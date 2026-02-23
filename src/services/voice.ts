// ============================================================================
// Voice Service (STT/TTS) and Sentiment Analysis
// MoodMash - Voice support and NLP capabilities
// ============================================================================

import type {
  VoiceConfig,
  VoiceEmotionResult,
  SentimentAnalysisInput,
  SentimentAnalysisOutput
} from '../types/advanced';

// Import SpeechRecognition types from the hook
import type {
  SpeechRecognition,
  SpeechRecognitionConstructor,
  SpeechRecognitionEvent,
  SpeechRecognitionErrorEvent
} from '../hooks/useVoiceRecording';

// ============================================================================
// Speech Recognition (STT)
// ============================================================================

export class SpeechRecognitionService {
  private recognition: SpeechRecognition | null = null;
  private isSupported: boolean;

  constructor() {
    const SpeechRecognitionAPI = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) as SpeechRecognitionConstructor | undefined : undefined;
    this.isSupported = !!SpeechRecognitionAPI;

    if (this.isSupported && SpeechRecognitionAPI) {
      this.recognition = new SpeechRecognitionAPI();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
    }
  }

  isAvailable(): boolean {
    return this.isSupported;
  }

  startListening(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (error: string) => void,
    onEnd: () => void
  ): boolean {
    if (!this.recognition) {
      onError('Speech recognition not supported');
      return false;
    }

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results;
      const lastResult = result[result.length - 1];
      const transcript = lastResult[0].transcript;
      onResult(transcript, lastResult.isFinal);
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      onError(event.error);
    };

    this.recognition.onend = onEnd;

    try {
      this.recognition.start();
      return true;
    } catch {
      onError('Failed to start recognition');
      return false;
    }
  }

  stopListening(): void {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  setLanguage(lang: string): void {
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }
}

// ============================================================================
// Text-to-Speech (TTS)
// ============================================================================

export class TextToSpeechService {
  private synthesis: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private defaultVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      this.synthesis = window.speechSynthesis;
      this.loadVoices();

      if (this.synthesis.onvoiceschanged !== undefined) {
        this.synthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices(): void {
    if (!this.synthesis) return;
    this.voices = this.synthesis.getVoices();
    this.defaultVoice = this.voices.find(v => v.lang.startsWith('en')) || this.voices[0] || null;
  }

  isAvailable(): boolean {
    return !!this.synthesis;
  }

  getVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  async speak(
    text: string,
    options?: {
      voice?: SpeechSynthesisVoice;
      rate?: number;
      pitch?: number;
      volume?: number;
      onEnd?: () => void;
      onError?: (error: string) => void;
    }
  ): Promise<boolean> {
    if (!this.synthesis) {
      options?.onError?.('Speech synthesis not supported');
      return false;
    }

    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    if (options?.voice) {
      utterance.voice = options.voice;
    } else if (this.defaultVoice) {
      utterance.voice = this.defaultVoice;
    }

    utterance.rate = options?.rate ?? 1;
    utterance.pitch = options?.pitch ?? 1;
    utterance.volume = options?.volume ?? 1;

    utterance.onend = () => {
      options?.onEnd?.();
    };

    utterance.onerror = (event) => {
      options?.onError?.(event.error);
    };

    try {
      this.synthesis.speak(utterance);
      return true;
    } catch {
      options?.onError?.('Failed to speak');
      return false;
    }
  }

  async speakWithEmotion(
    text: string,
    emotion: string,
    onEnd?: () => void,
    onError?: (error: string) => void
  ): Promise<boolean> {
    let rate = 1;
    let pitch = 1;

    switch (emotion) {
      case 'happy': rate = 1.1; pitch = 1.1; break;
      case 'sad': rate = 0.9; pitch = 0.9; break;
      case 'angry': rate = 1.2; pitch = 0.8; break;
      case 'calm': rate = 0.85; pitch = 1; break;
      case 'energetic': rate = 1.3; pitch = 1.2; break;
    }

    const emotionVoices = this.voices.filter(v =>
      v.name.toLowerCase().includes(emotion) || v.lang.startsWith('en')
    );

    const voice = emotionVoices[0] || this.defaultVoice;

    return this.speak(text, { voice, rate, pitch, onEnd, onError });
  }

  cancel(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  isSpeaking(): boolean {
    return this.synthesis?.speaking ?? false;
  }
}

// ============================================================================
// Sentiment Analysis Service (NLP)
// ============================================================================

export class SentimentAnalysisService {
  private positivePatterns = [
    /\b(good|great|amazing|excellent|happy|joy|love|wonderful|fantastic|awesome|beautiful|perfect|best|delighted|pleased|excited|thrilled|ecstatic)\b/gi,
    /\b(better|improving|progress|growth|success|achieve|accomplish|conquer|prevail|triumph)\b/gi
  ];

  private negativePatterns = [
    /\b(bad|terrible|awful|horrible|poor|sad|unhappy|depressed|angry|frustrated|disappointed|upset|anxious|stressed|worried|scared|fearful)\b/gi,
    /\b(worse|declining|failing|struggling|stuck|overwhelmed|exhausted|drained|tired|hopeless|helpless|worthless|useless)\b/gi
  ];

  private negators = ['not', "don't", "doesn't", "didn't", "won't", "can't", "couldn't", "never", "no"];

  analyze(input: SentimentAnalysisInput): SentimentAnalysisOutput {
    const { text, context } = input;
    const normalizedText = text.toLowerCase();

    let positiveMatches = 0;
    let negativeMatches = 0;

    this.positivePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      positiveMatches += matches?.length || 0;
    });

    this.negativePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      negativeMatches += matches?.length || 0;
    });

    const words = normalizedText.split(/\s+/);
    for (let i = 0; i < words.length - 1; i++) {
      if (this.negators.includes(words[i])) {
        const nextWord = words[i + 1];
        if (this.positivePatterns.some(p => p.test(nextWord))) {
          positiveMatches--;
          negativeMatches++;
        } else if (this.negativePatterns.some(p => p.test(nextWord))) {
          negativeMatches--;
          positiveMatches++;
        }
      }
    }

    const totalMatches = positiveMatches + negativeMatches || 1;
    const sentimentScore = (positiveMatches - negativeMatches) / totalMatches;

    let sentiment: 'positive' | 'neutral' | 'negative';
    if (sentimentScore > 0.1) sentiment = 'positive';
    else if (sentimentScore < -0.1) sentiment = 'negative';
    else sentiment = 'neutral';

    const emotions = this.detectEmotions(text);
    const keyPhrases = this.extractKeyPhrases(text);
    const topics = this.detectTopics(text);

    return {
      sentiment,
      confidence_score: Math.min(0.5 + totalMatches * 0.1, 0.95),
      sentiment_score: sentimentScore,
      emotions,
      key_phrases: keyPhrases,
      topics
    };
  }

  private detectEmotions(text: string): Array<{ emotion: string; score: number }> {
    const emotions: Array<{ emotion: string; score: number }> = [];
    const normalizedText = text.toLowerCase();

    const emotionKeywords: Record<string, string[]> = {
      joy: ['happy', 'joy', 'excited', 'thrilled', 'delighted', 'pleased', 'glad', 'cheerful'],
      sadness: ['sad', 'unhappy', 'depressed', 'melancholy', 'grief', 'sorrow', 'down', 'blue'],
      anger: ['angry', 'furious', 'irritated', 'annoyed', 'frustrated', 'enraged', 'irate'],
      fear: ['scared', 'afraid', 'anxious', 'worried', 'nervous', 'terrified', 'panicked', 'uneasy'],
      surprise: ['surprised', 'amazed', 'astonished', 'shocked', 'stunned', 'unexpected']
    };

    const totalWords = text.split(/\s+/).length;

    Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
      let matchCount = 0;
      keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = normalizedText.match(regex);
        matchCount += matches?.length || 0;
      });

      if (matchCount > 0) {
        const score = Math.min(matchCount / Math.sqrt(totalWords), 1);
        emotions.push({ emotion, score });
      }
    });

    return emotions.sort((a, b) => b.score - a.score).slice(0, 5);
  }

  private extractKeyPhrases(text: string): string[] {
    const phrases: string[] = [];

    const activityPatterns = [
      /\b(went|going|doing|played|watched|read|listened|ate|had)\s+([a-z]+(?:ing)?)\b/gi,
      /\b(spent|used)\s+\d+\s+(minutes?|hours?|days?)\s+(?:on|for)\s+([a-z]+(?:ing)?)\b/gi
    ];

    activityPatterns.forEach(pattern => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[2]) {
          phrases.push(match[2].trim());
        }
      }
    });

    return [...new Set(phrases)].slice(0, 10);
  }

  private detectTopics(text: string): string[] {
    const topics: string[] = [];
    const normalizedText = text.toLowerCase();

    const topicKeywords: Record<string, string[]> = {
      work: ['work', 'job', 'office', 'boss', 'colleague', 'meeting', 'project', 'deadline'],
      family: ['family', 'mom', 'dad', 'mother', 'father', 'sister', 'brother', 'kids', 'children', 'spouse'],
      health: ['health', 'exercise', 'workout', 'gym', 'doctor', 'medicine', 'symptoms', 'pain', 'tired', 'sleep'],
      social: ['friend', 'party', 'hangout', 'date', 'call', 'message', 'social', 'together'],
      hobbies: ['reading', 'gaming', 'music', 'movie', 'show', 'hobby', 'craft', 'art', 'paint']
    };

    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => normalizedText.includes(keyword))) {
        topics.push(topic);
      }
    });

    return topics;
  }
}

// ============================================================================
// Voice Emotion Detection Service
// ============================================================================

export class VoiceEmotionDetectionService {
  async analyzeVoiceEmotion(audioBlob: Blob): Promise<VoiceEmotionResult> {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const channelData = audioBuffer.getChannelData(0);
    const samples = Math.min(channelData.length, 44100);

    let sum = 0;
    let sumSquares = 0;
    let zeroCrossings = 0;

    for (let i = 0; i < samples; i++) {
      const sample = channelData[i];
      sum += sample;
      sumSquares += sample * sample;
      if (i > 0 && Math.sign(sample) !== Math.sign(channelData[i - 1])) {
        zeroCrossings++;
      }
    }

    const mean = sum / samples;
    const rms = Math.sqrt(sumSquares / samples);
    const zeroCrossingRate = zeroCrossings / samples;
    const pitchVariation = Math.min(rms * 10, 1);

    const energySegments = 10;
    const segmentSize = Math.floor(samples / energySegments);
    let energyChanges = 0;

    for (let i = 0; i < energySegments - 1; i++) {
      const energy1 = this.calculateEnergy(channelData, i * segmentSize, (i + 1) * segmentSize);
      const energy2 = this.calculateEnergy(channelData, (i + 1) * segmentSize, (i + 2) * segmentSize);
      energyChanges += Math.abs(energy1 - energy2);
    }

    const speechRate = Math.min(energyChanges / energySegments, 2);
    const emotions = this.mapFeaturesToEmotions({ rms, zeroCrossingRate, pitchVariation, speechRate });

    const valence = this.estimateValence(emotions);
    const arousal = this.estimateArousal(emotions, speechRate);

    return {
      dominant_emotion: emotions[0]?.emotion || 'neutral',
      emotions,
      confidence: Math.min(0.5 + rms * 2, 0.9),
      valence,
      arousal,
      speech_rate: speechRate,
      pitch_variation: pitchVariation
    };
  }

  private calculateEnergy(data: Float32Array, start: number, end: number): number {
    let sum = 0;
    for (let i = start; i < end; i++) {
      sum += data[i] * data[i];
    }
    return sum / (end - start);
  }

  private mapFeaturesToEmotions(features: { rms: number; zeroCrossingRate: number; pitchVariation: number; speechRate: number }): Array<{ emotion: string; score: number }> {
    const emotions: Array<{ emotion: string; score: number }> = [];

    if (features.rms > 0.3 && features.speechRate > 1) {
      emotions.push({ emotion: 'happy', score: features.rms * features.speechRate });
      emotions.push({ emotion: 'excited', score: features.rms * 0.8 });
    }

    if (features.rms < 0.1 && features.zeroCrossingRate < 0.05) {
      emotions.push({ emotion: 'sad', score: 0.7 });
      emotions.push({ emotion: 'calm', score: 0.5 });
    }

    if (features.zeroCrossingRate > 0.1 && features.rms > 0.2) {
      emotions.push({ emotion: 'angry', score: features.zeroCrossingRate });
      emotions.push({ emotion: 'stressed', score: features.zeroCrossingRate * 0.8 });
    }

    if (features.speechRate < 0.5 && features.rms < 0.2) {
      emotions.push({ emotion: 'tired', score: 0.6 });
      emotions.push({ emotion: 'neutral', score: 0.4 });
    }

    const maxScore = Math.max(...emotions.map(e => e.score), 1);
    return emotions.map(e => ({ ...e, score: e.score / maxScore })).sort((a, b) => b.score - a.score).slice(0, 5);
  }

  private estimateValence(emotions: Array<{ emotion: string; score: number }>): number {
    const positiveEmotions = ['happy', 'excited', 'calm'];
    const negativeEmotions = ['sad', 'angry', 'stressed', 'tired'];

    let positiveScore = 0;
    let negativeScore = 0;

    emotions.forEach(e => {
      if (positiveEmotions.includes(e.emotion)) positiveScore += e.score;
      else if (negativeEmotions.includes(e.emotion)) negativeScore += e.score;
    });

    const total = positiveScore + negativeScore || 1;
    return (positiveScore - negativeScore) / total;
  }

  private estimateArousal(emotions: Array<{ emotion: string; score: number }>, speechRate: number): number {
    const highArousalEmotions = ['happy', 'excited', 'angry', 'stressed'];
    const lowArousalEmotions = ['sad', 'calm', 'tired'];

    let highScore = 0;
    let lowScore = 0;

    emotions.forEach(e => {
      if (highArousalEmotions.includes(e.emotion)) highScore += e.score;
      else if (lowArousalEmotions.includes(e.emotion)) lowScore += e.score;
    });

    const baseArousal = (highScore - lowScore) / (highScore + lowScore || 1);
    return Math.min(Math.max((baseArousal + speechRate) / 2, 0), 1);
  }
}

// Create singleton instances
export const speechRecognitionService = new SpeechRecognitionService();
export const textToSpeechService = new TextToSpeechService();
export const sentimentAnalysisService = new SentimentAnalysisService();
export const voiceEmotionDetectionService = new VoiceEmotionDetectionService();

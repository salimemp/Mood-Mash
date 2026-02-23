import { MoodEntry, MOOD_EMOTIONS } from '../contexts/MoodContext';

// ============================================================================
// AI Insights Types
// ============================================================================

export interface AIInsight {
  id: string;
  type: 'summary' | 'pattern' | 'recommendation' | 'reflection';
  title: string;
  content: string;
  confidence: number;
  createdAt: Date;
  relatedEntries?: string[];
}

export interface AIAnalysisRequest {
  entries: MoodEntry[];
  timeframe?: 'week' | 'month' | 'year';
  focus?: string;
}

export interface AIAnalysisResponse {
  insights: AIInsight[];
  summary: string;
  generatedAt: Date;
}

// ============================================================================
// Gemini API Integration
// ============================================================================

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

async function callGeminiAPI(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch(`${GEMINI_API_BASE}/models/gemini-pro:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }],
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const data = await response.json();

  if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
    return data.candidates[0].content.parts[0].text;
  }

  throw new Error('Invalid response from Gemini API');
}

// ============================================================================
// Prompt Builders
// ============================================================================

function buildMoodSummaryPrompt(entries: MoodEntry[], timeframe: string): string {
  const moodEmojis = MOOD_EMOTIONS.map(m => `${m.emoji} (${m.label})`).join(', ');

  const recentEntries = entries.slice(0, 20).map(entry => {
    const mood = MOOD_EMOTIONS.find(m => m.key === entry.emotion);
    const date = new Date(entry.createdAt).toLocaleDateString();
    const time = new Date(entry.createdAt).toLocaleTimeString();
    return `- ${date} ${time}: ${mood?.emoji} ${mood?.label} (intensity: ${entry.intensity}/10)${entry.note ? ` - "${entry.note}"` : ''}`;
  }).join('\n');

  return `
You are a compassionate mood analysis assistant. Analyze the following mood journal entries from the past ${timeframe} and provide insights.

Available moods: ${moodEmojis}

Recent entries:
${recentEntries}

Please provide:
1. A brief summary of the overall emotional trends
2. Key patterns observed (time of day, days of week, etc.)
3. 2-3 personalized suggestions for improving emotional wellbeing
4. One reflective question to encourage self-awareness

Keep your response warm, supportive, and concise (under 300 words). Use markdown formatting with **bold** for emphasis.
`;
}

function buildPatternAnalysisPrompt(entries: MoodEntry[]): string {
  const emotionStats = entries.reduce((acc, entry) => {
    acc[entry.emotion] = (acc[entry.emotion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedEmotions = Object.entries(emotionStats)
    .sort((a, b) => b[1] - a[1])
    .map(([emotion, count]) => {
      const mood = MOOD_EMOTIONS.find(m => m.key === emotion);
      return `${mood?.emoji} ${mood?.label}: ${count} times`;
    })
    .join('\n');

  return `
Analyze these mood patterns and provide insights:

Most frequent moods:
${sortedEmotions}

Provide:
1. What these patterns might indicate about the person's emotional life
2. Potential triggers for their most common moods
3. Suggestions for maintaining positive moods and managing challenging ones
4. A thoughtful observation that could help them understand themselves better

Be empathetic and avoid making medical claims. Focus on general patterns and supportive suggestions.
`;
}

function buildDailyReflectionPrompt(entry: MoodEntry, previousEntries: MoodEntry[]): string {
  const mood = MOOD_EMOTIONS.find(m => m.key === entry.emotion);

  return `
The user just logged: ${mood?.emoji} ${mood?.label} (intensity: ${entry.intensity}/10)
${entry.note ? `Note: "${entry.note}"` : ''}

Provide a brief, supportive reflection response that:
1. Validates their current feeling
2. Offers a gentle perspective or insight
3. Ends with an encouraging thought for the day

Keep it warm, brief, and under 100 words.
`;
}

// ============================================================================
// AI Service Functions
// ============================================================================

export async function generateMoodInsights(
  entries: MoodEntry[],
  apiKey: string,
  timeframe: 'week' | 'month' | 'year' = 'week'
): Promise<AIAnalysisResponse> {
  if (entries.length === 0) {
    return {
      insights: [{
        id: 'empty',
        type: 'summary',
        title: 'Start Your Journey',
        content: 'Begin logging your mood to receive personalized AI insights about your emotional patterns.',
        confidence: 1,
        createdAt: new Date(),
      }],
      summary: 'No mood data available yet.',
      generatedAt: new Date(),
    };
  }

  const prompt = buildMoodSummaryPrompt(entries, timeframe);

  try {
    const response = await callGeminiAPI(prompt, apiKey);

    // Parse the response into structured insights
    const insights = parseAIGenerateResponse(response, entries);

    return {
      insights,
      summary: response,
      generatedAt: new Date(),
    };
  } catch (error) {
    console.error('Failed to generate AI insights:', error);

    // Return fallback insights
    return {
      insights: generateFallbackInsights(entries),
      summary: 'Unable to generate AI insights at this time. Please try again later.',
      generatedAt: new Date(),
    };
  }
}

export async function analyzePatterns(
  entries: MoodEntry[],
  apiKey: string
): Promise<string> {
  const prompt = buildPatternAnalysisPrompt(entries);

  try {
    return await callGeminiAPI(prompt, apiKey);
  } catch (error) {
    console.error('Failed to analyze patterns:', error);
    return 'Pattern analysis unavailable. Keep logging your mood to discover more about your emotional patterns.';
  }
}

export async function generateDailyReflection(
  entry: MoodEntry,
  previousEntries: MoodEntry[],
  apiKey: string
): Promise<string> {
  const prompt = buildDailyReflectionPrompt(entry, previousEntries);

  try {
    return await callGeminiAPI(prompt, apiKey);
  } catch (error) {
    console.error('Failed to generate reflection:', error);
    return `Thank you for sharing that you're feeling ${MOOD_EMOTIONS.find(m => m.key === entry.emotion)?.label.toLowerCase()}. Taking time to check in with yourself is a wonderful practice. Remember, all emotions are valid and temporary.`;
  }
}

// ============================================================================
// Response Parsing Helpers
// ============================================================================

function parseAIGenerateResponse(response: string, entries: MoodEntry[]): AIInsight[] {
  const insights: AIInsight[] = [];

  // Parse summary section
  const summaryMatch = response.match(/\*\*Summary[:\-]?\*\*[\s\S]*?(?=\*\*|$)/i);
  if (summaryMatch) {
    insights.push({
      id: `summary-${Date.now()}`,
      type: 'summary',
      title: 'Mood Summary',
      content: summaryMatch[0].replace(/\*\*Summary[:\-]?\*\*/i, '').trim(),
      confidence: 0.9,
      createdAt: new Date(),
    });
  }

  // Parse pattern insights
  const patternMatch = response.match(/\*\*Patterns?[:\-]?\*\*[\s\S]*?(?=\*\*|$)/i);
  if (patternMatch) {
    insights.push({
      id: `pattern-${Date.now()}`,
      type: 'pattern',
      title: 'Detected Patterns',
      content: patternMatch[0].replace(/\*\*Patterns?[:\-]?\*\*/i, '').trim(),
      confidence: 0.75,
      createdAt: new Date(),
    });
  }

  // Parse suggestions
  const suggestionsMatch = response.match(/\*\*Suggestions?[:\-]?\*\*[\s\S]*?(?=\*\*|$)/i);
  if (suggestionsMatch) {
    insights.push({
      id: `recommendation-${Date.now()}`,
      type: 'recommendation',
      title: 'Suggestions for You',
      content: suggestionsMatch[0].replace(/\*\*Suggestions?[:\-]?\*\*/i, '').trim(),
      confidence: 0.7,
      createdAt: new Date(),
    });
  }

  // Parse reflection question
  const reflectionMatch = response.match(/\*\*Reflection[:\-]?\*\*[\s\S]*?(?=\*\*|$)/i);
  if (reflectionMatch) {
    insights.push({
      id: `reflection-${Date.now()}`,
      type: 'reflection',
      title: 'Reflection Question',
      content: reflectionMatch[0].replace(/\*\*Reflection[:\-]?\*\*/i, '').trim(),
      confidence: 0.8,
      createdAt: new Date(),
    });
  }

  // If parsing failed, use the whole response
  if (insights.length === 0) {
    insights.push({
      id: `summary-${Date.now()}`,
      type: 'summary',
      title: 'AI Analysis',
      content: response,
      confidence: 0.7,
      createdAt: new Date(),
    });
  }

  return insights;
}

function generateFallbackInsights(entries: MoodEntry[]): AIInsight[] {
  const insights: AIInsight[] = [];

  // Calculate basic stats
  const emotionCounts = entries.reduce((acc, entry) => {
    acc[entry.emotion] = (acc[entry.emotion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topEmotion = Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1])[0];

  const avgIntensity = entries.reduce((sum, e) => sum + e.intensity, 0) / entries.length;

  if (topEmotion) {
    const mood = MOOD_EMOTIONS.find(m => m.key === topEmotion[0]);

    insights.push({
      id: 'fallback-1',
      type: 'summary',
      title: 'Your Mood Overview',
      content: `Over your recent entries, you've logged ${entries.length} moods. ${mood?.emoji} ${mood?.label} is your most frequent mood, appearing ${topEmotion[1]} times. Your average mood intensity is ${avgIntensity.toFixed(1)} out of 10.`,
      confidence: 1,
      createdAt: new Date(),
    });

    insights.push({
      id: 'fallback-2',
      type: 'recommendation',
      title: 'Keep Tracking',
      content: 'Continue logging your mood regularly to discover more patterns and insights about your emotional well-being. Every entry helps build a clearer picture of your emotional landscape.',
      confidence: 1,
      createdAt: new Date(),
    });
  }

  return insights;
}

// ============================================================================
// Utility Functions
// ============================================================================

export function getAPIKey(): string | null {
  // Try to get from multiple sources
  // 1. Environment variable
  if (import.meta.env['VITE_GEMINI_API_KEY']) {
    return import.meta.env['VITE_GEMINI_API_KEY'];
  }

  // 2. LocalStorage (set by settings)
  const stored = localStorage.getItem('gemini_api_key');
  if (stored) {
    return stored;
  }

  return null;
}

export function setAPIKey(key: string): void {
  localStorage.setItem('gemini_api_key', key);
}

export function clearAPIKey(): void {
  localStorage.removeItem('gemini_api_key');
}

export function isAPIKeySet(): boolean {
  return getAPIKey() !== null;
}

// ============================================================================
// TensorFlow.js-Style Neural Network Implementation for MoodMash
// On-device ML for mood prediction, pattern detection, and recommendations
// ============================================================================

import { format, subDays, eachDayOfInterval, addDays, getHours, getDay, isWeekend } from 'date-fns';

// ============================================================================
// Type Definitions for ML Models
// ============================================================================

export interface MLModelConfig {
  inputSize: number;
  hiddenSize: number;
  outputSize: number;
  learningRate: number;
  epochs: number;
}

export interface MoodPredictionResult {
  predictions: PredictedMood[];
  confidence: number;
  factors: PredictionFactor[];
  trend: 'improving' | 'stable' | 'declining';
}

export interface PredictedMood {
  date: Date;
  emotion: string;
  intensity: number;
  confidence: number;
}

export interface PredictionFactor {
  name: string;
  impact: number;
  direction: 'positive' | 'negative';
  description: string;
}

export interface PatternResult {
  patterns: DetectedPattern[];
  insights: PatternInsight[];
  recommendations: string[];
}

export interface DetectedPattern {
  id: string;
  type: 'circadian' | 'weekly' | 'seasonal' | 'trigger' | 'response' | 'correlation';
  strength: number;
  description: string;
  evidence: string[];
}

export interface PatternInsight {
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  recommendation: string;
}

export interface RecommendationResult {
  recommendations: SessionRecommendation[];
  personalizedTips: string[];
  optimalSchedule: OptimalSchedule[];
}

export interface SessionRecommendation {
  sessionId: string;
  sessionType: 'meditation' | 'yoga' | 'music';
  name: string;
  score: number;
  predictedEffect: string;
  reasoning: string[];
  urgency: 'high' | 'medium' | 'low';
}

export interface OptimalSchedule {
  timeSlot: string;
  activity: string;
  confidence: number;
  reason: string;
}

export interface SentimentResult {
  overallScore: number;
  emotions: DetectedEmotion[];
  themes: string[];
  keywords: string[];
  suggestions: string[];
}

export interface DetectedEmotion {
  name: string;
  score: number;
  intensity: 'high' | 'medium' | 'low';
}

export interface ModelState {
  version: string;
  isTrained: boolean;
  lastTrained: Date | null;
  accuracy: number;
  loss: number;
  dataPointsProcessed: number;
}

export interface TrainingData {
  inputs: number[][];
  targets: number[][];
}

export interface FeatureVector {
  moodHistory: number[];
  timeFeatures: number[];
  activityFeatures: number[];
  sleepFeatures: number[];
}

// ============================================================================
// Neural Network Implementation (TensorFlow.js Compatible Architecture)
// ============================================================================

class NeuralNetwork {
  private weights1: number[][];
  private weights2: number[][];
  private bias1: number[];
  private bias2: number[];
  private config: MLModelConfig;
  private isInitialized: boolean = false;

  constructor(config: MLModelConfig) {
    this.config = config;
    this.weights1 = [];
    this.weights2 = [];
    this.bias1 = [];
    this.bias2 = [];
  }

  /**
   * Initialize network with Xavier initialization
   */
  initialize(): void {
    const { inputSize, hiddenSize, outputSize } = this.config;

    // Xavier/Glorot initialization for weights
    const scale1 = Math.sqrt(2.0 / (inputSize + hiddenSize));
    const scale2 = Math.sqrt(2.0 / (hiddenSize + outputSize));

    this.weights1 = Array(inputSize).fill(null).map(() =>
      Array(hiddenSize).fill(null).map(() => this.randomNormal(0, scale1))
    );

    this.weights2 = Array(hiddenSize).fill(null).map(() =>
      Array(outputSize).fill(null).map(() => this.randomNormal(0, scale2))
    );

    this.bias1 = Array(hiddenSize).fill(0);
    this.bias2 = Array(outputSize).fill(0);

    this.isInitialized = true;
  }

  /**
   * ReLU activation function
   */
  private relu(x: number): number {
    return Math.max(0, x);
  }

  /**
   * Softmax activation for output layer
   */
  private softmax(arr: number[]): number[] {
    const maxVal = Math.max(...arr);
    const expArr = arr.map(x => Math.exp(x - maxVal));
    const sumExp = expArr.reduce((a, b) => a + b, 0);
    return expArr.map(x => x / sumExp);
  }

  /**
   * Normal distribution random number generator
   */
  private randomNormal(mean: number, std: number): number {
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return mean + z * std;
  }

  /**
   * Forward pass through the network
   */
  forward(inputs: number[]): number[] {
    if (!this.isInitialized) {
      this.initialize();
    }

    // Hidden layer with ReLU activation
    const hidden: number[] = Array(this.config.hiddenSize).fill(0);
    for (let j = 0; j < this.config.hiddenSize; j++) {
      let sum = this.bias1[j];
      for (let i = 0; i < this.config.inputSize; i++) {
        sum += inputs[i] * this.weights1[i][j];
      }
      hidden[j] = this.relu(sum);
    }

    // Output layer with softmax activation
    const output: number[] = Array(this.config.outputSize).fill(0);
    for (let k = 0; k < this.config.outputSize; k++) {
      let sum = this.bias2[k];
      for (let j = 0; j < this.config.hiddenSize; j++) {
        sum += hidden[j] * this.weights2[j][k];
      }
      output[k] = sum;
    }

    return this.softmax(output);
  }

  /**
   * Train the network using backpropagation
   */
  train(inputs: number[][], targets: number[][], epochs?: number): TrainingHistory {
    if (!this.isInitialized) {
      this.initialize();
    }

    const numEpochs = epochs || this.config.epochs;
    const history: TrainingHistory = {
      losses: [],
      accuracies: [],
    };

    for (let epoch = 0; epoch < numEpochs; epoch++) {
      let totalLoss = 0;
      let correctPredictions = 0;

      for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];
        const target = targets[i];

        // Forward pass
        const hidden: number[] = Array(this.config.hiddenSize).fill(0);
        for (let j = 0; j < this.config.hiddenSize; j++) {
          let sum = this.bias1[j];
          for (let k = 0; k < this.config.inputSize; k++) {
            sum += input[k] * this.weights1[k][j];
          }
          hidden[j] = this.relu(sum);
        }

        const output: number[] = Array(this.config.outputSize).fill(0);
        for (let j = 0; j < this.config.outputSize; j++) {
          let sum = this.bias2[j];
          for (let k = 0; k < this.config.hiddenSize; k++) {
            sum += hidden[k] * this.weights2[k][j];
          }
          output[j] = sum;
        }

        const softmaxOutput = this.softmax(output);

        // Calculate loss (cross-entropy)
        let loss = 0;
        for (let j = 0; j < this.config.outputSize; j++) {
          loss -= target[j] * Math.log(Math.max(softmaxOutput[j], 1e-10));
        }
        totalLoss += loss;

        // Check prediction
        const predictedClass = softmaxOutput.indexOf(Math.max(...softmaxOutput));
        const targetClass = target.indexOf(Math.max(...target));
        if (predictedClass === targetClass) {
          correctPredictions++;
        }

        // Backpropagation (simplified for demo)
        const learningRate = this.config.learningRate * (1 - epoch / numEpochs);
        const outputError = softmaxOutput.map((o, i) => o - target[i]);

        for (let j = 0; j < this.config.hiddenSize; j++) {
          for (let k = 0; k < this.config.outputSize; k++) {
            this.weights2[j][k] -= learningRate * outputError[k] * hidden[j];
          }
        }

        for (let k = 0; k < this.config.outputSize; k++) {
          this.bias2[k] -= learningRate * outputError[k];
        }

        // Hidden layer error
        const hiddenError = this.weights2.map((row, j) =>
          row.reduce((sum, w, k) => sum + w * outputError[k], 0)
        ).map((err, j) => err * (hidden[j] > 0 ? 1 : 0));

        for (let k = 0; k < this.config.inputSize; k++) {
          for (let j = 0; j < this.config.hiddenSize; j++) {
            this.weights1[k][j] -= learningRate * hiddenError[j] * input[k];
          }
        }

        for (let j = 0; j < this.config.hiddenSize; j++) {
          this.bias1[j] -= learningRate * hiddenError[j];
        }
      }

      history.losses.push(totalLoss / inputs.length);
      history.accuracies.push(correctPredictions / inputs.length);
    }

    return history;
  }

  /**
   * Get model parameters for storage
   */
  getParameters(): ModelParameters {
    return {
      weights1: this.weights1,
      weights2: this.weights2,
      bias1: this.bias1,
      bias2: this.bias2,
      config: this.config,
    };
  }

  /**
   * Load model parameters
   */
  loadParameters(params: ModelParameters): void {
    this.weights1 = params.weights1;
    this.weights2 = params.weights2;
    this.bias1 = params.bias1;
    this.bias2 = params.bias2;
    this.config = params.config;
    this.isInitialized = true;
  }
}

interface TrainingHistory {
  losses: number[];
  accuracies: number[];
}

interface ModelParameters {
  weights1: number[][];
  weights2: number[][];
  bias1: number[];
  bias2: number[];
  config: MLModelConfig;
}

// ============================================================================
// Mood Prediction Model
// ============================================================================

export class MoodPredictionModel {
  private network: NeuralNetwork;
  private emotionEncoder: Map<string, number>;
  private state: ModelState;
  private trainedData: Map<string, number[][]>;

  constructor() {
    const config: MLModelConfig = {
      inputSize: 48,  // 7 days × 24 hours × normalized features
      hiddenSize: 32,
      outputSize: 10, // 10 emotion categories
      learningRate: 0.01,
      epochs: 100,
    };

    this.network = new NeuralNetwork(config);
    this.emotionEncoder = new Map([
      ['happy', 0], ['calm', 1], ['energetic', 2], ['grateful', 3],
      ['motivated', 4], ['sad', 5], ['anxious', 6], ['stressed', 7],
      ['tired', 8], ['frustrated', 9],
    ]);
    this.state = {
      version: '1.0.0',
      isTrained: false,
      lastTrained: null,
      accuracy: 0,
      loss: 0,
      dataPointsProcessed: 0,
    };
    this.trainedData = new Map();
  }

  /**
   * Convert mood history to feature vector
   */
  private extractFeatures(
    moodHistory: Array<{ emotion: string; intensity: number; timestamp: Date }>,
    hoursToPredict: number = 24
  ): number[] {
    const features = Array(48).fill(0);

    // Time-based features
    const now = new Date();
    const hourOfDay = getHours(now);
    const dayOfWeek = getDay(now);
    const isWeekendDay = isWeekend(now) ? 1 : 0;

    // Hour encoding (sin/cos for cyclical)
    features[0] = Math.sin(2 * Math.PI * hourOfDay / 24);
    features[1] = Math.cos(2 * Math.PI * hourOfDay / 24);
    features[2] = Math.sin(2 * Math.PI * dayOfWeek / 7);
    features[3] = Math.cos(2 * Math.PI * dayOfWeek / 7);
    features[4] = isWeekendDay;

    // Recent mood history (last 7 entries, 6 features each)
    const recentMoods = moodHistory.slice(-7);
    for (let i = 0; i < 7; i++) {
      if (i < recentMoods.length) {
        const mood = recentMoods[i];
        const emotionIndex = this.emotionEncoder.get(mood.emotion.toLowerCase()) || 0;
        features[5 + i * 6] = emotionIndex / 10;
        features[6 + i * 6] = mood.intensity / 10;
        features[7 + i * 6] = Math.sin(2 * Math.PI * getHours(mood.timestamp) / 24);
        features[8 + i * 6] = Math.cos(2 * Math.PI * getHours(mood.timestamp) / 24);
        features[9 + i * 6] = getDay(mood.timestamp) / 7;
        features[10 + i * 6] = mood.intensity > 5 ? 1 : 0;
      } else {
        const baseIdx = 5 + i * 6;
        features[baseIdx] = 0.5; // Neutral emotion
        features[baseIdx + 1] = 0.5; // Medium intensity
      }
    }

    // Trend features
    if (recentMoods.length >= 3) {
      const recentIntensity = recentMoods.slice(-3).map(m => m.intensity);
      const trend = (recentIntensity[2] - recentIntensity[0]) / 2;
      features[47] = Math.tanh(trend);
    }

    return features;
  }

  /**
   * Prepare training data from mood history
   */
  prepareTrainingData(
    moodHistory: Array<{ emotion: string; intensity: number; timestamp: Date }>
  ): TrainingData {
    const inputs: number[][] = [];
    const targets: number[][] = [];

    // Create sliding window training examples
    for (let i = 7; i < moodHistory.length; i++) {
      const window = moodHistory.slice(i - 7, i);
      const features = this.extractFeatures(window);
      const targetEmotion = moodHistory[i].emotion.toLowerCase();
      const targetIndex = this.emotionEncoder.get(targetEmotion) || 0;

      const target = Array(10).fill(0);
      target[targetIndex] = 1;

      inputs.push(features);
      targets.push(target);
    }

    this.state.dataPointsProcessed = inputs.length;
    return { inputs, targets };
  }

  /**
   * Train the mood prediction model
   */
  train(
    moodHistory: Array<{ emotion: string; intensity: number; timestamp: Date }>
  ): TrainingHistory {
    const { inputs, targets } = this.prepareTrainingData(moodHistory);

    if (inputs.length < 10) {
      return { losses: [1.0], accuracies: [0] };
    }

    const history = this.network.train(inputs, targets, 50);

    this.state.isTrained = true;
    this.state.lastTrained = new Date();
    this.state.accuracy = history.accuracies[history.accuracies.length - 1];
    this.state.loss = history.losses[history.losses.length - 1];

    return history;
  }

  /**
   * Predict future moods
   */
  predict(
    moodHistory: Array<{ emotion: string; intensity: number; timestamp: Date }>,
    daysAhead: number = 7
  ): MoodPredictionResult {
    const predictions: PredictedMood[] = [];
    const factors: PredictionFactor[] = [];

    // Calculate trend from recent history
    const recentMoods = moodHistory.slice(-7);
    let trendScore = 0;
    if (recentMoods.length >= 3) {
      const intensities = recentMoods.map(m => m.intensity);
      trendScore = (intensities[intensities.length - 1] - intensities[0]) / intensities.length;
    }

    // Generate predictions for each day
    for (let d = 0; d < daysAhead; d++) {
      const predDate = addDays(new Date(), d + 1);
      const features = this.extractFeatures(moodHistory, 24 * (d + 1));

      // Add day offset to features
      features[0] = Math.sin(2 * Math.PI * getHours(predDate) / 24);
      features[2] = Math.sin(2 * Math.PI * getDay(predDate) / 7);

      let prediction: number[];
      if (this.state.isTrained) {
        prediction = this.network.forward(features);
      } else {
        // Fallback to rule-based prediction
        prediction = this.ruleBasedPrediction(moodHistory, d, trendScore);
      }

      // Find dominant emotion
      const maxIdx = prediction.indexOf(Math.max(...prediction));
      const emotions = Array.from(this.emotionEncoder.keys());
      const predictedEmotion = emotions[maxIdx];

      // Calculate confidence
      const confidence = Math.max(...prediction);

      predictions.push({
        date: predDate,
        emotion: predictedEmotion,
        intensity: Math.round(3 + prediction[maxIdx] * 7),
        confidence: confidence,
      });
    }

    // Calculate trend
    let trend: 'improving' | 'stable' | 'declining' = 'stable';
    if (trendScore > 0.2) {
      trend = 'improving';
    } else if (trendScore < -0.2) {
      trend = 'declining';
    }

    // Generate factors
    if (trendScore > 0.1) {
      factors.push({
        name: 'Upward Trend',
        impact: trendScore,
        direction: 'positive',
        description: 'Your mood has been improving recently',
      });
    } else if (trendScore < -0.1) {
      factors.push({
        name: 'Downward Trend',
        impact: Math.abs(trendScore),
        direction: 'negative',
        description: 'Your mood has been declining recently',
      });
    }

    // Add circadian factor
    const currentHour = getHours(new Date());
    if (currentHour >= 5 && currentHour <= 11) {
      factors.push({
        name: 'Morning Energy',
        impact: 0.3,
        direction: 'positive',
        description: 'Mornings tend to be your peak energy time',
      });
    }

    const overallConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;

    return {
      predictions,
      confidence: overallConfidence,
      factors,
      trend,
    };
  }

  /**
   * Rule-based prediction fallback
   */
  private ruleBasedPrediction(
    moodHistory: Array<{ emotion: string; intensity: number; timestamp: Date }>,
    dayOffset: number,
    trendScore: number
  ): number[] {
    const emotions = ['happy', 'calm', 'energetic', 'grateful', 'motivated',
                      'sad', 'anxious', 'stressed', 'tired', 'frustrated'];
    const prediction = Array(10).fill(0.1);

    // Base prediction on recent mood distribution
    const recentMoods = moodHistory.slice(-7);
    recentMoods.forEach(mood => {
      const idx = this.emotionEncoder.get(mood.emotion.toLowerCase());
      if (idx !== undefined) {
        prediction[idx] += 0.15 * (mood.intensity / 10);
      }
    });

    // Apply trend
    if (trendScore > 0) {
      prediction[0] += trendScore * 0.3; // Increase positive emotions
      prediction[5] -= trendScore * 0.2; // Decrease sad
    } else if (trendScore < 0) {
      prediction[5] += Math.abs(trendScore) * 0.3;
      prediction[6] += Math.abs(trendScore) * 0.2;
    }

    // Normalize to sum to 1
    const sum = prediction.reduce((a, b) => a + b, 0);
    return prediction.map(p => p / sum);
  }

  /**
   * Get model state
   */
  getState(): ModelState {
    return { ...this.state };
  }

  /**
   * Export model parameters
   */
  exportModel(): string {
    const params = this.network.getParameters();
    return JSON.stringify({
      parameters: params,
      state: this.state,
      emotionEncoder: Array.from(this.emotionEncoder.entries()),
    });
  }

  /**
   * Import model parameters
   */
  importModel(data: string): void {
    const parsed = JSON.parse(data);
    this.network.loadParameters(parsed.parameters);
    this.state = parsed.state;
    this.emotionEncoder = new Map(parsed.emotionEncoder);
  }
}

// ============================================================================
// Pattern Detection Engine
// ============================================================================

export class PatternDetectionEngine {
  private moodHistory: Array<{ emotion: string; intensity: number; timestamp: Date }>;
  private wellnessHistory: Array<{ type: string; category: string; moodBefore?: number; moodAfter?: number; completedAt: Date }>;

  constructor(
    moodHistory: Array<{ emotion: string; intensity: number; timestamp: Date }>,
    wellnessHistory: Array<{ type: string; category: string; moodBefore?: number; moodAfter?: number; completedAt: Date }>
  ) {
    this.moodHistory = moodHistory;
    this.wellnessHistory = wellnessHistory;
  }

  /**
   * Detect all patterns in the data
   */
  detectAll(): PatternResult {
    const patterns: DetectedPattern[] = [];
    const insights: PatternInsight[] = [];
    const recommendations: string[] = [];

    // Circadian patterns
    const circadian = this.detectCircadianPatterns();
    if (circadian) {
      patterns.push(circadian.pattern);
      insights.push(...circadian.insights);
      recommendations.push(...circadian.recommendations);
    }

    // Weekly patterns
    const weekly = this.detectWeeklyPatterns();
    if (weekly) {
      patterns.push(weekly.pattern);
      insights.push(...weekly.insights);
      recommendations.push(...weekly.recommendations);
    }

    // Trigger patterns
    const triggers = this.detectTriggerPatterns();
    if (triggers) {
      patterns.push(...triggers.patterns);
      insights.push(...triggers.insights);
      recommendations.push(...triggers.recommendations);
    }

    // Response patterns (how user responds to activities)
    const responses = this.detectResponsePatterns();
    if (responses) {
      patterns.push(...responses.patterns);
      insights.push(...responses.insights);
      recommendations.push(...responses.recommendations);
    }

    // Correlation patterns
    const correlations = this.detectCorrelations();
    if (correlations) {
      patterns.push(...correlations.patterns);
      insights.push(...correlations.insights);
      recommendations.push(...correlations.recommendations);
    }

    return {
      patterns: patterns.slice(0, 10), // Top 10 patterns
      insights: insights.slice(0, 5),
      recommendations: [...new Set(recommendations)].slice(0, 5),
    };
  }

  /**
   * Detect circadian (time-of-day) patterns
   */
  private detectCircadianPatterns(): { pattern: DetectedPattern; insights: PatternInsight[]; recommendations: string[] } | null {
    if (this.moodHistory.length < 20) return null;

    const hourGroups: Record<number, { totalIntensity: number; emotionCounts: Map<string, number>; count: number }> = {};

    this.moodHistory.forEach(entry => {
      const hour = getHours(entry.timestamp);
      if (!hourGroups[hour]) {
        hourGroups[hour] = { totalIntensity: 0, emotionCounts: new Map(), count: 0 };
      }
      hourGroups[hour].totalIntensity += entry.intensity;
      hourGroups[hour].emotionCounts.set(
        entry.emotion,
        (hourGroups[hour].emotionCounts.get(entry.emotion) || 0) + 1
      );
      hourGroups[hour].count++;
    });

    // Compare morning (5-11) vs evening (17-21)
    let morningData = { total: 0, count: 0, emotions: new Map<string, number>() };
    let eveningData = { total: 0, count: 0, emotions: new Map<string, number>() };

    Object.entries(hourGroups).forEach(([hour, data]) => {
      const h = parseInt(hour);
      if (h >= 5 && h <= 11) {
        morningData.total += data.totalIntensity;
        morningData.count += data.count;
        data.emotionCounts.forEach((count, emotion) => {
          morningData.emotions.set(emotion, (morningData.emotions.get(emotion) || 0) + count);
        });
      } else if (h >= 17 && h <= 21) {
        eveningData.total += data.totalIntensity;
        eveningData.count += data.count;
        data.emotionCounts.forEach((count, emotion) => {
          eveningData.emotions.set(emotion, (eveningData.emotions.get(emotion) || 0) + count);
        });
      }
    });

    if (morningData.count < 5 || eveningData.count < 5) return null;

    const morningAvg = morningData.total / morningData.count;
    const eveningAvg = eveningData.total / eveningData.count;

    const morningDominant = this.getDominantEmotion(morningData.emotions);
    const eveningDominant = this.getDominantEmotion(eveningData.emotions);

    const strength = Math.abs(morningAvg - eveningAvg) / 10;
    if (strength < 0.2) return null;

    return {
      pattern: {
        id: `circadian_${Date.now()}`,
        type: 'circadian',
        strength: Math.min(strength, 1),
        description: `Mood varies throughout the day: ${morningDominant} in mornings, ${eveningDominant} in evenings`,
        evidence: [
          `Morning average intensity: ${morningAvg.toFixed(1)} (${morningData.count} entries)`,
          `Evening average intensity: ${eveningAvg.toFixed(1)} (${eveningData.count} entries)`,
          `Morning dominant mood: ${morningDominant}`,
          `Evening dominant mood: ${eveningDominant}`,
        ],
      },
      insights: [{
        title: 'Your Daily Rhythm',
        description: `You tend to feel ${morningDominant} in the mornings and ${eveningDominant} in the evenings.`,
        confidence: strength,
        actionable: true,
        recommendation: morningAvg > eveningAvg
          ? 'Schedule important tasks in the morning when your mood is typically higher.'
          : 'Reserve evenings for self-care activities when your mood is typically better.',
      }],
      recommendations: [
        `Morning: Focus on ${morningDominant === 'energetic' || morningDominant === 'motivated' ? 'challenging tasks' : 'gentle activities'}`,
        `Evening: Practice ${eveningDominant === 'calm' || eveningDominant === 'relaxed' ? 'meditation' : 'energizing exercises'}`,
        'Maintain consistent sleep times to stabilize your circadian rhythm',
      ],
    };
  }

  /**
   * Detect weekly patterns
   */
  private detectWeeklyPatterns(): { pattern: DetectedPattern; insights: PatternInsight[]; recommendations: string[] } | null {
    if (this.moodHistory.length < 30) return null;

    const dayGroups: Record<number, { totalIntensity: number; emotionCounts: Map<string, number>; count: number }> = {};

    this.moodHistory.forEach(entry => {
      const day = getDay(entry.timestamp);
      if (!dayGroups[day]) {
        dayGroups[day] = { totalIntensity: 0, emotionCounts: new Map(), count: 0 };
      }
      dayGroups[day].totalIntensity += entry.intensity;
      dayGroups[day].emotionCounts.set(
        entry.emotion,
        (dayGroups[day].emotionCounts.get(entry.emotion) || 0) + 1
      );
      dayGroups[day].count++;
    });

    // Weekday vs Weekend comparison
    let weekdayData = { total: 0, count: 0, emotions: new Map<string, number>() };
    let weekendData = { total: 0, count: 0, emotions: new Map<string, number>() };

    Object.entries(dayGroups).forEach(([day, data]) => {
      const d = parseInt(day);
      const isWeekendDay = d === 0 || d === 6;

      if (isWeekendDay) {
        weekendData.total += data.totalIntensity;
        weekendData.count += data.count;
        data.emotionCounts.forEach((count, emotion) => {
          weekendData.emotions.set(emotion, (weekendData.emotions.get(emotion) || 0) + count);
        });
      } else {
        weekdayData.total += data.totalIntensity;
        weekdayData.count += data.count;
        data.emotionCounts.forEach((count, emotion) => {
          weekdayData.emotions.set(emotion, (weekdayData.emotions.get(emotion) || 0) + count);
        });
      }
    });

    if (weekdayData.count < 10 || weekendData.count < 5) return null;

    const weekdayAvg = weekdayData.total / weekdayData.count;
    const weekendAvg = weekendData.total / weekendData.count;
    const strength = Math.abs(weekdayAvg - weekendAvg) / 10;

    if (strength < 0.15) return null;

    const weekdayDominant = this.getDominantEmotion(weekdayData.emotions);
    const weekendDominant = this.getDominantEmotion(weekendData.emotions);

    return {
      pattern: {
        id: `weekly_${Date.now()}`,
        type: 'weekly',
        strength: Math.min(strength, 1),
        description: `Mood differs between weekdays (${weekdayDominant}) and weekends (${weekendDominant})`,
        evidence: [
          `Weekday average: ${weekdayAvg.toFixed(1)} (${weekdayData.count} entries)`,
          `Weekend average: ${weekendAvg.toFixed(1)} (${weekendData.count} entries)`,
          `Weekday dominant: ${weekdayDominant}`,
          `Weekend dominant: ${weekendDominant}`,
        ],
      },
      insights: [{
        title: 'Weekday vs Weekend Patterns',
        description: `Your mood tends to be ${weekdayDominant} on weekdays and ${weekendDominant} on weekends.`,
        confidence: strength,
        actionable: true,
        recommendation: weekdayAvg < weekendAvg
          ? 'Use weekends to recharge. Consider shorter workweeks if possible.'
          : 'You thrive during the week. Maintain work-life balance to preserve this energy.',
      }],
      recommendations: [
        weekdayAvg < weekendAvg
          ? 'Plan enjoyable activities during weekends to maintain momentum'
          : 'Continue weekday routines that contribute to your positive mood',
        'Consider what aspects of weekends improve your mood and incorporate them into weekdays',
        'Track specific activities to identify what makes weekends different',
      ],
    };
  }

  /**
   * Detect trigger patterns (times/events that trigger mood changes)
   */
  private detectTriggerPatterns(): { patterns: DetectedPattern[]; insights: PatternInsight[]; recommendations: string[] } | null {
    if (this.moodHistory.length < 15) return null;

    const drops: Array<{ date: Date; from: string; to: string; intensity: number }> = [];

    for (let i = 1; i < this.moodHistory.length; i++) {
      const prev = this.moodHistory[i - 1];
      const curr = this.moodHistory[i];

      if (curr.intensity < prev.intensity - 2) {
        drops.push({
          date: curr.timestamp,
          from: prev.emotion,
          to: curr.emotion,
          intensity: prev.intensity - curr.intensity,
        });
      }
    }

    if (drops.length < 3) return null;

    // Find common drop times
    const hourCounts: Record<number, number> = {};
    drops.forEach(drop => {
      const hour = getHours(drop.date);
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
    const patterns: DetectedPattern[] = [];

    if (peakHour && peakHour[1] >= 3) {
      patterns.push({
        id: `trigger_time_${Date.now()}`,
        type: 'trigger',
        strength: peakHour[1] / drops.length,
        description: `Mood tends to drop around ${this.formatHour(parseInt(peakHour[0]))}`,
        evidence: [
          `${drops.length} mood drops detected`,
          `${peakHour[1]} drops occurred around ${this.formatHour(parseInt(peakHour[0]))}`,
          'Pattern suggests a time-based trigger',
        ],
      });
    }

    return {
      patterns,
      insights: patterns.length > 0 ? [{
        title: 'Potential Mood Triggers',
        description: `Your mood tends to drop around ${this.formatHour(parseInt(peakHour[0]))}. This could be related to work stress, fatigue, or daily routines.`,
        confidence: peakHour[1] / drops.length,
        actionable: true,
        recommendation: `Plan calming activities around ${this.formatHour(parseInt(peakHour[0]))} to prevent mood drops.`,
      }] : [],
      recommendations: [
        `Schedule relaxation time around ${this.formatHour(parseInt(peakHour[0]))}`,
        'Keep a detailed journal during high-risk times to identify specific triggers',
        'Consider preemptive wellness sessions 30 minutes before typical drop times',
      ],
    };
  }

  /**
   * Detect how user responds to different activities
   */
  private detectResponsePatterns(): { patterns: DetectedPattern[]; insights: PatternInsight[]; recommendations: string[] } | null {
    if (this.wellnessHistory.length < 5) return null;

    const activityEffects: Record<string, { improvements: number[]; counts: number }> = {};

    this.wellnessHistory.forEach(session => {
      const type = session.type;
      if (!activityEffects[type]) {
        activityEffects[type] = { improvements: [], counts: 0 };
      }

      if (session.moodBefore && session.moodAfter) {
        const beforeIntensity = typeof session.moodBefore === 'number'
          ? session.moodBefore
          : this.getEmotionIntensity(session.moodBefore);
        const afterIntensity = typeof session.moodAfter === 'number'
          ? session.moodAfter
          : this.getEmotionIntensity(session.moodAfter);
        activityEffects[type].improvements.push(afterIntensity - beforeIntensity);
      }
      activityEffects[type].counts++;
    });

    const patterns: DetectedPattern[] = [];
    const insights: PatternInsight[] = [];
    const recommendations: string[] = [];

    Object.entries(activityEffects).forEach(([activity, data]) => {
      if (data.improvements.length >= 2) {
        const avgImprovement = data.improvements.reduce((a, b) => a + b, 0) / data.improvements.length;
        const positiveRate = data.improvements.filter(i => i > 0).length / data.improvements.length;

        if (avgImprovement > 0.5 || positiveRate > 0.6) {
          patterns.push({
            id: `response_${activity}_${Date.now()}`,
            type: 'response',
            strength: Math.min(Math.abs(avgImprovement) / 3, 1),
            description: `${activity} sessions tend to improve mood by ${avgImprovement.toFixed(1)} points`,
            evidence: [
              `Analyzed ${data.improvements.length} ${activity} sessions`,
              `Average improvement: ${avgImprovement.toFixed(1)}`,
              `Positive response rate: ${(positiveRate * 100).toFixed(0)}%`,
            ],
          });

          insights.push({
            title: `${this.capitalize(activity)} Works for You`,
            description: `${this.capitalize(activity)} sessions have a ${(positiveRate * 100).toFixed(0)}% positive response rate.`,
            confidence: positiveRate,
            actionable: true,
            recommendation: `Incorporate more ${activity} sessions into your routine, especially during low mood periods.`,
          });

          recommendations.push(
            `Schedule ${activity} sessions 2-3 times per week`,
            `Use ${activity} as a preventive measure during known low-mood periods`
          );
        }
      }
    });

    return { patterns, insights, recommendations };
  }

  /**
   * Detect correlations between factors
   */
  private detectCorrelations(): { patterns: DetectedPattern[]; insights: PatternInsight[]; recommendations: string[] } | null {
    // Simplified correlation detection
    const patterns: DetectedPattern[] = [];
    const insights: PatternInsight[] = [];
    const recommendations: string[] = [];

    // Check for consistency in wellness activity timing
    if (this.wellnessHistory.length >= 10) {
      const hourGroups: Record<number, number> = {};
      this.wellnessHistory.forEach(session => {
        const hour = getHours(session.completedAt);
        hourGroups[hour] = (hourGroups[hour] || 0) + 1;
      });

      const peakHours = Object.entries(hourGroups)
        .filter(([_, count]) => count >= 3)
        .sort((a, b) => b[1] - a[1]);

      if (peakHours.length > 0) {
        patterns.push({
          id: `correlation_timing_${Date.now()}`,
          type: 'correlation',
          strength: peakHours[0][1] / this.wellnessHistory.length,
          description: `You tend to do wellness activities around ${this.formatHour(parseInt(peakHours[0][0]))}`,
          evidence: [
            `${peakHours[0][1]} of ${this.wellnessHistory.length} activities at ${this.formatHour(parseInt(peakHours[0][0]))}`,
            'Strong timing preference detected',
          ],
        });

        insights.push({
          title: 'Optimal Activity Time',
          description: `You consistently practice wellness activities around ${this.formatHour(parseInt(peakHours[0][0]))}. This routine helps build lasting habits.`,
          confidence: peakHours[0][1] / this.wellnessHistory.length,
          actionable: true,
          recommendation: 'Maintain this consistent practice time to maximize benefits.',
        });

        recommendations.push(
          `Continue your ${this.formatHour(parseInt(peakHours[0][0]))} wellness routine`,
          'Consider gradually adding new activities during this time slot'
        );
      }
    }

    return { patterns, insights, recommendations };
  }

  /**
   * Helper: Get dominant emotion from emotion counts
   */
  private getDominantEmotion(emotionCounts: Map<string, number>): string {
    let dominant = 'neutral';
    let maxCount = 0;

    emotionCounts.forEach((count, emotion) => {
      if (count > maxCount) {
        maxCount = count;
        dominant = emotion;
      }
    });

    return dominant;
  }

  /**
   * Helper: Get intensity from emotion
   */
  private getEmotionIntensity(emotion: string): number {
    const positiveEmotions = ['happy', 'calm', 'energetic', 'grateful', 'motivated'];
    const negativeEmotions = ['sad', 'anxious', 'stressed', 'tired', 'frustrated'];

    if (positiveEmotions.includes(emotion.toLowerCase())) return 7;
    if (negativeEmotions.includes(emotion.toLowerCase())) return 3;
    return 5;
  }

  /**
   * Helper: Format hour for display
   */
  private formatHour(hour: number): string {
    if (hour === 0) return 'midnight';
    if (hour === 12) return 'noon';
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
  }

  /**
   * Helper: Capitalize first letter
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// ============================================================================
// Recommendation Engine
// ============================================================================

export class RecommendationEngine {
  private moodHistory: Array<{ emotion: string; intensity: number; timestamp: Date }>;
  private wellnessHistory: Array<{ type: string; category: string; name: string; completedAt: Date }>;
  private meditationContent: Array<{ id: string; name: string; category: string; level: string }>;
  private yogaContent: Array<{ id: string; name: string; category: string; level: string }>;
  private musicContent: Array<{ id: string; name: string; mood: string; genre: string }>;

  constructor(
    moodHistory: Array<{ emotion: string; intensity: number; timestamp: Date }>,
    wellnessHistory: Array<{ type: string; category: string; name: string; completedAt: Date }>,
    meditationContent: Array<{ id: string; name: string; category: string; level: string }>,
    yogaContent: Array<{ id: string; name: string; category: string; level: string }>,
    musicContent: Array<{ id: string; name: string; mood: string; genre: string }>
  ) {
    this.moodHistory = moodHistory;
    this.wellnessHistory = wellnessHistory;
    this.meditationContent = meditationContent;
    this.yogaContent = yogaContent;
    this.musicContent = musicContent;
  }

  /**
   * Generate personalized recommendations
   */
  generateRecommendations(count: number = 5): RecommendationResult {
    const recommendations: SessionRecommendation[] = [];
    const personalizedTips: string[] = [];
    const optimalSchedule: OptimalSchedule[] = [];

    // Get current mood context
    const currentMood = this.getCurrentMood();
    const recentTrends = this.analyzeRecentTrends();

    // Generate meditation recommendations
    const meditationRecs = this.recommendMeditations(currentMood, recentTrends);
    recommendations.push(...meditationRecs);

    // Generate yoga recommendations
    const yogaRecs = this.recommendYoga(currentMood, recentTrends);
    recommendations.push(...yogaRecs);

    // Generate music recommendations
    const musicRecs = this.recommendMusic(currentMood, recentTrends);
    recommendations.push(...musicRecs);

    // Sort by score and take top N
    const sortedRecs = recommendations.sort((a, b) => b.score - a.score).slice(0, count);

    // Generate personalized tips
    personalizedTips.push(...this.generateTips(currentMood, recentTrends));

    // Determine optimal schedule
    optimalSchedule.push(...this.determineOptimalSchedule());

    return {
      recommendations: sortedRecs,
      personalizedTips,
      optimalSchedule,
    };
  }

  /**
   * Get current mood context
   */
  private getCurrentMood(): { emotion: string; intensity: number } {
    if (this.moodHistory.length === 0) {
      return { emotion: 'neutral', intensity: 5 };
    }
    return {
      emotion: this.moodHistory[this.moodHistory.length - 1].emotion,
      intensity: this.moodHistory[this.moodHistory.length - 1].intensity,
    };
  }

  /**
   * Analyze recent mood trends
   */
  private analyzeRecentTrends(): { trend: string; volatility: number } {
    if (this.moodHistory.length < 3) {
      return { trend: 'stable', volatility: 0 };
    }

    const recent = this.moodHistory.slice(-7);
    const intensities = recent.map(m => m.intensity);

    // Calculate trend
    const trend = (intensities[intensities.length - 1] - intensities[0]) / intensities.length;

    // Calculate volatility (standard deviation)
    const mean = intensities.reduce((a, b) => a + b, 0) / intensities.length;
    const variance = intensities.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / intensities.length;

    return {
      trend: trend > 0.2 ? 'improving' : trend < -0.2 ? 'declining' : 'stable',
      volatility: Math.sqrt(variance),
    };
  }

  /**
   * Recommend meditations based on mood
   */
  private recommendMeditations(
    currentMood: { emotion: string; intensity: number },
    trends: { trend: string; volatility: number }
  ): SessionRecommendation[] {
    const recommendations: SessionRecommendation[] = [];
    const categoryMap: Record<string, string> = {
      'anxious': 'anxiety',
      'stressed': 'stress',
      'sad': 'sleep',
      'tired': 'energy',
      'calm': 'focus',
      'happy': 'gratitude',
    };

    const targetCategory = categoryMap[currentMood.emotion.toLowerCase()] || 'general';

    this.meditationContent
      .filter(m => m.category === targetCategory || m.category === 'breathing')
      .slice(0, 3)
      .forEach((meditation, idx) => {
        let score = 0.8 - idx * 0.1;
        let predictedEffect = '';
        let reasoning: string[] = [];
        let urgency: 'high' | 'medium' | 'low' = 'medium';

        // Adjust score based on trends
        if (trends.trend === 'declining' && ['anxiety', 'stress'].includes(targetCategory)) {
          score += 0.15;
          urgency = 'high';
        }

        if (trends.volatility > 2) {
          score += 0.1;
          reasoning.push('Helps stabilize mood fluctuations');
        }

        reasoning.push(`Targets ${targetCategory} mood patterns`);
        reasoning.push('Recommended based on current emotional state');

        predictedEffect = this.predictMeditationEffect(currentMood.emotion, targetCategory);

        recommendations.push({
          sessionId: meditation.id,
          sessionType: 'meditation',
          name: meditation.name,
          score: Math.min(score, 1),
          predictedEffect,
          reasoning,
          urgency,
        });
      });

    return recommendations;
  }

  /**
   * Recommend yoga based on mood
   */
  private recommendYoga(
    currentMood: { emotion: string; intensity: number },
    trends: { trend: string; volatility: number }
  ): SessionRecommendation[] {
    const recommendations: SessionRecommendation[] = [];

    // Map mood to yoga category and level
    const categoryMap: Record<string, { category: string; level: string }> = {
      'anxious': { category: 'seated', level: 'beginner' },
      'stressed': { category: 'restorative', level: 'beginner' },
      'tired': { category: 'energizing', level: 'beginner' },
      'sad': { category: 'backbend', level: 'intermediate' },
      'calm': { category: 'balance', level: 'intermediate' },
      'energetic': { category: 'standing', level: 'advanced' },
    };

    const moodConfig = categoryMap[currentMood.emotion.toLowerCase()] || { category: 'standing', level: 'beginner' };

    // Get user's preferred level based on history
    const userLevel = this.determineUserYogaLevel();

    this.yogaContent
      .filter(y => y.category === moodConfig.category || y.level === userLevel)
      .slice(0, 2)
      .forEach((pose, idx) => {
        let score = 0.7 - idx * 0.1;
        let predictedEffect = '';
        let reasoning: string[] = [];
        let urgency: 'high' | 'medium' | 'low' = 'medium';

        // Adjust for trends
        if (trends.trend === 'declining') {
          score += 0.1;
          urgency = 'high';
        }

        reasoning.push(`Matches your ${moodConfig.category} needs`);
        reasoning.push(`Appropriate for your ${userLevel} level`);

        predictedEffect = this.predictYogaEffect(currentMood.emotion, moodConfig.category);

        recommendations.push({
          sessionId: pose.id,
          sessionType: 'yoga',
          name: pose.name,
          score: Math.min(score, 1),
          predictedEffect,
          reasoning,
          urgency,
        });
      });

    return recommendations;
  }

  /**
   * Recommend music based on mood
   */
  private recommendMusic(
    currentMood: { emotion: string; intensity: number },
    trends: { trend: string; volatility: number }
  ): SessionRecommendation[] {
    const recommendations: SessionRecommendation[] = [];

    // Map mood to music genre/mood
    const moodMap: Record<string, string> = {
      'anxious': 'calm',
      'stressed': 'calm',
      'sad': 'comfort',
      'tired': 'energetic',
      'calm': 'focus',
      'happy': 'happy',
      'energetic': 'energetic',
      'motivated': 'energetic',
    };

    const targetMood = moodMap[currentMood.emotion.toLowerCase()] || 'all';

    this.musicContent
      .filter(m => m.mood === targetMood || m.mood === 'all')
      .slice(0, 2)
      .forEach((playlist, idx) => {
        let score = 0.75 - idx * 0.1;
        let predictedEffect = '';
        let reasoning: string[] = [];
        let urgency: 'high' | 'medium' | 'low' = 'medium';

        if (trends.trend === 'declining' && ['calm', 'comfort'].includes(targetMood)) {
          score += 0.15;
          urgency = 'high';
        }

        reasoning.push(`Matches your ${targetMood} mood state`);
        reasoning.push('Curated for emotional resonance');

        predictedEffect = this.predictMusicEffect(currentMood.emotion, targetMood);

        recommendations.push({
          sessionId: playlist.id,
          sessionType: 'music',
          name: playlist.name,
          score: Math.min(score, 1),
          predictedEffect,
          reasoning,
          urgency,
        });
      });

    return recommendations;
  }

  /**
   * Determine user's yoga level based on history
   */
  private determineUserYogaLevel(): string {
    const yogaSessions = this.wellnessHistory.filter(w => w.type === 'yoga');
    if (yogaSessions.length < 3) return 'beginner';

    // Check for advanced pose references
    const advancedKeywords = ['advanced', 'intermediate', 'challenge'];
    const hasAdvanced = yogaSessions.some(s =>
      advancedKeywords.some(key => s.name.toLowerCase().includes(key))
    );

    return hasAdvanced ? 'intermediate' : 'beginner';
  }

  /**
   * Predict meditation effect
   */
  private predictMeditationEffect(currentEmotion: string, category: string): string {
    const effects: Record<string, string> = {
      'anxiety': 'Reduce anxiety by 40-60% within 15 minutes',
      'stress': 'Lower stress hormones and promote relaxation',
      'sleep': 'Prepare mind for restful sleep',
      'energy': 'Increase alertness and mental clarity',
      'focus': 'Enhance concentration and present-moment awareness',
      'gratitude': 'Cultivate appreciation and positive outlook',
      'breathing': 'Activate calm response and reduce tension',
    };
    return effects[category] || 'Promote overall emotional well-being';
  }

  /**
   * Predict yoga effect
   */
  private predictYogaEffect(currentEmotion: string, category: string): string {
    const effects: Record<string, string> = {
      'seated': 'Ground emotions and reduce mental chatter',
      'restorative': 'Deep relaxation and stress release',
      'energizing': 'Boost energy and vitality',
      'backbend': 'Open heart and uplift mood',
      'balance': 'Enhance mental equilibrium and focus',
      'standing': 'Build strength and confidence',
    };
    return effects[category] || 'Improve overall physical and mental well-being';
  }

  /**
   * Predict music effect
   */
  private predictMusicEffect(currentEmotion: string, mood: string): string {
    const effects: Record<string, string> = {
      'calm': 'Reduce stress and create peaceful atmosphere',
      'comfort': 'Provide emotional support and validation',
      'energetic': 'Boost mood and motivation',
      'focus': 'Enhance concentration and productivity',
      'happy': 'Elevate mood and spread positivity',
    };
    return effects[mood] || 'Support emotional well-being through sound';
  }

  /**
   * Generate personalized tips
   */
  private generateTips(
    currentMood: { emotion: string; intensity: number },
    trends: { trend: string; volatility: number }
  ): string[] {
    const tips: string[] = [];

    if (trends.trend === 'declining') {
      tips.push('Consider adding a short 5-minute meditation to your morning routine');
      tips.push('Your body might need more rest - prioritize sleep tonight');
    }

    if (trends.volatility > 2) {
      tips.push('Try consistent daily wellness activities to stabilize mood');
      tips.push('Journaling before bed can help process daily emotions');
    }

    if (currentMood.intensity < 4) {
      tips.push('Start with gentle activities - avoid demanding workouts today');
      tips.push('Reach out to a friend or support person if needed');
    }

    if (currentMood.emotion === 'anxious' || currentMood.emotion === 'stressed') {
      tips.push('Practice 4-7-8 breathing: inhale 4s, hold 7s, exhale 8s');
      tips.push('Limit caffeine intake for the next few hours');
    }

    return tips;
  }

  /**
   * Determine optimal activity schedule
   */
  private determineOptimalSchedule(): OptimalSchedule[] {
    const schedule: OptimalSchedule[] = [];

    // Analyze when user typically does activities
    const hourGroups: Record<number, number> = {};
    this.wellnessHistory.forEach(session => {
      const hour = getHours(session.completedAt);
      hourGroups[hour] = (hourGroups[hour] || 0) + 1;
    });

    const peakHours = Object.entries(hourGroups)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    peakHours.forEach(([hour, count]) => {
      const h = parseInt(hour);
      let activity = 'wellness session';
      let reason = 'Consistent practice time';

      if (h >= 5 && h <= 9) {
        activity = 'morning meditation or yoga';
        reason = 'Morning practice sets a positive tone for the day';
      } else if (h >= 12 && h <= 14) {
        activity = 'midday mindfulness break';
        reason = 'Afternoon practice combats post-lunch fatigue';
      } else if (h >= 17 && h <= 19) {
        activity = 'evening wind-down routine';
        reason = 'Evening practice helps transition to rest';
      } else if (h >= 20 && h <= 22) {
        activity = 'relaxation or sleep meditation';
        reason = 'Late practice prepares mind for restful sleep';
      }

      schedule.push({
        timeSlot: this.formatHour(h),
        activity,
        confidence: count / this.wellnessHistory.length,
        reason,
      });
    });

    return schedule;
  }

  /**
   * Format hour for display
   */
  private formatHour(hour: number): string {
    if (hour === 0) return 'Midnight';
    if (hour === 12) return 'Noon';
    if (hour < 12) return `${hour}:00 AM`;
    return `${hour - 12}:00 PM`;
  }
}

// ============================================================================
// Sentiment Analysis Engine
// ============================================================================

export class SentimentAnalysisEngine {
  private positiveWords: Set<string>;
  private negativeWords: Set<string>;
  private emotionKeywords: Map<string, string[]>;

  constructor() {
    this.positiveWords = new Set([
      'happy', 'joy', 'great', 'wonderful', 'amazing', 'love', 'grateful', 'excited',
      'peaceful', 'calm', 'content', 'fulfilled', 'motivated', 'energetic', 'hopeful',
      'confident', 'proud', 'accomplished', 'relaxed', 'blessed', 'appreciate',
      'enjoy', 'beautiful', 'good', 'better', 'best', 'success', 'progress', 'growth',
    ]);

    this.negativeWords = new Set([
      'sad', 'depressed', 'anxious', 'stressed', 'worried', 'frustrated', 'angry',
      'tired', 'exhausted', 'overwhelmed', 'lonely', 'hopeless', 'nervous', 'scared',
      'disappointed', 'fail', 'failed', 'mistake', 'wrong', 'bad', 'terrible',
      'awful', 'hate', 'difficult', 'hard', 'struggle', 'pain', 'hurt', 'upset',
    ]);

    this.emotionKeywords = new Map([
      ['happy', ['happy', 'joy', 'excited', 'cheerful', 'delighted', 'pleased']],
      ['calm', ['calm', 'peaceful', 'relaxed', 'serene', 'tranquil', 'centered']],
      ['anxious', ['anxious', 'nervous', 'worried', 'uneasy', 'tense', 'apprehensive']],
      ['stressed', ['stressed', 'overwhelmed', 'pressure', 'burden', 'tension', 'strain']],
      ['sad', ['sad', 'down', 'blue', 'melancholy', 'unhappy', 'disappointed']],
      ['grateful', ['grateful', 'thankful', 'appreciate', 'blessed', 'fortunate', 'appreciative']],
      ['motivated', ['motivated', 'inspired', 'driven', 'energized', 'focused', 'determined']],
      ['tired', ['tired', 'exhausted', 'fatigue', 'weary', 'drained', 'sleepy']],
      ['frustrated', ['frustrated', 'annoyed', 'irritated', 'aggravated', 'impatient', 'stuck']],
    ]);
  }

  /**
   * Analyze sentiment in text
   */
  analyze(text: string): SentimentResult {
    const words = text.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;
    const detectedEmotions: Map<string, number> = new Map();
    const themes: string[] = [];
    const keywords: string[] = [];

    // Count positive/negative words
    words.forEach(word => {
      const cleanWord = word.replace(/[^a-z]/g, '');
      if (this.positiveWords.has(cleanWord)) {
        positiveCount++;
        keywords.push(cleanWord);
      }
      if (this.negativeWords.has(cleanWord)) {
        negativeCount++;
        keywords.push(cleanWord);
      }
    });

    // Detect specific emotions
    this.emotionKeywords.forEach((triggerWords, emotion) => {
      const matches = words.filter(word =>
        triggerWords.some(trigger => word.includes(trigger))
      ).length;
      if (matches > 0) {
        detectedEmotions.set(emotion, matches);
      }
    });

    // Calculate overall score (-1 to 1)
    const total = positiveCount + negativeCount || 1;
    const overallScore = (positiveCount - negativeCount) / total;

    // Determine emotions with intensity
    const emotions: DetectedEmotion[] = [];
    detectedEmotions.forEach((count, name) => {
      const intensity = count > 2 ? 'high' : count > 1 ? 'medium' : 'low';
      emotions.push({
        name,
        score: Math.min(count / 3, 1),
        intensity,
      });
    });

    // Sort by score
    emotions.sort((a, b) => b.score - a.score);

    // Generate themes based on detected patterns
    if (overallScore > 0.3) {
      themes.push('Positive outlook');
    } else if (overallScore < -0.3) {
      themes.push('Challenging emotional state');
    }

    if (emotions.length > 0) {
      themes.push(`${emotions[0].name.charAt(0).toUpperCase() + emotions[0].name.slice(1)} focus`);
    }

    // Generate suggestions
    const suggestions = this.generateSuggestions(overallScore, emotions);

    return {
      overallScore,
      emotions,
      themes,
      keywords: [...new Set(keywords)],
      suggestions,
    };
  }

  /**
   * Generate suggestions based on analysis
   */
  private generateSuggestions(overallScore: number, emotions: DetectedEmotion[]): string[] {
    const suggestions: string[] = [];

    if (overallScore < -0.3) {
      suggestions.push('Consider talking to a friend or mental health professional');
      suggestions.push('Try a gentle meditation to process these emotions');
      suggestions.push('Be gentle with yourself - difficult emotions are temporary');
    }

    emotions.forEach(emotion => {
      switch (emotion.name) {
        case 'anxious':
          suggestions.push('Practice deep breathing exercises');
          suggestions.push('Ground yourself in the present moment');
          break;
        case 'stressed':
          suggestions.push('Take a short break from your current task');
          suggestions.push('List what you can control vs what you cannot');
          break;
        case 'tired':
          suggestions.push('Consider a short rest or nap');
          suggestions.push('Ensure you stayed hydrated today');
          break;
        case 'sad':
          suggestions.push('Allow yourself to feel these emotions');
          suggestions.push('Reach out to someone you trust');
          break;
      }
    });

    if (overallScore > 0.3) {
      suggestions.push('Take a moment to appreciate this positive state');
      suggestions.push('Consider journaling about what contributed to these feelings');
    }

    return suggestions.slice(0, 3);
  }
}

// ============================================================================
// Main ML Service
// ============================================================================

export class MLService {
  private predictionModel: MoodPredictionModel;
  private sentimentEngine: SentimentAnalysisEngine;
  private modelState: ModelState;

  constructor() {
    this.predictionModel = new MoodPredictionModel();
    this.sentimentEngine = new SentimentAnalysisEngine();
    this.modelState = {
      version: '1.0.0',
      isTrained: false,
      lastTrained: null,
      accuracy: 0,
      loss: 0,
      dataPointsProcessed: 0,
    };
  }

  /**
   * Train all models with user data
   */
  trainModels(
    moodHistory: Array<{ emotion: string; intensity: number; timestamp: Date }>,
    wellnessHistory: Array<{ type: string; category: string; name: string; completedAt: Date }>,
    meditationContent: Array<{ id: string; name: string; category: string; level: string }>,
    yogaContent: Array<{ id: string; name: string; category: string; level: string }>,
    musicContent: Array<{ id: string; name: string; mood: string; genre: string }>
  ): void {
    // Train prediction model
    const history = this.predictionModel.train(moodHistory);
    const modelState = this.predictionModel.getState();
    this.modelState = {
      ...this.modelState,
      ...modelState,
      lastTrained: new Date(),
    };
  }

  /**
   * Predict future moods
   */
  predictMoods(
    moodHistory: Array<{ emotion: string; intensity: number; timestamp: Date }>,
    daysAhead: number = 7
  ): MoodPredictionResult {
    return this.predictionModel.predict(moodHistory, daysAhead);
  }

  /**
   * Detect patterns in data
   */
  detectPatterns(
    moodHistory: Array<{ emotion: string; intensity: number; timestamp: Date }>,
    wellnessHistory: Array<{ type: string; category: string; moodBefore?: number; moodAfter?: number; completedAt: Date }>
  ): PatternResult {
    const engine = new PatternDetectionEngine(moodHistory, wellnessHistory);
    return engine.detectAll();
  }

  /**
   * Generate recommendations
   */
  generateRecommendations(
    moodHistory: Array<{ emotion: string; intensity: number; timestamp: Date }>,
    wellnessHistory: Array<{ type: string; category: string; name: string; completedAt: Date }>,
    meditationContent: Array<{ id: string; name: string; category: string; level: string }>,
    yogaContent: Array<{ id: string; name: string; category: string; level: string }>,
    musicContent: Array<{ id: string; name: string; mood: string; genre: string }>
  ): RecommendationResult {
    const engine = new RecommendationEngine(
      moodHistory,
      wellnessHistory,
      meditationContent,
      yogaContent,
      musicContent
    );
    return engine.generateRecommendations();
  }

  /**
   * Analyze sentiment in text
   */
  analyzeSentiment(text: string): SentimentResult {
    return this.sentimentEngine.analyze(text);
  }

  /**
   * Get model state
   */
  getModelState(): ModelState {
    return { ...this.modelState };
  }
}

// Export singleton instance
export const mlService = new MLService();

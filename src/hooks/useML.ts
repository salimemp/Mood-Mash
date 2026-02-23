// ============================================================================
// ML Integration Hook for MoodMash
// Connects ML service with React components
// ============================================================================

import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  mlService,
  MoodPredictionResult,
  PatternResult,
  RecommendationResult,
  SentimentResult,
} from '../data/mlModels';
import { MoodEntry } from '../contexts/MoodContext';
import { MeditationSession, YogaPose, MusicPlaylist } from '../data/wellnessContent';

// Minimal wellness history type
interface WellnessHistoryEntry {
  type: string;
  category: string;
  name: string;
  completedAt: Date;
  moodBefore?: number;
  moodAfter?: number;
}

// ============================================================================
// Types
// ============================================================================

export interface MLPredictions {
  predictions: MoodPredictionResult | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export interface MLPatterns {
  patterns: PatternResult | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export interface MLRecommendations {
  recommendations: RecommendationResult | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export interface MLSentiment {
  sentiment: SentimentResult | null;
  analyze: (text: string) => SentimentResult;
}

export interface MLModelStatus {
  isTrained: boolean;
  accuracy: number;
  lastTrained: Date | null;
  dataPointsProcessed: number;
}

// ============================================================================
// Hook: useMLPredictions
// ============================================================================

export function useMLPredictions(
  moodHistory: MoodEntry[],
  wellnessHistory: WellnessHistoryEntry[]
): MLPredictions {
  const [predictions, setPredictions] = useState<MoodPredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (moodHistory.length < 7) {
      setError('Need at least 7 mood entries for predictions');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = mlService.predictMoods(
        moodHistory.map(m => ({
          emotion: m.emotion,
          intensity: m.intensity,
                  timestamp: new Date(m.createdAt),
        })),
        7
      );
      setPredictions(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate predictions');
    } finally {
      setIsLoading(false);
    }
  }, [moodHistory]);

  useEffect(() => {
    if (moodHistory.length >= 7) {
      refresh();
    }
  }, [moodHistory.length]);

  return { predictions, isLoading, error, refresh };
}

// ============================================================================
// Hook: useMLPatterns
// ============================================================================

export function useMLPatterns(
  moodHistory: MoodEntry[],
  wellnessHistory: WellnessHistoryEntry[]
): MLPatterns {
  const [patterns, setPatterns] = useState<PatternResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (moodHistory.length < 14) {
      setError('Need at least 14 mood entries to detect patterns');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = mlService.detectPatterns(
        moodHistory.map(m => ({
          emotion: m.emotion,
          intensity: m.intensity,
                  timestamp: new Date(m.createdAt),
        })),
        wellnessHistory.map(w => ({
          type: w.type,
          category: w.category,
          moodBefore: w.moodBefore,
          moodAfter: w.moodAfter,
          completedAt: new Date(w.completedAt),
        }))
      );
      setPatterns(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to detect patterns');
    } finally {
      setIsLoading(false);
    }
  }, [moodHistory, wellnessHistory]);

  useEffect(() => {
    if (moodHistory.length >= 14) {
      refresh();
    }
  }, [moodHistory.length]);

  return { patterns, isLoading, error, refresh };
}

// ============================================================================
// Hook: useMLRecommendations
// ============================================================================

export function useMLRecommendations(
  moodHistory: MoodEntry[],
  wellnessHistory: WellnessHistoryEntry[],
  meditationContent: MeditationSession[],
  yogaContent: YogaPose[],
  musicContent: MusicPlaylist[]
): MLRecommendations {
  const [recommendations, setRecommendations] = useState<RecommendationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (moodHistory.length < 3) {
      setError('Need at least 3 mood entries for recommendations');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = mlService.generateRecommendations(
        moodHistory.map(m => ({
          emotion: m.emotion,
          intensity: m.intensity,
                  timestamp: new Date(m.createdAt),
        })),
        wellnessHistory.map(w => ({
          type: w.type,
          category: w.category,
          name: w.name,
          completedAt: new Date(w.completedAt),
        })),
        meditationContent.map(m => ({
          id: m.id,
          name: m.name,
          category: m.category,
          level: m.level,
        })),
        yogaContent.map(y => ({
          id: y.id,
          name: y.name,
          category: y.category,
          level: y.level,
        })),
        musicContent.map(mu => ({
          id: mu.id,
          name: mu.name,
          mood: mu.mood,
          genre: mu.genre,
        }))
      );
      setRecommendations(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate recommendations');
    } finally {
      setIsLoading(false);
    }
  }, [moodHistory, wellnessHistory, meditationContent, yogaContent, musicContent]);

  useEffect(() => {
    if (moodHistory.length >= 3) {
      refresh();
    }
  }, [moodHistory.length]);

  return { recommendations, isLoading, error, refresh };
}

// ============================================================================
// Hook: useMLSentiment
// ============================================================================

export function useMLSentiment(): MLSentiment {
  const [sentiment, setSentiment] = useState<SentimentResult | null>(null);

  const analyze = useCallback((text: string): SentimentResult => {
    const result = mlService.analyzeSentiment(text);
    setSentiment(result);
    return result;
  }, []);

  return { sentiment, analyze };
}

// ============================================================================
// Hook: useMLModelStatus
// ============================================================================

export function useMLModelStatus(): MLModelStatus {
  const [status, setStatus] = useState<MLModelStatus>({
    isTrained: false,
    accuracy: 0,
    lastTrained: null,
    dataPointsProcessed: 0,
  });

  useEffect(() => {
    const modelState = mlService.getModelState();
    setStatus({
      isTrained: modelState.isTrained,
      accuracy: modelState.accuracy * 100,
      lastTrained: modelState.lastTrained,
      dataPointsProcessed: modelState.dataPointsProcessed,
    });
  }, []);

  return status;
}

// ============================================================================
// Hook: useMoodTrend
// ============================================================================

export interface MoodTrend {
  trend: 'improving' | 'stable' | 'declining';
  volatility: number;
  averageIntensity: number;
  prediction: string;
}

export function useMoodTrend(moodHistory: MoodEntry[]): MoodTrend {
  return useMemo(() => {
    if (moodHistory.length < 3) {
      return {
        trend: 'stable' as const,
        volatility: 0,
        averageIntensity: 5,
        prediction: 'Not enough data for trend analysis',
      };
    }

    const recent = moodHistory.slice(0, 7);
    const intensities = recent.map(m => m.intensity);

    // Calculate average
    const averageIntensity = intensities.reduce((a, b) => a + b, 0) / intensities.length;

    // Calculate trend
    const trend = (intensities[0] - intensities[intensities.length - 1]) / intensities.length;

    // Calculate volatility (standard deviation)
    const mean = averageIntensity;
    const variance = intensities.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / intensities.length;
    const volatility = Math.sqrt(variance);

    let trendResult: 'improving' | 'stable' | 'declining';
    let prediction: string;

    if (trend > 0.3) {
      trendResult = 'improving';
      prediction = 'Your mood has been trending upward. Keep up the positive momentum!';
    } else if (trend < -0.3) {
      trendResult = 'declining';
      prediction = 'Your mood has been declining. Consider trying some wellness activities.';
    } else {
      trendResult = 'stable';
      prediction = 'Your mood has been stable. Great consistency!';
    }

    return {
      trend: trendResult,
      volatility,
      averageIntensity,
      prediction,
    };
  }, [moodHistory]);
}

// ============================================================================
// Hook: useOptimalTiming
// ============================================================================

export interface OptimalTiming {
  bestTimeForMeditation: string;
  bestTimeForYoga: string;
  bestTimeForMusic: string;
  highRiskTimes: string[];
}

export function useOptimalTiming(wellnessHistory: WellnessHistoryEntry[], moodHistory: MoodEntry[]): OptimalTiming {
  return useMemo(() => {
    const getBestTime = (type: string): string => {
      const filtered = wellnessHistory.filter(w => w.type === type);
      if (filtered.length === 0) return 'Not enough data';

      const hourCounts: Record<number, number> = {};
      filtered.forEach(w => {
        const hour = new Date(w.completedAt).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });

      const bestHour = Object.entries(hourCounts)
        .sort((a, b) => b[1] - a[1])[0];

      if (!bestHour) return 'Not enough data';

      const hour = parseInt(bestHour[0]);
      if (hour === 0) return 'Midnight';
      if (hour === 12) return 'Noon';
      if (hour < 12) return `${hour} AM`;
      return `${hour - 12} PM`;
    };

    // Find high-risk times (when negative moods are most common)
    const highRiskTimes: string[] = [];
    if (moodHistory.length >= 10) {
      const hourMoodMap: Record<number, { total: number; count: number }> = {};

      moodHistory.forEach(m => {
        const hour = new Date(m.createdAt).getHours();
        if (!hourMoodMap[hour]) {
          hourMoodMap[hour] = { total: 0, count: 0 };
        }
        hourMoodMap[hour].total += m.intensity;
        hourMoodMap[hour].count += 1;
      });

      const averages = Object.entries(hourMoodMap)
        .map(([hour, data]) => ({
          hour: parseInt(hour),
          average: data.total / data.count,
        }))
        .filter(d => d.average < 5)
        .sort((a, b) => a.average - b.average)
        .slice(0, 2);

      averages.forEach(d => {
        if (d.hour === 0) highRiskTimes.push('Around midnight');
        else if (d.hour < 12) highRiskTimes.push(`Around ${d.hour} AM`);
        else highRiskTimes.push(`Around ${d.hour - 12} PM`);
      });
    }

    return {
      bestTimeForMeditation: getBestTime('meditation'),
      bestTimeForYoga: getBestTime('yoga'),
      bestTimeForMusic: getBestTime('music'),
      highRiskTimes,
    };
  }, [wellnessHistory, moodHistory]);
}

// ============================================================================
// Hook: useAIAvailability
// ============================================================================

export interface AIAvailability {
  predictionsAvailable: boolean;
  patternsAvailable: boolean;
  recommendationsAvailable: boolean;
  minimumEntriesNeeded: number;
}

export function useAIAvailability(moodHistory: MoodEntry[]): AIAvailability {
  return useMemo(() => ({
    predictionsAvailable: moodHistory.length >= 7,
    patternsAvailable: moodHistory.length >= 14,
    recommendationsAvailable: moodHistory.length >= 3,
    minimumEntriesNeeded: 3,
  }), [moodHistory.length]);
}

export default {
  useMLPredictions,
  useMLPatterns,
  useMLRecommendations,
  useMLSentiment,
  useMLModelStatus,
  useMoodTrend,
  useOptimalTiming,
  useAIAvailability,
};

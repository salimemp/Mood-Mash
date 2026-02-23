// ============================================================================
// Advanced ML Services
// MoodMash - Mood Prediction, Pattern Recognition, Anomaly Detection
// ============================================================================

import type {
  MoodPredictionInput,
  MoodPredictionOutput,
  DetectedPattern,
  DetectedAnomaly,
  HealthCorrelation,
  PatternRecognitionConfig,
  AnomalyDetectionConfig,
  MoodPredictionConfig
} from '../types/advanced';

// Default configurations
const DEFAULT_MOOD_PREDICTION_CONFIG: MoodPredictionConfig = {
  sequence_length: 7,
  embedding_dim: 64,
  lstm_units: 128,
  attention_heads: 4,
  transformer_layers: 2,
  dropout_rate: 0.3,
  learning_rate: 0.001
};

const DEFAULT_PATTERN_CONFIG: PatternRecognitionConfig = {
  min_occurrences: 3,
  min_confidence: 0.6,
  min_strength: 0.4,
  time_window_days: 30
};

const DEFAULT_ANOMALY_CONFIG: AnomalyDetectionConfig = {
  z_score_threshold: 2,
  sensitivity: 0.5,
  min_data_points: 7,
  lookback_days: 30
};

// ============================================================================
// Mood Prediction Service (Rule-based)
// ============================================================================

export class MoodPredictionService {
  private config: MoodPredictionConfig;

  constructor(config?: Partial<MoodPredictionConfig>) {
    this.config = { ...DEFAULT_MOOD_PREDICTION_CONFIG, ...config };
  }

  async predict(input: MoodPredictionInput): Promise<MoodPredictionOutput> {
    const { historical_moods, sleep_data, day_of_week, is_weekend, hour_of_day } = input;

    if (historical_moods.length === 0) {
      return this.getDefaultPrediction(input);
    }

    const recentMoods = historical_moods.slice(-this.config.sequence_length);
    const avgIntensity = recentMoods.reduce((sum, m) => sum + m.intensity, 0) / recentMoods.length;

    let trend = 0;
    for (let i = 1; i < recentMoods.length; i++) {
      trend += recentMoods[i].intensity - recentMoods[i - 1].intensity;
    }

    let sleepFactor = 0;
    if (sleep_data && sleep_data.length > 0) {
      const avgSleep = sleep_data.reduce((sum, s) => sum + s.duration_minutes, 0) / sleep_data.length;
      if (avgSleep < 360) sleepFactor = -0.3;
      else if (avgSleep > 480) sleepFactor = 0.2;
    }

    const timeFactor = (hour_of_day >= 9 && hour_of_day <= 11) ? 0.1 : 0;
    const weekendFactor = is_weekend ? 0.1 : 0;

    const predictedIntensity = Math.max(1, Math.min(10,
      avgIntensity + (trend * 0.1) + sleepFactor + timeFactor + weekendFactor
    ));

    const predictedMood = this.getMoodLabel(predictedIntensity);
    const confidenceScore = Math.min(0.5 + (recentMoods.length / this.config.sequence_length) * 0.4, 0.9);

    const contributingFactors = [
      { factor: 'Recent mood trend', impact: trend * 0.1, description: trend > 0 ? 'Improving mood pattern' : 'Declining mood pattern' },
      { factor: 'Sleep quality', impact: sleepFactor, description: sleepFactor !== 0 ? (sleepFactor > 0 ? 'Good sleep duration' : 'Insufficient sleep') : 'No sleep data' },
      { factor: 'Time of day', impact: timeFactor, description: 'Morning hours can boost mood' }
    ];

    const recommendedInterventions = this.generateInterventions(predictedMood, predictedIntensity);

    return {
      user_id: input.user_id,
      prediction_date: new Date().toISOString(),
      predicted_mood: {
        mood_id: predictedMood,
        mood_label: this.getMoodLabel(predictedIntensity),
        confidence_score: confidenceScore
      },
      mood_probabilities: this.calculateMoodProbabilities(predictedIntensity, confidenceScore),
      contributing_factors: contributingFactors,
      recommended_interventions: recommendedInterventions,
      model_version: 'rule-based-v1.0',
      created_at: new Date().toISOString()
    };
  }

  private getDefaultPrediction(input: MoodPredictionInput): MoodPredictionOutput {
    return {
      user_id: input.user_id,
      prediction_date: new Date().toISOString(),
      predicted_mood: { mood_id: 'neutral', mood_label: 'Neutral', confidence_score: 0.5 },
      mood_probabilities: [
        { mood_id: 'neutral', mood_label: 'Neutral', probability: 0.4 },
        { mood_id: 'happy', mood_label: 'Happy', probability: 0.25 },
        { mood_id: 'calm', mood_label: 'Calm', probability: 0.2 },
        { mood_id: 'tired', mood_label: 'Tired', probability: 0.15 }
      ],
      contributing_factors: [
        { factor: 'Insufficient data', impact: 0, description: 'Not enough historical data for accurate prediction' }
      ],
      recommended_interventions: [
        { type: 'tracking', description: 'Continue logging your mood daily', expected_impact: 'Improved predictions over time' }
      ],
      model_version: 'rule-based-v1.0',
      created_at: new Date().toISOString()
    };
  }

  private getMoodLabel(intensity: number): string {
    if (intensity >= 8) return 'happy';
    if (intensity >= 6) return 'calm';
    if (intensity >= 4) return 'neutral';
    if (intensity >= 2) return 'tired';
    return 'anxious';
  }

  private calculateMoodProbabilities(predictedIntensity: number, confidence: number): Array<{ mood_id: string; mood_label: string; probability: number }> {
    const intensity = predictedIntensity;
    return [
      { mood_id: 'happy', mood_label: 'Happy', probability: Math.max(0, (10 - intensity) / 10) * confidence },
      { mood_id: 'calm', mood_label: 'Calm', probability: 0.3 * confidence },
      { mood_id: 'neutral', mood_label: 'Neutral', probability: 0.3 *confidence },
      { mood_id: 'tired', mood_label: 'Tired', probability: Math.max(0, intensity / 10 - 0.3) * confidence }
    ];
  }

  private generateInterventions(mood: string, intensity: number): Array<{ type: string; description: string; expected_impact: string }> {
    const interventions: Array<{ type: string; description: string; expected_impact: string }> = [];

    if (mood === 'anxious' || intensity < 4) {
      interventions.push({ type: 'breathing', description: 'Try a 4-7-8 breathing exercise', expected_impact: 'Reduced anxiety' });
      interventions.push({ type: 'activity', description: 'Take a short walk outside', expected_impact: 'Mood improvement' });
    }

    if (mood === 'tired') {
      interventions.push({ type: 'rest', description: 'Consider a short 15-minute rest', expected_impact: 'Increased energy' });
      interventions.push({ type: 'hydration', description: 'Drink a glass of water', expected_impact: 'Quick energy boost' });
    }

    if (intensity >= 7) {
      interventions.push({ type: 'gratitude', description: 'Write down 3 things you\'re grateful for', expected_impact: 'Sustained positive mood' });
    }

    return interventions;
  }
}

// ============================================================================
// Pattern Recognition Service
// ============================================================================

export class PatternRecognitionService {
  private config: PatternRecognitionConfig;

  constructor(config?: Partial<PatternRecognitionConfig>) {
    this.config = { ...DEFAULT_PATTERN_CONFIG, ...config };
  }

  async analyzePatterns(
    userId: string,
    moodData: Array<{ mood_id: string; mood_label: string; intensity: number; timestamp: string; activities?: string[] }>,
    sleepData?: Array<{ date: string; duration_minutes: number; sleep_score?: number }>,
    activityData?: Array<{ date: string; steps: number; active_minutes: number }>
  ): Promise<DetectedPattern[]> {
    const patterns: DetectedPattern[] = [];

    const circadianPatterns = this.detectCircadianPatterns(moodData, userId);
    patterns.push(...circadianPatterns);

    const weeklyPatterns = this.detectWeeklyPatterns(moodData, userId);
    patterns.push(...weeklyPatterns);

    if (sleepData && activityData) {
      const correlations = this.detectCorrelations(moodData, sleepData, activityData, userId);
      patterns.push(...correlations);
    }

    const triggerPatterns = this.detectTriggerPatterns(moodData, userId);
    patterns.push(...triggerPatterns);

    return patterns.filter(p => p.confidence >= this.config.min_confidence);
  }

  private detectCircadianPatterns(
    moodData: Array<{ mood_id: string; mood_label: string; intensity: number; timestamp: string }>,
    userId: string
  ): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];
    const hourlyMoods: Record<number, Array<{ mood: string; intensity: number }>> = {};

    moodData.forEach(mood => {
      const hour = new Date(mood.timestamp).getHours();
      if (!hourlyMoods[hour]) hourlyMoods[hour] = [];
      hourlyMoods[hour].push({ mood: mood.mood_label, intensity: mood.intensity });
    });

    const hourlyAverages = Object.entries(hourlyMoods).map(([hour, moods]) => ({
      hour: parseInt(hour),
      avgIntensity: moods.reduce((sum, m) => sum + m.intensity, 0) / moods.length,
      count: moods.length
    }));

    hourlyAverages.sort((a, b) => b.avgIntensity - a.avgIntensity);

    if (hourlyAverages.length > 0 && hourlyAverages[0].count >= this.config.min_occurrences) {
      const peakHour = hourlyAverages[0];
      const timeLabel = peakHour.hour < 12 ? 'morning' : peakHour.hour < 17 ? 'afternoon' : 'evening';

      patterns.push({
        id: `circadian_${timeLabel}_${userId}`,
        user_id: userId,
        pattern_type: 'circadian',
        name: `${timeLabel.charAt(0).toUpperCase() + timeLabel.slice(1)} Energy Peak`,
        description: `You tend to feel best during the ${timeLabel} (around ${peakHour.hour}:00)`,
        strength: peakHour.avgIntensity / 10,
        confidence: Math.min(peakHour.count / 10, 1),
        evidence: [{
          type: 'statistic',
          description: `Average mood intensity of ${peakHour.avgIntensity.toFixed(1)} during ${timeLabel}`,
          value: peakHour.avgIntensity.toFixed(1),
          timestamp: new Date().toISOString()
        }],
        first_detected: new Date().toISOString(),
        last_detected: new Date().toISOString(),
        occurrence_count: peakHour.count,
        frequency_description: `${peakHour.count} occurrences detected`,
        is_active: true,
        actionable: true,
        recommendation: 'Schedule important activities during your peak hours',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    return patterns;
  }

  private detectWeeklyPatterns(
    moodData: Array<{ mood_id: string; mood_label: string; intensity: number; timestamp: string }>,
    userId: string
  ): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dailyMoods: Record<number, Array<{ mood: string; intensity: number }>> = {};

    moodData.forEach(mood => {
      const day = new Date(mood.timestamp).getDay();
      if (!dailyMoods[day]) dailyMoods[day] = [];
      dailyMoods[day].push({ mood: mood.mood_label, intensity: mood.intensity });
    });

    const dailyAverages = Object.entries(dailyMoods).map(([day, moods]) => ({
      day: parseInt(day),
      name: dayNames[parseInt(day)],
      avgIntensity: moods.reduce((sum, m) => sum + m.intensity, 0) / moods.length,
      count: moods.length
    }));

    dailyAverages.sort((a, b) => b.avgIntensity - a.avgIntensity);

    if (dailyAverages.length >= 3) {
      const bestDay = dailyAverages[0];
      const worstDay = dailyAverages[dailyAverages.length - 1];

      if (bestDay.count >= this.config.min_occurrences) {
        patterns.push({
          id: `weekly_${bestDay.name}_${userId}`,
          user_id: userId,
          pattern_type: 'weekly',
          name: `${bestDay.name} Mood Boost`,
          description: `Your mood tends to be best on ${bestDay.name}s`,
          strength: bestDay.avgIntensity / 10,
          confidence: Math.min(bestDay.count / 7, 1),
          evidence: [{
            type: 'statistic',
            description: `Average intensity of ${bestDay.avgIntensity.toFixed(1)} on ${bestDay.name}`,
            value: bestDay.avgIntensity.toFixed(1),
            timestamp: new Date().toISOString()
          }],
          first_detected: new Date().toISOString(),
          last_detected: new Date().toISOString(),
          occurrence_count: bestDay.count,
          is_active: true,
          actionable: true,
          recommendation: `Plan enjoyable activities for ${bestDay.name}s`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    }

    return patterns;
  }

  private detectCorrelations(
    moodData: Array<{ mood_id: string; mood_label: string; intensity: number; timestamp: string }>,
    sleepData: Array<{ date: string; duration_minutes: number; sleep_score?: number }>,
    activityData: Array<{ date: string; steps: number; active_minutes: number }>,
    userId: string
  ): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];

    const alignedData = this.alignDataByDate(moodData, sleepData, activityData);

    if (alignedData.length >= 5) {
      const sleepMoodCorr = this.calculateCorrelation(
        alignedData.map(d => d.sleep),
        alignedData.map(d => d.mood)
      );

      if (Math.abs(sleepMoodCorr) > this.config.min_strength) {
        patterns.push({
          id: `correlation_sleep_mood_${userId}`,
          user_id: userId,
          pattern_type: 'correlation',
          name: 'Sleep-Mood Connection',
          description: sleepMoodCorr > 0 ? 'Better sleep correlates with better mood' : 'Sleep-mood relationship varies',
          strength: Math.abs(sleepMoodCorr),
          confidence: Math.min(alignedData.length / 14, 1),
          evidence: [{
            type: 'correlation',
            description: `Correlation coefficient: ${sleepMoodCorr.toFixed(2)}`,
            value: sleepMoodCorr.toFixed(2),
            timestamp: new Date().toISOString()
          }],
          first_detected: new Date().toISOString(),
          last_detected: new Date().toISOString(),
          occurrence_count: alignedData.length,
          is_active: true,
          actionable: true,
          recommendation: sleepMoodCorr > 0 ? 'Prioritize 7-9 hours of sleep' : 'Focus on sleep quality',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    }

    return patterns;
  }

  private detectTriggerPatterns(
    moodData: Array<{ mood_id: string; mood_label: string; intensity: number; timestamp: string; activities?: string[] }>,
    userId: string
  ): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];
    const activityMoods: Record<string, Array<{ mood: string; intensity: number }>> = {};

    moodData.forEach(mood => {
      if (mood.activities && mood.activities.length > 0) {
        mood.activities.forEach(activity => {
          if (!activityMoods[activity]) activityMoods[activity] = [];
          activityMoods[activity].push({ mood: mood.mood_label, intensity: mood.intensity });
        });
      }
    });

    Object.entries(activityMoods).forEach(([activity, moods]) => {
      if (moods.length >= this.config.min_occurrences) {
        const positiveCount = moods.filter(m => m.intensity >= 7).length;
        const positiveRatio = positiveCount / moods.length;

        if (positiveRatio >= 0.6) {
          patterns.push({
            id: `trigger_positive_${activity}_${userId}`,
            user_id: userId,
            pattern_type: 'trigger',
            name: `${activity} Boost`,
            description: `Doing ${activity} tends to improve your mood`,
            strength: positiveRatio,
            confidence: Math.min(moods.length / 7, 1),
            evidence: [{
              type: 'statistic',
              description: `${positiveRatio * 100}% positive mood after ${activity}`,
              value: `${(positiveRatio * 100).toFixed(0)}%`,
              timestamp: new Date().toISOString()
            }],
            first_detected: new Date().toISOString(),
            last_detected: new Date().toISOString(),
            occurrence_count: moods.length,
            frequency_description: `${moods.length} occurrences`,
            is_active: true,
            actionable: true,
            recommendation: `Consider incorporating ${activity} more regularly`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
      }
    });

    return patterns;
  }

  private alignDataByDate(
    moodData: Array<{ mood_id: string; mood_label: string; intensity: number; timestamp: string }>,
    sleepData: Array<{ date: string; duration_minutes: number; sleep_score?: number }>,
    activityData: Array<{ date: string; steps: number; active_minutes: number }>
  ): Array<{ date: string; mood: number; sleep: number; activity: number }> {
    const moodMap = new Map(moodData.map(m => [new Date(m.timestamp).toISOString().split('T')[0], m.intensity]));
    const sleepMap = new Map(sleepData.map(s => [s.date, s.duration_minutes]));
    const activityMap = new Map(activityData.map(a => [a.date, a.active_minutes]));

    const dates = new Set([...moodMap.keys(), ...sleepMap.keys(), ...activityMap.keys()]);

    return Array.from(dates)
      .filter(date => moodMap.has(date) && sleepMap.has(date) && activityMap.has(date))
      .map(date => ({
        date,
        mood: moodMap.get(date)!,
        sleep: sleepMap.get(date)!,
        activity: activityMap.get(date)!
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private calculateCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length === 0) return 0;

    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((total, xi, i) => total + xi * y[i], 0);
    const sumX2 = x.reduce((total, xi) => total + xi * xi, 0);
    const sumY2 = y.reduce((total, yi) => total + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }
}

// ============================================================================
// Anomaly Detection Service
// ============================================================================

export class AnomalyDetectionService {
  private config: AnomalyDetectionConfig;

  constructor(config?: Partial<AnomalyDetectionConfig>) {
    this.config = { ...DEFAULT_ANOMALY_CONFIG, ...config };
  }

  async detectAnomalies(
    userId: string,
    moodData: Array<{ mood_id: string; mood_label: string; intensity: number; timestamp: string }>,
    sleepData?: Array<{ date: string; duration_minutes: number; sleep_score?: number }>,
    activityData?: Array<{ date: string; steps: number; active_minutes: number }>
  ): Promise<DetectedAnomaly[]> {
    const anomalies: DetectedAnomaly[] = [];

    const moodAnomalies = this.detectMoodAnomalies(moodData, userId);
    anomalies.push(...moodAnomalies);

    if (sleepData && sleepData.length >= this.config.min_data_points) {
      const sleepAnomalies = this.detectSleepAnomalies(sleepData, userId);
      anomalies.push(...sleepAnomalies);
    }

    if (activityData && activityData.length >= this.config.min_data_points) {
      const activityAnomalies = this.detectActivityAnomalies(activityData, userId);
      anomalies.push(...activityAnomalies);
    }

    return anomalies;
  }

  private detectMoodAnomalies(moodData: Array<{ mood_id: string; mood_label: string; intensity: number; timestamp: string }>, userId: string): DetectedAnomaly[] {
    const anomalies: DetectedAnomaly[] = [];
    const intensities = moodData.map(m => m.intensity);

    if (intensities.length < this.config.min_data_points) return anomalies;

    const mean = intensities.reduce((a, b) => a + b, 0) / intensities.length;
    const std = Math.sqrt(intensities.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / intensities.length);

    for (let i = Math.max(0, intensities.length - this.config.lookback_days); i < intensities.length; i++) {
      const zScore = (intensities[i] - mean) / (std || 1);

      if (Math.abs(zScore) > this.config.z_score_threshold) {
        const isHigh = zScore > 0;
        const severity = Math.abs(zScore) > 3 ? 'high' : Math.abs(zScore) > 2.5 ? 'medium' : 'low';

        anomalies.push({
          id: `mood_${isHigh ? 'spike' : 'drop'}_${userId}_${i}`,
          user_id: userId,
          anomaly_type: isHigh ? 'mood_spike' : 'behavioral_shift',
          severity,
          metric_name: 'mood_intensity',
          expected_range: { min: Math.max(1, mean - this.config.z_score_threshold * std), max: Math.min(10, mean + this.config.z_score_threshold * std) },
          observed_value: intensities[i],
          deviation_score: zScore,
          description: isHigh ? `Unusually high mood intensity of ${intensities[i]}` : `Unusually low mood intensity of ${intensities[i]}`,
          possible_causes: isHigh ? ['Positive life events', 'Medication effects', 'Manic episode', 'Social activities'] : ['Stress or burnout', 'Health issues', 'Sleep problems', 'Life challenges'],
          recommendations: isHigh ? ['Maintain consistent routines', 'Monitor for pattern changes', 'Enjoy the positive period'] : ['Consider speaking with a friend', 'Review recent stressors', 'Ensure adequate rest', 'Professional support if persistent'],
          requires_attention: severity === 'high',
          created_at: new Date().toISOString()
        });
      }
    }

    return anomalies;
  }

  private detectSleepAnomalies(sleepData: Array<{ date: string; duration_minutes: number; sleep_score?: number }>, userId: string): DetectedAnomaly[] {
    const anomalies: DetectedAnomaly[] = [];
    const durations = sleepData.map(s => s.duration_minutes);
    const mean = durations.reduce((a, b) => a + b, 0) / durations.length;
    const std = Math.sqrt(durations.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / durations.length);

    for (let i = Math.max(0, sleepData.length - this.config.lookback_days); i < sleepData.length; i++) {
      const zScore = (sleepData[i].duration_minutes - mean) / (std || 1);

      if (Math.abs(zScore) > this.config.z_score_threshold) {
        const isLow = zScore < 0;
        const severity = Math.abs(zScore) > 3 ? 'high' : Math.abs(zScore) > 2.5 ? 'medium' : 'low';

        anomalies.push({
          id: `sleep_disruption_${userId}_${i}`,
          user_id: userId,
          anomaly_type: 'sleep_disruption',
          severity,
          metric_name: 'sleep_duration',
          expected_range: { min: Math.max(0, mean - this.config.z_score_threshold * std), max: mean + this.config.z_score_threshold * std },
          observed_value: sleepData[i].duration_minutes,
          deviation_score: zScore,
          description: isLow ? `Unusually low sleep of ${Math.round(sleepData[i].duration_minutes / 60)}h` : `Unusually high sleep of ${Math.round(sleepData[i].duration_minutes / 60)}h`,
          possible_causes: isLow ? ['Stress', 'Late activities', 'Sleep environment'] : ['Illness recovery', 'Schedule changes'],
          recommendations: isLow ? ['Establish consistent bedtime', 'Reduce evening screen time'] : ['Evaluate sleep quality', 'Check underlying issues'],
          requires_attention: severity === 'high' || (isLow && sleepData[i].duration_minutes < 300),
          created_at: new Date().toISOString()
        });
      }
    }

    return anomalies;
  }

  private detectActivityAnomalies(activityData: Array<{ date: string; steps: number; active_minutes: number }>, userId: string): DetectedAnomaly[] {
    const anomalies: DetectedAnomaly[] = [];
    const steps = activityData.map(a => a.steps);
    const mean = steps.reduce((a, b) => a + b, 0) / steps.length;
    const avgRecentSteps = steps.slice(-7).reduce((a, b) => a + b, 0) / Math.min(7, steps.length);

    if (avgRecentSteps < mean * 0.5 && steps.length >= 7) {
      anomalies.push({
        id: `activity_drop_${userId}`,
        user_id: userId,
        anomaly_type: 'activity_drop',
        severity: avgRecentSteps < mean * 0.3 ? 'high' : 'medium',
        metric_name: 'daily_steps',
        expected_range: { min: mean * 0.5, max: mean * 1.5 },
        observed_value: avgRecentSteps,
        deviation_score: (mean - avgRecentSteps) / mean,
        description: 'Significant decrease in physical activity',
        possible_causes: ['Illness or injury', 'Busy period at work', 'Lack of motivation', 'Schedule changes'],
        recommendations: ['Start with gentle activities', 'Set small, achievable goals', 'Find an activity buddy'],
        requires_attention: avgRecentSteps < mean * 0.3,
        created_at: new Date().toISOString()
      });
    }

    return anomalies;
  }
}

// Create singleton instances
export const moodPredictionService = new MoodPredictionService();
export const patternRecognitionService = new PatternRecognitionService();
export const anomalyDetectionService = new AnomalyDetectionService();

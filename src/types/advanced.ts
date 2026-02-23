// ============================================================================
// Advanced Feature Types
// MoodMash - Comprehensive ML and Analytics Types
// ============================================================================

// Configuration Interfaces
export interface MoodPredictionConfig {
  sequence_length: number;
  embedding_dim: number;
  lstm_units: number;
  attention_heads: number;
  transformer_layers: number;
  dropout_rate: number;
  learning_rate: number;
}

export interface PatternRecognitionConfig {
  min_occurrences: number;
  min_confidence: number;
  min_strength: number;
  time_window_days: number;
}

export interface AnomalyDetectionConfig {
  z_score_threshold: number;
  sensitivity: number;
  min_data_points: number;
  lookback_days: number;
}

// Wearables Integration
export interface WearableDevice {
  id: string;
  user_id: string;
  device_type: 'smartwatch' | 'fitness_tracker' | 'smart_scale' | 'sleep_tracker' | 'blood_pressure' | 'glucose_monitor';
  device_name: string;
  manufacturer: string;
  model?: string;
  api_provider: 'google_fit' | 'apple_health' | 'samsung_health' | 'fitbit' | 'garmin' | 'withings' | 'oura' | 'whoop';
  access_token?: string;
  refresh_token?: string;
  token_expires_at?: string;
  last_sync_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WearableDataPoint {
  id: string;
  device_id: string;
  user_id: string;
  data_type: 'heart_rate' | 'steps' | 'sleep' | 'hrv' | 'respiratory_rate' | 'blood_oxygen' | 'temperature' | 'calories' | 'distance' | 'floors' | 'active_minutes' | 'sleep_stages' | 'resting_heart_rate';
  value: number | string | Record<string, unknown>;
  unit: string;
  timestamp: string;
  source: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface WearableSyncResult {
  success: boolean;
  device_id: string;
  data_points_synced: number;
  last_sync_at: string;
  error?: string;
}

// Sleep Tracking
export interface SleepSession {
  id: string;
  user_id: string;
  device_id?: string;
  date: string;
  bedtime: string;
  wake_time: string;
  duration_minutes: number;
  sleep_score?: number;

  // Sleep stages breakdown
  stages: {
    deep_minutes: number;
    light_minutes: number;
    rem_minutes: number;
    awake_minutes: number;
  };

  // Sleep metrics
  metrics: {
    average_heart_rate?: number;
    lowest_heart_rate?: number;
    hrv_average?: number;
    respiratory_rate?: number;
    blood_oxygen_average?: number;
    temperature_deviation?: number;
    restless_periods?: number;
    interruptions?: number;
    sleep_latency_minutes?: number;
    time_in_bed_minutes?: number;
  };

  // Sleep insights
  insights: string[];
  recommendations: string[];
  created_at: string;
}

export interface SleepQualityMetrics {
  average_duration: number;
  average_score: number;
  average_deep_sleep_percentage: number;
  average_rem_percentage: number;
  consistency_score: number;
  debt_hours: number;
  quality_trend: 'improving' | 'stable' | 'declining';
}

// Health Insights & Correlations
export interface HealthInsight {
  id: string;
  user_id: string;
  insight_type: 'correlation' | 'pattern' | 'trend' | 'anomaly' | 'recommendation' | 'risk_alert';
  category: 'sleep' | 'mood' | 'activity' | 'heart_health' | 'stress' | 'overall';
  title: string;
  description: string;
  evidence: string[];
  confidence_score: number;
  impact_score: number;
  actionable: boolean;
  action_items?: string[];
  related_metrics: string[];
  is_read: boolean;
  is_dismissed: boolean;
  dismissed_at?: string;
  created_at: string;
}

export interface HealthCorrelation {
  metric_a: string;
  metric_b: string;
  correlation_type: 'positive' | 'negative' | 'none';
  correlation_strength: number; // -1 to 1
  p_value?: number;
  sample_size: number;
  time_range_days: number;
  description: string;
  implications: string[];
}

// Mood Prediction (LSTM/Transformer)
export interface MoodPredictionInput {
  user_id: string;
  historical_moods: Array<{
    mood_id: string;
    mood_label: string;
    intensity: number;
    timestamp: string;
    activities?: string[];
    context?: Record<string, unknown>;
  }>;
  sleep_data?: SleepSession[];
  wearable_data?: WearableDataPoint[];
  day_of_week: number;
  hour_of_day: number;
  is_weekend: boolean;
  season?: string;
}

export interface MoodPredictionOutput {
  user_id: string;
  prediction_date: string;
  predicted_mood: {
    mood_id: string;
    mood_label: string;
    confidence_score: number;
  };
  mood_probabilities: Array<{
    mood_id: string;
    mood_label: string;
    probability: number;
  }>;
  contributing_factors: Array<{
    factor: string;
    impact: number; // positive or negative
    description: string;
  }>;
  recommended_interventions: Array<{
    type: string;
    description: string;
    expected_impact: string;
  }>;
  model_version: string;
  created_at: string;
}

// Pattern Recognition
export interface DetectedPattern {
  id: string;
  user_id: string;
  pattern_type: 'circadian' | 'weekly' | 'seasonal' | 'trigger' | 'correlation' | 'response' | 'anomaly' | 'behavioral';
  name: string;
  description: string;
  strength: number; // 0-1
  confidence: number; // 0-1
  evidence: EvidenceItem[];
  first_detected: string;
  last_detected: string;
  occurrence_count: number;
  frequency_description?: string;
  is_active: boolean;
  actionable: boolean;
  recommendation?: string;
  created_at: string;
  updated_at: string;
}

export interface EvidenceItem {
  type: 'data_point' | 'correlation' | 'statistic' | 'time_series';
  description: string;
  value: string | number;
  timestamp?: string;
}

// Anomaly Detection
export interface DetectedAnomaly {
  id: string;
  user_id: string;
  anomaly_type: 'mood_spike' | 'sleep_disruption' | 'activity_drop' | 'hrv_change' | 'stress_indicator' | 'behavioral_shift';
  severity: 'low' | 'medium' | 'high' | 'critical';
  metric_name: string;
  expected_range: {
    min: number;
    max: number;
  };
  observed_value: number;
  deviation_score: number;
  description: string;
  possible_causes: string[];
  recommendations: string[];
  requires_attention: boolean;
  acknowledged_at?: string;
  acknowledged_by?: string;
  resolved_at?: string;
  created_at: string;
}

// Sentiment Analysis
export interface SentimentAnalysisInput {
  text: string;
  context?: {
    mood_id?: string;
    activities?: string[];
    time_of_day?: string;
  };
}

export interface SentimentAnalysisOutput {
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence_score: number;
  sentiment_score: number; // -1 to 1
  emotions: Array<{
    emotion: string;
    score: number;
  }>;
  key_phrases: string[];
  topics: string[];
  suggested_mood_adjustment?: {
    mood_id: string;
    confidence: number;
    reason: string;
  };
}

// Voice Support
export interface VoiceConfig {
  enabled: boolean;
  stt_provider: 'browser' | 'google' | 'azure' | 'openai';
  tts_provider: 'browser' | 'google' | 'azure' | 'openai';
  language: string;
  voice_id?: string;
  speech_rate: number; // 0.5 to 2.0
  pitch: number; // 0.5 to 2.0
}

export interface VoiceEmotionResult {
  dominant_emotion: string;
  emotions: Array<{
    emotion: string;
    score: number;
  }>;
  confidence: number;
  valence: number; // -1 (negative) to 1 (positive)
  arousal: number; // 0 (calm) to 1 (excited)
  speech_rate: number;
  pitch_variation: number;
}

// Smart Notifications
export interface NotificationPreference {
  user_id: string;
  channel: 'app' | 'email' | 'push' | 'sms';
  notification_type: 'reminder' | 'insight' | 'achievement' | 'challenge' | 'risk_alert' | 'recommendation' | 'social' | 'system';
  enabled: boolean;
  timing_preference: 'immediate' | 'daily_digest' | 'weekly_digest' | 'custom';
  custom_hours?: number[]; // hours of day when notifications allowed
  quiet_hours?: {
    start: number; // 0-23
    end: number; // 0-23
    timezone: string;
  };
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface SmartNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  channel: string;
  priority: string;
  triggered_by: string;
  context: Record<string, unknown>;
  action_url?: string;
  action_label?: string;
  scheduled_for?: string;
  sent_at?: string;
  read_at?: string;
  dismissed_at?: string;
  created_at: string;
}

// Context-Aware Chatbot
export interface ChatMessage {
  id: string;
  user_id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  intent?: string;
  entities?: Record<string, unknown>;
  sentiment?: SentimentAnalysisOutput;
  voice_input?: boolean;
  audio_url?: string;
  created_at: string;
}

export interface ChatConversation {
  id: string;
  user_id: string;
  title: string;
  context: {
    current_mood?: string;
    recent_activities?: string[];
    goals?: string[];
    concerns?: string[];
  };
  message_count: number;
  last_message_at: string;
  is_archived: boolean;
  created_at: string;
}

// Personalized Recommendations
export interface UserRecommendation {
  id: string;
  user_id: string;
  recommendation_type: 'activity' | 'content' | 'intervention' | 'goal' | 'tip';
  category: string;
  title: string;
  description: string;
  rationale: string;
  priority_score: number;
  relevance_score: number;
  estimated_impact: string;
  action_url?: string;
  action_label?: string;
  expires_at?: string;
  action_taken_at?: string;
  feedback?: {
    helpful: boolean;
    rating: number;
    comment?: string;
  };
  created_at: string;
}

export interface RecommendationEngineInput {
  user_id: string;
  current_mood?: string;
  recent_moods?: Array<{ mood_id: string; timestamp: string }>;
  sleep_quality?: SleepQualityMetrics;
  activity_level?: {
    daily_steps: number;
    active_minutes: number;
    streak_days: number;
  };
  goals?: string[];
  preferences?: Record<string, unknown>;
  time_context?: {
    hour_of_day: number;
    day_of_week: number;
    is_weekend: boolean;
  };
}

// Automated Interventions
export interface InterventionTrigger {
  id: string;
  user_id: string;
  trigger_type: 'mood_drop' | 'poor_sleep' | 'low_activity' | 'stress_indicator' | 'risk_detected' | 'goal_missed' | 'positive_momentum';
  condition: {
    metric: string;
    operator: 'lt' | 'gt' | 'lte' | 'gte' | 'eq' | 'change';
    threshold?: number;
    change_percentage?: number;
    time_window_hours?: number;
  };
  intervention_action: string;
 干预配置: Record<string, unknown>;
  is_active: boolean;
  last_triggered_at?: string;
  trigger_count: number;
  created_at: string;
}

export interface InterventionExecution {
  id: string;
  user_id: string;
  trigger_id: string;
  intervention_type: string;
  status: 'pending' | 'sent' | 'acknowledged' | 'completed' | 'dismissed' | 'escalated';
  message: string;
  action_url?: string;
  outcome?: {
    action_taken: boolean;
    mood_change?: number;
    effectiveness_rating?: number;
  };
  executed_at: string;
  completed_at?: string;
}

// Cookie Consent
export interface CookieConsent {
  user_id?: string;
  session_id: string;
  consent_version: string;
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  ad_personalization: boolean;
  consent_given_at: string;
  consent_updated_at?: string;
  ip_address?: string;
  user_agent?: string;
}

export interface CookieCategory {
  id: string;
  name: string;
  description: string;
  required: boolean;
  cookies: string[];
  purposes: string[];
}

// Accessibility
export interface AccessibilityPreferences {
  user_id?: string;
  reduced_motion: boolean;
  high_contrast: boolean;
  font_size: 'small' | 'medium' | 'large' | 'extra_large';
  color_blind_mode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  screen_reader_optimized: boolean;
  keyboard_navigation: boolean;
  focus_indicators: boolean;
  voice_control: boolean;
  captioning: boolean;
  caption_size: 'small' | 'medium' | 'large';
  audio_descriptions: boolean;
}

// Behavioral Insights Dashboard
export interface BehavioralDashboardData {
  user_id: string;
  period_days: number;
  generated_at: string;

  // Summary scores
  overall_wellness_score: number;
  mood_stability_score: number;
  sleep_quality_score: number;
  activity_level_score: number;
  consistency_score: number;

  // Key metrics
  mood_distribution: Record<string, number>;
  mood_trend: 'improving' | 'stable' | 'declining';
  average_mood_intensity: number;
  dominant_activities: Array<{ activity: string; count: number }>;

  // Streaks and achievements
  current_streak_days: number;
  longest_streak_days: number;
  achievements_unlocked: number;
  total_points_earned: number;

  // Insights
  top_insights: Array<{
    type: string;
    title: string;
    impact: string;
  }>;

  // Correlations
  top_correlations: Array<{
    metrics: string;
    correlation: number;
    description: string;
  }>;

  // Goals progress
  goals_progress: Array<{
    goal: string;
    progress: number;
    target: number;
    status: 'on_track' | 'behind' | 'exceeded';
  }>;
}

// Adaptive UI/UX
export interface AdaptiveUIConfig {
  user_id?: string;
  session_id: string;
  theme: 'light' | 'dark' | 'system' | 'custom';
  color_scheme: string;
  layout_density: 'compact' | 'comfortable' | 'spacious';
  dashboard_layout: string[];
  default_view: string;
  card_sizes: 'small' | 'medium' | 'large';
  chart_complexity: 'simple' | 'detailed' | 'comprehensive';
  show_animations: boolean;
  show_predictions: boolean;
  show_recommendations: boolean;
  interaction_mode: 'standard' | 'simplified' | 'advanced';
  onboarding_completed: boolean;
  last_updated: string;
}

// ============================================================================
// AR (Augmented Reality) Types
// ============================================================================

export interface ARSessionConfig {
  enableSpatialAudio: boolean;
  enablePoseDetection: boolean;
  enableEmotionTracking: boolean;
  environmentQuality: 'low' | 'medium' | 'high';
  frameRate: number;
}

export interface ARSession {
  id: string;
  type: ARSessionType;
  userId: string;
  startTime: Date;
  endTime?: Date;
  environment: AREnvironment;
  metrics: ARMetrics;
}

export type ARSessionType = 'meditation' | 'yoga' | 'mood' | 'social' | 'fitness';

export interface AREnvironment {
  type: EnvironmentType;
  timeOfDay: TimeOfDay;
  weather: Weather;
  customElements?: string[];
  ambientSound?: string;
  lighting?: LightingConfig;
}

export type EnvironmentType = 'nature' | 'ocean' | 'mountain' | 'forest' | 'space' | 'beach' | 'garden' | 'temple' | 'custom';
export type TimeOfDay = 'morning' | 'noon' | 'sunset' | 'night' | 'twilight';
export type Weather = 'clear' | 'cloudy' | 'rain' | 'stars' | 'fog' | 'aurora';

export interface LightingConfig {
  intensity: number;
  color: string;
  shadows: boolean;
  ambientColor: string;
  sunPosition: { x: number; y: number; z: number };
}

export interface ARMetrics {
  duration: number;
  accuracy?: number;
  calories?: number;
  heartRate?: number;
  mindfulnessScore?: number;
  moodScore?: number;
  engagementLevel: number;
  achievements: string[];
}

export interface ARParticipant {
  id: string;
  name: string;
  avatar?: string;
  mood?: string;
  position: { x: number; y: number; z: number };
  isSpeaking: boolean;
  isMuted: boolean;
  hasVideo: boolean;
}

export interface ARMoodPoint {
  date: Date;
  mood: string;
  intensity: number;
  position: { x: number; y: number; z: number };
}

export interface ARPoseData {
  keypoints: Array<{
    name: string;
    x: number;
    y: number;
    z: number;
    visibility: number;
  }>;
  confidence: number;
  skeleton: Array<{
    startPoint: string;
    endPoint: string;
    confidence: number;
  }>;
}

export interface ARFormFeedback {
  jointAngle: number;
  targetAngle: number;
  accuracy: number;
  feedback: string[];
  corrections: string[];
}

export interface ARSocialMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
  mood?: string;
}

export interface ARSocialRoom {
  id: string;
  name: string;
  type: 'support' | 'meditation' | 'yoga' | 'chat';
  participants: ARParticipant[];
  maxParticipants: number;
  isPrivate: boolean;
  hostId: string;
}

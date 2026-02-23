// ============================================================================
// Database Types for MoodMash
// TypeScript interfaces for Supabase database tables
// ============================================================================

// ============================================================================
// Base Types
// ============================================================================

interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

interface UserOwnedEntity extends BaseEntity {
  user_id: string;
}

// ============================================================================
// Users Table
// ============================================================================

export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
    [key: string]: unknown;
  };
  app_metadata: {
    provider?: string;
    [key: string]: unknown;
  };
  role: string;
  aud: string;
  active: boolean;
}

// ============================================================================
// Mood Entries Table
// ============================================================================

export interface MoodEntry {
  id: string;
  user_id: string;
  mood_id?: string;
  mood_label?: string;
  emotion: string;
  emotion_icon?: string;
  intensity: number;
  note?: string;
  activities?: string[];
  tags?: string[];
  context?: Record<string, unknown>;
  is_ai_analyzed?: boolean;
  ai_insights?: string[];
  sleep_quality?: number;
  energy_level?: number;
  stress_level?: number;
  weather?: string;
  location?: string;
  created_at: string;
  updated_at: string;
  entry_date: string;
  entry_time: string;
}

// ============================================================================
// Wellness Sessions Table
// ============================================================================

export interface WellnessSession {
  id: string;
  user_id: string;
  type: 'meditation' | 'yoga' | 'breathing' | 'stretching' | 'mindfulness' | 'sleep' | 'music' | 'journal' | 'other';
  category: string;
  name: string;
  description?: string;
  duration_minutes: number;
  completed_at: string;
  metrics?: Record<string, unknown>;
  settings?: Record<string, unknown>;
  mood_before?: number;
  mood_after?: number;
  notes?: string;
  ai_recommendation?: boolean;
  guided?: boolean;
  video_id?: string;
  audio_id?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Achievements Table
// ============================================================================

export interface Achievement {
  id: string;
  user_id: string;
  achievement_id?: string;
  achievement_type?: string;
  achievement_type_field?: string;
  name: string;
  description: string;
  icon: string;
  badge_url?: string;
  points: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  unlocked_at: string | null;
  progress?: number;
  max_progress?: number;
  is_completed?: boolean;
  completed_at?: string | null;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface AchievementDefinition {
  id: string;
  achievement_id?: string;
  type: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  max_progress: number;
  category: string;
  requirement: string;
}

// ============================================================================
// Challenges Table
// ============================================================================

export interface Challenge {
  id: string;
  user_id: string;
  challenge_id: string;
  name: string;
  description: string;
  category: string;
  duration_days: number;
  start_date: string;
  end_date: string;
  target_value: number;
  current_value: number;
  status: 'active' | 'completed' | 'failed' | 'cancelled';
  completed_at?: string;
  reward_points: number;
  bonus_points?: number;
  started_at?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ChallengeDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  duration_days: number;
  target_value: number;
  reward_points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  icon: string;
}

// ============================================================================
// Streaks Table
// ============================================================================

export interface Streak {
  id: string;
  user_id: string;
  streak_type: 'mood' | 'meditation' | 'wellness' | 'journal' | 'exercise' | 'daily_mood';
  current_count: number;
  longest_count: number;
  last_activity_date: string;
  started_at: string;
  milestone_7: boolean;
  milestone_14: boolean;
  milestone_30: boolean;
  milestone_60: boolean;
  milestone_100: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Gamification Points Table
// ============================================================================

export interface PointsTransaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: 'earn' | 'spend' | 'bonus' | 'adjustment' | 'referral';
  source_type: 'mood' | 'wellness' | 'achievement' | 'challenge' | 'streak' | 'referral' | 'manual' | 'bonus' | 'mood_entry' | 'wellness_session' | 'journal';
  source_id?: string;
  description: string;
  balance_after: number;
  created_at: string;
}

export interface UserPoints {
  user_id: string;
  total_points: number;
  lifetime_points: number;
  level: number;
  points_to_next_level: number;
  rank: number;
  rank_percentage: number;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// User Profiles Table
// ============================================================================

export interface UserProfile {
  id: string;
  user_id: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  timezone?: string;
  notification_preferences?: {
    email: boolean;
    push: boolean;
    weekly_summary: boolean;
    achievement_alerts: boolean;
    streak_reminders: boolean;
  };
  preferences?: {
    notifications?: {
      email: boolean;
      push: boolean;
      weekly_summary: boolean;
      achievement_alerts: boolean;
      streak_reminders: boolean;
    };
    privacy?: {
      show_on_leaderboard: boolean;
      share_achievements: boolean;
      allow_anonymous_data: boolean;
    };
    display?: {
      theme: 'light' | 'dark' | 'system';
      language: string;
      currency: string;
    };
    wellness?: {
      daily_goal_mood_entries: number;
      daily_goal_meditation_minutes: number;
      reminder_times?: string[];
    };
  };
  stats?: {
    total_mood_entries: number;
    total_wellness_minutes: number;
    total_achievements: number;
    total_challenges_completed: number;
    current_streak: number;
    longest_streak: number;
    member_since: string;
    last_active: string;
  };
  goals?: {
    mood?: string;
    wellness?: string;
    challenges?: string;
  };
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Journal Entries Table
// ============================================================================

export interface JournalEntry {
  id: string;
  user_id: string;
  title?: string;
  content: string;
  mood_id?: string;
  mood_intensity?: number;
  sentiment_score?: number;
  sentiment_label?: 'positive' | 'neutral' | 'negative';
  tags?: string[];
  activities?: string[];
  is_ai_generated?: boolean;
  ai_summary?: string;
  ai_suggestions?: string[];
  ai_recommendations?: string[];
  sleep_quality?: number;
  energy_level?: number;
  stress_level?: number;
  weather?: string;
  location?: string;
  related_mood_entry?: string;
  created_at: string;
  updated_at: string;
  entry_date: string;
  entry_time: string;
}

// ============================================================================// ML/AI Data Tables
// ============================================================================

export interface MLModelState {
  id: string;
  user_id: string;
  model_type: 'mood_prediction' | 'pattern_detection' | 'recommendation' | 'sentiment';
  version: string;
  weights_hash?: string;
  accuracy_score?: number;
  hyperparameters?: Record<string, unknown>;
  training_data_info?: Record<string, unknown>;
  performance_history?: { date: string; score: number }[];
  last_trained_at?: string;
  is_active: boolean;
  metrics?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface MoodPrediction {
  id: string;
  user_id: string;
  predicted_date: string;
  prediction_type?: 'emotion' | 'intensity' | 'trend' | 'recommendation';
  predicted_emotion: string;
  confidence_score: number;
  factors?: string[];
  factors_importance?: Record<string, number>;
  recommendation?: string;
  model_version?: string;
  is_verified: boolean;
  actual_emotion?: string;
  created_at: string;
}

export interface PatternInsight {
  id: string;
  user_id: string;
  pattern_type: 'circadian' | 'weekly' | 'seasonal' | 'trigger' | 'correlation' | 'response';
  name: string;
  description: string;
  strength: number;
  confidence: number;
  confidence_level?: 'low' | 'medium' | 'high';
  evidence: string[];
  related_activities?: string[];
  actionable: boolean;
  recommendation?: string;
  recommendation_json?: Record<string, unknown>;
  first_detected: string;
  last_detected: string;
  occurrence_count: number;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Notifications Table
// ============================================================================

export interface Notification {
  id: string;
  user_id: string;
  type: 'achievement' | 'challenge' | 'streak' | 'reminder' | 'insight' | 'social' | 'system' | 'ar';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  is_read: boolean;
  read_at?: string;
  is_sent: boolean;
  sent_at?: string;
  channel: 'app' | 'email' | 'push';
  created_at: string;
  expires_at?: string;
}

export interface NotificationTemplate {
  id: string;
  template_id: string;
  type: Notification['type'];
  title_template: string;
  body_template: string;
  default_data?: Record<string, unknown>;
  channels?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================// Analytics Tables
// ============================================================================

export interface DailyAnalytics {
  id: string;
  user_id: string;
  date: string;
  mood_summary?: {
    entries: number;
    avgIntensity: number;
    dominantEmotion: string;
  };
  wellness_summary?: {
    sessions: number;
    minutes: number;
  };
  achievements?: { id: string; name: string }[];
  points_earned?: number;
  streak_status?: 'maintained' | 'increased' | 'broken' | 'none';
  insights?: string[];
  ar_sessions_count?: number;
  ar_meditation_minutes?: number;
  ar_yoga_sessions?: number;
  ar_social_sessions?: number;
  journal_entries_count?: number;
  ai_insights_count?: number;
  mood_predictions_accuracy?: number;
  created_at: string;
  updated_at: string;
}

export interface WeeklyReport {
  id: string;
  user_id: string;
  week_start_date: string;
  week_end_date: string;
  mood_data?: {
    totalEntries: number;
    trend: string;
    distribution: Record<string, number>;
  };
  wellness_data?: {
    totalSessions: number;
    totalMinutes: number;
    byType: Record<string, { count: number; minutes: number }>;
  };
  achievements?: { id: string; name: string; icon: string }[];
  challenges_completed?: number;
  insights?: string[];
  recommendations?: string[];
  overall_score?: number;
  created_at: string;
}

// ============================================================================
// AR Tables
// ============================================================================

export interface ARMeditationSession {
  id: string;
  user_id: string;
  session_type: 'guided' | 'unguided' | 'ambient' | 'breathing';
  environment_type: 'nature' | 'ocean' | 'forest' | 'mountain' | 'space' | 'beach' | 'garden' | 'temple';
  time_of_day: 'day' | 'night' | 'sunset' | 'sunrise';
  duration_minutes: number;
  breathing_pattern: 'box' | '4-7-8' | 'calm' | 'energy' | 'custom';
  spatial_audio_enabled: boolean;
  environment_settings?: Record<string, unknown>;
  mood_before?: number;
  mood_after?: number;
  relaxation_score?: number;
  completed_at: string;
  created_at: string;
}

export interface ARYogaSession {
  id: string;
  user_id: string;
  session_type: 'guided' | 'free' | 'challenge';
  environment_type: 'nature' | 'ocean' | 'forest' | 'mountain' | 'space' | 'beach' | 'garden' | 'temple' | 'studio';
  yoga_style: 'hatha' | 'vinyasa' | 'yin' | 'restorative' | 'power' | 'hot' | 'kids' | 'pregnancy';
  difficulty_level: number;
  duration_minutes: number;
  poses_completed: number;
  poses?: ARPoseDetection[];
  form_score?: number;
  calories_burned?: number;
  flexibility_score?: number;
  balance_score?: number;
  instructor_enabled: boolean;
  environment_settings?: Record<string, unknown>;
  mood_before?: number;
  mood_after?: number;
  completed_at: string;
  created_at: string;
}

export interface ARPoseDetection {
  pose_name: string;
  detection_timestamp: string;
  keypoints: Record<string, unknown>;
  form_accuracy: number;
  alignment_score: number;
  balance_score: number;
  corrections: string[];
  duration_seconds: number;
}

export interface ARMoodVisualization {
  id: string;
  user_id: string;
  mood_type: string;
  mood_intensity: number;
  visualization_type: 'sphere' | 'particles' | 'aura' | 'river' | 'constellation' | 'mandala';
  environment_type?: 'nature' | 'ocean' | 'forest' | 'mountain' | 'space' | 'beach' | 'garden' | 'temple';
  particle_effects?: Record<string, unknown>;
  color_palette?: Record<string, unknown>;
  animation_settings?: Record<string, unknown>;
  is_shareable: boolean;
  share_count: number;
  saved_at: string;
  created_at: string;
}

export interface ARMoodJourney {
  id: string;
  user_id: string;
  journey_name: string;
  start_date: string;
  end_date?: string;
  journey_type: 'daily' | 'weekly' | 'monthly' | 'custom';
  mood_entries?: ARMoodJourneyEntry[];
  path_visualization?: Record<string, unknown>;
  statistics?: Record<string, unknown>;
  is_completed: boolean;
  completed_at?: string;
  created_at: string;
}

export interface ARMoodJourneyEntry {
  date: string;
  mood_type: string;
  mood_intensity: number;
  visualization_id: string;
}

export interface ARSocialRoom {
  id: string;
  host_id: string;
  room_name: string;
  room_type: 'support' | 'meditation' | 'yoga' | 'chat' | 'activity' | 'group';
  room_description?: string;
  environment_type: 'nature' | 'ocean' | 'forest' | 'mountain' | 'space' | 'beach' | 'garden' | 'temple';
  max_participants: number;
  is_private: boolean;
  password_hash?: string;
  activity_settings?: Record<string, unknown>;
  room_settings?: Record<string, unknown>;
  is_active: boolean;
  last_activity_at: string;
  created_at: string;
  expires_at?: string;
}

export interface ARSocialParticipant {
  id: string;
  room_id: string;
  user_id: string;
  avatar_config?: Record<string, unknown>;
  avatar_mood_color?: string;
  position_x?: number;
  position_y?: number;
  position_z?: number;
  is_speaking: boolean;
  is_muted: boolean;
  is_video_enabled: boolean;
  current_mood?: string;
  joined_at: string;
  last_seen_at: string;
  left_at?: string;
  created_at: string;
}

export interface ARSocialMessage {
  id: string;
  room_id: string;
  user_id: string;
  message_type: 'text' | 'voice' | 'emoji' | 'action' | 'system';
  message_content: string;
  mood_at_time?: string;
  audio_url?: string;
  reactions?: Record<string, unknown>;
  is_edited: boolean;
  edited_at?: string;
  created_at: string;
}

export interface ARAvatar {
  id: string;
  user_id: string;
  avatar_style: 'humanoid' | 'abstract' | 'animal' | 'creature' | 'custom';
  base_model?: string;
  appearance?: Record<string, unknown>;
  accessories?: string[];
  animations?: string[];
  mood_expressions?: Record<string, unknown>;
  color_scheme?: Record<string, unknown>;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface ARObjectivePreset {
  id: string;
  user_id?: string;
  preset_name: string;
  environment_type: 'nature' | 'ocean' | 'forest' | 'mountain' | 'space' | 'beach' | 'garden' | 'temple';
  time_of_day?: 'day' | 'night' | 'sunset' | 'sunrise';
  weather?: 'clear' | 'cloudy' | 'rain' | 'snow' | 'windy';
  lighting?: Record<string, unknown>;
  ambient_settings?: Record<string, unknown>;
  custom_elements?: string[];
  is_default: boolean;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface ARSessionAnalytics {
  id: string;
  user_id: string;
  session_type: 'meditation' | 'yoga' | 'mood' | 'social';
  session_id: string;
  duration_seconds: number;
  engagement_score: number;
  device_info?: Record<string, unknown>;
  performance_metrics?: Record<string, unknown>;
  error_logs?: string[];
  created_at: string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}

export interface MutationResponse {
  success: boolean;
  error?: {
    code: string;
    message: string;
  };
}

// ============================================================================// Join Types for Complex Queries
// ============================================================================

export interface MoodWithWellness {
  mood: MoodEntry;
  wellness_sessions: WellnessSession[];
}

export interface UserWithProfile {
  user: User;
  profile: UserProfile;
}

export interface AchievementWithDefinition {
  achievement: Achievement;
  definition: AchievementDefinition;
}

export interface ChallengeWithDefinition {
  challenge: Challenge;
  definition: ChallengeDefinition;
}

export interface JournalWithMood {
  journal: JournalEntry;
  mood_entry?: {
    id: string;
    emotion: string;
    intensity: number;
  };
}

// ============================================================================
// Database Schema Version
// ============================================================================

export const DATABASE_VERSION = '2026.001';
export const SCHEMA_LAST_UPDATED = '2026-02-05';

// ============================================================================
// Helper Types
// ============================================================================

export type EmotionType = MoodEntry['emotion'];
export type WellnessType = WellnessSession['type'];
export type AchievementTier = Achievement['tier'];
export type ChallengeStatus = Challenge['status'];
export type NotificationType = Notification['type'];
export type SentimentLabel = JournalEntry['sentiment_label'];
export type AREnvironmentType = ARMeditationSession['environment_type'];
export type ARSessionType = ARSessionAnalytics['session_type'];

// ============================================================================
// Enum-like Constants
// ============================================================================

export const EMOTIONS = [
  'happy',
  'calm',
  'energetic',
  'grateful',
  'motivated',
  'neutral',
  'tired',
  'anxious',
  'stressed',
  'sad',
  'frustrated',
  'overwhelmed',
] as const;

export const WELLNESS_TYPES = [
  'meditation',
  'yoga',
  'breathing',
  'music',
  'journal',
  'stretching',
  'mindfulness',
  'sleep',
] as const;

export const ACHIEVEMENT_TIERS = ['bronze', 'silver', 'gold', 'platinum'] as const;

export const MOOD_TRENDS = ['improving', 'stable', 'declining'] as const;

export const NOTIFICATION_TYPES = [
  'achievement',
  'challenge',
  'streak',
  'reminder',
  'insight',
  'social',
  'system',
  'ar',
] as const;

export const AR_ENVIRONMENTS = [
  'nature',
  'ocean',
  'forest',
  'mountain',
  'space',
  'beach',
  'garden',
  'temple',
] as const;

export const AR_YOGA_STYLES = [
  'hatha',
  'vinyasa',
  'yin',
  'restorative',
  'power',
  'hot',
  'kids',
  'pregnancy',
] as const;

export const BREATHING_PATTERNS = ['box', '4-7-8', 'calm', 'energy', 'custom'] as const;

// ============================================================================
// Additional Types for Services
// ============================================================================

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  from?: number;
  to?: number;
}

export interface MoodStatistics {
  totalEntries: number;
  averageIntensity: number;
  dominantEmotion: string;
  emotionDistribution: Record<string, number>;
  averageByHour: Record<number, number>;
  averageByDay: Record<number, number>;
  weeklyTrend: number;
  streak: number;
}

export interface WellnessStatistics {
  totalSessions: number;
  totalMinutes: number;
  byType: Record<string, { count: number; minutes: number }>;
  byCategory: Record<string, { count: number; minutes: number }>;
  averageSessionDuration: number;
  favoriteType: string;
  streak: number;
  weeklyAverage: number;
  monthlyMinutes: number;
}

export interface AchievementStats {
  totalUnlocked: number;
  totalPoints: number;
  byTier: Record<string, number>;
  recentAchievements: Achievement[];
  completionPercentage: number;
}

export interface ChallengeStats {
  activeChallenges: number;
  completedChallenges: number;
  failedChallenges: number;
  totalRewardPoints: number;
  currentRank: number;
  totalParticipants: number;
}

export interface StreakStats {
  currentStreaks: Record<string, number>;
  longestStreaks: Record<string, number>;
  totalMilestonesReached: number;
  streakBonusPoints: number;
}

export interface PointsSummary {
  currentBalance: number;
  level: number;
  pointsToNextLevel: number;
  lifetimePoints: number;
  rank: number;
  rankPercentage: number;
  recentTransactions: PointsTransaction[];
  pointsHistory: { date: string; points: number }[];
}

export interface WeeklyWellnessGoal {
  meditationMinutes: number;
  yogaSessions: number;
  totalMinutes: number;
  progress: {
    meditation: number;
    yoga: number;
    total: number;
  };
}

export interface MonthlyReport {
  month: string;
  year: number;
  totalMoodEntries: number;
  moodDistribution: Record<string, number>;
  moodTrend: 'improving' | 'stable' | 'declining';
  monthlyGrowth: number;
  topPatterns: string[];
  accomplishments: string[];
  yearlyGoalProgress: number;
  yearlyMilestones: string[];
}

export interface MoodTrendData {
  date: string;
  emotion: string;
  intensity: number;
  count: number;
}

export interface JournalStatistics {
  totalEntries: number;
  totalWords: number;
  averageWordCount: number;
  sentimentDistribution: Record<SentimentLabel, number>;
  averageSentimentScore: number;
  topTags: { tag: string; count: number }[];
  writingStreak: number;
  entriesThisWeek: number;
  entriesThisMonth: number;
  aiInsightsGenerated: number;
}

export interface ARMeditationStatistics {
  totalSessions: number;
  totalMinutes: number;
  averageSessionDuration: number;
  favoriteEnvironment: string;
  favoriteBreathingPattern: string;
  averageRelaxationScore: number;
  sessionsThisWeek: number;
  sessionsThisMonth: number;
  currentStreak: number;
}

export interface ARYogaStatistics {
  totalSessions: number;
  totalMinutes: number;
  totalPoses: number;
  averageFormScore: number;
  averageFlexibilityScore: number;
  averageBalanceScore: number;
  favoriteStyle: string;
  favoriteEnvironment: string;
  caloriesBurned: number;
  sessionsThisWeek: number;
  currentStreak: number;
}

export interface AROverallStatistics {
  meditation: ARMeditationStatistics;
  yoga: ARYogaStatistics;
  totalMoodVisualizations: number;
  totalSocialSessions: number;
  totalSocialMessages: number;
  totalARMinutes: number;
  currentMeditationStreak: number;
  currentYogaStreak: number;
  favoriteEnvironment: string;
}

// ============================================================================
// End of Database Types
// ============================================================================

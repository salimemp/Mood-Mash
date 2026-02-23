// ============================================================================
// AR Backend Service for MoodMash
// Database operations for AR meditation, yoga, mood visualization, and social
// ============================================================================

import {
  getSupabaseClient,
  getPaginationParams,
  formatPaginatedResult,
  handleSupabaseError,
} from '../lib/supabase';
import type { ApiResponse, PaginatedResult, PaginationParams } from '../types/database';

// ============================================================================
// AR Types
// ============================================================================

export type ARObjectiveType =
  | 'meditation'
  | 'yoga'
  | 'mood'
  | 'social'
  | 'environment'
  | 'avatar';

export type ARObjectiveEnvironment =
  | 'nature'
  | 'ocean'
  | 'forest'
  | 'mountain'
  | 'space'
  | 'beach'
  | 'garden'
  | 'temple'
  | 'studio';

export type ARObjectiveTimeOfDay = 'day' | 'night' | 'sunset' | 'sunrise';

export type ARObjectiveWeather = 'clear' | 'cloudy' | 'rain' | 'snow' | 'windy';

export type ARObjectiveYogaStyle =
  | 'hatha'
  | 'vinyasa'
  | 'yin'
  | 'restorative'
  | 'power'
  | 'hot'
  | 'kids'
  | 'pregnancy';

export type ARObjectiveRoomType =
  | 'support'
  | 'meditation'
  | 'yoga'
  | 'chat'
  | 'activity'
  | 'group';

export type ARObjectiveVisualizationType =
  | 'sphere'
  | 'particles'
  | 'aura'
  | 'river'
  | 'constellation'
  | 'mandala';

// ============================================================================
// AR Meditation Session Types
// ============================================================================

export interface CreateARMeditationSessionData {
  session_type: 'guided' | 'unguided' | 'ambient' | 'breathing';
  environment_type: ARObjectiveEnvironment;
  time_of_day?: ARObjectiveTimeOfDay;
  duration_minutes: number;
  breathing_pattern?: 'box' | '4-7-8' | 'calm' | 'energy' | 'custom';
  spatial_audio_enabled?: boolean;
  environment_settings?: Record<string, unknown>;
  mood_before?: number;
}

export interface ARMeditationSession {
  id: string;
  user_id: string;
  session_type: string;
  environment_type: string;
  time_of_day: string;
  duration_minutes: number;
  breathing_pattern: string;
  spatial_audio_enabled: boolean;
  environment_settings: Record<string, unknown>;
  mood_before: number;
  mood_after: number;
  relaxation_score: number;
  completed_at: string;
  created_at: string;
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

// ============================================================================
// AR Yoga Session Types
// ============================================================================

export interface CreateARYogaSessionData {
  session_type: 'guided' | 'free' | 'challenge';
  environment_type: ARObjectiveEnvironment;
  yoga_style?: ARObjectiveYogaStyle;
  difficulty_level?: number;
  duration_minutes: number;
  instructor_enabled?: boolean;
  environment_settings?: Record<string, unknown>;
  mood_before?: number;
}

export interface ARYogaSession {
  id: string;
  user_id: string;
  session_type: string;
  environment_type: string;
  yoga_style: string;
  difficulty_level: number;
  duration_minutes: number;
  poses_completed: number;
  poses: ARPoseDetection[];
  form_score: number;
  calories_burned: number;
  flexibility_score: number;
  balance_score: number;
  instructor_enabled: boolean;
  environment_settings: Record<string, unknown>;
  mood_before: number;
  mood_after: number;
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

// ============================================================================
// AR Mood Visualization Types
// ============================================================================

export interface CreateARMoodVisualizationData {
  mood_type: string;
  mood_intensity: number;
  visualization_type: ARObjectiveVisualizationType;
  environment_type?: ARObjectiveEnvironment;
  particle_effects?: Record<string, unknown>;
  color_palette?: Record<string, unknown>;
  animation_settings?: Record<string, unknown>;
  is_shareable?: boolean;
}

export interface ARMoodVisualization {
  id: string;
  user_id: string;
  mood_type: string;
  mood_intensity: number;
  visualization_type: string;
  environment_type: string;
  particle_effects: Record<string, unknown>;
  color_palette: Record<string, unknown>;
  animation_settings: Record<string, unknown>;
  is_shareable: boolean;
  share_count: number;
  saved_at: string;
  created_at: string;
}

export interface CreateARMoodJourneyData {
  journey_name?: string;
  start_date: string;
  end_date?: string;
  journey_type: 'daily' | 'weekly' | 'monthly' | 'custom';
}

export interface ARMoodJourney {
  id: string;
  user_id: string;
  journey_name: string;
  start_date: string;
  end_date: string;
  journey_type: string;
  mood_entries: ARMoodJourneyEntry[];
  path_visualization: Record<string, unknown>;
  statistics: Record<string, unknown>;
  is_completed: boolean;
  completed_at: string;
  created_at: string;
}

export interface ARMoodJourneyEntry {
  date: string;
  mood_type: string;
  mood_intensity: number;
  visualization_id: string;
}

// ============================================================================
// AR Social Types
// ============================================================================

export interface CreateARSocialRoomData {
  room_name: string;
  room_type: ARObjectiveRoomType;
  room_description?: string;
  environment_type?: ARObjectiveEnvironment;
  max_participants?: number;
  is_private?: boolean;
  password_hash?: string;
  activity_settings?: Record<string, unknown>;
}

export interface ARSocialRoom {
  id: string;
  host_id: string;
  room_name: string;
  room_type: string;
  room_description: string;
  environment_type: string;
  max_participants: number;
  is_private: boolean;
  activity_settings: Record<string, unknown>;
  room_settings: Record<string, unknown>;
  is_active: boolean;
  last_activity_at: string;
  created_at: string;
  expires_at: string;
}

export interface ARSocialParticipant {
  id: string;
  room_id: string;
  user_id: string;
  avatar_config: Record<string, unknown>;
  avatar_mood_color: string;
  position_x: number;
  position_y: number;
  position_z: number;
  is_speaking: boolean;
  is_muted: boolean;
  is_video_enabled: boolean;
  current_mood: string;
  joined_at: string;
  last_seen_at: string;
  left_at: string;
}

export interface ARSocialMessage {
  id: string;
  room_id: string;
  user_id: string;
  message_type: 'text' | 'voice' | 'emoji' | 'action' | 'system';
  message_content: string;
  mood_at_time: string;
  audio_url: string;
  reactions: Record<string, unknown>;
  is_edited: boolean;
  edited_at: string;
  created_at: string;
}

// ============================================================================
// AR Avatar Types
// ============================================================================

export interface CreateARAvatarData {
  avatar_style?: 'humanoid' | 'abstract' | 'animal' | 'creature' | 'custom';
  base_model?: string;
  appearance?: Record<string, unknown>;
  accessories?: string[];
  animations?: string[];
  mood_expressions?: Record<string, unknown>;
  color_scheme?: Record<string, unknown>;
  is_public?: boolean;
}

export interface ARAvatar {
  id: string;
  user_id: string;
  avatar_style: string;
  base_model: string;
  appearance: Record<string, unknown>;
  accessories: string[];
  animations: string[];
  mood_expressions: Record<string, unknown>;
  color_scheme: Record<string, unknown>;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// AR Environment Preset Types
// ============================================================================

export interface CreateAREnvironmentPresetData {
  preset_name: string;
  environment_type: ARObjectiveEnvironment;
  time_of_day?: ARObjectiveTimeOfDay;
  weather?: ARObjectiveWeather;
  lighting?: Record<string, unknown>;
  ambient_settings?: Record<string, unknown>;
  custom_elements?: string[];
  is_default?: boolean;
  is_favorite?: boolean;
}

export interface ARObjectivePreset {
  id: string;
  user_id: string;
  preset_name: string;
  environment_type: string;
  time_of_day: string;
  weather: string;
  lighting: Record<string, unknown>;
  ambient_settings: Record<string, unknown>;
  custom_elements: string[];
  is_default: boolean;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// AR Analytics Types
// ============================================================================

export interface CreateARSessionAnalyticsData {
  session_type: ARObjectiveType;
  session_id: string;
  duration_seconds: number;
  engagement_score: number;
  device_info?: Record<string, unknown>;
  performance_metrics?: Record<string, unknown>;
  error_logs?: string[];
}

export interface ARSessionAnalytics {
  id: string;
  user_id: string;
  session_type: string;
  session_id: string;
  duration_seconds: number;
  engagement_score: number;
  device_info: Record<string, unknown>;
  performance_metrics: Record<string, unknown>;
  error_logs: string[];
  created_at: string;
}

// ============================================================================
// AR Statistics
// ============================================================================

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
// AR Meditation Session Operations
// ============================================================================

/**
 * Create a new AR meditation session
 */
export async function createARMeditationSession(
  data: CreateARMeditationSessionData
): Promise<ApiResponse<ARMeditationSession>> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'You must be signed in' },
      };
    }

    const now = new Date().toISOString();

    const { data: session, error } = await client
      .from('ar_meditation_sessions')
      .insert({
        user_id: user.data.user.id,
        session_type: data.session_type,
        environment_type: data.environment_type,
        time_of_day: data.time_of_day || 'day',
        duration_minutes: data.duration_minutes,
        breathing_pattern: data.breathing_pattern || 'custom',
        spatial_audio_enabled: data.spatial_audio_enabled ?? true,
        environment_settings: data.environment_settings || {},
        mood_before: data.mood_before,
        completed_at: now,
        created_at: now,
      })
      .select()
      .single();

    if (error) {
      handleSupabaseError(error, 'Create AR meditation session');
    }

    console.log('[AR Meditation] Session created:', session.id);

    return { success: true, data: session };
  } catch (error) {
    console.error('[AR Meditation] Create error:', error);
    return {
      success: false,
      error: {
        code: 'CREATE_FAILED',
        message: 'Failed to create AR meditation session',
      },
    };
  }
}

/**
 * Complete an AR meditation session with mood after
 */
export async function completeARMeditationSession(
  sessionId: string,
  moodAfter: number,
  relaxationScore: number
): Promise<ApiResponse<ARMeditationSession>> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'You must be signed in' },
      };
    }

    const { data: session, error } = await client
      .from('ar_meditation_sessions')
      .update({
        mood_after: moodAfter,
        relaxation_score: relaxationScore,
      })
      .eq('id', sessionId)
      .eq('user_id', user.data.user.id)
      .select()
      .single();

    if (error) {
      handleSupabaseError(error, 'Complete AR meditation session');
    }

    return { success: true, data: session };
  } catch (error) {
    console.error('[AR Meditation] Complete error:', error);
    return {
      success: false,
      error: {
        code: 'UPDATE_FAILED',
        message: 'Failed to complete AR meditation session',
      },
    };
  }
}

/**
 * Get AR meditation sessions
 */
export async function getARMeditationSessions(
  pagination: PaginationParams = {}
): Promise<ApiResponse<PaginatedResult<ARMeditationSession>>> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'You must be signed in' },
      };
    }

    const { page = 1, limit = 20 } = pagination;
    const { from, to } = getPaginationParams(page, limit);

    const { data, error, count } = await client
      .from('ar_meditation_sessions')
      .select('*', { count: 'exact' })
      .eq('user_id', user.data.user.id)
      .order('completed_at', { ascending: false })
      .range(from, to);

    if (error) {
      handleSupabaseError(error, 'Get AR meditation sessions');
    }

    const result = formatPaginatedResult(data || [], count || 0, page, limit);
    return { success: true, data: result };
  } catch (error) {
    console.error('[AR Meditation] Query error:', error);
    return {
      success: false,
      error: {
        code: 'QUERY_FAILED',
        message: 'Failed to get AR meditation sessions',
      },
    };
  }
}

/**
 * Get AR meditation statistics
 */
export async function getARMeditationStatistics(): Promise<
  ApiResponse<ARMeditationStatistics>
> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'You must be signed in' },
      };
    }

    const { data: sessions, error } = await client
      .from('ar_meditation_sessions')
      .select('*')
      .eq('user_id', user.data.user.id)
      .order('completed_at', { ascending: true });

    if (error) {
      handleSupabaseError(error, 'Get AR meditation statistics');
    }

    const meditationSessions = sessions || [];

    if (meditationSessions.length === 0) {
      return {
        success: true,
        data: {
          totalSessions: 0,
          totalMinutes: 0,
          averageSessionDuration: 0,
          favoriteEnvironment: 'nature',
          favoriteBreathingPattern: 'box',
          averageRelaxationScore: 0,
          sessionsThisWeek: 0,
          sessionsThisMonth: 0,
          currentStreak: 0,
        },
      };
    }

    // Calculate statistics
    const totalMinutes = meditationSessions.reduce(
      (sum, s) => sum + s.duration_minutes,
      0
    );
    const environmentCount: Record<string, number> = {};
    const breathingCount: Record<string, number> = {};
    let totalRelaxationScore = 0;

    meditationSessions.forEach((session) => {
      environmentCount[session.environment_type] =
        (environmentCount[session.environment_type] || 0) + 1;
      breathingCount[session.breathing_pattern] =
        (breathingCount[session.breathing_pattern] || 0) + 1;
      totalRelaxationScore += session.relaxation_score || 0;
    });

    const favoriteEnvironment = Object.entries(environmentCount).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0] || 'nature';
    const favoriteBreathingPattern = Object.entries(breathingCount).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0] || 'box';

    // Calculate streaks and recent sessions
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    const monthAgo = new Date(now);
    monthAgo.setDate(now.getDate() - 30);

    const sessionsThisWeek = meditationSessions.filter(
      (s) => new Date(s.completed_at) >= weekAgo
    ).length;
    const sessionsThisMonth = meditationSessions.filter(
      (s) => new Date(s.completed_at) >= monthAgo
    ).length;

    let currentStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    for (let i = 0; i < 365; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const hasSession = meditationSessions.some(
        (s) => s.completed_at.split('T')[0] === dateStr
      );
      if (hasSession) {
        currentStreak++;
      } else if (dateStr !== today) {
        break;
      }
    }

    return {
      success: true,
      data: {
        totalSessions: meditationSessions.length,
        totalMinutes,
        averageSessionDuration: totalMinutes / meditationSessions.length,
        favoriteEnvironment,
        favoriteBreathingPattern,
        averageRelaxationScore:
          totalRelaxationScore / meditationSessions.length,
        sessionsThisWeek,
        sessionsThisMonth,
        currentStreak,
      },
    };
  } catch (error) {
    console.error('[AR Meditation] Statistics error:', error);
    return {
      success: false,
      error: {
        code: 'STATS_FAILED',
        message: 'Failed to get meditation statistics',
      },
    };
  }
}

// ============================================================================
// AR Yoga Session Operations
// ============================================================================

/**
 * Create a new AR yoga session
 */
export async function createARYogaSession(
  data: CreateARYogaSessionData
): Promise<ApiResponse<ARYogaSession>> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'You must be signed in' },
      };
    }

    const now = new Date().toISOString();

    const { data: session, error } = await client
      .from('ar_yoga_sessions')
      .insert({
        user_id: user.data.user.id,
        session_type: data.session_type,
        environment_type: data.environment_type,
        yoga_style: data.yoga_style || 'hatha',
        difficulty_level: data.difficulty_level || 1,
        duration_minutes: data.duration_minutes,
        instructor_enabled: data.instructor_enabled ?? true,
        environment_settings: data.environment_settings || {},
        mood_before: data.mood_before,
        completed_at: now,
        created_at: now,
      })
      .select()
      .single();

    if (error) {
      handleSupabaseError(error, 'Create AR yoga session');
    }

    console.log('[AR Yoga] Session created:', session.id);

    return { success: true, data: session };
  } catch (error) {
    console.error('[AR Yoga] Create error:', error);
    return {
      success: false,
      error: {
        code: 'CREATE_FAILED',
        message: 'Failed to create AR yoga session',
      },
    };
  }
}

/**
 * Complete an AR yoga session with results
 */
export async function completeARYogaSession(
  sessionId: string,
  poses: ARPoseDetection[],
  moodAfter: number,
  formScore: number,
  flexibilityScore: number,
  balanceScore: number,
  caloriesBurned: number
): Promise<ApiResponse<ARYogaSession>> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'You must be signed in' },
      };
    }

    const { data: session, error } = await client
      .from('ar_yoga_sessions')
      .update({
        poses: poses,
        poses_completed: poses.length,
        mood_after: moodAfter,
        form_score: formScore,
        flexibility_score: flexibilityScore,
        balance_score: balanceScore,
        calories_burned: caloriesBurned,
      })
      .eq('id', sessionId)
      .eq('user_id', user.data.user.id)
      .select()
      .single();

    if (error) {
      handleSupabaseError(error, 'Complete AR yoga session');
    }

    // Also save individual pose detections
    if (poses.length > 0) {
      const poseDetections = poses.map((pose) => ({
        session_id: sessionId,
        user_id: user.data.user!.id,
        pose_name: pose.pose_name,
        detection_timestamp: pose.detection_timestamp,
        keypoints: pose.keypoints,
        form_accuracy: pose.form_accuracy,
        alignment_score: pose.alignment_score,
        balance_score: pose.balance_score,
        corrections: pose.corrections,
        duration_seconds: pose.duration_seconds,
      }));

      await client.from('ar_yoga_pose_detections').insert(poseDetections);
    }

    return { success: true, data: session };
  } catch (error) {
    console.error('[AR Yoga] Complete error:', error);
    return {
      success: false,
      error: {
        code: 'UPDATE_FAILED',
        message: 'Failed to complete AR yoga session',
      },
    };
  }
}

/**
 * Get AR yoga sessions
 */
export async function getARYogaSessions(
  pagination: PaginationParams = {}
): Promise<ApiResponse<PaginatedResult<ARYogaSession>>> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'You must be signed in' },
      };
    }

    const { page = 1, limit = 20 } = pagination;
    const { from, to } = getPaginationParams(page, limit);

    const { data, error, count } = await client
      .from('ar_yoga_sessions')
      .select('*', { count: 'exact' })
      .eq('user_id', user.data.user.id)
      .order('completed_at', { ascending: false })
      .range(from, to);

    if (error) {
      handleSupabaseError(error, 'Get AR yoga sessions');
    }

    const result = formatPaginatedResult(data || [], count || 0, page, limit);
    return { success: true, data: result };
  } catch (error) {
    console.error('[AR Yoga] Query error:', error);
    return {
      success: false,
      error: {
        code: 'QUERY_FAILED',
        message: 'Failed to get AR yoga sessions',
      },
    };
  }
}

/**
 * Get AR yoga statistics
 */
export async function getARYogaStatistics(): Promise<
  ApiResponse<ARYogaStatistics>
> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'You must be signed in' },
      };
    }

    const { data: sessions, error } = await client
      .from('ar_yoga_sessions')
      .select('*')
      .eq('user_id', user.data.user.id)
      .order('completed_at', { ascending: true });

    if (error) {
      handleSupabaseError(error, 'Get AR yoga statistics');
    }

    const yogaSessions = sessions || [];

    if (yogaSessions.length === 0) {
      return {
        success: true,
        data: {
          totalSessions: 0,
          totalMinutes: 0,
          totalPoses: 0,
          averageFormScore: 0,
          averageFlexibilityScore: 0,
          averageBalanceScore: 0,
          favoriteStyle: 'hatha',
          favoriteEnvironment: 'nature',
          caloriesBurned: 0,
          sessionsThisWeek: 0,
          currentStreak: 0,
        },
      };
    }

    // Calculate statistics
    const totalMinutes = yogaSessions.reduce(
      (sum, s) => sum + s.duration_minutes,
      0
    );
    const totalPoses = yogaSessions.reduce(
      (sum, s) => sum + s.poses_completed,
      0
    );
    const totalCalories = yogaSessions.reduce(
      (sum, s) => sum + (s.calories_burned || 0),
      0
    );
    const styleCount: Record<string, number> = {};
    const environmentCount: Record<string, number> = {};
    let totalFormScore = 0;
    let totalFlexibilityScore = 0;
    let totalBalanceScore = 0;
    let sessionsWithScores = 0;

    yogaSessions.forEach((session) => {
      styleCount[session.yoga_style] =
        (styleCount[session.yoga_style] || 0) + 1;
      environmentCount[session.environment_type] =
        (environmentCount[session.environment_type] || 0) + 1;

      if (session.form_score) {
        totalFormScore += session.form_score;
        totalFlexibilityScore += session.flexibility_score || 0;
        totalBalanceScore += session.balance_score || 0;
        sessionsWithScores++;
      }
    });

    const favoriteStyle = Object.entries(styleCount).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0] || 'hatha';
    const favoriteEnvironment = Object.entries(environmentCount).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0] || 'nature';

    // Calculate streak
    let currentStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    for (let i = 0; i < 365; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const hasSession = yogaSessions.some(
        (s) => s.completed_at.split('T')[0] === dateStr
      );
      if (hasSession) {
        currentStreak++;
      } else if (dateStr !== today) {
        break;
      }
    }

    // Calculate sessions this week
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    const sessionsThisWeek = yogaSessions.filter(
      (s) => new Date(s.completed_at) >= weekAgo
    ).length;

    return {
      success: true,
      data: {
        totalSessions: yogaSessions.length,
        totalMinutes,
        totalPoses,
        averageFormScore:
          sessionsWithScores > 0 ? totalFormScore / sessionsWithScores : 0,
        averageFlexibilityScore:
          sessionsWithScores > 0
            ? totalFlexibilityScore / sessionsWithScores
            : 0,
        averageBalanceScore:
          sessionsWithScores > 0 ? totalBalanceScore / sessionsWithScores : 0,
        favoriteStyle,
        favoriteEnvironment,
        caloriesBurned: totalCalories,
        sessionsThisWeek,
        currentStreak,
      },
    };
  } catch (error) {
    console.error('[AR Yoga] Statistics error:', error);
    return {
      success: false,
      error: {
        code: 'STATS_FAILED',
        message: 'Failed to get yoga statistics',
      },
    };
  }
}

// ============================================================================
// AR Mood Visualization Operations
// ============================================================================

/**
 * Create a new AR mood visualization
 */
export async function createARMoodVisualization(
  data: CreateARMoodVisualizationData
): Promise<ApiResponse<ARMoodVisualization>> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'You must be signed in' },
      };
    }

    const now = new Date().toISOString();

    const { data: visualization, error } = await client
      .from('ar_mood_visualizations')
      .insert({
        user_id: user.data.user.id,
        mood_type: data.mood_type,
        mood_intensity: data.mood_intensity,
        visualization_type: data.visualization_type,
        environment_type: data.environment_type || 'nature',
        particle_effects: data.particle_effects || {},
        color_palette: data.color_palette || {},
        animation_settings: data.animation_settings || {},
        is_shareable: data.is_shareable ?? false,
        saved_at: now,
        created_at: now,
      })
      .select()
      .single();

    if (error) {
      handleSupabaseError(error, 'Create AR mood visualization');
    }

    console.log('[AR Mood] Visualization created:', visualization.id);

    return { success: true, data: visualization };
  } catch (error) {
    console.error('[AR Mood] Create error:', error);
    return {
      success: false,
      error: {
        code: 'CREATE_FAILED',
        message: 'Failed to create AR mood visualization',
      },
    };
  }
}

/**
 * Get AR mood visualizations
 */
export async function getARMoodVisualizations(
  pagination: PaginationParams = {}
): Promise<ApiResponse<PaginatedResult<ARMoodVisualization>>> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'You must be signed in' },
      };
    }

    const { page = 1, limit = 20 } = pagination;
    const { from, to } = getPaginationParams(page, limit);

    const { data, error, count } = await client
      .from('ar_mood_visualizations')
      .select('*', { count: 'exact' })
      .eq('user_id', user.data.user.id)
      .order('saved_at', { ascending: false })
      .range(from, to);

    if (error) {
      handleSupabaseError(error, 'Get AR mood visualizations');
    }

    const result = formatPaginatedResult(data || [], count || 0, page, limit);
    return { success: true, data: result };
  } catch (error) {
    console.error('[AR Mood] Query error:', error);
    return {
      success: false,
      error: {
        code: 'QUERY_FAILED',
        message: 'Failed to get AR mood visualizations',
      },
    };
  }
}

/**
 * Share an AR mood visualization (increment share count)
 */
export async function shareARMoodVisualization(
  visualizationId: string
): Promise<ApiResponse<ARMoodVisualization>> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'You must be signed in' },
      };
    }

    const { data: visualization, error } = await client
      .from('ar_mood_visualizations')
      .update({
        is_shareable: true,
        share_count: client!.from('ar_mood_visualizations').select('share_count').eq('id', visualizationId).single() as any,
      })
      .eq('id', visualizationId)
      .eq('user_id', user.data.user.id)
      .select()
      .single();

    if (error) {
      handleSupabaseError(error, 'Share AR mood visualization');
    }

    return { success: true, data: visualization };
  } catch (error) {
    console.error('[AR Mood] Share error:', error);
    return {
      success: false,
      error: {
        code: 'UPDATE_FAILED',
        message: 'Failed to share AR mood visualization',
      },
    };
  }
}

// ============================================================================
// AR Mood Journey Operations
// ============================================================================

/**
 * Create a new AR mood journey
 */
export async function createARMoodJourney(
  data: CreateARMoodJourneyData
): Promise<ApiResponse<ARMoodJourney>> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'You must be signed in' },
      };
    }

    const now = new Date().toISOString();

    const { data: journey, error } = await client
      .from('ar_mood_journeys')
      .insert({
        user_id: user.data.user.id,
        journey_name: data.journey_name || `Journey ${now}`,
        start_date: data.start_date,
        end_date: data.end_date,
        journey_type: data.journey_type,
        mood_entries: [],
        path_visualization: {},
        statistics: {},
        is_completed: false,
        created_at: now,
      })
      .select()
      .single();

    if (error) {
      handleSupabaseError(error, 'Create AR mood journey');
    }

    return { success: true, data: journey };
  } catch (error) {
    console.error('[AR Journey] Create error:', error);
    return {
      success: false,
      error: {
        code: 'CREATE_FAILED',
        message: 'Failed to create AR mood journey',
      },
    };
  }
}

/**
 * Get AR mood journeys
 */
export async function getARMoodJourneys(): Promise<
  ApiResponse<ARMoodJourney[]>
> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'You must be signed in' },
      };
    }

    const { data, error } = await client
      .from('ar_mood_journeys')
      .select('*')
      .eq('user_id', user.data.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      handleSupabaseError(error, 'Get AR mood journeys');
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('[AR Journey] Query error:', error);
    return {
      success: false,
      error: {
        code: 'QUERY_FAILED',
        message: 'Failed to get AR mood journeys',
      },
    };
  }
}

// ============================================================================
// AR Social Operations
// ============================================================================

/**
 * Create a new AR social room
 */
export async function createARSocialRoom(
  data: CreateARSocialRoomData
): Promise<ApiResponse<ARSocialRoom>> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'You must be signed in' },
      };
    }

    const now = new Date().toISOString();
    const expiresAt = new Date(now);
    expiresAt.setHours(expiresAt.getHours() + 24); // Default 24h expiry

    const { data: room, error } = await client
      .from('ar_social_rooms')
      .insert({
        host_id: user.data.user.id,
        room_name: data.room_name,
        room_type: data.room_type,
        room_description: data.room_description,
        environment_type: data.environment_type || 'nature',
        max_participants: data.max_participants || 10,
        is_private: data.is_private ?? false,
        password_hash: data.password_hash,
        activity_settings: data.activity_settings || {},
        room_settings: {},
        last_activity_at: now,
        created_at: now,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      handleSupabaseError(error, 'Create AR social room');
    }

    // Add host as first participant
    await client.from('ar_social_participants').insert({
      room_id: room.id,
      user_id: user.data.user.id,
      avatar_mood_color: '#4F46E5',
      joined_at: now,
      last_seen_at: now,
    });

    console.log('[AR Social] Room created:', room.id);

    return { success: true, data: room };
  } catch (error) {
    console.error('[AR Social] Create error:', error);
    return {
      success: false,
      error: {
        code: 'CREATE_FAILED',
        message: 'Failed to create AR social room',
      },
    };
  }
}

/**
 * Get public AR social rooms
 */
export async function getPublicARSocialRooms(): Promise<
  ApiResponse<ARSocialRoom[]>
> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'You must be signed in' },
      };
    }

    const { data: rooms, error } = await client
      .from('ar_social_rooms')
      .select('*')
      .eq('is_private', false)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .order('last_activity_at', { ascending: false });

    if (error) {
      handleSupabaseError(error, 'Get public AR social rooms');
    }

    return { success: true, data: rooms || [] };
  } catch (error) {
    console.error('[AR Social] Query error:', error);
    return {
      success: false,
      error: {
        code: 'QUERY_FAILED',
        message: 'Failed to get public AR social rooms',
      },
    };
  }
}

/**
 * Join an AR social room
 */
export async function joinARSocialRoom(
  roomId: string,
  avatarMoodColor: string
): Promise<ApiResponse<ARSocialParticipant>> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'You must be signed in' },
      };
    }

    const now = new Date().toISOString();

    // Check if room exists
    const { data: room, error: roomError } = await client
      .from('ar_social_rooms')
      .select('id, max_participants')
      .eq('id', roomId)
      .eq('is_active', true)
      .single();

    if (roomError || !room) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: 'Room not found' },
      };
    }

    // Check if already a participant
    const { data: existingParticipant } = await client
      .from('ar_social_participants')
      .select('*')
      .eq('room_id', roomId)
      .eq('user_id', user.data.user.id)
      .is('left_at', null)
      .single();

    if (existingParticipant) {
      // Update last_seen_at
      const { data: participant, error } = await client
        .from('ar_social_participants')
        .update({
          last_seen_at: now,
          left_at: null as any,
        })
        .eq('id', existingParticipant.id)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'Update AR social participant');
      }

      return { success: true, data: participant };
    }

    // Check capacity - count current participants
    const { count: participantCount, error: countError } = await client
      .from('ar_social_participants')
      .select('*', { count: 'exact', head: true })
      .eq('room_id', roomId)
      .is('left_at', null);

    if (countError) {
      handleSupabaseError(countError, 'Count room participants');
    }

    if ((participantCount || 0) >= room.max_participants) {
      return {
        success: false,
        error: { code: 'ROOM_FULL', message: 'Room is at capacity' },
      };
    }

    const { data: participant, error } = await client
      .from('ar_social_participants')
      .insert({
        room_id: roomId,
        user_id: user.data.user.id,
        avatar_mood_color: avatarMoodColor,
        joined_at: now,
        last_seen_at: now,
      })
      .select()
      .single();

    if (error) {
      handleSupabaseError(error, 'Join AR social room');
    }

    // Add system message
    await client.from('ar_social_messages').insert({
      room_id: roomId,
      user_id: user.data.user.id,
      message_type: 'system',
      message_content: `${user.data.user.email} joined the room`,
    });

    // Update room last_activity_at
    await client
      .from('ar_social_rooms')
      .update({ last_activity_at: now })
      .eq('id', roomId);

    return { success: true, data: participant };
  } catch (error) {
    console.error('[AR Social] Join error:', error);
    return {
      success: false,
      error: {
        code: 'JOIN_FAILED',
        message: 'Failed to join AR social room',
      },
    };
  }
}

/**
 * Leave an AR social room
 */
export async function leaveARSocialRoom(roomId: string): Promise<
  ApiResponse<null>
> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'You must be signed in' },
      };
    }

    const now = new Date().toISOString();

    const { error } = await client
      .from('ar_social_participants')
      .update({
        left_at: now,
        is_speaking: false,
      })
      .eq('room_id', roomId)
      .eq('user_id', user.data.user.id)
      .is('left_at', null);

    if (error) {
      handleSupabaseError(error, 'Leave AR social room');
    }

    // Add system message
    await client.from('ar_social_messages').insert({
      room_id: roomId,
      user_id: user.data.user.id,
      message_type: 'system',
      message_content: `${user.data.user.email} left the room`,
    });

    return { success: true, data: null };
  } catch (error) {
    console.error('[AR Social] Leave error:', error);
    return {
      success: false,
      error: {
        code: 'LEAVE_FAILED',
        message: 'Failed to leave AR social room',
      },
    };
  }
}

/**
 * Send a message in an AR social room
 */
export async function sendARSocialMessage(
  roomId: string,
  messageContent: string,
  messageType: 'text' | 'voice' | 'emoji' | 'action' = 'text'
): Promise<ApiResponse<ARSocialMessage>> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'You must be signed in' },
      };
    }

    const now = new Date().toISOString();

    const { data: message, error } = await client
      .from('ar_social_messages')
      .insert({
        room_id: roomId,
        user_id: user.data.user.id,
        message_type: messageType,
        message_content: messageContent,
        created_at: now,
      })
      .select()
      .single();

    if (error) {
      handleSupabaseError(error, 'Send AR social message');
    }

    // Update room last_activity_at
    await client
      .from('ar_social_rooms')
      .update({ last_activity_at: now })
      .eq('id', roomId);

    return { success: true, data: message };
  } catch (error) {
    console.error('[AR Social] Message error:', error);
    return {
      success: false,
      error: {
        code: 'MESSAGE_FAILED',
        message: 'Failed to send AR social message',
      },
    };
  }
}

/**
 * Get messages from an AR social room
 */
export async function getARSocialMessages(
  roomId: string,
  limit: number = 50
): Promise<ApiResponse<ARSocialMessage[]>> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'You must be signed in' },
      };
    }

    const { data: messages, error } = await client
      .from('ar_social_messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      handleSupabaseError(error, 'Get AR social messages');
    }

    return { success: true, data: (messages || []).reverse() };
  } catch (error) {
    console.error('[AR Social] Query error:', error);
    return {
      success: false,
      error: {
        code: 'QUERY_FAILED',
        message: 'Failed to get AR social messages',
      },
    };
  }
}

/**
 * Update participant speaking status
 */
export async function updateARParticipantSpeaking(
  roomId: string,
  isSpeaking: boolean
): Promise<ApiResponse<null>> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'You must be signed in' },
      };
    }

    const { error } = await client
      .from('ar_social_participants')
      .update({
        is_speaking: isSpeaking,
        last_seen_at: new Date().toISOString(),
      })
      .eq('room_id', roomId)
      .eq('user_id', user.data.user.id);

    if (error) {
      handleSupabaseError(error, 'Update participant speaking');
    }

    return { success: true, data: null };
  } catch (error) {
    console.error('[AR Social] Speaking update error:', error);
    return {
      success: false,
      error: {
        code: 'UPDATE_FAILED',
        message: 'Failed to update speaking status',
      },
    };
  }
}

// ============================================================================
// AR Avatar Operations
// ============================================================================

/**
 * Create or update AR avatar
 */
export async function saveARAvatar(
  data: CreateARAvatarData
): Promise<ApiResponse<ARAvatar>> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'You must be signed in' },
      };
    }

    const now = new Date().toISOString();

    const { data: avatar, error } = await client
      .from('ar_avatars')
      .upsert({
        user_id: user.data.user.id,
        avatar_style: data.avatar_style || 'humanoid',
        base_model: data.base_model,
        appearance: data.appearance || {},
        accessories: data.accessories || [],
        animations: data.animations || [],
        mood_expressions: data.mood_expressions || {},
        color_scheme: data.color_scheme || {},
        is_public: data.is_public ?? true,
        updated_at: now,
      } as any, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      handleSupabaseError(error, 'Save AR avatar');
    }

    return { success: true, data: avatar };
  } catch (error) {
    console.error('[AR Avatar] Save error:', error);
    return {
      success: false,
      error: {
        code: 'SAVE_FAILED',
        message: 'Failed to save AR avatar',
      },
    };
  }
}

/**
 * Get user AR avatar
 */
export async function getARAvatar(): Promise<ApiResponse<ARAvatar | null>> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'You must be signed in' },
      };
    }

    const { data, error } = await client
      .from('ar_avatars')
      .select('*')
      .eq('user_id', user.data.user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      handleSupabaseError(error, 'Get AR avatar');
    }

    return { success: true, data: data || null };
  } catch (error) {
    console.error('[AR Avatar] Get error:', error);
    return {
      success: false,
      error: {
        code: 'GET_FAILED',
        message: 'Failed to get AR avatar',
      },
    };
  }
}

// ============================================================================
// AR Environment Preset Operations
// ============================================================================

/**
 * Create an AR environment preset
 */
export async function createAREnvironmentPreset(
  data: CreateAREnvironmentPresetData
): Promise<ApiResponse<ARObjectivePreset>> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'You must be signed in' },
      };
    }

    const now = new Date().toISOString();

    const { data: preset, error } = await client
      .from('ar_environment_presets')
      .insert({
        user_id: user.data.user.id,
        preset_name: data.preset_name,
        environment_type: data.environment_type,
        time_of_day: data.time_of_day || 'day',
        weather: data.weather || 'clear',
        lighting: data.lighting || {},
        ambient_settings: data.ambient_settings || {},
        custom_elements: data.custom_elements || [],
        is_default: data.is_default ?? false,
        is_favorite: data.is_favorite ?? false,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error) {
      handleSupabaseError(error, 'Create AR environment preset');
    }

    return { success: true, data: preset };
  } catch (error) {
    console.error('[AR Preset] Create error:', error);
    return {
      success: false,
      error: {
        code: 'CREATE_FAILED',
        message: 'Failed to create AR environment preset',
      },
    };
  }
}

/**
 * Get user AR environment presets
 */
export async function getAREnvironmentPresets(): Promise<
  ApiResponse<ARObjectivePreset[]>
> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'You must be signed in' },
      };
    }

    // Get user's presets and default presets
    const { data: userPresets, error: userError } = await client
      .from('ar_environment_presets')
      .select('*')
      .eq('user_id', user.data.user.id);

    const { data: defaultPresets, error: defaultError } = await client
      .from('ar_environment_presets')
      .select('*')
      .is('user_id', null);

    if (userError) {
      handleSupabaseError(userError, 'Get AR environment presets');
    }
    if (defaultError) {
      handleSupabaseError(defaultError, 'Get default AR environment presets');
    }

    return {
      success: true,
      data: [...(defaultPresets || []), ...(userPresets || [])],
    };
  } catch (error) {
    console.error('[AR Preset] Query error:', error);
    return {
      success: false,
      error: {
        code: 'QUERY_FAILED',
        message: 'Failed to get AR environment presets',
      },
    };
  }
}

// ============================================================================
// AR Analytics Operations
// ============================================================================

/**
 * Create AR session analytics
 */
export async function createARSessionAnalytics(
  data: CreateARSessionAnalyticsData
): Promise<ApiResponse<ARSessionAnalytics>> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'You must be signed in' },
      };
    }

    const { data: analytics, error } = await client
      .from('ar_session_analytics')
      .insert({
        user_id: user.data.user.id,
        session_type: data.session_type,
        session_id: data.session_id,
        duration_seconds: data.duration_seconds,
        engagement_score: data.engagement_score,
        device_info: data.device_info || {},
        performance_metrics: data.performance_metrics || {},
        error_logs: data.error_logs || [],
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      handleSupabaseError(error, 'Create AR session analytics');
    }

    return { success: true, data: analytics };
  } catch (error) {
    console.error('[AR Analytics] Create error:', error);
    return {
      success: false,
      error: {
        code: 'CREATE_FAILED',
        message: 'Failed to create AR session analytics',
      },
    };
  }
}

// ============================================================================
// AR Overall Statistics
// ============================================================================

/**
 * Get complete AR statistics
 */
export async function getAROverallStatistics(): Promise<
  ApiResponse<AROverallStatistics>
> {
  try {
    const [
      meditationStats,
      yogaStats,
      moodResult,
      socialParticipantsResult,
      socialMessagesResult,
    ] = await Promise.all([
      getARMeditationStatistics(),
      getARYogaStatistics(),
      getARMoodVisualizations({ limit: 1 }),
      // Get total social sessions count
      Promise.resolve({ success: true, data: [] }),
      // Get total messages count
      Promise.resolve({ success: true, data: [] }),
    ]);

    // Get total AR minutes
    const meditationMinutes = meditationStats.data?.totalMinutes || 0;
    const yogaMinutes = yogaStats.data?.totalMinutes || 0;

    // Calculate favorite environment
    const environments: Record<string, number> = {};
    if (meditationStats.data?.favoriteEnvironment) {
      environments[meditationStats.data.favoriteEnvironment] =
        (environments[meditationStats.data.favoriteEnvironment] || 0) + 1;
    }
    if (yogaStats.data?.favoriteEnvironment) {
      environments[yogaStats.data.favoriteEnvironment] =
        (environments[yogaStats.data.favoriteEnvironment] || 0) + 1;
    }
    const favoriteEnvironment = Object.entries(environments).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0] || 'nature';

    return {
      success: true,
      data: {
        meditation: meditationStats.data!,
        yoga: yogaStats.data!,
        totalMoodVisualizations: moodResult.data?.total || 0,
        totalSocialSessions: 0,
        totalSocialMessages: 0,
        totalARMinutes: meditationMinutes + yogaMinutes,
        currentMeditationStreak: meditationStats.data?.currentStreak || 0,
        currentYogaStreak: yogaStats.data?.currentStreak || 0,
        favoriteEnvironment,
      },
    };
  } catch (error) {
    console.error('[AR] Overall statistics error:', error);
    return {
      success: false,
      error: {
        code: 'STATS_FAILED',
        message: 'Failed to get overall AR statistics',
      },
    };
  }
}

// ============================================================================
// Export
// ============================================================================

// All types are exported above as interfaces

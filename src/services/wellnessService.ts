// ============================================================================
// Wellness Service for MoodMash
// Database operations for wellness sessions
// ============================================================================

import { getSupabaseClient, getPaginationParams, formatPaginatedResult, handleSupabaseError } from '../lib/supabase';
import type {
  WellnessSession,
  ApiResponse,
  PaginatedResult,
  PaginationParams,
  UserProfile,
} from '../types/database';

// ============================================================================
// Types
// ============================================================================

export interface CreateWellnessSessionData {
  type: WellnessSession['type'];
  category: string;
  name: string;
  description?: string;
  duration_minutes: number;
  mood_before?: number;
  mood_after?: number;
  notes?: string;
  guided?: boolean;
  video_id?: string;
  audio_id?: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UpdateWellnessSessionData extends Partial<CreateWellnessSessionData> {}

export interface WellnessQueryParams {
  type?: WellnessSession['type'];
  category?: string;
  startDate?: string;
  endDate?: string;
  minDuration?: number;
  maxDuration?: number;
  orderBy?: 'created_at' | 'completed_at' | 'duration_minutes';
  order?: 'asc' | 'desc';
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

// ============================================================================
// CRUD Operations
// ============================================================================

/**
 * Create a new wellness session
 */
export async function createWellnessSession(data: CreateWellnessSessionData): Promise<ApiResponse<WellnessSession>> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be signed in' } };
    }

    const now = new Date().toISOString();

    const { data: session, error } = await client
      .from('wellness_sessions')
      .insert({
        user_id: user.data.user.id,
        type: data.type,
        category: data.category,
        name: data.name,
        description: data.description,
        duration_minutes: data.duration_minutes,
        mood_before: data.mood_before,
        mood_after: data.mood_after,
        notes: data.notes,
        guided: data.guided || false,
        video_id: data.video_id,
        audio_id: data.audio_id,
        completed_at: now,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error) {
      handleSupabaseError(error, 'Create wellness session');
    }

    console.log('[Wellness] Session created:', session.id);

    return { success: true, data: session };
  } catch (error) {
    console.error('[Wellness] Create error:', error);
    return { success: false, error: { code: 'CREATE_FAILED', message: 'Failed to create session' } };
  }
}

/**
 * Get a wellness session by ID
 */
export async function getWellnessSession(id: string): Promise<ApiResponse<WellnessSession>> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be signed in' } };
    }

    const { data, error } = await client
      .from('wellness_sessions')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.data.user.id)
      .single();

    if (error) {
      handleSupabaseError(error, 'Get wellness session');
    }

    return { success: true, data };
  } catch (error) {
    console.error('[Wellness] Get error:', error);
    return { success: false, error: { code: 'GET_FAILED', message: 'Failed to get session' } };
  }
}

/**
 * Update a wellness session
 */
export async function updateWellnessSession(
  id: string,
  data: UpdateWellnessSessionData
): Promise<ApiResponse<WellnessSession>> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be signed in' } };
    }

    const { data: session, error } = await client
      .from('wellness_sessions')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.data.user.id)
      .select()
      .single();

    if (error) {
      handleSupabaseError(error, 'Update wellness session');
    }

    console.log('[Wellness] Session updated:', session.id);

    return { success: true, data: session };
  } catch (error) {
    console.error('[Wellness] Update error:', error);
    return { success: false, error: { code: 'UPDATE_FAILED', message: 'Failed to update session' } };
  }
}

/**
 * Delete a wellness session
 */
export async function deleteWellnessSession(id: string): Promise<ApiResponse<null>> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be signed in' } };
    }

    const { error } = await client
      .from('wellness_sessions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.data.user.id);

    if (error) {
      handleSupabaseError(error, 'Delete wellness session');
    }

    console.log('[Wellness] Session deleted:', id);

    return { success: true, data: null };
  } catch (error) {
    console.error('[Wellness] Delete error:', error);
    return { success: false, error: { code: 'DELETE_FAILED', message: 'Failed to delete session' } };
  }
}

// ============================================================================
// Query Operations
// ============================================================================

/**
 * Get all wellness sessions with optional filtering
 */
export async function getWellnessSessions(
  params: WellnessQueryParams = {},
  pagination: PaginationParams = {}
): Promise<ApiResponse<PaginatedResult<WellnessSession>>> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be signed in' } };
    }

    let query = client
      .from('wellness_sessions')
      .select('*', { count: 'exact' })
      .eq('user_id', user.data.user.id);

    // Apply filters
    if (params.type) {
      query = query.eq('type', params.type);
    }
    if (params.category) {
      query = query.eq('category', params.category);
    }
    if (params.startDate) {
      query = query.gte('completed_at', params.startDate);
    }
    if (params.endDate) {
      query = query.lte('completed_at', params.endDate);
    }
    if (params.minDuration !== undefined) {
      query = query.gte('duration_minutes', params.minDuration);
    }
    if (params.maxDuration !== undefined) {
      query = query.lte('duration_minutes', params.maxDuration);
    }

    // Apply ordering
    const orderBy = params.orderBy || 'completed_at';
    const order = params.order || 'desc';
    query = query.order(orderBy, { ascending: order === 'asc' });

    // Apply pagination
    const { page = 1, limit = 20 } = pagination;
    const { from, to } = getPaginationParams(page, limit);
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      handleSupabaseError(error, 'Get wellness sessions');
    }

    const result = formatPaginatedResult(data || [], count || 0, page, limit);

    return { success: true, data: result };
  } catch (error) {
    console.error('[Wellness] Query error:', error);
    return { success: false, error: { code: 'QUERY_FAILED', message: 'Failed to query sessions' } };
  }
}

/**
 * Get sessions for today
 */
export async function getTodaySessions(): Promise<ApiResponse<WellnessSession[]>> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be signed in' } };
    }

    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const { data, error } = await client
      .from('wellness_sessions')
      .select('*')
      .eq('user_id', user.data.user.id)
      .gte('completed_at', today)
      .lt('completed_at', tomorrowStr)
      .order('completed_at', { ascending: false });

    if (error) {
      handleSupabaseError(error, 'Get today sessions');
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('[Wellness] Get today sessions error:', error);
    return { success: false, error: { code: 'QUERY_FAILED', message: 'Failed to get sessions' } };
  }
}

/**
 * Get sessions by type
 */
export async function getSessionsByType(type: WellnessSession['type']): Promise<ApiResponse<WellnessSession[]>> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be signed in' } };
    }

    const { data, error } = await client
      .from('wellness_sessions')
      .select('*')
      .eq('user_id', user.data.user.id)
      .eq('type', type)
      .order('completed_at', { ascending: false });

    if (error) {
      handleSupabaseError(error, 'Get sessions by type');
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('[Wellness] Get by type error:', error);
    return { success: false, error: { code: 'QUERY_FAILED', message: 'Failed to get sessions' } };
  }
}

/**
 * Get recent sessions (last 7 days)
 */
export async function getRecentSessions(days: number = 7): Promise<ApiResponse<WellnessSession[]>> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be signed in' } };
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString();

    const { data, error } = await client
      .from('wellness_sessions')
      .select('*')
      .eq('user_id', user.data.user.id)
      .gte('completed_at', startDateStr)
      .order('completed_at', { ascending: false });

    if (error) {
      handleSupabaseError(error, 'Get recent sessions');
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('[Wellness] Get recent sessions error:', error);
    return { success: false, error: { code: 'QUERY_FAILED', message: 'Failed to get sessions' } };
  }
}

// ============================================================================
// Statistics
// ============================================================================

/**
 * Get wellness statistics
 */
export async function getWellnessStatistics(startDate?: string, endDate?: string): Promise<ApiResponse<WellnessStatistics>> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be signed in' } };
    }

    let query = client
      .from('wellness_sessions')
      .select('*')
      .eq('user_id', user.data.user.id);

    if (startDate) {
      query = query.gte('completed_at', startDate);
    }
    if (endDate) {
      query = query.lte('completed_at', endDate);
    }

    const { data: sessions, error } = await query.order('completed_at', { ascending: true });

    if (error) {
      handleSupabaseError(error, 'Get wellness statistics');
    }

    const wellnessSessions = sessions || [];

    if (wellnessSessions.length === 0) {
      return {
        success: true,
        data: {
          totalSessions: 0,
          totalMinutes: 0,
          byType: {},
          byCategory: {},
          averageSessionDuration: 0,
          favoriteType: 'meditation',
          streak: 0,
          weeklyAverage: 0,
          monthlyMinutes: 0,
        },
      };
    }

    // Calculate statistics
    const byType: Record<string, { count: number; minutes: number }> = {};
    const byCategory: Record<string, { count: number; minutes: number }> = {};
    let totalMinutes = 0;
    let maxTypeCount = 0;
    let favoriteType = 'meditation';

    wellnessSessions.forEach((session) => {
      totalMinutes += session.duration_minutes;

      // By type
      if (!byType[session.type]) {
        byType[session.type] = { count: 0, minutes: 0 };
      }
      byType[session.type].count++;
      byType[session.type].minutes += session.duration_minutes;

      if (byType[session.type].count > maxTypeCount) {
        maxTypeCount = byType[session.type].count;
        favoriteType = session.type;
      }

      // By category
      if (!byCategory[session.category]) {
        byCategory[session.category] = { count: 0, minutes: 0 };
      }
      byCategory[session.category].count++;
      byCategory[session.category].minutes += session.duration_minutes;
    });

    // Calculate streak
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    for (let i = 0; i < 365; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const hasSession = wellnessSessions.some((s) => s.completed_at.split('T')[0] === dateStr);
      if (hasSession) {
        streak++;
      } else if (dateStr !== today) {
        break;
      }
    }

    // Calculate weekly average
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekSessions = wellnessSessions.filter((s) => new Date(s.completed_at) >= weekAgo);
    const weeklyAverage = weekSessions.length / 4; // Approximate weeks

    // Calculate monthly minutes
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const monthlyMinutes = wellnessSessions
      .filter((s) => new Date(s.completed_at) >= monthAgo)
      .reduce((sum, s) => sum + s.duration_minutes, 0);

    return {
      success: true,
      data: {
        totalSessions: wellnessSessions.length,
        totalMinutes,
        byType,
        byCategory,
        averageSessionDuration: totalMinutes / wellnessSessions.length,
        favoriteType,
        streak,
        weeklyAverage,
        monthlyMinutes,
      },
    };
  } catch (error) {
    console.error('[Wellness] Statistics error:', error);
    return { success: false, error: { code: 'STATS_FAILED', message: 'Failed to get statistics' } };
  }
}

/**
 * Get weekly wellness goal progress
 */
export async function getWeeklyWellnessGoal(): Promise<ApiResponse<WeeklyWellnessGoal>> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be signed in' } };
    }

    // Get start of week (Monday)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - mondayOffset);
    weekStart.setHours(0, 0, 0, 0);
    const weekStartStr = weekStart.toISOString();

    const { data: sessions, error } = await client
      .from('wellness_sessions')
      .select('type, duration_minutes')
      .eq('user_id', user.data.user.id)
      .gte('completed_at', weekStartStr);

    if (error) {
      handleSupabaseError(error, 'Get weekly wellness goal');
    }

    const weekSessions = sessions || [];

    // Calculate totals
    let meditationMinutes = 0;
    let yogaSessions = 0;
    let totalMinutes = 0;

    weekSessions.forEach((session) => {
      totalMinutes += session.duration_minutes;

      if (session.type === 'meditation') {
        meditationMinutes += session.duration_minutes;
      } else if (session.type === 'yoga') {
        yogaSessions += 1;
      }
    });

    // Default goals (could be user-configurable)
    const meditationGoal = 70; // 70 minutes per week
    const yogaGoal = 3; // 3 sessions per week
    const totalGoal = 150; // 150 minutes total per week

    return {
      success: true,
      data: {
        meditationMinutes,
        yogaSessions,
        totalMinutes,
        progress: {
          meditation: Math.min((meditationMinutes / meditationGoal) * 100, 100),
          yoga: Math.min((yogaSessions / yogaGoal) * 100, 100),
          total: Math.min((totalMinutes / totalGoal) * 100, 100),
        },
      },
    };
  } catch (error) {
    console.error('[Wellness] Weekly goal error:', error);
    return { success: false, error: { code: 'GOAL_FAILED', message: 'Failed to get weekly goal' } };
  }
}

// ============================================================================
// User Profile Operations
// ============================================================================

/**
 * Get user profile
 */
export async function getUserProfile(): Promise<ApiResponse<UserProfile>> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be signed in' } };
    }

    const { data, error } = await client
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.data.user.id)
      .single();

    if (error) {
      handleSupabaseError(error, 'Get user profile');
    }

    return { success: true, data };
  } catch (error) {
    console.error('[Wellness] Get profile error:', error);
    return { success: false, error: { code: 'PROFILE_FAILED', message: 'Failed to get profile' } };
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  data: Partial<UserProfile>
): Promise<ApiResponse<UserProfile>> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be signed in' } };
    }

    const { data: profile, error } = await client
      .from('user_profiles')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.data.user.id)
      .select()
      .single();

    if (error) {
      handleSupabaseError(error, 'Update user profile');
    }

    return { success: true, data: profile };
  } catch (error) {
    console.error('[Wellness] Update profile error:', error);
    return { success: false, error: { code: 'UPDATE_FAILED', message: 'Failed to update profile' } };
  }
}

// ============================================================================
// Export
// ============================================================================

// All types are exported from ../types/database.ts

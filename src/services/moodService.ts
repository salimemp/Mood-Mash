// ============================================================================
// Mood Service for MoodMash
// Database operations for mood entries
// ============================================================================

import { getSupabaseClient, safeQuery, getPaginationParams, formatPaginatedResult, handleSupabaseError } from '../lib/supabase';
import type {
  MoodEntry,
  ApiResponse,
  PaginatedResult,
  PaginationParams,
  MoodPrediction,
  PatternInsight,
} from '../types/database';

// ============================================================================
// Types
// ============================================================================

export interface CreateMoodEntryData {
  emotion: string;
  emotion_icon?: string;
  intensity: number;
  note?: string;
  tags?: string[];
  activities?: string[];
  sleep_quality?: number;
  energy_level?: number;
  stress_level?: number;
  weather?: string;
  location?: string;
  entry_date?: string;
  entry_time?: string;
}

export interface UpdateMoodEntryData extends Partial<CreateMoodEntryData> {}

export interface MoodQueryParams {
  startDate?: string;
  endDate?: string;
  emotions?: string[];
  minIntensity?: number;
  maxIntensity?: number;
  limit?: number;
  orderBy?: 'created_at' | 'entry_date' | 'intensity';
  order?: 'asc' | 'desc';
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

export interface MoodTrendData {
  date: string;
  emotion: string;
  intensity: number;
  count: number;
}

// ============================================================================
// CRUD Operations
// ============================================================================

/**
 * Create a new mood entry
 */
export async function createMoodEntry(data: CreateMoodEntryData): Promise<ApiResponse<MoodEntry>> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be signed in' } };
    }

    const now = new Date().toISOString();
    const entryDate = data.entry_date || new Date().toISOString().split('T')[0];
    const entryTime = data.entry_time || new Date().toTimeString().slice(0, 5);

    const { data: entry, error } = await client
      .from('mood_entries')
      .insert({
        user_id: user.data.user.id,
        emotion: data.emotion,
        emotion_icon: data.emotion_icon,
        intensity: data.intensity,
        note: data.note,
        tags: data.tags || [],
        activities: data.activities || [],
        sleep_quality: data.sleep_quality,
        energy_level: data.energy_level,
        stress_level: data.stress_level,
        weather: data.weather,
        location: data.location,
        entry_date: entryDate,
        entry_time: entryTime,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error) {
      handleSupabaseError(error, 'Create mood entry');
    }

    console.log('[Mood] Entry created:', entry.id);

    return { success: true, data: entry };
  } catch (error) {
    console.error('[Mood] Create error:', error);
    return { success: false, error: { code: 'CREATE_FAILED', message: 'Failed to create mood entry' } };
  }
}

/**
 * Get a mood entry by ID
 */
export async function getMoodEntry(id: string): Promise<ApiResponse<MoodEntry>> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be signed in' } };
    }

    const { data, error } = await client
      .from('mood_entries')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.data.user.id)
      .single();

    if (error) {
      handleSupabaseError(error, 'Get mood entry');
    }

    return { success: true, data };
  } catch (error) {
    console.error('[Mood] Get error:', error);
    return { success: false, error: { code: 'GET_FAILED', message: 'Failed to get mood entry' } };
  }
}

/**
 * Update a mood entry
 */
export async function updateMoodEntry(id: string, data: UpdateMoodEntryData): Promise<ApiResponse<MoodEntry>> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be signed in' } };
    }

    const { data: entry, error } = await client
      .from('mood_entries')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.data.user.id)
      .select()
      .single();

    if (error) {
      handleSupabaseError(error, 'Update mood entry');
    }

    console.log('[Mood] Entry updated:', entry.id);

    return { success: true, data: entry };
  } catch (error) {
    console.error('[Mood] Update error:', error);
    return { success: false, error: { code: 'UPDATE_FAILED', message: 'Failed to update mood entry' } };
  }
}

/**
 * Delete a mood entry
 */
export async function deleteMoodEntry(id: string): Promise<ApiResponse<null>> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be signed in' } };
    }

    const { error } = await client
      .from('mood_entries')
      .delete()
      .eq('id', id)
      .eq('user_id', user.data.user.id);

    if (error) {
      handleSupabaseError(error, 'Delete mood entry');
    }

    console.log('[Mood] Entry deleted:', id);

    return { success: true, data: null };
  } catch (error) {
    console.error('[Mood] Delete error:', error);
    return { success: false, error: { code: 'DELETE_FAILED', message: 'Failed to delete mood entry' } };
  }
}

// ============================================================================
// Query Operations
// ============================================================================

/**
 * Get all mood entries with optional filtering
 */
export async function getMoodEntries(
  params: MoodQueryParams = {},
  pagination: PaginationParams = {}
): Promise<ApiResponse<PaginatedResult<MoodEntry>>> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be signed in' } };
    }

    let query = client
      .from('mood_entries')
      .select('*', { count: 'exact' })
      .eq('user_id', user.data.user.id);

    // Apply filters
    if (params.startDate) {
      query = query.gte('entry_date', params.startDate);
    }
    if (params.endDate) {
      query = query.lte('entry_date', params.endDate);
    }
    if (params.emotions && params.emotions.length > 0) {
      query = query.in('emotion', params.emotions);
    }
    if (params.minIntensity !== undefined) {
      query = query.gte('intensity', params.minIntensity);
    }
    if (params.maxIntensity !== undefined) {
      query = query.lte('intensity', params.maxIntensity);
    }

    // Apply ordering
    const orderBy = params.orderBy || 'created_at';
    const order = params.order || 'desc';
    query = query.order(orderBy, { ascending: order === 'asc' });

    // Apply pagination
    const { page = 1, limit = 20 } = pagination;
    const { from, to } = getPaginationParams(page, limit);
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      handleSupabaseError(error, 'Get mood entries');
    }

    const result = formatPaginatedResult(data || [], count || 0, page, limit);

    return { success: true, data: result, meta: { page, limit, total: count, hasMore: result.hasMore } };
  } catch (error) {
    console.error('[Mood] Query error:', error);
    return { success: false, error: { code: 'QUERY_FAILED', message: 'Failed to query mood entries' } };
  }
}

/**
 * Get mood entries for today
 */
export async function getTodayMoods(): Promise<ApiResponse<MoodEntry[]>> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be signed in' } };
    }

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await client
      .from('mood_entries')
      .select('*')
      .eq('user_id', user.data.user.id)
      .eq('entry_date', today)
      .order('created_at', { ascending: false });

    if (error) {
      handleSupabaseError(error, 'Get today moods');
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('[Mood] Get today moods error:', error);
    return { success: false, error: { code: 'QUERY_FAILED', message: 'Failed to get today moods' } };
  }
}

/**
 * Get mood entries for the last N days
 */
export async function getRecentMoods(days: number = 7): Promise<ApiResponse<MoodEntry[]>> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be signed in' } };
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    const { data, error } = await client
      .from('mood_entries')
      .select('*')
      .eq('user_id', user.data.user.id)
      .gte('entry_date', startDateStr)
      .order('entry_date', { ascending: true });

    if (error) {
      handleSupabaseError(error, 'Get recent moods');
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('[Mood] Get recent moods error:', error);
    return { success: false, error: { code: 'QUERY_FAILED', message: 'Failed to get recent moods' } };
  }
}

// ============================================================================
// Statistics
// ============================================================================

/**
 * Get mood statistics
 */
export async function getMoodStatistics(startDate?: string, endDate?: string): Promise<ApiResponse<MoodStatistics>> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be signed in' } };
    }

    // Get all entries for the period
    let query = client
      .from('mood_entries')
      .select('*')
      .eq('user_id', user.data.user.id);

    if (startDate) {
      query = query.gte('entry_date', startDate);
    }
    if (endDate) {
      query = query.lte('entry_date', endDate);
    }

    const { data: entries, error } = await query.order('created_at', { ascending: true });

    if (error) {
      handleSupabaseError(error, 'Get mood statistics');
    }

    const moodEntries = entries || [];

    if (moodEntries.length === 0) {
      return {
        success: true,
        data: {
          totalEntries: 0,
          averageIntensity: 0,
          dominantEmotion: 'neutral',
          emotionDistribution: {},
          averageByHour: {},
          averageByDay: {},
          weeklyTrend: 0,
          streak: 0,
        },
      };
    }

    // Calculate statistics
    const emotionDistribution: Record<string, number> = {};
    const averageByHour: Record<number, { total: number; count: number }> = {};
    const averageByDay: Record<number, { total: number; count: number }> = {};

    let totalIntensity = 0;
    let maxEmotionCount = 0;
    let dominantEmotion = 'neutral';

    moodEntries.forEach((entry) => {
      // Intensity
      totalIntensity += entry.intensity;

      // Emotion distribution
      emotionDistribution[entry.emotion] = (emotionDistribution[entry.emotion] || 0) + 1;
      if (emotionDistribution[entry.emotion] > maxEmotionCount) {
        maxEmotionCount = emotionDistribution[entry.emotion];
        dominantEmotion = entry.emotion;
      }

      // Time-based averages
      const entryTime = new Date(entry.created_at);
      const hour = entryTime.getHours();
      const day = entryTime.getDay();

      if (!averageByHour[hour]) {
        averageByHour[hour] = { total: 0, count: 0 };
      }
      averageByHour[hour].total += entry.intensity;
      averageByHour[hour].count++;

      if (!averageByDay[day]) {
        averageByDay[day] = { total: 0, count: 0 };
      }
      averageByDay[day].total += entry.intensity;
      averageByDay[day].count++;
    });

    // Calculate averages
    const averageByHourCalc: Record<number, number> = {};
    Object.entries(averageByHour).forEach(([hour, data]) => {
      averageByHourCalc[parseInt(hour)] = data.total / data.count;
    });

    const averageByDayCalc: Record<number, number> = {};
    Object.entries(averageByDay).forEach(([day, data]) => {
      averageByDayCalc[parseInt(day)] = data.total / data.count;
    });

    // Calculate weekly trend (compare last 7 days to previous 7 days)
    const now = new Date();
    const lastWeekStart = new Date(now);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const prevWeekStart = new Date(lastWeekStart);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);

    const lastWeekEntries = moodEntries.filter(
      (e) => new Date(e.created_at) >= lastWeekStart
    );
    const prevWeekEntries = moodEntries.filter(
      (e) => new Date(e.created_at) >= prevWeekStart && new Date(e.created_at) < lastWeekStart
    );

    const lastWeekAvg = lastWeekEntries.length > 0
      ? lastWeekEntries.reduce((sum, e) => sum + e.intensity, 0) / lastWeekEntries.length
      : 0;
    const prevWeekAvg = prevWeekEntries.length > 0
      ? prevWeekEntries.reduce((sum, e) => sum + e.intensity, 0) / prevWeekEntries.length
      : 0;

    const weeklyTrend = prevWeekAvg > 0 ? ((lastWeekAvg - prevWeekAvg) / prevWeekAvg) * 100 : 0;

    // Calculate streak
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    for (let i = 0; i < 365; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const hasEntry = moodEntries.some((e) => e.entry_date === dateStr);
      if (hasEntry) {
        streak++;
      } else if (dateStr !== today) {
        break;
      }
    }

    return {
      success: true,
      data: {
        totalEntries: moodEntries.length,
        averageIntensity: totalIntensity / moodEntries.length,
        dominantEmotion,
        emotionDistribution,
        averageByHour: averageByHourCalc,
        averageByDay: averageByDayCalc,
        weeklyTrend,
        streak,
      },
    };
  } catch (error) {
    console.error('[Mood] Statistics error:', error);
    return { success: false, error: { code: 'STATS_FAILED', message: 'Failed to get statistics' } };
  }
}

/**
 * Get mood trend data for charts
 */
export async function getMoodTrendData(days: number = 30): Promise<ApiResponse<MoodTrendData[]>> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be signed in' } };
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    const { data, error } = await client
      .from('mood_entries')
      .select('entry_date, emotion, intensity')
      .eq('user_id', user.data.user.id)
      .gte('entry_date', startDateStr)
      .order('entry_date', { ascending: true });

    if (error) {
      handleSupabaseError(error, 'Get mood trend');
    }

    // Aggregate by date
    const trendMap = new Map<string, MoodTrendData>();

    (data || []).forEach((entry) => {
      const existing = trendMap.get(entry.entry_date);
      if (existing) {
        existing.count++;
        existing.intensity = ((existing.intensity * (existing.count - 1)) + entry.intensity) / existing.count;
      } else {
        trendMap.set(entry.entry_date, {
          date: entry.entry_date,
          emotion: entry.emotion,
          intensity: entry.intensity,
          count: 1,
        });
      }
    });

    const trendData = Array.from(trendMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    return { success: true, data: trendData };
  } catch (error) {
    console.error('[Mood] Trend data error:', error);
    return { success: false, error: { code: 'TREND_FAILED', message: 'Failed to get trend data' } };
  }
}

// ============================================================================
// Bulk Operations
// ============================================================================

/**
 * Bulk create mood entries
 */
export async function bulkCreateMoodEntries(entries: CreateMoodEntryData[]): Promise<ApiResponse<MoodEntry[]>> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be signed in' } };
    }

    const now = new Date().toISOString();
    const entriesWithUser = entries.map((entry) => ({
      user_id: user.data.user!.id,
      emotion: entry.emotion,
      emotion_icon: entry.emotion_icon,
      intensity: entry.intensity,
      note: entry.note,
      tags: entry.tags || [],
      activities: entry.activities || [],
      sleep_quality: entry.sleep_quality,
      energy_level: entry.energy_level,
      stress_level: entry.stress_level,
      weather: entry.weather,
      location: entry.location,
      entry_date: entry.entry_date || now.split('T')[0],
      entry_time: entry.entry_time || now.split('T')[1].slice(0, 5),
      created_at: now,
      updated_at: now,
    }));

    const { data, error } = await client
      .from('mood_entries')
      .insert(entriesWithUser)
      .select();

    if (error) {
      handleSupabaseError(error, 'Bulk create mood entries');
    }

    console.log('[Mood] Bulk created:', data?.length, 'entries');

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('[Mood] Bulk create error:', error);
    return { success: false, error: { code: 'BULK_CREATE_FAILED', message: 'Failed to create entries' } };
  }
}

/**
 * Delete multiple mood entries
 */
export async function bulkDeleteMoodEntries(ids: string[]): Promise<ApiResponse<{ deleted: number }>> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be signed in' } };
    }

    const { error } = await client
      .from('mood_entries')
      .delete()
      .in('id', ids)
      .eq('user_id', user.data.user.id);

    if (error) {
      handleSupabaseError(error, 'Bulk delete mood entries');
    }

    console.log('[Mood] Bulk deleted:', ids.length, 'entries');

    return { success: true, data: { deleted: ids.length } };
  } catch (error) {
    console.error('[Mood] Bulk delete error:', error);
    return { success: false, error: { code: 'BULK_DELETE_FAILED', message: 'Failed to delete entries' } };
  }
}

// ============================================================================
// Export
// ============================================================================

// All types are exported from ../types/database.ts

// ============================================================================
// Journal Service for MoodMash
// Database operations for journal entries with AI-powered insights
// ============================================================================

import {
  getSupabaseClient,
  getPaginationParams,
  formatPaginatedResult,
  handleSupabaseError,
} from '../lib/supabase';
import type {
  JournalEntry,
  ApiResponse,
  PaginatedResult,
  PaginationParams,
  SentimentLabel,
} from '../types/database';

// ============================================================================
// Types
// ============================================================================

export interface CreateJournalEntryData {
  title?: string;
  content: string;
  mood_id?: string;
  mood_intensity?: number;
  activities?: string[];
  tags?: string[];
  sleep_quality?: number;
  energy_level?: number;
  stress_level?: number;
  weather?: string;
  location?: string;
  entry_date?: string;
  entry_time?: string;
  related_mood_entry?: string;
}

export interface UpdateJournalEntryData extends Partial<CreateJournalEntryData> {
  is_ai_generated?: boolean;
  ai_summary?: string;
  ai_suggestions?: string[];
  sentiment_score?: number;
  sentiment_label?: SentimentLabel;
}

export interface JournalQueryParams {
  startDate?: string;
  endDate?: string;
  mood_id?: string;
  sentiment?: SentimentLabel;
  minSentimentScore?: number;
  maxSentimentScore?: number;
  tags?: string[];
  has_ai_insights?: boolean;
  orderBy?: 'created_at' | 'entry_date' | 'sentiment_score';
  order?: 'asc' | 'desc';
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

export interface JournalWithMood {
  journal: JournalEntry;
  mood_entry?: {
    id: string;
    emotion: string;
    intensity: number;
  };
}

// ============================================================================
// CRUD Operations
// ============================================================================

/**
 * Create a new journal entry
 */
export async function createJournalEntry(
  data: CreateJournalEntryData
): Promise<ApiResponse<JournalEntry>> {
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
    const entryDate = data.entry_date || new Date().toISOString().split('T')[0];
    const entryTime = data.entry_time || new Date().toTimeString().slice(0, 5);

    const { data: entry, error } = await client
      .from('journal_entries')
      .insert({
        user_id: user.data.user.id,
        title: data.title,
        content: data.content,
        mood_id: data.mood_id,
        mood_intensity: data.mood_intensity,
        activities: data.activities || [],
        tags: data.tags || [],
        sleep_quality: data.sleep_quality,
        energy_level: data.energy_level,
        stress_level: data.stress_level,
        weather: data.weather,
        location: data.location,
        entry_date: entryDate,
        entry_time: entryTime,
        related_mood_entry: data.related_mood_entry,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error) {
      handleSupabaseError(error, 'Create journal entry');
    }

    console.log('[Journal] Entry created:', entry.id);

    return { success: true, data: entry };
  } catch (error) {
    console.error('[Journal] Create error:', error);
    return {
      success: false,
      error: { code: 'CREATE_FAILED', message: 'Failed to create journal entry' },
    };
  }
}

/**
 * Get a journal entry by ID
 */
export async function getJournalEntry(
  id: string
): Promise<ApiResponse<JournalEntry>> {
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
      .from('journal_entries')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.data.user.id)
      .single();

    if (error) {
      handleSupabaseError(error, 'Get journal entry');
    }

    return { success: true, data };
  } catch (error) {
    console.error('[Journal] Get error:', error);
    return {
      success: false,
      error: { code: 'GET_FAILED', message: 'Failed to get journal entry' },
    };
  }
}

/**
 * Update a journal entry
 */
export async function updateJournalEntry(
  id: string,
  data: UpdateJournalEntryData
): Promise<ApiResponse<JournalEntry>> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'You must be signed in' },
      };
    }

    const { data: entry, error } = await client
      .from('journal_entries')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.data.user.id)
      .select()
      .single();

    if (error) {
      handleSupabaseError(error, 'Update journal entry');
    }

    console.log('[Journal] Entry updated:', entry.id);

    return { success: true, data: entry };
  } catch (error) {
    console.error('[Journal] Update error:', error);
    return {
      success: false,
      error: { code: 'UPDATE_FAILED', message: 'Failed to update journal entry' },
    };
  }
}

/**
 * Delete a journal entry
 */
export async function deleteJournalEntry(
  id: string
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
      .from('journal_entries')
      .delete()
      .eq('id', id)
      .eq('user_id', user.data.user.id);

    if (error) {
      handleSupabaseError(error, 'Delete journal entry');
    }

    console.log('[Journal] Entry deleted:', id);

    return { success: true, data: null };
  } catch (error) {
    console.error('[Journal] Delete error:', error);
    return {
      success: false,
      error: { code: 'DELETE_FAILED', message: 'Failed to delete journal entry' },
    };
  }
}

// ============================================================================
// Query Operations
// ============================================================================

/**
 * Get all journal entries with optional filtering
 */
export async function getJournalEntries(
  params: JournalQueryParams = {},
  pagination: PaginationParams = {}
): Promise<ApiResponse<PaginatedResult<JournalEntry>>> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'You must be signed in' },
      };
    }

    let query = client
      .from('journal_entries')
      .select('*', { count: 'exact' })
      .eq('user_id', user.data.user.id);

    // Apply filters
    if (params.startDate) {
      query = query.gte('entry_date', params.startDate);
    }
    if (params.endDate) {
      query = query.lte('entry_date', params.endDate);
    }
    if (params.mood_id) {
      query = query.eq('mood_id', params.mood_id);
    }
    if (params.sentiment) {
      query = query.eq('sentiment_label', params.sentiment);
    }
    if (params.minSentimentScore !== undefined) {
      query = query.gte('sentiment_score', params.minSentimentScore);
    }
    if (params.maxSentimentScore !== undefined) {
      query = query.lte('sentiment_score', params.maxSentimentScore);
    }
    if (params.tags && params.tags.length > 0) {
      query = query.overlaps('tags', params.tags);
    }
    if (params.has_ai_insights !== undefined) {
      query = query.eq('is_ai_generated', params.has_ai_insights);
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
      handleSupabaseError(error, 'Get journal entries');
    }

    const result = formatPaginatedResult(data || [], count || 0, page, limit);

    return {
      success: true,
      data: result,
      meta: { page, limit, total: count, hasMore: result.hasMore },
    };
  } catch (error) {
    console.error('[Journal] Query error:', error);
    return {
      success: false,
      error: { code: 'QUERY_FAILED', message: 'Failed to query journal entries' },
    };
  }
}

/**
 * Get journal entries for today
 */
export async function getTodayJournalEntries(): Promise<ApiResponse<JournalEntry[]>> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'You must be signed in' },
      };
    }

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await client
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.data.user.id)
      .eq('entry_date', today)
      .order('created_at', { ascending: false });

    if (error) {
      handleSupabaseError(error, 'Get today journal entries');
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('[Journal] Get today entries error:', error);
    return {
      success: false,
      error: { code: 'QUERY_FAILED', message: 'Failed to get today journal entries' },
    };
  }
}

/**
 * Get journal entries with related mood data
 */
export async function getJournalEntriesWithMood(
  params: JournalQueryParams = {},
  pagination: PaginationParams = {}
): Promise<ApiResponse<PaginatedResult<JournalWithMood>>> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'You must be signed in' },
      };
    }

    // First get journal entries
    const journalResult = await getJournalEntries(params, pagination);

    if (!journalResult.success || !journalResult.data) {
      return {
        success: journalResult.success,
        error: journalResult.error,
        data: undefined,
      };
    }

    // Get related mood entries
    const journalIds = journalResult.data.data
      .filter((entry) => entry.related_mood_entry)
      .map((entry) => entry.related_mood_entry!);

    const moodMap: Record<string, { id: string; emotion: string; intensity: number }> = {};

    if (journalIds.length > 0) {
      const { data: moodEntries } = await client
        .from('mood_entries')
        .select('id, emotion, intensity')
        .in('id', journalIds);

      if (moodEntries) {
        moodEntries.forEach((mood) => {
          moodMap[mood.id] = {
            id: mood.id,
            emotion: mood.emotion,
            intensity: mood.intensity,
          };
        });
      }
    }

    // Combine data
    const combinedData: JournalWithMood[] = journalResult.data.data.map((entry) => ({
      journal: entry,
      mood_entry: entry.related_mood_entry
        ? moodMap[entry.related_mood_entry]
        : undefined,
    }));

    return {
      success: true,
      data: {
        ...journalResult.data,
        data: combinedData,
      },
    };
  } catch (error) {
    console.error('[Journal] Get with mood error:', error);
    return {
      success: false,
      error: { code: 'QUERY_FAILED', message: 'Failed to get journal entries with mood' },
    };
  }
}

/**
 * Search journal entries
 */
export async function searchJournalEntries(
  searchQuery: string,
  pagination: PaginationParams = {}
): Promise<ApiResponse<PaginatedResult<JournalEntry>>> {
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

    // Use text search for title and content with OR condition
    const searchPattern = `%${searchQuery}%`;
    const { data, error, count } = await client
      .from('journal_entries')
      .select('*', { count: 'exact' })
      .eq('user_id', user.data.user.id)
      .or(`title.ilike.${searchPattern},content.ilike.${searchPattern}`)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      handleSupabaseError(error, 'Search journal entries');
    }

    const result = formatPaginatedResult(data || [], count || 0, page, limit);

    return { success: true, data: result };
  } catch (error) {
    console.error('[Journal] Search error:', error);
    return {
      success: false,
      error: { code: 'SEARCH_FAILED', message: 'Failed to search journal entries' },
    };
  }
}

// ============================================================================
// Statistics
// ============================================================================

/**
 * Get journal statistics
 */
export async function getJournalStatistics(
  startDate?: string,
  endDate?: string
): Promise<ApiResponse<JournalStatistics>> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'You must be signed in' },
      };
    }

    let query = client
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.data.user.id);

    if (startDate) {
      query = query.gte('entry_date', startDate);
    }
    if (endDate) {
      query = query.lte('entry_date', endDate);
    }

    const { data: entries, error } = await query.order('created_at', {
      ascending: true,
    });

    if (error) {
      handleSupabaseError(error, 'Get journal statistics');
    }

    const journalEntries = entries || [];

    if (journalEntries.length === 0) {
      return {
        success: true,
        data: {
          totalEntries: 0,
          totalWords: 0,
          averageWordCount: 0,
          sentimentDistribution: { positive: 0, neutral: 0, negative: 0 },
          averageSentimentScore: 0,
          topTags: [],
          writingStreak: 0,
          entriesThisWeek: 0,
          entriesThisMonth: 0,
          aiInsightsGenerated: 0,
        },
      };
    }

    // Calculate statistics
    const sentimentDistribution: Record<SentimentLabel, number> = {
      positive: 0,
      neutral: 0,
      negative: 0,
    };
    const tagCount: Record<string, number> = {};
    let totalWords = 0;
    let totalSentimentScore = 0;
    let aiInsightsCount = 0;

    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    const monthAgo = new Date(now);
    monthAgo.setDate(now.getDate() - 30);

    journalEntries.forEach((entry) => {
      // Word count
      const wordCount = entry.content.split(/\s+/).filter(Boolean).length;
      totalWords += wordCount;

      // Sentiment
      if (entry.sentiment_label) {
        sentimentDistribution[entry.sentiment_label]++;
        if (entry.sentiment_score) {
          totalSentimentScore += entry.sentiment_score;
        }
      }

      // Tags
      if (entry.tags) {
        entry.tags.forEach((tag: string) => {
          tagCount[tag] = (tagCount[tag] || 0) + 1;
        });
      }

      // AI insights
      if (entry.is_ai_generated) {
        aiInsightsCount++;
      }
    });

    // Calculate writing streak
    let writingStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    for (let i = 0; i < 365; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const hasEntry = journalEntries.some((e) => e.entry_date === dateStr);
      if (hasEntry) {
        writingStreak++;
      } else if (dateStr !== today) {
        break;
      }
    }

    // Count entries this week and month
    const entriesThisWeek = journalEntries.filter(
      (e) => new Date(e.created_at) >= weekAgo
    ).length;
    const entriesThisMonth = journalEntries.filter(
      (e) => new Date(e.created_at) >= monthAgo
    ).length;

    // Get top tags
    const topTags = Object.entries(tagCount)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      success: true,
      data: {
        totalEntries: journalEntries.length,
        totalWords,
        averageWordCount: totalWords / journalEntries.length,
        sentimentDistribution,
        averageSentimentScore:
          totalSentimentScore / journalEntries.length,
        topTags,
        writingStreak,
        entriesThisWeek,
        entriesThisMonth,
        aiInsightsGenerated: aiInsightsCount,
      },
    };
  } catch (error) {
    console.error('[Journal] Statistics error:', error);
    return {
      success: false,
      error: { code: 'STATS_FAILED', message: 'Failed to get statistics' },
    };
  }
}

// ============================================================================
// AI-Powered Features
// ============================================================================

/**
 * Analyze journal entry sentiment (placeholder for actual AI integration)
 */
export async function analyzeJournalSentiment(
  content: string
): Promise<{
  sentiment_score: number;
  sentiment_label: SentimentLabel;
}> {
  // Placeholder implementation - in production, this would call an AI service
  const positiveWords = [
    'happy',
    'good',
    'great',
    'excellent',
    'amazing',
    'wonderful',
    'joy',
    'love',
    'excited',
    'grateful',
  ];
  const negativeWords = [
    'sad',
    'bad',
    'terrible',
    'awful',
    'angry',
    'frustrated',
    'anxious',
    'stressed',
    'worried',
    'depressed',
  ];

  const words = content.toLowerCase().split(/\s+/);
  let positiveCount = 0;
  let negativeCount = 0;

  words.forEach((word) => {
    if (positiveWords.some((pw) => word.includes(pw))) positiveCount++;
    if (negativeWords.some((nw) => word.includes(nw))) negativeCount++;
  });

  const total = positiveCount + negativeCount || 1;
  const score = (positiveCount - negativeCount) / total;

  return {
    sentiment_score: Math.max(-1, Math.min(1, score)),
    sentiment_label:
      score > 0.2 ? 'positive' : score < -0.2 ? 'negative' : 'neutral',
  };
}

/**
 * Generate AI summary for journal entry (placeholder)
 */
export async function generateAISummary(
  content: string
): Promise<{ summary: string; suggestions: string[] }> {
  // Placeholder implementation - in production, this would call an AI service
  const words = content.split(/\s+/);
  const firstSentence = content.split(/[.!?]/)[0] || content.substring(0, 100);

  return {
    summary: `Journal entry about: ${firstSentence}...`,
    suggestions: [
      'Consider writing about what made you feel this way',
      'What could you do to maintain this feeling?',
      'Think about how you might share this experience with others',
    ],
  };
}

/**
 * Update journal entry with AI analysis
 */
export async function analyzeAndUpdateJournal(
  id: string
): Promise<ApiResponse<JournalEntry>> {
  try {
    // Get the journal entry
    const entryResult = await getJournalEntry(id);
    if (!entryResult.success || !entryResult.data) {
      return entryResult as ApiResponse<JournalEntry>;
    }

    const entry = entryResult.data;

    // Skip if already analyzed
    if (entry.is_ai_generated) {
      return { success: true, data: entry };
    }

    // Analyze sentiment
    const sentiment = await analyzeJournalSentiment(entry.content);

    // Generate summary and suggestions
    const aiContent = await generateAISummary(entry.content);

    // Update the entry
    const updateResult = await updateJournalEntry(id, {
      sentiment_score: sentiment.sentiment_score,
      sentiment_label: sentiment.sentiment_label,
      is_ai_generated: true,
      ai_summary: aiContent.summary,
      ai_suggestions: aiContent.suggestions,
    });

    return updateResult;
  } catch (error) {
    console.error('[Journal] AI analysis error:', error);
    return {
      success: false,
      error: {
        code: 'AI_FAILED',
        message: 'Failed to analyze journal entry',
      },
    };
  }
}

// ============================================================================
// Bulk Operations
// ============================================================================

/**
 * Bulk create journal entries
 */
export async function bulkCreateJournalEntries(
  entries: CreateJournalEntryData[]
): Promise<ApiResponse<JournalEntry[]>> {
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
    const entriesWithUser = entries.map((entry) => ({
      user_id: user.data.user!.id,
      title: entry.title,
      content: entry.content,
      mood_id: entry.mood_id,
      mood_intensity: entry.mood_intensity,
      activities: entry.activities || [],
      tags: entry.tags || [],
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
      .from('journal_entries')
      .insert(entriesWithUser)
      .select();

    if (error) {
      handleSupabaseError(error, 'Bulk create journal entries');
    }

    console.log('[Journal] Bulk created:', data?.length, 'entries');

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('[Journal] Bulk create error:', error);
    return {
      success: false,
      error: { code: 'BULK_CREATE_FAILED', message: 'Failed to create entries' },
    };
  }
}

/**
 * Delete multiple journal entries
 */
export async function bulkDeleteJournalEntries(
  ids: string[]
): Promise<ApiResponse<{ deleted: number }>> {
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
      .from('journal_entries')
      .delete()
      .in('id', ids)
      .eq('user_id', user.data.user.id);

    if (error) {
      handleSupabaseError(error, 'Bulk delete journal entries');
    }

    console.log('[Journal] Bulk deleted:', ids.length, 'entries');

    return { success: true, data: { deleted: ids.length } };
  } catch (error) {
    console.error('[Journal] Bulk delete error:', error);
    return {
      success: false,
      error: { code: 'BULK_DELETE_FAILED', message: 'Failed to delete entries' },
    };
  }
}

// ============================================================================
// Export
// ============================================================================

// All types are exported from ../types/database.ts

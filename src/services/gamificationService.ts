// ============================================================================
// Gamification Service for MoodMash
// Achievements, challenges, streaks, and points
// ============================================================================

import { getSupabaseClient, getPaginationParams, formatPaginatedResult, handleSupabaseError } from '../lib/supabase';
import type {
  Achievement,
  AchievementDefinition,
  Challenge,
  ChallengeDefinition,
  Streak,
  PointsTransaction,
  UserPoints,
  ApiResponse,
  PaginatedResult,
  PaginationParams,
} from '../types/database';

// ============================================================================
// Achievement Types
// ============================================================================

export interface CreateAchievementData {
  achievement_type: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  tier: Achievement['tier'];
  progress?: number;
  max_progress?: number;
}

export interface AchievementWithProgress {
  achievement: Achievement;
  definition: AchievementDefinition;
  progress: number;
  isUnlocked: boolean;
}

export interface AchievementStats {
  totalUnlocked: number;
  totalPoints: number;
  byTier: Record<string, number>;
  recentAchievements: Achievement[];
  completionPercentage: number;
}

// ============================================================================
// Challenge Types
// ============================================================================

export interface StartChallengeData {
  challenge_id: string;
  start_date?: string;
}

export interface ChallengeProgress {
  challenge: Challenge;
  definition: ChallengeDefinition;
  progress: number;
  daysRemaining: number;
  isOnTrack: boolean;
}

export interface ChallengeStats {
  activeChallenges: number;
  completedChallenges: number;
  failedChallenges: number;
  totalRewardPoints: number;
  currentRank: number;
  totalParticipants: number;
}

// ============================================================================
// Streak Types
// ============================================================================

export interface StreakWithDetails {
  streak: Streak;
  daysUntilNextMilestone: number;
  nextMilestone: number;
  recentActivity: boolean;
  milestoneProgress: number;
}

export interface StreakStats {
  currentStreaks: Record<string, number>;
  longestStreaks: Record<string, number>;
  totalMilestonesReached: number;
  streakBonusPoints: number;
}

// ============================================================================
// Points Types
// ============================================================================

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

export interface AwardPointsData {
  amount: number;
  transaction_type: PointsTransaction['transaction_type'];
  source_type: PointsTransaction['source_type'];
  source_id?: string;
  description: string;
}

// ============================================================================
// Achievements
// ============================================================================

/**
 * Get all achievement definitions
 */
export async function getAchievementDefinitions(): Promise<ApiResponse<AchievementDefinition[]>> {
  try {
    // This could be a static list or fetched from a table
    const definitions: AchievementDefinition[] = [
      {
        id: 'first_mood',
        type: 'milestone',
        name: 'First Steps',
        description: 'Log your first mood entry',
        icon: '👣',
        points: 10,
        tier: 'bronze',
        max_progress: 1,
        category: 'mood',
        requirement: 'Log 1 mood entry',
      },
      {
        id: 'week_streak',
        type: 'streak',
        name: 'Consistent Care',
        description: 'Log moods for 7 days in a row',
        icon: '🔥',
        points: 50,
        tier: 'silver',
        max_progress: 7,
        category: 'streak',
        requirement: 'Maintain a 7-day streak',
      },
      {
        id: 'month_streak',
        type: 'streak',
        name: 'Dedicated Defender',
        description: 'Log moods for 30 days in a row',
        icon: '💪',
        points: 200,
        tier: 'gold',
        max_progress: 30,
        category: 'streak',
        requirement: 'Maintain a 30-day streak',
      },
      {
        id: 'meditation_master',
        type: 'sessions',
        name: 'Zen Master',
        description: 'Complete 10 meditation sessions',
        icon: '🧘',
        points: 75,
        tier: 'silver',
        max_progress: 10,
        category: 'wellness',
        requirement: 'Complete 10 meditation sessions',
      },
      {
        id: 'yoga_warrior',
        type: 'sessions',
        name: 'Yoga Warrior',
        description: 'Complete 20 yoga sessions',
        icon: '🧎',
        points: 100,
        tier: 'silver',
        max_progress: 20,
        category: 'wellness',
        requirement: 'Complete 20 yoga sessions',
      },
      {
        id: 'emotional_explorer',
        type: 'variety',
        name: 'Emotional Explorer',
        description: 'Log 5 different emotions',
        icon: '🎭',
        points: 25,
        tier: 'bronze',
        max_progress: 5,
        category: 'mood',
        requirement: 'Experience 5 different emotions',
      },
      {
        id: 'gratitude_guru',
        type: 'journal',
        name: 'Gratitude Guru',
        description: 'Write 7 gratitude journal entries',
        icon: '🙏',
        points: 35,
        tier: 'bronze',
        max_progress: 7,
        category: 'journal',
        requirement: 'Write 7 gratitude entries',
      },
      {
        id: 'early_bird',
        type: 'time',
        name: 'Early Bird',
        description: 'Log your mood before 8 AM for 5 days',
        icon: '🌅',
        points: 30,
        tier: 'bronze',
        max_progress: 5,
        category: 'habit',
        requirement: 'Log mood before 8 AM 5 times',
      },
      {
        id: 'night_owl',
        type: 'time',
        name: 'Night Owl',
        description: 'Log your mood after 9 PM for 5 days',
        icon: '🦉',
        points: 30,
        tier: 'bronze',
        max_progress: 5,
        category: 'habit',
        requirement: 'Log mood after 9 PM 5 times',
      },
      {
        id: 'century_club',
        type: 'milestone',
        name: 'Century Club',
        description: 'Log 100 mood entries',
        icon: '💯',
        points: 150,
        tier: 'gold',
        max_progress: 100,
        category: 'mood',
        requirement: 'Log 100 mood entries',
      },
      {
        id: 'mindful_marathon',
        type: 'duration',
        name: 'Mindful Marathon',
        description: 'Complete 500 minutes of meditation',
        icon: '⏱️',
        points: 125,
        tier: 'gold',
        max_progress: 500,
        category: 'wellness',
        requirement: 'Meditate for 500 minutes total',
      },
      {
        id: 'balance_master',
        type: 'variety',
        name: 'Balance Master',
        description: 'Try all 4 wellness activity types',
        icon: '⚖️',
        points: 50,
        tier: 'silver',
        max_progress: 4,
        category: 'wellness',
        requirement: 'Try meditation, yoga, breathing, and music therapy',
      },
    ];

    return { success: true, data: definitions };
  } catch (error) {
    console.error('[Gamification] Get achievement definitions error:', error);
    return { success: false, error: { code: 'QUERY_FAILED', message: 'Failed to get definitions' } };
  }
}

/**
 * Get user achievements
 */
export async function getUserAchievements(
  pagination: PaginationParams = {}
): Promise<ApiResponse<PaginatedResult<Achievement>>> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be signed in' } };
    }

    const { page = 1, limit = 20 } = pagination;
    const { from, to } = getPaginationParams(page, limit);

    const { data, error, count } = await client
      .from('achievements')
      .select('*', { count: 'exact' })
      .eq('user_id', user.data.user.id)
      .order('unlocked_at', { ascending: false, nullsFirst: false })
      .range(from, to);

    if (error) {
      handleSupabaseError(error, 'Get user achievements');
    }

    const result = formatPaginatedResult(data || [], count || 0, page, limit);
    return { success: true, data: result };
  } catch (error) {
    console.error('[Gamification] Get achievements error:', error);
    return { success: false, error: { code: 'QUERY_FAILED', message: 'Failed to get achievements' } };
  }
}

/**
 * Get achievement stats
 */
export async function getAchievementStats(): Promise<ApiResponse<AchievementStats>> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be signed in' } };
    }

    const { data: achievements, error } = await client
      .from('achievements')
      .select('*')
      .eq('user_id', user.data.user.id)
      .not('unlocked_at', 'is', null);

    if (error) {
      handleSupabaseError(error, 'Get achievement stats');
    }

    const unlockedAchievements = achievements || [];

    // Calculate stats
    const byTier: Record<string, number> = {};
    let totalPoints = 0;

    unlockedAchievements.forEach((achievement) => {
      byTier[achievement.tier] = (byTier[achievement.tier] || 0) + 1;
      totalPoints += achievement.points;
    });

    const definitions = await getAchievementDefinitions();
    const totalDefinitions = definitions.data?.length || 1;
    const completionPercentage = (unlockedAchievements.length / totalDefinitions) * 100;

    // Get recent achievements
    const recentAchievements = unlockedAchievements
      .sort((a, b) => new Date(b.unlocked_at!).getTime() - new Date(a.unlocked_at!).getTime())
      .slice(0, 5);

    return {
      success: true,
      data: {
        totalUnlocked: unlockedAchievements.length,
        totalPoints,
        byTier,
        recentAchievements,
        completionPercentage,
      },
    };
  } catch (error) {
    console.error('[Gamification] Achievement stats error:', error);
    return { success: false, error: { code: 'STATS_FAILED', message: 'Failed to get stats' } };
  }
}

// ============================================================================
// Challenges
// ============================================================================

/**
 * Get challenge definitions
 */
export async function getChallengeDefinitions(): Promise<ApiResponse<ChallengeDefinition[]>> {
  try {
    const definitions: ChallengeDefinition[] = [
      {
        id: 'seven_day_mindfulness',
        name: '7-Day Mindfulness',
        description: 'Meditate for at least 10 minutes every day for a week',
        category: 'meditation',
        duration_days: 7,
        target_value: 7,
        reward_points: 100,
        difficulty: 'medium',
        icon: '🧘',
      },
      {
        id: 'mood_tracking',
        name: 'Mood Tracker',
        description: 'Log your mood every day for 14 days',
        category: 'mood',
        duration_days: 14,
        target_value: 14,
        reward_points: 150,
        difficulty: 'hard',
        icon: '📊',
      },
      {
        id: 'gratitude_journal',
        name: 'Gratitude Journal',
        description: 'Write gratitude entries for 21 days',
        category: 'journal',
        duration_days: 21,
        target_value: 21,
        reward_points: 200,
        difficulty: 'hard',
        icon: '🙏',
      },
      {
        id: 'yoga_intro',
        name: 'Yoga Intro',
        description: 'Complete 5 yoga sessions',
        category: 'yoga',
        duration_days: 14,
        target_value: 5,
        reward_points: 75,
        difficulty: 'easy',
        icon: '🧎',
      },
      {
        id: 'breathing_exercise',
        name: 'Breathe Easy',
        description: 'Complete 10 breathing exercises',
        category: 'breathing',
        duration_days: 7,
        target_value: 10,
        reward_points: 50,
        difficulty: 'easy',
        icon: '💨',
      },
      {
        id: 'wellness_warrior',
        name: 'Wellness Warrior',
        description: 'Complete any wellness activity every day for 30 days',
        category: 'wellness',
        duration_days: 30,
        target_value: 30,
        reward_points: 500,
        difficulty: 'hard',
        icon: '⚔️',
      },
    ];

    return { success: true, data: definitions };
  } catch (error) {
    console.error('[Gamification] Get challenge definitions error:', error);
    return { success: false, error: { code: 'QUERY_FAILED', message: 'Failed to get definitions' } };
  }
}

/**
 * Get user challenges
 */
export async function getUserChallenges(
  status?: Challenge['status']
): Promise<ApiResponse<Challenge[]>> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be signed in' } };
    }

    let query = client
      .from('challenges')
      .select('*')
      .eq('user_id', user.data.user.id);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      handleSupabaseError(error, 'Get user challenges');
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('[Gamification] Get challenges error:', error);
    return { success: false, error: { code: 'QUERY_FAILED', message: 'Failed to get challenges' } };
  }
}

/**
 * Start a new challenge
 */
export async function startChallenge(data: StartChallengeData): Promise<ApiResponse<Challenge>> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be signed in' } };
    }

    // Get challenge definition
    const definitions = await getChallengeDefinitions();
    const definition = definitions.data?.find((d) => d.id === data.challenge_id);

    if (!definition) {
      return { success: false, error: { code: 'NOT_FOUND', message: 'Challenge not found' } };
    }

    // Check if already active
    const { data: existing } = await client
      .from('challenges')
      .select('*')
      .eq('user_id', user.data.user.id)
      .eq('challenge_id', data.challenge_id)
      .in('status', ['active']);

    if (existing && existing.length > 0) {
      return { success: false, error: { code: 'ALREADY_ACTIVE', message: 'Challenge already active' } };
    }

    const startDate = data.start_date || new Date().toISOString();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + definition.duration_days);

    const { data: challenge, error } = await client
      .from('challenges')
      .insert({
        user_id: user.data.user.id,
        challenge_id: data.challenge_id,
        name: definition.name,
        description: definition.description,
        category: definition.category,
        duration_days: definition.duration_days,
        start_date: startDate,
        end_date: endDate.toISOString(),
        target_value: definition.target_value,
        current_value: 0,
        status: 'active',
        reward_points: definition.reward_points,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      handleSupabaseError(error, 'Start challenge');
    }

    console.log('[Gamification] Challenge started:', challenge.id);

    return { success: true, data: challenge };
  } catch (error) {
    console.error('[Gamification] Start challenge error:', error);
    return { success: false, error: { code: 'CREATE_FAILED', message: 'Failed to start challenge' } };
  }
}

/**
 * Update challenge progress
 */
export async function updateChallengeProgress(
  challengeId: string,
  increment: number
): Promise<ApiResponse<Challenge>> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be signed in' } };
    }

    // Get current challenge
    const { data: current } = await client
      .from('challenges')
      .select('*')
      .eq('id', challengeId)
      .eq('user_id', user.data.user.id)
      .single();

    if (!current) {
      return { success: false, error: { code: 'NOT_FOUND', message: 'Challenge not found' } };
    }

    if (current.status !== 'active') {
      return { success: false, error: { code: 'INVALID_STATUS', message: 'Challenge is not active' } };
    }

    const newValue = current.current_value + increment;
    const isCompleted = newValue >= current.target_value;
    const now = new Date().toISOString();

    const { data: challenge, error } = await client
      .from('challenges')
      .update({
        current_value: newValue,
        status: isCompleted ? 'completed' : current.status,
        completed_at: isCompleted ? now : undefined,
        updated_at: now,
      })
      .eq('id', challengeId)
      .select()
      .single();

    if (error) {
      handleSupabaseError(error, 'Update challenge progress');
    }

    // If completed, award points
    if (isCompleted) {
      await awardPoints({
        amount: challenge.reward_points,
        transaction_type: 'earn',
        source_type: 'challenge',
        source_id: challengeId,
        description: `Completed challenge: ${challenge.name}`,
      });
    }

    return { success: true, data: challenge };
  } catch (error) {
    console.error('[Gamification] Update challenge error:', error);
    return { success: false, error: { code: 'UPDATE_FAILED', message: 'Failed to update challenge' } };
  }
}

// ============================================================================
// Streaks
// ============================================================================

/**
 * Get user streaks
 */
export async function getUserStreaks(): Promise<ApiResponse<Streak[]>> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be signed in' } };
    }

    const { data, error } = await client
      .from('streaks')
      .select('*')
      .eq('user_id', user.data.user.id);

    if (error) {
      handleSupabaseError(error, 'Get user streaks');
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('[Gamification] Get streaks error:', error);
    return { success: false, error: { code: 'QUERY_FAILED', message: 'Failed to get streaks' } };
  }
}

/**
 * Update streak activity
 */
export async function updateStreakActivity(streakType: Streak['streak_type']): Promise<ApiResponse<Streak>> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be signed in' } };
    }

    const today = new Date().toISOString().split('T')[0];

    // Check for existing streak
    const { data: existing, error: findError } = await client
      .from('streaks')
      .select('*')
      .eq('user_id', user.data.user.id)
      .eq('streak_type', streakType)
      .single();

    if (findError && findError.code !== 'PGRST116') {
      handleSupabaseError(findError, 'Find streak');
    }

    const now = new Date().toISOString();

    if (existing) {
      const lastActivity = new Date(existing.last_activity_date);
      const activityDate = new Date(today);
      const diffDays = Math.floor((activityDate.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

      let newCount = existing.current_count;
      let milestones = { ...existing };

      if (diffDays === 0) {
        // Same day, no change
        return { success: true, data: existing };
      } else if (diffDays === 1) {
        // Consecutive day
        newCount++;
      } else {
        // Streak broken
        newCount = 1;
      }

      // Check milestones
      if (newCount >= 7 && !existing.milestone_7) milestones.milestone_7 = true;
      if (newCount >= 14 && !existing.milestone_14) milestones.milestone_14 = true;
      if (newCount >= 30 && !existing.milestone_30) milestones.milestone_30 = true;
      if (newCount >= 60 && !existing.milestone_60) milestones.milestone_60 = true;
      if (newCount >= 100 && !existing.milestone_100) milestones.milestone_100 = true;

      // Update longest streak if needed
      const newLongest = Math.max(existing.longest_count, newCount);

      // Award milestone points
      const milestonePoints = calculateMilestonePoints(existing, milestones);
      if (milestonePoints > 0) {
        await awardPoints({
          amount: milestonePoints,
          transaction_type: 'bonus',
          source_type: 'streak',
          description: `Streak milestone reached: ${streakType}`,
        });
      }

      const { data: streak, error } = await client
        .from('streaks')
        .update({
          current_count: newCount,
          longest_count: newLongest,
          last_activity_date: today,
          milestone_7: milestones.milestone_7,
          milestone_14: milestones.milestone_14,
          milestone_30: milestones.milestone_30,
          milestone_60: milestones.milestone_60,
          milestone_100: milestones.milestone_100,
          updated_at: now,
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'Update streak');
      }

      return { success: true, data: streak };
    } else {
      // Create new streak
      const { data: streak, error } = await client
        .from('streaks')
        .insert({
          user_id: user.data.user.id,
          streak_type: streakType,
          current_count: 1,
          longest_count: 1,
          last_activity_date: today,
          started_at: now,
          milestone_7: false,
          milestone_14: false,
          milestone_30: false,
          milestone_60: false,
          milestone_100: false,
          created_at: now,
          updated_at: now,
        })
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'Create streak');
      }

      return { success: true, data: streak };
    }
  } catch (error) {
    console.error('[Gamification] Update streak error:', error);
    return { success: false, error: { code: 'UPDATE_FAILED', message: 'Failed to update streak' } };
  }
}

function calculateMilestonePoints(oldStreak: Streak, newMilestones: Partial<Streak>): number {
  let points = 0;

  if (!oldStreak.milestone_7 && newMilestones.milestone_7) points += 25;
  if (!oldStreak.milestone_14 && newMilestones.milestone_14) points += 50;
  if (!oldStreak.milestone_30 && newMilestones.milestone_30) points += 100;
  if (!oldStreak.milestone_60 && newMilestones.milestone_60) points += 200;
  if (!oldStreak.milestone_100 && newMilestones.milestone_100) points += 500;

  return points;
}

// ============================================================================
// Points
// ============================================================================

/**
 * Get user points
 */
export async function getUserPoints(): Promise<ApiResponse<UserPoints>> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be signed in' } };
    }

    const { data, error } = await client
      .from('user_points')
      .select('*')
      .eq('user_id', user.data.user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      handleSupabaseError(error, 'Get user points');
    }

    // If no points record, return default
    if (!data) {
      return {
        success: true,
        data: {
          user_id: user.data.user.id,
          total_points: 0,
          level: 1,
          points_to_next_level: 100,
          lifetime_points: 0,
          rank: 0,
          rank_percentage: 100,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      };
    }

    return { success: true, data };
  } catch (error) {
    console.error('[Gamification] Get points error:', error);
    return { success: false, error: { code: 'QUERY_FAILED', message: 'Failed to get points' } };
  }
}

/**
 * Award points to user
 */
export async function awardPoints(data: AwardPointsData): Promise<ApiResponse<PointsTransaction>> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be signed in' } };
    }

    const now = new Date().toISOString();

    // Get current points
    const { data: currentPoints } = await client
      .from('user_points')
      .select('total_points, lifetime_points, level, points_to_next_level')
      .eq('user_id', user.data.user.id)
      .single();

    let newTotal = data.amount;
    let newLifetime = data.amount;
    let newLevel = 1;
    let newPointsToNext = 100;

    if (currentPoints) {
      newTotal = currentPoints.total_points + data.amount;
      newLifetime = currentPoints.lifetime_points + data.amount;

      // Calculate new level (every 100 points = 1 level)
      newLevel = Math.floor(newLifetime / 100) + 1;
      const pointsInCurrentLevel = newLifetime % 100;
      newPointsToNext = 100 - pointsInCurrentLevel;
    }

    // Create transaction
    const { data: transaction, error: txError } = await client
      .from('points_transactions')
      .insert({
        user_id: user.data.user.id,
        amount: data.amount,
        transaction_type: data.transaction_type,
        source_type: data.source_type,
        source_id: data.source_id,
        description: data.description,
        balance_after: newTotal,
        created_at: now,
      })
      .select()
      .single();

    if (txError) {
      handleSupabaseError(txError, 'Create points transaction');
    }

    // Update user points
    const { error: updateError } = await client
      .from('user_points')
      .upsert({
        user_id: user.data.user.id,
        total_points: newTotal,
        lifetime_points: newLifetime,
        level: newLevel,
        points_to_next_level: newPointsToNext,
        updated_at: now,
      }, { onConflict: 'user_id' });

    if (updateError) {
      handleSupabaseError(updateError, 'Update user points');
    }

    console.log('[Gamification] Points awarded:', data.amount, 'to user', user.data.user.id);

    return { success: true, data: transaction };
  } catch (error) {
    console.error('[Gamification] Award points error:', error);
    return { success: false, error: { code: 'AWARD_FAILED', message: 'Failed to award points' } };
  }
}

/**
 * Get points transactions
 */
export async function getPointsTransactions(
  limit: number = 20
): Promise<ApiResponse<PointsTransaction[]>> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be signed in' } };
    }

    const { data, error } = await client
      .from('points_transactions')
      .select('*')
      .eq('user_id', user.data.user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      handleSupabaseError(error, 'Get points transactions');
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('[Gamification] Get transactions error:', error);
    return { success: false, error: { code: 'QUERY_FAILED', message: 'Failed to get transactions' } };
  }
}

/**
 * Get points summary with history
 */
export async function getPointsSummary(): Promise<ApiResponse<PointsSummary>> {
  try {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();

    if (!user.data.user) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be signed in' } };
    }

    // Get current points
    const pointsResult = await getUserPoints();
    if (!pointsResult.success || !pointsResult.data) {
      return { success: false, error: { code: 'NOT_FOUND', message: 'Points not found' } };
    }

    // Get recent transactions
    const transactionsResult = await getPointsTransactions(10);
    const recentTransactions = transactionsResult.data || [];

    // Get points history (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: history, error } = await client
      .from('points_transactions')
      .select('created_at, amount')
      .eq('user_id', user.data.user.id)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      handleSupabaseError(error, 'Get points history');
    }

    // Aggregate by day
    const pointsByDay: Record<string, number> = {};
    (history || []).forEach((tx) => {
      const day = tx.created_at.split('T')[0];
      pointsByDay[day] = (pointsByDay[day] || 0) + tx.amount;
    });

    const pointsHistory = Object.entries(pointsByDay).map(([date, points]) => ({
      date,
      points,
    }));

    // Get rank
    const { data: rankData, error: rankError } = await client
      .from('user_points')
      .select('user_id')
      .order('lifetime_points', { ascending: false });

    if (rankError) {
      handleSupabaseError(rankError, 'Get rank');
    }

    const allUsers = rankData || [];
    const currentUserRank = allUsers.findIndex((u) => u.user_id === user.data.user.id) + 1;
    const totalUsers = allUsers.length;
    const rankPercentage = totalUsers > 0 ? ((totalUsers - currentUserRank + 1) / totalUsers) * 100 : 100;

    return {
      success: true,
      data: {
        currentBalance: pointsResult.data.total_points,
        level: pointsResult.data.level,
        pointsToNextLevel: pointsResult.data.points_to_next_level,
        lifetimePoints: pointsResult.data.lifetime_points,
        rank: currentUserRank,
        rankPercentage,
        recentTransactions,
        pointsHistory,
      },
    };
  } catch (error) {
    console.error('[Gamification] Get points summary error:', error);
    return { success: false, error: { code: 'SUMMARY_FAILED', message: 'Failed to get summary' } };
  }
}

// ============================================================================
// Export Types
// ============================================================================

// All types are exported from ../types/database.ts

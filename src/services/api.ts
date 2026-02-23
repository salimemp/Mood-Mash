// ============================================================================
// Unified API Service for MoodMash
// Central API layer with error handling and caching
// ============================================================================

import type {
  MoodEntry,
  WellnessSession,
  Achievement,
  Challenge,
  Streak,
  UserPoints,
  UserProfile,
  JournalEntry,
  Notification,
  PaginatedResult,
  MoodStatistics,
  WellnessStatistics,
  AchievementStats,
  ChallengeStats,
  StreakStats,
  PointsSummary,
  WeeklyWellnessGoal,
  WeeklyReport,
  MonthlyReport,
} from '../types/database';

// Import individual services
import * as authService from './authService';
import * as moodService from './moodService';
import * as wellnessService from './wellnessService';
import * as gamificationService from './gamificationService';

// ============================================================================
// API Configuration
// ============================================================================

interface APIConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  cacheEnabled: boolean;
  cacheTTL: number;
}

const defaultConfig: APIConfig = {
  baseUrl: import.meta.env['VITE_API_URL'] || '/api',
  timeout: 30000,
  retries: 3,
  cacheEnabled: true,
  cacheTTL: 60000, // 1 minute
};

let apiConfig: APIConfig = { ...defaultConfig };

export function configureAPI(config: Partial<APIConfig>): void {
  apiConfig = { ...apiConfig, ...config };
}

export function getAPIConfig(): APIConfig {
  return { ...apiConfig };
}

// ============================================================================
// Cache Management
// ============================================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  key: string;
}

const cache = new Map<string, CacheEntry<unknown>>();

export function getCached<T>(key: string): T | null {
  if (!apiConfig.cacheEnabled) return null;

  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;

  const isExpired = Date.now() - entry.timestamp > apiConfig.cacheTTL;
  if (isExpired) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

export function setCache<T>(key: string, data: T): void {
  if (!apiConfig.cacheEnabled) return;

  cache.set(key, {
    data,
    timestamp: Date.now(),
    key,
  });
}

export function invalidateCache(pattern?: string): void {
  if (!pattern) {
    cache.clear();
    return;
  }

  const regex = new RegExp(pattern);
  Array.from(cache.entries()).forEach(([key]) => {
    if (regex.test(key)) {
      cache.delete(key);
    }
  });
}

export function invalidateUserCache(): void {
  invalidateCache('user');
}

// ============================================================================
// Request Helpers
// ============================================================================

async function withRetry<T>(
  operation: () => Promise<T>,
  retries: number = apiConfig.retries
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.warn(`[API] Attempt ${attempt + 1} failed:`, lastError.message);

      // Don't retry on client errors (4xx)
      if (lastError.message.includes('4') || lastError.message.includes('UNAUTHORIZED')) {
        throw lastError;
      }

      // Wait before retry (exponential backoff)
      if (attempt < retries - 1) {
        const delay = Math.pow(2, attempt) * 100;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

// ============================================================================
// Unified API Class
// ============================================================================

class MoodMashAPI {
  // ============ Authentication ============

  async signUp(email: string, password: string, fullName?: string) {
    return withRetry(() => authService.signUp({ email, password, fullName }));
  }

  async signIn(email: string, password: string) {
    return withRetry(() => authService.signIn({ email, password }));
  }

  async signOut() {
    return withRetry(() => authService.signOut());
  }

  async sendPasswordReset(email: string) {
    return withRetry(() => authService.sendPasswordReset(email));
  }

  async updatePassword(newPassword: string, refreshToken?: string) {
    return withRetry(() => authService.updatePassword({ newPassword, refreshToken }));
  }

  async getCurrentUser() {
    return withRetry(() => authService.getUser());
  }

  async isAuthenticated() {
    return withRetry(() => authService.checkAuth());
  }

  // ============ Mood Entries ============

  async createMoodEntry(data: moodService.CreateMoodEntryData) {
    invalidateUserCache();
    return withRetry(() => moodService.createMoodEntry(data));
  }

  async getMoodEntry(id: string) {
    const cacheKey = `mood:${id}`;
    const cached = getCached<MoodEntry>(cacheKey);
    if (cached) return { success: true, data: cached };

    const result = await withRetry(() => moodService.getMoodEntry(id));
    if (result.success && result.data) {
      setCache(cacheKey, result.data);
    }
    return result;
  }

  async updateMoodEntry(id: string, data: moodService.UpdateMoodEntryData) {
    invalidateUserCache();
    return withRetry(() => moodService.updateMoodEntry(id, data));
  }

  async deleteMoodEntry(id: string) {
    invalidateUserCache();
    return withRetry(() => moodService.deleteMoodEntry(id));
  }

  async getMoodEntries(
    params?: moodService.MoodQueryParams,
    pagination?: { page?: number; limit?: number }
  ) {
    const cacheKey = `moods:${JSON.stringify(params)}:${JSON.stringify(pagination)}`;
    const cached = getCached<PaginatedResult<MoodEntry>>(cacheKey);
    if (cached) return { success: true, data: cached };

    const result = await withRetry(() => moodService.getMoodEntries(params, pagination));
    if (result.success && result.data) {
      setCache(cacheKey, result.data);
    }
    return result;
  }

  async getTodayMoods() {
    return withRetry(() => moodService.getTodayMoods());
  }

  async getRecentMoods(days?: number) {
    return withRetry(() => moodService.getRecentMoods(days));
  }

  async getMoodStatistics(startDate?: string, endDate?: string) {
    return withRetry(() => moodService.getMoodStatistics(startDate, endDate));
  }

  async getMoodTrendData(days?: number) {
    return withRetry(() => moodService.getMoodTrendData(days));
  }

  // ============ Wellness Sessions ============

  async createWellnessSession(data: wellnessService.CreateWellnessSessionData) {
    invalidateUserCache();
    return withRetry(() => wellnessService.createWellnessSession(data));
  }

  async getWellnessSession(id: string) {
    return withRetry(() => wellnessService.getWellnessSession(id));
  }

  async updateWellnessSession(id: string, data: wellnessService.UpdateWellnessSessionData) {
    return withRetry(() => wellnessService.updateWellnessSession(id, data));
  }

  async deleteWellnessSession(id: string) {
    return withRetry(() => wellnessService.deleteWellnessSession(id));
  }

  async getWellnessSessions(
    params?: wellnessService.WellnessQueryParams,
    pagination?: { page?: number; limit?: number }
  ) {
    return withRetry(() => wellnessService.getWellnessSessions(params, pagination));
  }

  async getTodaySessions() {
    return withRetry(() => wellnessService.getTodaySessions());
  }

  async getSessionsByType(type: WellnessSession['type']) {
    return withRetry(() => wellnessService.getSessionsByType(type));
  }

  async getWellnessStatistics(startDate?: string, endDate?: string) {
    return withRetry(() => wellnessService.getWellnessStatistics(startDate, endDate));
  }

  async getWeeklyWellnessGoal() {
    return withRetry(() => wellnessService.getWeeklyWellnessGoal());
  }

  // ============ User Profile ============

  async getUserProfile() {
    const cacheKey = 'user:profile';
    const cached = getCached<UserProfile>(cacheKey);
    if (cached) return { success: true, data: cached };

    const result = await withRetry(() => wellnessService.getUserProfile());
    if (result.success && result.data) {
      setCache(cacheKey, result.data);
    }
    return result;
  }

  async updateUserProfile(data: Partial<UserProfile>) {
    invalidateUserCache();
    return withRetry(() => wellnessService.updateUserProfile(data));
  }

  // ============ Achievements ============

  async getAchievementDefinitions() {
    return withRetry(() => gamificationService.getAchievementDefinitions());
  }

  async getUserAchievements(pagination?: { page?: number; limit?: number }) {
    return withRetry(() => gamificationService.getUserAchievements(pagination));
  }

  async getAchievementStats() {
    return withRetry(() => gamificationService.getAchievementStats());
  }

  // ============ Challenges ============

  async getChallengeDefinitions() {
    return withRetry(() => gamificationService.getChallengeDefinitions());
  }

  async getUserChallenges(status?: Challenge['status']) {
    return withRetry(() => gamificationService.getUserChallenges(status));
  }

  async startChallenge(challengeId: string) {
    invalidateUserCache();
    return withRetry(() => gamificationService.startChallenge({ challenge_id: challengeId }));
  }

  async updateChallengeProgress(challengeId: string, increment: number = 1) {
    return withRetry(() => gamificationService.updateChallengeProgress(challengeId, increment));
  }

  // ============ Streaks ============

  async getUserStreaks() {
    return withRetry(() => gamificationService.getUserStreaks());
  }

  async updateStreakActivity(streakType: Streak['streak_type']) {
    return withRetry(() => gamificationService.updateStreakActivity(streakType));
  }

  // ============ Points ============

  async getUserPoints() {
    return withRetry(() => gamificationService.getUserPoints());
  }

  async awardPoints(data: gamificationService.AwardPointsData) {
    return withRetry(() => gamificationService.awardPoints(data));
  }

  async getPointsTransactions(limit?: number) {
    return withRetry(() => gamificationService.getPointsTransactions(limit));
  }

  async getPointsSummary() {
    return withRetry(() => gamificationService.getPointsSummary());
  }

  // ============ Dashboard Data ============

  async getDashboardData() {
    const [
      todayMoods,
      todaySessions,
      weeklyGoal,
      streaks,
      recentAchievements,
      stats,
    ] = await Promise.all([
      this.getTodayMoods(),
      this.getTodaySessions(),
      this.getWeeklyWellnessGoal(),
      this.getUserStreaks(),
      this.getUserAchievements({ limit: 3 }),
      this.getMoodStatistics(),
    ]);

    return {
      success: true,
      data: {
        todayMoods: todayMoods.data || [],
        todaySessions: todaySessions.data || [],
        weeklyGoal: weeklyGoal.data,
        streaks: streaks.data || [],
        recentAchievements: recentAchievements.data?.data || [],
        moodStats: stats.data,
      },
    };
  }

  // ============ Reports ============

  async getWeeklyReport() {
    return withRetry(async () => {
      // This would typically fetch from a backend endpoint
      // For now, we'll generate it from available data
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - 7);

      const [moods, wellness, achievements, points] = await Promise.all([
        this.getMoodEntries({ startDate: weekStart.toISOString().split('T')[0] }),
        this.getWellnessStatistics(weekStart.toISOString()),
        this.getAchievementStats(),
        this.getPointsSummary(),
      ]);

      // Generate report (simplified)
      return {
        success: true,
        data: {
          weekStart: weekStart.toISOString(),
          weekEnd: now.toISOString(),
          totalMoodEntries: moods.data?.total || 0,
          moodTrend: 'stable' as const,
          moodTrendPercentage: 0,
          dominantMoods: [],
          topInsights: [],
          achievementsUnlocked: [],
          weeklyGoalProgress: 0,
          suggestedActivities: [],
        },
      };
    });
  }

  async getMonthlyReport(month: number, year: number) {
    return withRetry(async () => {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      const [moods, wellness, achievements, points] = await Promise.all([
        this.getMoodEntries({
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
        }),
        this.getWellnessStatistics(startDate.toISOString()),
        this.getAchievementStats(),
        this.getPointsSummary(),
      ]);

      return {
        success: true,
        data: {
          month: startDate.toLocaleString('default', { month: 'long' }),
          year,
          totalMoodEntries: moods.data?.total || 0,
          moodTrend: 'stable' as const,
          monthlyGrowth: 0,
          moodDistribution: {},
          topPatterns: [],
          accomplishments: [],
          yearlyGoalProgress: 0,
          yearlyMilestones: [],
        },
      };
    });
  }

  // ============ Health Check ============

  async healthCheck(): Promise<{ status: 'healthy' | 'degraded' | 'unhealthy'; latency: number }> {
    const start = Date.now();
    try {
      const userResult = await this.getCurrentUser();
      const latency = Date.now() - start;

      // userResult is an ApiResponse, so check the success property
      const response = userResult as { success?: boolean };
      return {
        status: (response.success ?? false) ? 'healthy' : 'degraded',
        latency,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        latency: Date.now() - start,
      };
    }
  }
}

// Create singleton instance
export const api = new MoodMashAPI();

// Export individual functions for convenience
export const {
  // Auth
  signUp,
  signIn,
  signOut,
  sendPasswordReset,
  updatePassword,
  getCurrentUser,
  isAuthenticated,

  // Mood
  createMoodEntry,
  getMoodEntry,
  updateMoodEntry,
  deleteMoodEntry,
  getMoodEntries,
  getTodayMoods,
  getRecentMoods,
  getMoodStatistics,
  getMoodTrendData,

  // Wellness
  createWellnessSession,
  getWellnessSession,
  updateWellnessSession,
  deleteWellnessSession,
  getWellnessSessions,
  getTodaySessions,
  getSessionsByType,
  getWellnessStatistics,
  getWeeklyWellnessGoal,

  // Profile
  getUserProfile,
  updateUserProfile,

  // Achievements
  getAchievementDefinitions,
  getUserAchievements,
  getAchievementStats,

  // Challenges
  getChallengeDefinitions,
  getUserChallenges,
  startChallenge,
  updateChallengeProgress,

  // Streaks
  getUserStreaks,
  updateStreakActivity,

  // Points
  getUserPoints,
  awardPoints,
  getPointsTransactions,
  getPointsSummary,

  // Dashboard
  getDashboardData,

  // Reports
  getWeeklyReport,
  getMonthlyReport,

  // Health
  healthCheck,
} = api;

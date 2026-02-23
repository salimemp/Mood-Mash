import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { MoodEntry, MoodEmotion, MOOD_EMOTIONS } from './MoodContext';

// ============================================================================
// Types
// ============================================================================

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  level: number;
  experience: number;
  points: number;
  streak: number;
  longestStreak: number;
  totalEntries: number;
  totalMinutes: number;
  joinedAt: Date;
  lastActiveAt: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirement: number;
  xpReward: number;
  unlockedAt?: Date;
  progress: number;
}

export type AchievementCategory =
  | 'mood'
  | 'streak'
  | 'meditation'
  | 'yoga'
  | 'music'
  | 'social'
  | 'exploration'
  | 'mastery';

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  target: number;
  current: number;
  xpReward: number;
  completed: boolean;
  expiresAt: Date;
}

export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  target: number;
  current: number;
  xpReward: number;
  completed: boolean;
  progress: number;
  expiresAt: Date;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar: string;
  score: number;
  level: number;
  streak: number;
  isFriend: boolean;
  isCurrentUser: boolean;
}

export interface WellnessSession {
  id: string;
  type: 'meditation' | 'yoga' | 'music';
  category: string;
  name: string;
  duration: number;
  moodBefore?: MoodEmotion;
  moodAfter?: MoodEmotion;
  completedAt: Date;
  xpEarned: number;
}

export interface GamificationContextType {
  // Profile
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  addExperience: (amount: number) => void;
  addPoints: (amount: number) => void;

  // Streak
  currentStreak: number;
  longestStreak: number;
  updateStreak: () => void;

  // Achievements
  achievements: Achievement[];
  unlockAchievement: (achievementId: string) => void;
  getAchievementProgress: (achievementId: string) => number;
  checkAndUnlockAchievements: (entry?: MoodEntry) => void;

  // Challenges
  dailyChallenges: DailyChallenge[];
  weeklyChallenges: WeeklyChallenge[];
  completeChallenge: (challengeId: string, isDaily: boolean) => void;
  refreshChallenges: () => void;

  // Leaderboard
  globalLeaderboard: LeaderboardEntry[];
  friendLeaderboard: LeaderboardEntry[];
  getUserRank: (score: number) => number;

  // Sessions
  wellnessSessions: WellnessSession[];
  logSession: (session: Omit<WellnessSession, 'id' | 'completedAt' | 'xpEarned'>) => void;

  // Level
  getLevelFromXP: (xp: number) => { level: number; currentXP: number; requiredXP: number; progress: number };
  getXPForLevel: (level: number) => number;
}

// ============================================================================
// Achievement Definitions (40+ Achievements)
// ============================================================================

const ACHIEVEMENTS: Achievement[] = [
  // Mood Achievements
  { id: 'mood_first', name: 'First Step', description: 'Log your first mood entry', icon: '🌟', category: 'mood', rarity: 'common', requirement: 1, xpReward: 50, progress: 0 },
  { id: 'mood_10', name: 'Mood Explorer', description: 'Log 10 mood entries', icon: '📊', category: 'mood', rarity: 'common', requirement: 10, xpReward: 100, progress: 0 },
  { id: 'mood_50', name: 'Mood Tracker', description: 'Log 50 mood entries', icon: '📈', category: 'mood', rarity: 'rare', requirement: 50, xpReward: 250, progress: 0 },
  { id: 'mood_100', name: 'Mood Master', description: 'Log 100 mood entries', icon: '👑', category: 'mood', rarity: 'epic', requirement: 100, xpReward: 500, progress: 0 },
  { id: 'mood_365', name: 'Year of Feelings', description: 'Log 365 mood entries', icon: '🏆', category: 'mood', rarity: 'legendary', requirement: 365, xpReward: 2000, progress: 0 },
  { id: 'mood_all', name: 'Full Spectrum', description: 'Experience all 15 mood types', icon: '🎨', category: 'mood', rarity: 'rare', requirement: 15, xpReward: 300, progress: 0 },
  { id: 'mood_consistent', name: 'Consistent Logger', description: 'Log moods for 7 consecutive days', icon: '📝', category: 'mood', rarity: 'rare', requirement: 7, xpReward: 200, progress: 0 },

  // Streak Achievements
  { id: 'streak_3', name: 'Getting Started', description: 'Maintain a 3-day streak', icon: '🔥', category: 'streak', rarity: 'common', requirement: 3, xpReward: 75, progress: 0 },
  { id: 'streak_7', name: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '💪', category: 'streak', rarity: 'common', requirement: 7, xpReward: 150, progress: 0 },
  { id: 'streak_14', name: 'Two Weeks Strong', description: 'Maintain a 14-day streak', icon: '⚡', category: 'streak', rarity: 'rare', requirement: 14, xpReward: 300, progress: 0 },
  { id: 'streak_30', name: 'Monthly Master', description: 'Maintain a 30-day streak', icon: '🏅', category: 'streak', rarity: 'epic', requirement: 30, xpReward: 750, progress: 0 },
  { id: 'streak_100', name: 'Century Streak', description: 'Maintain a 100-day streak', icon: '💎', category: 'streak', rarity: 'legendary', requirement: 100, xpReward: 2500, progress: 0 },
  { id: 'streak_365', name: 'Year of Dedication', description: 'Maintain a 365-day streak', icon: '👑', category: 'streak', rarity: 'legendary', requirement: 365, xpReward: 10000, progress: 0 },

  // Meditation Achievements
  { id: 'meditation_first', name: 'Mindful Beginnings', description: 'Complete your first meditation', icon: '🧘', category: 'meditation', rarity: 'common', requirement: 1, xpReward: 50, progress: 0 },
  { id: 'meditation_10', name: 'Meditation Novice', description: 'Complete 10 meditation sessions', icon: '🌸', category: 'meditation', rarity: 'common', requirement: 10, xpReward: 150, progress: 0 },
  { id: 'meditation_50', name: 'Meditation Practitioner', description: 'Complete 50 meditation sessions', icon: '🎋', category: 'meditation', rarity: 'rare', requirement: 50, xpReward: 400, progress: 0 },
  { id: 'meditation_100', name: 'Meditation Master', description: 'Complete 100 meditation sessions', icon: '🏵️', category: 'meditation', rarity: 'epic', requirement: 100, xpReward: 800, progress: 0 },
  { id: 'meditation_500', name: 'Zen Master', description: 'Complete 500 meditation sessions', icon: '☯️', category: 'meditation', rarity: 'legendary', requirement: 500, xpReward: 3000, progress: 0 },
  { id: 'meditation_all_categories', name: 'Diverse Practice', description: 'Try all 10 meditation categories', icon: '🌈', category: 'meditation', rarity: 'rare', requirement: 10, xpReward: 350, progress: 0 },
  { id: 'meditation_1000_minutes', name: 'Thousand Breaths', description: 'Meditate for 1000 total minutes', icon: '⏱️', category: 'meditation', rarity: 'epic', requirement: 1000, xpReward: 1200, progress: 0 },

  // Yoga Achievements
  { id: 'yoga_first', name: 'First Flow', description: 'Complete your first yoga session', icon: '🧘‍♀️', category: 'yoga', rarity: 'common', requirement: 1, xpReward: 50, progress: 0 },
  { id: 'yoga_10', name: 'Yoga Novice', description: 'Complete 10 yoga sessions', icon: '🌺', category: 'yoga', rarity: 'common', requirement: 10, xpReward: 150, progress: 0 },
  { id: 'yoga_50', name: 'Yoga Practitioner', description: 'Complete 50 yoga sessions', icon: '🌿', category: 'yoga', rarity: 'rare', requirement: 50, xpReward: 400, progress: 0 },
  { id: 'yoga_100', name: 'Yoga Master', description: 'Complete 100 yoga sessions', icon: '🦋', category: 'yoga', rarity: 'epic', requirement: 100, xpReward: 800, progress: 0 },
  { id: 'yoga_500', name: 'Yoga Legend', description: 'Complete 500 yoga sessions', icon: '🌟', category: 'yoga', rarity: 'legendary', requirement: 500, xpReward: 3000, progress: 0 },
  { id: 'yoga_all_styles', name: 'Versatile Yogi', description: 'Try all yoga styles', icon: '🎭', category: 'yoga', rarity: 'rare', requirement: 8, xpReward: 350, progress: 0 },
  { id: 'yoga_3000_minutes', name: 'Flexible Journey', description: 'Practice yoga for 3000 total minutes', icon: '⏱️', category: 'yoga', rarity: 'epic', requirement: 3000, xpReward: 1500, progress: 0 },

  // Music Therapy Achievements
  { id: 'music_first', name: 'First Playlist', description: 'Listen to your first music therapy session', icon: '🎵', category: 'music', rarity: 'common', requirement: 1, xpReward: 25, progress: 0 },
  { id: 'music_10', name: 'Music Enthusiast', description: 'Complete 10 music therapy sessions', icon: '🎶', category: 'music', rarity: 'common', requirement: 10, xpReward: 75, progress: 0 },
  { id: 'music_50', name: 'Music Lover', description: 'Complete 50 music therapy sessions', icon: '🎼', category: 'music', rarity: 'rare', requirement: 50, xpReward: 250, progress: 0 },
  { id: 'music_100', name: 'Music Connoisseur', description: 'Complete 100 music therapy sessions', icon: '🎹', category: 'music', rarity: 'epic', requirement: 100, xpReward: 500, progress: 0 },
  { id: 'music_all_moods', name: 'Mood Harmonizer', description: 'Use music for all 4 mood categories', icon: '🎭', category: 'music', rarity: 'rare', requirement: 4, xpReward: 300, progress: 0 },
  { id: 'music_5000_minutes', name: 'Sonic Journey', description: 'Listen for 5000 total minutes', icon: '⏱️', category: 'music', rarity: 'epic', requirement: 5000, xpReward: 1000, progress: 0 },

  // Social Achievements
  { id: 'social_share', name: 'Social Butterfly', description: 'Share your first mood with friends', icon: '🦋', category: 'social', rarity: 'common', requirement: 1, xpReward: 50, progress: 0 },
  { id: 'social_leaderboard', name: 'Competitive Spirit', description: 'Appear on the leaderboard', icon: '🏆', category: 'social', rarity: 'common', requirement: 1, xpReward: 100, progress: 0 },
  { id: 'social_top_10', name: 'Top Performer', description: 'Reach top 10 on leaderboard', icon: '🥇', category: 'social', rarity: 'rare', requirement: 10, xpReward: 500, progress: 0 },
  { id: 'social_top_1', name: 'Champion', description: 'Reach #1 on leaderboard', icon: '👑', category: 'social', rarity: 'legendary', requirement: 1, xpReward: 2000, progress: 0 },

  // Exploration Achievements
  { id: 'explore_all_features', name: 'Feature Explorer', description: 'Try all main features', icon: '🗺️', category: 'exploration', rarity: 'common', requirement: 5, xpReward: 200, progress: 0 },
  { id: 'explore_voice', name: 'Voice User', description: 'Use voice recording 5 times', icon: '🎤', category: 'exploration', rarity: 'common', requirement: 5, xpReward: 100, progress: 0 },
  { id: 'explore_ai', name: 'AI Enthusiast', description: 'Use AI insights 10 times', icon: '🤖', category: 'exploration', rarity: 'common', requirement: 10, xpReward: 150, progress: 0 },
  { id: 'explore_export', name: 'Data Keeper', description: 'Export your data 3 times', icon: '💾', category: 'exploration', rarity: 'common', requirement: 3, xpReward: 75, progress: 0 },

  // Mastery Achievements
  { id: 'mastery_level_10', name: 'Rising Star', description: 'Reach level 10', icon: '⭐', category: 'mastery', rarity: 'rare', requirement: 10, xpReward: 500, progress: 0 },
  { id: 'mastery_level_25', name: 'Shining Star', description: 'Reach level 25', icon: '🌟', category: 'mastery', rarity: 'epic', requirement: 25, xpReward: 1500, progress: 0 },
  { id: 'mastery_level_50', name: 'Super Star', description: 'Reach level 50', icon: '💫', category: 'mastery', rarity: 'epic', requirement: 50, xpReward: 3000, progress: 0 },
  { id: 'mastery_level_100', name: 'Cosmic Star', description: 'Reach level 100', icon: '✨', category: 'mastery', rarity: 'legendary', requirement: 100, xpReward: 10000, progress: 0 },
  { id: 'mastery_points_10000', name: 'Point Collector', description: 'Earn 10,000 points', icon: '🎯', category: 'mastery', rarity: 'rare', requirement: 10000, xpReward: 800, progress: 0 },
  { id: 'mastery_points_100000', name: 'Point Master', description: 'Earn 100,000 points', icon: '🎖️', category: 'mastery', rarity: 'legendary', requirement: 100000, xpReward: 5000, progress: 0 },
];

// ============================================================================
// Daily Challenge Templates
// ============================================================================

const DAILY_CHALLENGE_TEMPLATES = [
  { title: 'Morning Mindfulness', description: 'Log your mood before 9 AM', icon: '🌅', category: 'mood', target: 1, xpReward: 50 },
  { title: 'Gratitude Practice', description: 'Log 3 things you are grateful for', icon: '🙏', category: 'gratitude', target: 3, xpReward: 75 },
  { title: 'Evening Reflection', description: 'Log your mood after 8 PM', icon: '🌙', category: 'mood', target: 1, xpReward: 50 },
  { title: 'Consistent Logging', description: 'Log your mood 3 times today', icon: '📊', category: 'mood', target: 3, xpReward: 100 },
  { title: 'Zen Session', description: 'Complete one meditation session', icon: '🧘', category: 'meditation', target: 1, xpReward: 75 },
  { title: 'Yoga Flow', description: 'Complete one yoga session', icon: '🧘‍♀️', category: 'yoga', target: 1, xpReward: 75 },
  { title: 'Musical Mood', description: 'Listen to one music therapy session', icon: '🎵', category: 'music', target: 1, xpReward: 25 },
  { title: 'Positive Vibes', description: 'Log a positive mood (happy, calm, grateful)', icon: '😊', category: 'mood', target: 1, xpReward: 40 },
  { title: 'Supportive Check-in', description: 'Log mood and add a note', icon: '📝', category: 'mood', target: 1, xpReward: 35 },
  { title: 'Mindful Movement', description: 'Complete any wellness activity', icon: '🌟', category: 'wellness', target: 1, xpReward: 60 },
];

const WEEKLY_CHALLENGE_TEMPLATES = [
  { title: 'Week of Mindfulness', description: 'Log moods for 5 days this week', icon: '📅', category: 'mood', target: 5, xpReward: 200 },
  { title: 'Meditation Week', description: 'Complete 7 meditation sessions', icon: '🧘', category: 'meditation', target: 7, xpReward: 300 },
  { title: 'Yoga Journey', description: 'Complete 5 yoga sessions', icon: '🧘‍♀️', category: 'yoga', target: 5, xpReward: 250 },
  { title: 'Musical Week', description: 'Listen to 10 music therapy sessions', icon: '🎶', category: 'music', target: 10, xpReward: 150 },
  { title: 'Streak Defender', description: 'Maintain a 7-day streak', icon: '🔥', category: 'streak', target: 7, xpReward: 350 },
  { title: 'Mood Explorer', description: 'Experience 5 different moods', icon: '🎨', category: 'mood', target: 5, xpReward: 150 },
  { title: 'Wellness Warrior', description: 'Complete 14 wellness activities', icon: '⚔️', category: 'wellness', target: 14, xpReward: 400 },
  { title: 'Grateful Week', description: 'Log gratitude for 4 days', icon: '🙏', category: 'gratitude', target: 4, xpReward: 150 },
];

// ============================================================================
// Leaderboard Mock Data
// ============================================================================

const MOCK_LEADERBOARD_USERS = [
  { id: 'user_1', name: 'Sarah M.', avatar: '👩', score: 15420, level: 45, streak: 89 },
  { id: 'user_2', name: 'Michael K.', avatar: '👨', score: 14850, level: 42, streak: 67 },
  { id: 'user_3', name: 'Emma L.', avatar: '👧', score: 13200, level: 38, streak: 45 },
  { id: 'user_4', name: 'James W.', avatar: '🧔', score: 12100, level: 35, streak: 34 },
  { id: 'user_5', name: 'Olivia B.', avatar: '👩‍🦰', score: 11500, level: 33, streak: 56 },
  { id: 'user_6', name: 'William D.', avatar: '👱', score: 10800, level: 31, streak: 28 },
  { id: 'user_7', name: 'Ava T.', avatar: '👩‍🦱', score: 10200, level: 29, streak: 41 },
  { id: 'user_8', name: 'Benjamin H.', avatar: '👴', score: 9800, level: 28, streak: 23 },
  { id: 'user_9', name: 'Sophia R.', avatar: '👩‍🦳', score: 9200, level: 26, streak: 38 },
  { id: 'user_10', name: 'Lucas N.', avatar: '🧒', score: 8700, level: 25, streak: 19 },
];

const MOCK_FRIENDS = [
  { id: 'friend_1', name: 'Alex P.', avatar: '🧑', score: 8900, level: 24, streak: 12 },
  { id: 'friend_2', name: 'Jordan C.', avatar: '👤', score: 7600, level: 22, streak: 8 },
  { id: 'friend_3', name: 'Taylor S.', avatar: '🧑‍🦰', score: 6500, level: 19, streak: 15 },
  { id: 'friend_4', name: 'Casey M.', avatar: '👩‍🦬', score: 5800, level: 17, streak: 5 },
];

// ============================================================================
// Context
// ============================================================================

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

// ============================================================================
// Provider
// ============================================================================

export function GamificationProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>({
    id: 'current_user',
    name: 'You',
    avatar: '😊',
    level: 1,
    experience: 0,
    points: 0,
    streak: 0,
    longestStreak: 0,
    totalEntries: 0,
    totalMinutes: 0,
    joinedAt: new Date(),
    lastActiveAt: new Date(),
  });

  const [achievements, setAchievements] = useState<Achievement[]>(
    ACHIEVEMENTS.map(a => ({ ...a, unlockedAt: undefined, progress: 0 }))
  );

  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>([]);
  const [weeklyChallenges, setWeeklyChallenges] = useState<WeeklyChallenge[]>([]);
  const [wellnessSessions, setWellnessSessions] = useState<WellnessSession[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('moodmash_gamification');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProfile(parsed.profile || profile);
        setAchievements(parsed.achievements || achievements);
        setDailyChallenges(parsed.dailyChallenges || []);
        setWeeklyChallenges(parsed.weeklyChallenges || []);
        setWellnessSessions(parsed.wellnessSessions || []);
      } catch {
        console.warn('Failed to load gamification data from localStorage');
      }
    } else {
      // Initialize challenges
      initializeChallenges();
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('moodmash_gamification', JSON.stringify({
      profile,
      achievements,
      dailyChallenges,
      weeklyChallenges,
      wellnessSessions,
    }));
  }, [profile, achievements, dailyChallenges, weeklyChallenges, wellnessSessions]);

  // Check and update streak daily
  useEffect(() => {
    const checkStreak = () => {
      const lastActive = new Date(profile.lastActiveAt);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      lastActive.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays > 1) {
        // Streak broken
        setProfile(prev => ({ ...prev, streak: 0 }));
      }
    };

    checkStreak();
  }, [profile.lastActiveAt]);

  // Initialize challenges
  const initializeChallenges = useCallback(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    // Daily challenges
    const daily: DailyChallenge[] = [];
    for (let i = 0; i < 3; i++) {
      const template = DAILY_CHALLENGE_TEMPLATES[Math.floor(Math.random() * DAILY_CHALLENGE_TEMPLATES.length)];
      const expiresAt = new Date(today);
      daily.push({
        id: `daily_${Date.now()}_${i}`,
        ...template,
        current: 0,
        completed: false,
        expiresAt,
      });
    }
    setDailyChallenges(daily);

    // Weekly challenges
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + (7 - weekEnd.getDay()));
    weekEnd.setHours(23, 59, 59, 999);

    const weekly: WeeklyChallenge[] = [];
    for (let i = 0; i < 2; i++) {
      const template = WEEKLY_CHALLENGE_TEMPLATES[Math.floor(Math.random() * WEEKLY_CHALLENGE_TEMPLATES.length)];
      weekly.push({
        id: `weekly_${Date.now()}_${i}`,
        ...template,
        current: 0,
        completed: false,
        progress: 0,
        expiresAt: weekEnd,
      });
    }
    setWeeklyChallenges(weekly);
  }, []);

  // Profile functions
  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates, lastActiveAt: new Date() }));
  }, []);

  const addExperience = useCallback((amount: number) => {
    setProfile(prev => {
      const newXP = prev.experience + amount;
      const { level: newLevel, currentXP } = getLevelFromXP(newXP);

      return {
        ...prev,
        experience: currentXP,
        level: newLevel,
        points: prev.points + amount,
        lastActiveAt: new Date(),
      };
    });
  }, []);

  const addPoints = useCallback((amount: number) => {
    setProfile(prev => ({
      ...prev,
      points: prev.points + amount,
      lastActiveAt: new Date(),
    }));
  }, []);

  // Streak functions
  const updateStreak = useCallback(() => {
    setProfile(prev => {
      const lastActive = new Date(prev.lastActiveAt);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      lastActive.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        // Same day, no change
        return prev;
      } else if (diffDays === 1) {
        // Consecutive day, increment streak
        const newStreak = prev.streak + 1;
        return {
          ...prev,
          streak: newStreak,
          longestStreak: Math.max(prev.longestStreak, newStreak),
          lastActiveAt: new Date(),
        };
      } else {
        // Streak broken
        return {
          ...prev,
          streak: 1,
          lastActiveAt: new Date(),
        };
      }
    });
  }, []);

  // Achievement functions
  const unlockAchievement = useCallback((achievementId: string) => {
    setAchievements(prev => prev.map(ach => {
      if (ach.id === achievementId && !ach.unlockedAt) {
        addExperience(ach.xpReward);
        return { ...ach, unlockedAt: new Date() };
      }
      return ach;
    }));
  }, [addExperience]);

  const getAchievementProgress = useCallback((achievementId: string) => {
    const achievement = achievements.find(a => a.id === achievementId);
    return achievement?.progress || 0;
  }, [achievements]);

  const checkAndUnlockAchievements = useCallback((entry?: MoodEntry) => {
    // Update achievement progress based on current state
    setAchievements(prev => {
      const updated = prev.map(ach => {
        switch (ach.id) {
          case 'mood_first':
            return { ...ach, progress: Math.min(ach.progress + (entry ? 1 : 0), ach.requirement) };
          case 'mood_10':
          case 'mood_50':
          case 'mood_100':
          case 'mood_365':
            return { ...ach, progress: profile.totalEntries };
          case 'streak_3':
          case 'streak_7':
          case 'streak_14':
          case 'streak_30':
          case 'streak_100':
          case 'streak_365':
            return { ...ach, progress: profile.streak };
          case 'meditation_first':
          case 'meditation_10':
          case 'meditation_50':
          case 'meditation_100':
          case 'meditation_500':
            const medSessions = wellnessSessions.filter(s => s.type === 'meditation').length;
            return { ...ach, progress: medSessions };
          case 'yoga_first':
          case 'yoga_10':
          case 'yoga_50':
          case 'yoga_100':
          case 'yoga_500':
            const yogaSessions = wellnessSessions.filter(s => s.type === 'yoga').length;
            return { ...ach, progress: yogaSessions };
          case 'music_first':
          case 'music_10':
          case 'music_50':
          case 'music_100':
            const musicSessions = wellnessSessions.filter(s => s.type === 'music').length;
            return { ...ach, progress: musicSessions };
          default:
            return ach;
        }
      });

      // Check for unlocks
      updated.forEach(ach => {
        if (ach.progress >= ach.requirement && !ach.unlockedAt) {
          unlockAchievement(ach.id);
        }
      });

      return updated;
    });
  }, [profile, wellnessSessions, unlockAchievement]);

  // Challenge functions
  const completeChallenge = useCallback((challengeId: string, isDaily: boolean) => {
    if (isDaily) {
      setDailyChallenges(prev => prev.map(ch => {
        if (ch.id === challengeId && !ch.completed) {
          const newProgress = Math.min(ch.current + 1, ch.target);
          const completed = newProgress >= ch.target;
          if (completed) {
            addExperience(ch.xpReward);
          }
          return { ...ch, current: newProgress, completed };
        }
        return ch;
      }));
    } else {
      setWeeklyChallenges(prev => prev.map(ch => {
        if (ch.id === challengeId && !ch.completed) {
          const newProgress = Math.min(ch.current + 1, ch.target);
          const progressPercent = (newProgress / ch.target) * 100;
          const completed = newProgress >= ch.target;
          if (completed) {
            addExperience(ch.xpReward);
          }
          return { ...ch, current: newProgress, progress: progressPercent, completed };
        }
        return ch;
      }));
    }
  }, [addExperience]);

  const refreshChallenges = useCallback(() => {
    initializeChallenges();
  }, [initializeChallenges]);

  // Leaderboard functions
  const globalLeaderboard: LeaderboardEntry[] = MOCK_LEADERBOARD_USERS.map((user, index) => ({
    ...user,
    userId: user.id,
    rank: index + 1,
    isFriend: false,
    isCurrentUser: user.id === profile.id,
  }));

  const friendLeaderboard: LeaderboardEntry[] = MOCK_FRIENDS.map((user, index) => ({
    ...user,
    userId: user.id,
    rank: index + 1,
    isFriend: true,
    isCurrentUser: user.id === profile.id,
  }));

  const getUserRank = useCallback((score: number) => {
    const allUsers = [...MOCK_LEADERBOARD_USERS, ...MOCK_FRIENDS, { id: profile.id, score }];
    const sorted = allUsers.sort((a, b) => b.score - a.score);
    return sorted.findIndex(u => u.id === profile.id) + 1;
  }, [profile.id]);

  // Session functions
  const logSession = useCallback((session: Omit<WellnessSession, 'id' | 'completedAt' | 'xpEarned'>) => {
    const xpEarned = Math.round(session.duration * 2); // 2 XP per minute

    const newSession: WellnessSession = {
      ...session,
      id: `session_${Date.now()}`,
      completedAt: new Date(),
      xpEarned,
    };

    setWellnessSessions(prev => [newSession, ...prev]);
    addExperience(xpEarned);
    addPoints(xpEarned);

    // Update total minutes
    setProfile(prev => ({
      ...prev,
      totalMinutes: prev.totalMinutes + session.duration,
    }));
  }, [addExperience, addPoints]);

  // Level functions
  const getXPForLevel = useCallback((level: number) => {
    // XP formula: 100 * level^1.5
    return Math.floor(100 * Math.pow(level, 1.5));
  }, []);

  const getLevelFromXP = useCallback((xp: number) => {
    let level = 1;
    let requiredXP = getXPForLevel(level);
    let currentXP = xp;

    while (currentXP >= requiredXP) {
      currentXP -= requiredXP;
      level++;
      requiredXP = getXPForLevel(level);
    }

    const progress = (currentXP / requiredXP) * 100;

    return { level, currentXP, requiredXP, progress };
  }, [getXPForLevel]);

  const value: GamificationContextType = {
    profile,
    updateProfile,
    addExperience,
    addPoints,
    currentStreak: profile.streak,
    longestStreak: profile.longestStreak,
    updateStreak,
    achievements,
    unlockAchievement,
    getAchievementProgress,
    checkAndUnlockAchievements,
    dailyChallenges,
    weeklyChallenges,
    completeChallenge,
    refreshChallenges,
    globalLeaderboard,
    friendLeaderboard,
    getUserRank,
    wellnessSessions,
    logSession,
    getLevelFromXP,
    getXPForLevel,
  };

  return <GamificationContext.Provider value={value}>{children}</GamificationContext.Provider>;
}

// ============================================================================
// Hook
// ============================================================================

export function useGamification() {
  const context = useContext(GamificationContext);
  if (context === undefined) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
}

export default GamificationContext;

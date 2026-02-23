import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

// ============================================================================
// Types
// ============================================================================

export type MoodEmotion =
  | 'happy'
  | 'sad'
  | 'angry'
  | 'anxious'
  | 'calm'
  | 'excited'
  | 'tired'
  | 'grateful'
  | 'stressed'
  | 'peaceful'
  | 'frustrated'
  | 'hopeful'
  | 'lonely'
  | 'confident'
  | 'overwhelmed';

export type MoodIntensity = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type PrivacyLevel = 'global' | 'friends' | 'private';

export interface MoodEntry {
  id: string;
  emotion: MoodEmotion;
  intensity: MoodIntensity;
  note?: string;
  tags?: string[];
  privacy: PrivacyLevel;
  createdAt: Date;
  updatedAt: Date;
}

export interface MoodStatistics {
  totalEntries: number;
  averageIntensity: number;
  mostFrequentEmotion: MoodEmotion | null;
  emotionCounts: Record<MoodEmotion, number>;
  weeklyTrend: { date: string; averageIntensity: number }[];
  monthlyTrend: { date: string; averageIntensity: number }[];
  streak: number;
}

export interface MoodContextType {
  // Entries
  entries: MoodEntry[];
  addEntry: (entry: Omit<MoodEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEntry: (id: string, updates: Partial<Omit<MoodEntry, 'id' | 'createdAt'>>) => void;
  deleteEntry: (id: string) => void;
  getEntryById: (id: string) => MoodEntry | undefined;

  // Statistics
  getStatistics: (range?: 'week' | 'month' | 'year') => MoodStatistics;
  getEntriesByDate: (date: Date) => MoodEntry[];
  getEntriesByRange: (startDate: Date, endDate: Date) => MoodEntry[];

  // Recent/Common
  recentEmotions: MoodEmotion[];
  commonEmotions: MoodEmotion[];

  // Utility
  clearAllEntries: () => void;
  exportData: () => string;
}

// ============================================================================
// Mood Definitions
// ============================================================================

export const MOOD_EMOTIONS: { key: MoodEmotion; label: string; emoji: string; color: string; category: string }[] = [
  { key: 'happy', label: 'Happy', emoji: '😊', color: '#FFD93D', category: 'Positive' },
  { key: 'sad', label: 'Sad', emoji: '😢', color: '#6B7FD7', category: 'Negative' },
  { key: 'angry', label: 'Angry', emoji: '😠', color: '#FF6B6B', category: 'Negative' },
  { key: 'anxious', label: 'Anxious', emoji: '😰', color: '#A8D8EA', category: 'Negative' },
  { key: 'calm', label: 'Calm', emoji: '😌', color: '#98D8C8', category: 'Positive' },
  { key: 'excited', label: 'Excited', emoji: '🤩', color: '#FF9F43', category: 'Positive' },
  { key: 'tired', label: 'Tired', emoji: '😴', color: '#B8B8B8', category: 'Neutral' },
  { key: 'grateful', label: 'Grateful', emoji: '🙏', color: '#26DE81', category: 'Positive' },
  { key: 'stressed', label: 'Stressed', emoji: '😣', color: '#EB4D4B', category: 'Negative' },
  { key: 'peaceful', label: 'Peaceful', emoji: '😇', color: '#7ED6DF', category: 'Positive' },
  { key: 'frustrated', label: 'Frustrated', emoji: '😤', color: '#F0932B', category: 'Negative' },
  { key: 'hopeful', label: 'Hopeful', emoji: '✨', color: '#FECA57', category: 'Positive' },
  { key: 'lonely', label: 'Lonely', emoji: '🥺', color: '#833471', category: 'Negative' },
  { key: 'confident', label: 'Confident', emoji: '💪', color: '#22A6B3', category: 'Positive' },
  { key: 'overwhelmed', label: 'Overwhelmed', emoji: '😵‍💫', color: '#BE2EDD', category: 'Negative' },
];

export const MOOD_COLORS: { emotion: MoodEmotion; color: string; gradient: string }[] = [
  { emotion: 'happy', color: '#FFD93D', gradient: 'from-yellow-400 to-orange-400' },
  { emotion: 'sad', color: '#6B7FD7', gradient: 'from-indigo-400 to-purple-400' },
  { emotion: 'angry', color: '#FF6B6B', gradient: 'from-red-400 to-pink-500' },
  { emotion: 'anxious', color: '#A8D8EA', gradient: 'from-cyan-300 to-blue-400' },
  { emotion: 'calm', color: '#98D8C8', gradient: 'from-teal-400 to-emerald-400' },
  { emotion: 'excited', color: '#FF9F43', gradient: 'from-orange-400 to-amber-500' },
  { emotion: 'tired', color: '#B8B8B8', gradient: 'from-gray-400 to-gray-500' },
  { emotion: 'grateful', color: '#26DE81', gradient: 'from-green-400 to-emerald-500' },
  { emotion: 'stressed', color: '#EB4D4B', gradient: 'from-red-500 to-rose-500' },
  { emotion: 'peaceful', color: '#7ED6DF', gradient: 'from-sky-400 to-cyan-400' },
  { emotion: 'frustrated', color: '#F0932B', gradient: 'from-amber-400 to-orange-400' },
  { emotion: 'hopeful', color: '#FECA57', gradient: 'from-yellow-400 to-amber-400' },
  { emotion: 'lonely', color: '#833471', gradient: 'from-purple-500 to-pink-600' },
  { emotion: 'confident', color: '#22A6B3', gradient: 'from-cyan-500 to-teal-500' },
  { emotion: 'overwhelmed', color: '#BE2EDD', gradient: 'from-purple-500 to-fuchsia-500' },
];

export const INTENSITY_LABELS: Record<MoodIntensity, string> = {
  1: 'Very Mild',
  2: 'Mild',
  3: 'Slight',
  4: 'Moderate',
  5: 'Medium',
  6: 'Noticeable',
  7: 'Strong',
  8: 'Very Strong',
  9: 'Intense',
  10: 'Extreme',
};

export const COMMON_TAGS = [
  'Work', 'Family', 'Health', 'Social', 'Exercise',
  'Sleep', 'Weather', 'Food', 'Hobbies', 'Relaxation',
  'Stress', 'Achievement', 'Relationships', 'Money', 'Weather'
];

// ============================================================================
// Context
// ============================================================================

const MoodContext = createContext<MoodContextType | undefined>(undefined);

// ============================================================================
// Provider
// ============================================================================

export function MoodProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<MoodEntry[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('moodmash_entries');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setEntries(parsed.map((entry: MoodEntry) => ({
          ...entry,
          createdAt: new Date(entry.createdAt),
          updatedAt: new Date(entry.updatedAt),
        })));
      } catch {
        console.warn('Failed to load mood entries from localStorage');
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('moodmash_entries', JSON.stringify(entries));
  }, [entries]);

  const generateUUID = useCallback(() => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c: string): string => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }, []);

  const addEntry = useCallback((entry: Omit<MoodEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    const newEntry: MoodEntry = {
      ...entry,
      id: generateUUID(),
      createdAt: now,
      updatedAt: now,
    };
    setEntries((prev) => [newEntry, ...prev]);
  }, [generateUUID]);

  const updateEntry = useCallback((id: string, updates: Partial<Omit<MoodEntry, 'id' | 'createdAt'>>) => {
    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === id
          ? { ...entry, ...updates, updatedAt: new Date() }
          : entry
      )
    );
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  const getEntryById = useCallback((id: string) => {
    return entries.find((entry) => entry.id === id);
  }, [entries]);

  const getEntriesByDate = useCallback((date: Date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return entries.filter(
      (entry) =>
        entry.createdAt >= startOfDay && entry.createdAt <= endOfDay
    );
  }, [entries]);

  const getEntriesByRange = useCallback((startDate: Date, endDate: Date) => {
    return entries.filter(
      (entry) => entry.createdAt >= startDate && entry.createdAt <= endDate
    );
  }, [entries]);

  const getStatistics = useCallback((range: 'week' | 'month' | 'year' = 'month'): MoodStatistics => {
    const now = new Date();
    let startDate: Date;

    switch (range) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case 'month':
      default:
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 1);
        break;
    }

    const rangeEntries = getEntriesByRange(startDate, now);
    const emotionCounts = {} as Record<MoodEmotion, number>;

    MOOD_EMOTIONS.forEach((mood) => {
      emotionCounts[mood.key] = 0;
    });

    let totalIntensity = 0;
    let maxEmotion: MoodEmotion | null = null;
    let maxCount = 0;

    rangeEntries.forEach((entry) => {
      emotionCounts[entry.emotion]++;
      totalIntensity += entry.intensity;

      if (emotionCounts[entry.emotion] > maxCount) {
        maxCount = emotionCounts[entry.emotion];
        maxEmotion = entry.emotion;
      }
    });

    // Calculate weekly trend
    const weeklyTrend: { date: string; averageIntensity: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const dayEntries = entries.filter(
        (entry) => entry.createdAt >= dayStart && entry.createdAt <= dayEnd
      );

      if (dayEntries.length > 0) {
        const avgIntensity = dayEntries.reduce((sum, e) => sum + e.intensity, 0) / dayEntries.length;
        weeklyTrend.push({
          date: date.toLocaleDateString('en-US', { weekday: 'short' }),
          averageIntensity: avgIntensity,
        });
      } else {
        weeklyTrend.push({
          date: date.toLocaleDateString('en-US', { weekday: 'short' }),
          averageIntensity: 5,
        });
      }
    }

    // Calculate monthly trend
    const monthlyTrend: { date: string; averageIntensity: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const dayEntries = entries.filter(
        (entry) => entry.createdAt >= dayStart && entry.createdAt <= dayEnd
      );

      if (dayEntries.length > 0) {
        const avgIntensity = dayEntries.reduce((sum, e) => sum + e.intensity, 0) / dayEntries.length;
        monthlyTrend.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          averageIntensity: avgIntensity,
        });
      } else {
        monthlyTrend.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          averageIntensity: 5,
        });
      }
    }

    // Calculate streak
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dayStart = new Date(checkDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(checkDate);
      dayEnd.setHours(23, 59, 59, 999);

      const dayEntries = entries.filter(
        (entry) => entry.createdAt >= dayStart && entry.createdAt <= dayEnd
      );

      if (dayEntries.length > 0) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    return {
      totalEntries: rangeEntries.length,
      averageIntensity: rangeEntries.length > 0 ? totalIntensity / rangeEntries.length : 5,
      mostFrequentEmotion: maxEmotion,
      emotionCounts,
      weeklyTrend,
      monthlyTrend,
      streak,
    };
  }, [entries, getEntriesByRange]);

  const recentEmotions = entries.slice(0, 5).map((e) => e.emotion);

  const commonEmotions = Object.entries(
    entries.reduce((acc, entry) => {
      acc[entry.emotion] = (acc[entry.emotion] || 0) + 1;
      return acc;
    }, {} as Record<MoodEmotion, number>)
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([emotion]) => emotion as MoodEmotion);

  const clearAllEntries = useCallback(() => {
    setEntries([]);
  }, []);

  const exportData = useCallback(() => {
    return JSON.stringify(entries, null, 2);
  }, [entries]);

  const value: MoodContextType = {
    entries,
    addEntry,
    updateEntry,
    deleteEntry,
    getEntryById,
    getStatistics,
    getEntriesByDate,
    getEntriesByRange,
    recentEmotions,
    commonEmotions,
    clearAllEntries,
    exportData,
  };

  return <MoodContext.Provider value={value}>{children}</MoodContext.Provider>;
}

// ============================================================================
// Hook
// ============================================================================

export function useMood() {
  const context = useContext(MoodContext);
  if (context === undefined) {
    throw new Error('useMood must be used within a MoodProvider');
  }
  return context;
}

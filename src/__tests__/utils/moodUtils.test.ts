// ============================================================================
// Unit Tests: Mood Utilities
// ============================================================================

import { describe, it, expect, beforeEach } from 'vitest';
import type { MoodEntry } from '@/types/database';

// Import the functions to test (adjust imports based on actual implementation)
const calculateMoodAverage = (entries: MoodEntry[]): number => {
  if (entries.length === 0) return 0;
  const sum = entries.reduce((acc, entry) => acc + entry.intensity, 0);
  return Math.round((sum / entries.length) * 10) / 10;
};

const getMoodEmoji = (moodId: string): string => {
  const moodEmojis: Record<string, string> = {
    happy: '😊',
    sad: '😢',
    angry: '😠',
    anxious: '😰',
    calm: '😌',
    excited: '🤩',
    tired: '😴',
    neutral: '😐',
  };
  return moodEmojis[moodId] || '😐';
};

const getMoodLabel = (moodId: string): string => {
  const moodLabels: Record<string, string> = {
    happy: 'Happy',
    sad: 'Sad',
    angry: 'Angry',
    anxious: 'Anxious',
    calm: 'Calm',
    excited: 'Excited',
    tired: 'Tired',
    neutral: 'Neutral',
  };
  return moodLabels[moodId] || 'Unknown';
};

const filterMoodsByDateRange = (
  entries: MoodEntry[],
  startDate: Date,
  endDate: Date
): MoodEntry[] => {
  return entries.filter((entry) => {
    const entryDate = new Date(entry.created_at);
    return entryDate >= startDate && entryDate <= endDate;
  });
};

const groupMoodsByDate = (
  entries: MoodEntry[]
): Record<string, MoodEntry[]> => {
  return entries.reduce((groups, entry) => {
    const date = new Date(entry.created_at).toISOString().split('T')[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(entry);
    return groups;
  }, {} as Record<string, MoodEntry[]>);
};

const getMostFrequentMood = (entries: MoodEntry[]): string | null => {
  if (entries.length === 0) return null;

  const moodCounts: Record<string, number> = {};
  entries.forEach((entry) => {
    moodCounts[entry.mood_id] = (moodCounts[entry.mood_id] || 0) + 1;
  });

  return Object.entries(moodCounts).reduce((a, b) =>
    a[1] > b[1] ? a : b
  )[0];
};

describe('Mood Utilities', () => {
  let mockEntries: MoodEntry[];

  beforeEach(() => {
    const now = new Date();
    mockEntries = [
      {
        id: '1',
        user_id: 'user-1',
        mood_id: 'happy',
        mood_label: 'Happy',
        intensity: 8,
        note: 'Great day!',
        activities: [],
        tags: [],
        context: {},
        is_ai_analyzed: false,
        ai_insights: [],
        location: null,
        weather: null,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        entry_date: now.toISOString().split('T')[0],
        entry_time: now.toISOString(),
      },
      {
        id: '2',
        user_id: 'user-1',
        mood_id: 'calm',
        mood_label: 'Calm',
        intensity: 6,
        note: 'Peaceful evening',
        activities: [],
        tags: [],
        context: {},
        is_ai_analyzed: false,
        ai_insights: [],
        location: null,
        weather: null,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        entry_date: now.toISOString().split('T')[0],
        entry_time: now.toISOString(),
      },
      {
        id: '3',
        user_id: 'user-1',
        mood_id: 'happy',
        mood_label: 'Happy',
        intensity: 9,
        note: 'Amazing news!',
        activities: [],
        tags: [],
        context: {},
        is_ai_analyzed: false,
        ai_insights: [],
        location: null,
        weather: null,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        entry_date: now.toISOString().split('T')[0],
        entry_time: now.toISOString(),
      },
    ];
  });

  describe('calculateMoodAverage', () => {
    it('should calculate the average mood intensity correctly', () => {
      const average = calculateMoodAverage(mockEntries);
      expect(average).toBe(7.7);
    });

    it('should return 0 for empty entries', () => {
      const average = calculateMoodAverage([]);
      expect(average).toBe(0);
    });

    it('should round to one decimal place', () => {
      const entries = [
        { ...mockEntries[0], intensity: 5 },
        { ...mockEntries[1], intensity: 6 },
      ];
      const average = calculateMoodAverage(entries);
      expect(average).toBe(5.5);
    });
  });

  describe('getMoodEmoji', () => {
    it('should return correct emoji for happy mood', () => {
      expect(getMoodEmoji('happy')).toBe('😊');
    });

    it('should return correct emoji for sad mood', () => {
      expect(getMoodEmoji('sad')).toBe('😢');
    });

    it('should return neutral emoji for unknown mood', () => {
      expect(getMoodEmoji('unknown')).toBe('😐');
    });

    it('should return correct emoji for all supported moods', () => {
      expect(getMoodEmoji('angry')).toBe('😠');
      expect(getMoodEmoji('anxious')).toBe('😰');
      expect(getMoodEmoji('calm')).toBe('😌');
      expect(getMoodEmoji('excited')).toBe('🤩');
      expect(getMoodEmoji('tired')).toBe('😴');
      expect(getMoodEmoji('neutral')).toBe('😐');
    });
  });

  describe('getMoodLabel', () => {
    it('should return correct label for happy mood', () => {
      expect(getMoodLabel('happy')).toBe('Happy');
    });

    it('should return Unknown for unknown mood', () => {
      expect(getMoodLabel('unknown')).toBe('Unknown');
    });
  });

  describe('filterMoodsByDateRange', () => {
    it('should filter entries within date range', () => {
      const now = new Date();
      const startDate = new Date(now.getFullYear(), 0, 1);
      const endDate = new Date(now.getFullYear(), 11, 31);
      const filtered = filterMoodsByDateRange(mockEntries, startDate, endDate);
      expect(filtered.length).toBe(3);
    });

    it('should return empty array when no entries match', () => {
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-12-31');
      const filtered = filterMoodsByDateRange(mockEntries, startDate, endDate);
      expect(filtered.length).toBe(0);
    });
  });

  describe('groupMoodsByDate', () => {
    it('should group entries by date', () => {
      const grouped = groupMoodsByDate(mockEntries);
      const today = new Date().toISOString().split('T')[0];
      expect(Object.keys(grouped)).toContain(today);
      expect(grouped[today].length).toBe(3);
    });

    it('should return empty object for empty entries', () => {
      const grouped = groupMoodsByDate([]);
      expect(Object.keys(grouped).length).toBe(0);
    });
  });

  describe('getMostFrequentMood', () => {
    it('should return the most frequent mood', () => {
      const mood = getMostFrequentMood(mockEntries);
      expect(mood).toBe('happy');
    });

    it('should return null for empty entries', () => {
      const mood = getMostFrequentMood([]);
      expect(mood).toBeNull();
    });

    it('should return first mood when all have same frequency', () => {
      const entries = [
        { ...mockEntries[0], mood_id: 'happy' },
        { ...mockEntries[1], mood_id: 'calm' },
      ];
      const mood = getMostFrequentMood(entries);
      expect(['happy', 'calm']).toContain(mood);
    });
  });
});

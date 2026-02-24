// ============================================================================
// Unit Tests: Wellness Utilities
// ============================================================================

import { describe, it, expect } from 'vitest';
import type { WellnessSession } from '@/types/database';

// Wellness calculation functions
const calculateWellnessStats = (sessions: WellnessSession[]) => {
  if (sessions.length === 0) {
    return {
      totalSessions: 0,
      totalMinutes: 0,
      averageDuration: 0,
      streak: 0,
      favoriteType: null as string | null,
    };
  }

  const totalSessions = sessions.length;
  const totalMinutes = sessions.reduce((sum, s) => sum + s.duration_minutes, 0);
  const averageDuration = Math.round(totalMinutes / totalSessions);

  // Calculate streak (consecutive days)
  const uniqueDates = [...new Set(sessions.map((s) => s.completed_at.split('T')[0]))].sort().reverse();
  let streak = 0;
  const today = new Date().toISOString().split('T')[0];

  for (let i = 0; i < uniqueDates.length; i++) {
    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - i);
    const expectedDateStr = expectedDate.toISOString().split('T')[0];

    if (uniqueDates[i] === expectedDateStr) {
      streak++;
    } else {
      break;
    }
  }

  // Calculate favorite type
  const typeCounts: Record<string, number> = {};
  sessions.forEach((s) => {
    typeCounts[s.type] = (typeCounts[s.type] || 0) + 1;
  });
  const favoriteType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  return { totalSessions, totalMinutes, averageDuration, streak, favoriteType };
};

const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }
  return `${hours} hr ${remainingMinutes} min`;
};

const getWellnessCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    relaxation: '#8B5CF6',
    exercise: '#10B981',
    mindfulness: '#3B82F6',
    sleep: '#6366F1',
    breathing: '#14B8A6',
    stretching: '#F59E0B',
  };
  return colors[category] || '#6B7280';
};

const getWellnessTypeIcon = (type: string): string => {
  const icons: Record<string, string> = {
    meditation: '🧘',
    yoga: '🧎',
    breathing: '💨',
    stretching: '🤸',
    mindfulness: '🧠',
    sleep: '😴',
    music: '🎵',
    journal: '📝',
  };
  return icons[type] || '✨';
};

const calculateCaloriesBurned = (type: string, minutes: number): number => {
  const burnRates: Record<string, number> = {
    yoga: 4,
    stretching: 3,
    meditation: 1,
    breathing: 1,
    mindfulness: 1.5,
    exercise: 5,
  };
  const rate = burnRates[type] || 2;
  return Math.round(rate * minutes);
};

const getRecommendedWellnessActivity = (
  currentMood: string,
  timeOfDay: string
): string => {
  const recommendations: Record<string, Record<string, string>> = {
    anxious: {
      morning: 'breathing',
      afternoon: 'breathing',
      evening: 'meditation',
    },
    sad: {
      morning: 'music',
      afternoon: 'yoga',
      evening: 'meditation',
    },
    tired: {
      morning: 'yoga',
      afternoon: 'breathing',
      evening: 'sleep',
    },
    happy: {
      morning: 'exercise',
      afternoon: 'yoga',
      evening: 'journal',
    },
    calm: {
      morning: 'yoga',
      afternoon: 'stretching',
      evening: 'meditation',
    },
  };

  return recommendations[currentMood]?.[timeOfDay] || 'meditation';
};

describe('Wellness Utilities', () => {
  describe('calculateWellnessStats', () => {
    it('should calculate total sessions correctly', () => {
      const sessions: WellnessSession[] = [
        {
          id: '1',
          user_id: 'user-1',
          type: 'meditation',
          category: 'mindfulness',
          name: 'Morning Meditation',
          duration_minutes: 15,
          completed_at: new Date().toISOString(),
        },
        {
          id: '2',
          user_id: 'user-1',
          type: 'yoga',
          category: 'exercise',
          name: 'Yoga Flow',
          duration_minutes: 30,
          completed_at: new Date().toISOString(),
        },
      ];

      const stats = calculateWellnessStats(sessions);
      expect(stats.totalSessions).toBe(2);
      expect(stats.totalMinutes).toBe(45);
    });

    it('should return zeros for empty sessions', () => {
      const stats = calculateWellnessStats([]);
      expect(stats.totalSessions).toBe(0);
      expect(stats.totalMinutes).toBe(0);
      expect(stats.averageDuration).toBe(0);
    });

    it('should calculate average duration', () => {
      const sessions: WellnessSession[] = [
        { id: '1', user_id: 'user-1', type: 'meditation', category: 'mindfulness', name: 'Session 1', duration_minutes: 10, completed_at: new Date().toISOString() },
        { id: '2', user_id: 'user-1', type: 'yoga', category: 'exercise', name: 'Session 2', duration_minutes: 20, completed_at: new Date().toISOString() },
      ];

      const stats = calculateWellnessStats(sessions);
      expect(stats.averageDuration).toBe(15);
    });

    it('should identify favorite type', () => {
      const sessions: WellnessSession[] = [
        { id: '1', user_id: 'user-1', type: 'meditation', category: 'mindfulness', name: 'Session 1', duration_minutes: 10, completed_at: new Date().toISOString() },
        { id: '2', user_id: 'user-1', type: 'meditation', category: 'mindfulness', name: 'Session 2', duration_minutes: 15, completed_at: new Date().toISOString() },
        { id: '3', user_id: 'user-1', type: 'yoga', category: 'exercise', name: 'Session 3', duration_minutes: 20, completed_at: new Date().toISOString() },
      ];

      const stats = calculateWellnessStats(sessions);
      expect(stats.favoriteType).toBe('meditation');
    });
  });

  describe('formatDuration', () => {
    it('should format minutes only', () => {
      expect(formatDuration(30)).toBe('30 min');
    });

    it('should format hours only', () => {
      expect(formatDuration(60)).toBe('1 hr');
      expect(formatDuration(120)).toBe('2 hr');
    });

    it('should format hours and minutes', () => {
      expect(formatDuration(90)).toBe('1 hr 30 min');
      expect(formatDuration(75)).toBe('1 hr 15 min');
    });
  });

  describe('getWellnessCategoryColor', () => {
    it('should return correct colors for categories', () => {
      expect(getWellnessCategoryColor('relaxation')).toBe('#8B5CF6');
      expect(getWellnessCategoryColor('exercise')).toBe('#10B981');
      expect(getWellnessCategoryColor('mindfulness')).toBe('#3B82F6');
    });

    it('should return default color for unknown category', () => {
      expect(getWellnessCategoryColor('unknown')).toBe('#6B7280');
    });
  });

  describe('getWellnessTypeIcon', () => {
    it('should return correct icons for types', () => {
      expect(getWellnessTypeIcon('meditation')).toBe('🧘');
      expect(getWellnessTypeIcon('yoga')).toBe('🧎');
      expect(getWellnessTypeIcon('breathing')).toBe('💨');
      expect(getWellnessTypeIcon('sleep')).toBe('😴');
    });

    it('should return default icon for unknown type', () => {
      expect(getWellnessTypeIcon('unknown')).toBe('✨');
    });
  });

  describe('calculateCaloriesBurned', () => {
    it('should calculate calories for yoga', () => {
      expect(calculateCaloriesBurned('yoga', 30)).toBe(120);
    });

    it('should calculate calories for meditation', () => {
      expect(calculateCaloriesBurned('meditation', 15)).toBe(15);
    });

    it('should use default rate for unknown type', () => {
      expect(calculateCaloriesBurned('unknown', 10)).toBe(20);
    });
  });

  describe('getRecommendedWellnessActivity', () => {
    it('should recommend breathing for anxious mood in morning', () => {
      expect(getRecommendedWellnessActivity('anxious', 'morning')).toBe('breathing');
    });

    it('should recommend meditation for anxious mood in evening', () => {
      expect(getRecommendedWellnessActivity('anxious', 'evening')).toBe('meditation');
    });

    it('should recommend music for sad mood in morning', () => {
      expect(getRecommendedWellnessActivity('sad', 'morning')).toBe('music');
    });

    it('should default to meditation for unknown mood', () => {
      expect(getRecommendedWellnessActivity('unknown', 'morning')).toBe('meditation');
    });
  });
});

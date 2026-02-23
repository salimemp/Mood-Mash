import { MoodEntry, MoodEmotion, MOOD_EMOTIONS } from '../contexts/MoodContext';

// ============================================================================
// Pattern Analysis Types
// ============================================================================

export interface MoodPattern {
  type: PatternType;
  title: string;
  description: string;
  confidence: number;
  evidence: string[];
  suggestions: string[];
}

export type PatternType =
  | 'circadian'
  | 'weekly'
  | 'seasonal'
  | 'trigger'
  | 'correlation'
  | 'trend'
  | 'outlier';

export interface TimeOfDayPattern {
  morning: { emotion: MoodEmotion | null; count: number; avgIntensity: number };
  afternoon: { emotion: MoodEmotion | null; count: number; avgIntensity: number };
  evening: { emotion: MoodEmotion | null; count: number; avgIntensity: number };
  night: { emotion: MoodEmotion | null; count: number; avgIntensity: number };
}

export interface DayOfWeekPattern {
  [key: string]: { emotion: MoodEmotion | null; count: number; avgIntensity: number };
}

export interface CorrelationResult {
  emotion1: MoodEmotion;
  emotion2: MoodEmotion;
  correlation: number;
  description: string;
}

export interface TrendAnalysis {
  direction: 'improving' | 'declining' | 'stable';
  slope: number;
  confidence: number;
  prediction: { date: string; expectedIntensity: number }[];
}

// ============================================================================
// Pattern Analysis Functions
// ============================================================================

export function analyzePatterns(entries: MoodEntry[]): MoodPattern[] {
  if (entries.length < 5) {
    return [{
      type: 'trend',
      title: 'Need More Data',
      description: 'Keep logging your mood to unlock personalized pattern insights.',
      confidence: 0,
      evidence: [`Currently tracking ${entries.length} entries. Minimum 5 entries needed for analysis.`],
      suggestions: ['Log your mood regularly for at least a week'],
    }];
  }

  const patterns: MoodPattern[] = [];

  // Analyze circadian patterns
  const circadianPattern = analyzeCircadianPattern(entries);
  if (circadianPattern) {
    patterns.push(circadianPattern);
  }

  // Analyze weekly patterns
  const weeklyPattern = analyzeWeeklyPattern(entries);
  if (weeklyPattern) {
    patterns.push(weeklyPattern);
  }

  // Analyze correlations
  const correlations = analyzeCorrelations(entries);
  if (correlations.length > 0) {
    patterns.push(...correlations);
  }

  // Analyze trends
  const trend = analyzeTrend(entries);
  if (trend) {
    patterns.push(trend);
  }

  // Analyze triggers based on tags/notes
  const triggers = analyzeTriggers(entries);
  if (triggers.length > 0) {
    patterns.push(...triggers);
  }

  return patterns;
}

function analyzeCircadianPattern(entries: MoodEntry[]): MoodPattern | null {
  const timeSlots: TimeOfDayPattern = {
    morning: { emotion: null, count: 0, avgIntensity: 0 },
    afternoon: { emotion: null, count: 0, avgIntensity: 0 },
    evening: { emotion: null, count: 0, avgIntensity: 0 },
    night: { emotion: null, count: 0, avgIntensity: 0 },
  };

  entries.forEach((entry) => {
    const hour = new Date(entry.createdAt).getHours();
    let timeSlot: keyof TimeOfDayPattern;

    if (hour >= 5 && hour < 12) {
      timeSlot = 'morning';
    } else if (hour >= 12 && hour < 17) {
      timeSlot = 'afternoon';
    } else if (hour >= 17 && hour < 21) {
      timeSlot = 'evening';
    } else {
      timeSlot = 'night';
    }

    const slot = timeSlots[timeSlot];
    slot.count++;
    slot.avgIntensity = ((slot.avgIntensity * (slot.count - 1)) + entry.intensity) / slot.count;

    if (!slot.emotion || slot.count === 1) {
      slot.emotion = entry.emotion;
    }
  });

  // Find the time slot with most entries and highest/lowest intensity
  const validSlots = Object.entries(timeSlots).filter(([, slot]) => slot.count > 0);

  if (validSlots.length < 2) {
    return null;
  }

  const bestSlot = validSlots.reduce((best, [name, slot]) =>
    slot.avgIntensity > best[1].avgIntensity ? [name, slot] : best
  );

  const worstSlot = validSlots.reduce((worst, [name, slot]) =>
    slot.avgIntensity < worst[1].avgIntensity ? [name, slot] : worst
  );

  const emotion1 = MOOD_EMOTIONS.find((m) => m.key === bestSlot[1].emotion);
  const emotion2 = MOOD_EMOTIONS.find((m) => m.key === worstSlot[1].emotion);

  const confidence = Math.min(bestSlot[1].count, worstSlot[1].count) / entries.length;

  if (confidence < 0.2) {
    return null;
  }

  return {
    type: 'circadian',
    title: 'Daily Energy Patterns',
    description: `You tend to feel most ${emotion1?.label.toLowerCase() || 'positive'} during the ${bestSlot[0]} and most ${emotion2?.label.toLowerCase() || 'negative'} during ${worstSlot[0]}.`,
    confidence,
    evidence: [
      `${bestSlot[1].count} entries show ${emotion1?.emoji} ${emotion1?.label} (avg intensity: ${bestSlot[1].avgIntensity.toFixed(1)}) during ${bestSlot[0]}`,
      `${worstSlot[1].count} entries show ${emotion2?.emoji} ${emotion2?.label} (avg intensity: ${worstSlot[1].avgIntensity.toFixed(1)}) during ${worstSlot[0]}`,
    ],
    suggestions: [
      `Schedule ${emotion1?.label}-inducing activities during ${bestSlot[0]}`,
      `Try relaxation techniques during ${worstSlot[0]} to improve your mood`,
      'Consider a consistent sleep schedule to stabilize circadian rhythm',
    ],
  };
}

function analyzeWeeklyPattern(entries: MoodEntry[]): MoodPattern | null {
  const days: DayOfWeekPattern = {
    Sunday: { emotion: null, count: 0, avgIntensity: 0 },
    Monday: { emotion: null, count: 0, avgIntensity: 0 },
    Tuesday: { emotion: null, count: 0, avgIntensity: 0 },
    Wednesday: { emotion: null, count: 0, avgIntensity: 0 },
    Thursday: { emotion: null, count: 0, avgIntensity: 0 },
    Friday: { emotion: null, count: 0, avgIntensity: 0 },
    Saturday: { emotion: null, count: 0, avgIntensity: 0 },
  };

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  entries.forEach((entry) => {
    const dayIndex = new Date(entry.createdAt).getDay();
    const day = dayNames[dayIndex] as keyof typeof days;
    const d = days[day];
    if (d) {
      d.count++;
      d.avgIntensity = ((d.avgIntensity * (d.count - 1)) + entry.intensity) / d.count;

      if (!d.emotion || d.count === 1) {
        d.emotion = entry.emotion;
      }
    }
  });

  const validDays = Object.entries(days).filter(([, day]) => day.count > 0);

  if (validDays.length < 3) {
    return null;
  }

  // Calculate average intensity per day
  const dayAverages = validDays.map(([name, day]) => ({
    name,
    avgIntensity: day.avgIntensity,
    count: day.count,
  }));

  // Find best and worst days
  const sortedByIntensity = [...dayAverages].sort((a, b) => b.avgIntensity - a.avgIntensity);
  const bestDay = sortedByIntensity[0];
  const worstDay = sortedByIntensity[sortedByIntensity.length - 1];

  if (!bestDay || !worstDay) {
    return null;
  }

  const confidence = Math.min(bestDay.count, worstDay.count) / entries.length;

  if (confidence < 0.15) {
    return null;
  }

  return {
    type: 'weekly',
    title: 'Weekly Mood Cycles',
    description: `${bestDay.name}s are your best days with average intensity of ${bestDay.avgIntensity.toFixed(1)}, while ${worstDay.name}s tend to be more challenging at ${worstDay.avgIntensity.toFixed(1)}.`,
    confidence,
    evidence: [
      `${bestDay.count} entries on ${bestDay.name}s show higher energy`,
      `${worstDay.count} entries on ${worstDay.name}s show lower energy`,
    ],
    suggestions: [
      `Plan enjoyable activities for ${worstDay.name}s to boost your mood`,
      'Use best days for important tasks or social activities',
      'Consider what factors might be causing the mid-week slump',
    ],
  };
}

function analyzeCorrelations(entries: MoodEntry[]): MoodPattern[] {
  const patterns: MoodPattern[] = [];
  const emotionCounts: Record<MoodEmotion, number> = {} as Record<MoodEmotion, number>;
  const emotionPairs: Record<string, number> = {};

  // Count emotions and adjacent pairs
  for (let i = 0; i < entries.length - 1; i++) {
    const currentEntry = entries[i];
    const nextEntry = entries[i + 1];
    if (!currentEntry || !nextEntry) continue;

    const current = currentEntry.emotion;
    const next = nextEntry.emotion;

    emotionCounts[current] = (emotionCounts[current] || 0) + 1;

    const pairKey = [current, next].sort().join('-');
    emotionPairs[pairKey] = (emotionPairs[pairKey] || 0) + 1;
  }

  // Find significant correlations
  const significantPairs = Object.entries(emotionPairs)
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  significantPairs.forEach(([pair, count]) => {
    const [emotion1, emotion2] = pair.split('-') as [MoodEmotion, MoodEmotion];
    const mood1 = MOOD_EMOTIONS.find((m) => m.key === emotion1);
    const mood2 = MOOD_EMOTIONS.find((m) => m.key === emotion2);

    patterns.push({
      type: 'correlation',
      title: 'Mood Connections',
      description: `When you feel ${mood1?.label.toLowerCase()}, you often follow up with ${mood2?.label.toLowerCase()}.`,
      confidence: Math.min(count / 5, 0.8),
      evidence: [
        `This transition occurred ${count} times in your mood history`,
        `${mood1?.emoji} → ${mood2?.emoji} is a common mood pattern`,
      ],
      suggestions: [
        `Understanding this pattern can help you manage mood transitions`,
        `Consider what triggers lead from ${mood1?.label} to ${mood2?.label}`,
      ],
    });
  });

  return patterns;
}

function analyzeTrend(entries: MoodEntry[]): MoodPattern | null {
  if (entries.length < 7) {
    return null;
  }

  // Calculate trend over last 30 entries
  const recentEntries = entries.slice(0, 30);
  const midPoint = Math.floor(recentEntries.length / 2);

  const firstHalf = recentEntries.slice(midPoint);
  const secondHalf = recentEntries.slice(0, midPoint);

  const firstAvg = firstHalf.reduce((sum, e) => sum + e.intensity, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, e) => sum + e.intensity, 0) / secondHalf.length;

  const diff = secondAvg - firstAvg;
  const slope = diff / midPoint;

  let direction: 'improving' | 'declining' | 'stable';
  let title: string;
  let description: string;
  let suggestions: string[];

  if (Math.abs(slope) < 0.05) {
    direction = 'stable';
    title = 'Stable Mood Pattern';
    description = 'Your mood has been relatively stable over recent weeks.';
    suggestions = [
      'Continue your current routines and activities',
      'Try new positive experiences to boost your mood further',
    ];
  } else if (slope > 0) {
    direction = 'improving';
    title = 'Positive Mood Trend';
    description = `Your mood has been improving, with an average increase of ${(slope * 10).toFixed(1)} points over recent entries.`;
    suggestions = [
      'Great job! Keep doing what you\'re doing',
      'Consider what\'s working and try to maintain these factors',
      'Share your positive experiences with others',
    ];
  } else {
    direction = 'declining';
    title = 'Mood Needs Attention';
    description = `Your mood has shown a slight declining trend recently. Average intensity dropped by ${(Math.abs(slope) * 10).toFixed(1)} points.`;
    suggestions = [
      'Consider talking to a friend or professional',
      'Review recent events that might be affecting your mood',
      'Try activities that have helped in the past',
    ];
  }

  return {
    type: 'trend',
    title,
    description,
    confidence: Math.min(recentEntries.length / 30, 1),
    evidence: [
      `${recentEntries.length} recent entries analyzed`,
      `Average mood ${direction === 'stable' ? 'remained steady' : direction === 'improving' ? 'increased' : 'decreased'} from ${firstAvg.toFixed(1)} to ${secondAvg.toFixed(1)}`,
    ],
    suggestions,
  };
}

function analyzeTriggers(entries: MoodEntry[]): MoodPattern[] {
  const patterns: MoodPattern[] = [];

  // Group entries with notes/tags
  const entriesWithNotes = entries.filter((e) => e.note && e.note.length > 3);

  if (entriesWithNotes.length < 3) {
    return patterns;
  }

  // Simple keyword analysis
  const keywordEmotions: Record<string, MoodEmotion[]> = {};

  entriesWithNotes.forEach((entry) => {
    const note = entry.note?.toLowerCase() || '';
    const words = note.split(/\s+/);

    words.forEach((word) => {
      const cleanWord = word.replace(/[^a-z]/g, '');
      if (cleanWord.length > 3) {
        if (!keywordEmotions[cleanWord]) {
          keywordEmotions[cleanWord] = [];
        }
        keywordEmotions[cleanWord].push(entry.emotion);
      }
    });
  });

  // Find keywords that correlate with specific emotions
  const significantKeywords = Object.entries(keywordEmotions)
    .filter(([, emotions]) => emotions.length >= 2)
    .map(([keyword, emotions]) => {
      const emotionCounts: Record<MoodEmotion, number> = {} as Record<MoodEmotion, number>;
      emotions.forEach((e) => {
        emotionCounts[e] = (emotionCounts[e] || 0) + 1;
      });

      const sortedEmotions = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1]);
      const dominantEmotion = sortedEmotions[0];
      if (!dominantEmotion) return null;

      const mood = MOOD_EMOTIONS.find((m) => m.key === dominantEmotion[0]);

      return {
        keyword,
        emotion: dominantEmotion[0] as MoodEmotion,
        moodLabel: mood?.label,
        moodEmoji: mood?.emoji,
        count: emotions.length,
        confidence: dominantEmotion[1] / emotions.length,
      };
    })
    .filter((k): k is NonNullable<typeof k> => k !== null && k.confidence >= 0.6)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  if (significantKeywords.length > 0) {
    const topKeyword = significantKeywords[0];
    if (!topKeyword) return patterns;

    const mood = MOOD_EMOTIONS.find((m) => m.key === topKeyword.emotion);

    patterns.push({
      type: 'trigger',
      title: 'Mood Themes Detected',
      description: `When you mention "${topKeyword.keyword}", you often feel ${mood?.label?.toLowerCase()}.`,
      confidence: topKeyword.confidence,
      evidence: [
        `"${topKeyword.keyword}" appeared in ${topKeyword.count} entries`,
        `${(topKeyword.confidence * 100).toFixed(0)}% of these entries showed ${mood?.emoji} ${mood?.label}`,
      ],
      suggestions: [
        `Reflect on how "${topKeyword.keyword}" affects your mood`,
        'Consider keeping a journal about this topic',
        'Plan positive experiences related to this theme',
      ],
    });
  }

  return patterns;
}

// ============================================================================
// Export Functions
// ============================================================================

export function exportToCSV(entries: MoodEntry[]): string {
  const headers = ['Date', 'Time', 'Emotion', 'Emoji', 'Intensity', 'Note', 'Privacy', 'Tags'];

  const rows = entries.map((entry) => {
    const date = new Date(entry.createdAt);
    const mood = MOOD_EMOTIONS.find((m) => m.key === entry.emotion);

    return [
      date.toLocaleDateString(),
      date.toLocaleTimeString(),
      mood?.label || entry.emotion,
      mood?.emoji || '',
      entry.intensity.toString(),
      `"${entry.note?.replace(/"/g, '""') || ''}"`,
      entry.privacy,
      `"${entry.tags?.join(', ') || ''}"`,
    ];
  });

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function exportToJSON(entries: MoodEntry[]): string {
  return JSON.stringify(
    entries.map((entry) => ({
      ...entry,
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
    })),
    null,
    2
  );
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

import { useState, useMemo } from 'react';
import { useMood, MoodEntry, MOOD_EMOTIONS, MOOD_COLORS } from '../contexts/MoodContext';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Search,
  Clock,
  Edit2,
  Trash2,
  Heart,
} from 'lucide-react';

interface MoodHistoryProps {
  limit?: number;
  showCalendar?: boolean;
}

export function MoodHistory({ limit }: MoodHistoryProps) {
  const { entries, deleteEntry } = useMood();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEmotion, setFilterEmotion] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  const displayedEntries = useMemo(() => {
    let filtered = [...entries];

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(
        (entry) =>
          entry.note?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          MOOD_EMOTIONS.find((m) => m.key === entry.emotion)?.label
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    // Filter by emotion
    if (filterEmotion !== 'all') {
      filtered = filtered.filter((entry) => entry.emotion === filterEmotion);
    }

    // Filter by date if selected
    if (selectedDate) {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      filtered = filtered.filter(
        (entry) => entry.createdAt >= startOfDay && entry.createdAt <= endOfDay
      );
    }

    if (limit) {
      return filtered.slice(0, limit);
    }

    return filtered;
  }, [entries, searchQuery, filterEmotion, selectedDate, limit]);

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
          <Heart className="w-8 h-8 text-slate-600" />
        </div>
        <p className="text-slate-400">No mood entries yet</p>
        <p className="text-slate-500 text-sm mt-1">Start logging your moods to see history</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <select
            value={filterEmotion}
            onChange={(e) => setFilterEmotion(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="all">All emotions</option>
            {MOOD_EMOTIONS.map((mood) => (
              <option key={mood.key} value={mood.key}>
                {mood.emoji} {mood.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-2 rounded-lg text-sm transition-all ${
              viewMode === 'list'
                ? 'bg-violet-500 text-white'
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            List
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-3 py-2 rounded-lg text-sm transition-all ${
              viewMode === 'calendar'
                ? 'bg-violet-500 text-white'
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            <Calendar className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <MoodCalendar
          entries={entries}
          onDateSelect={(date) => setSelectedDate(date)}
          selectedDate={selectedDate}
        />
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {displayedEntries.map((entry) => (
            <MoodEntryCard key={entry.id} entry={entry} onDelete={deleteEntry} />
          ))}

          {displayedEntries.length === 0 && (
            <div className="text-center py-8">
              <p className="text-slate-400">No entries match your filters</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Individual mood entry card
function MoodEntryCard({
  entry,
  onDelete,
}: {
  entry: MoodEntry;
  onDelete: (id: string) => void;
}) {
  const [showActions, setShowActions] = useState(false);
  const mood = MOOD_EMOTIONS.find((m) => m.key === entry.emotion);

  return (
    <div
      className="relative group p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start gap-4">
        {/* Mood Emoji/Color */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
          style={{ backgroundColor: `${mood?.color}20` }}
        >
          {mood?.emoji}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-white">{mood?.label}</span>
            <span
              className="px-2 py-0.5 rounded-full text-xs"
              style={{ backgroundColor: `${mood?.color}30`, color: mood?.color }}
            >
              Intensity: {entry.intensity}
            </span>
          </div>

          {entry.note && (
            <p className="text-slate-400 text-sm line-clamp-2">{entry.note}</p>
          )}

          <div className="flex items-center gap-1 mt-2 text-slate-500 text-xs">
            <Clock className="w-3 h-3" />
            <span>
              {new Intl.DateTimeFormat('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }).format(entry.createdAt)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div
          className={`absolute right-2 top-2 flex items-center gap-1 p-1 rounded-lg bg-slate-800 transition-opacity ${
            showActions ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <button className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(entry.id)}
            className="p-1.5 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Calendar component for mood visualization
interface MoodCalendarProps {
  entries: MoodEntry[];
  onDateSelect: (date: Date | null) => void;
  selectedDate: Date | null;
}

export function MoodCalendar({ entries, onDateSelect, selectedDate }: MoodCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewYear, setViewYear] = useState(new Date().getFullYear());

  const daysInMonth = new Date(viewYear, currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewYear, currentMonth.getMonth(), 1).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const getMoodForDate = (day: number) => {
    const date = new Date(viewYear, currentMonth.getMonth(), day);
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const dayEntries = entries.filter(
      (entry) => entry.createdAt >= startOfDay && entry.createdAt <= endOfDay
    );

    if (dayEntries.length === 0) return null;

    // Get the most frequent mood for the day
    const moodCounts: Record<string, number> = {};
    dayEntries.forEach((entry) => {
      moodCounts[entry.emotion] = (moodCounts[entry.emotion] || 0) + 1;
    });

    const mostFrequent = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];
    return mostFrequent ? (mostFrequent[0] as typeof entries[0]['emotion']) : null;
  };

  const isSelectedDate = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth.getMonth() &&
      selectedDate.getFullYear() === viewYear
    );
  };

  return (
    <div className="glass rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => {
            if (currentMonth.getMonth() === 0) {
              setCurrentMonth(new Date(viewYear - 1, 11, 1));
              setViewYear(viewYear - 1);
            } else {
              setCurrentMonth(new Date(viewYear, currentMonth.getMonth() - 1, 1));
            }
          }}
          className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-semibold text-white">
          {monthNames[currentMonth.getMonth()]} {viewYear}
        </h3>

        <button
          onClick={() => {
            if (currentMonth.getMonth() === 11) {
              setCurrentMonth(new Date(viewYear + 1, 0, 1));
              setViewYear(viewYear + 1);
            } else {
              setCurrentMonth(new Date(viewYear, currentMonth.getMonth() + 1, 1));
            }
          }}
          className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-xs text-slate-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before the first of the month */}
        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}

        {/* Days of the month */}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const mood = getMoodForDate(day);
          const moodInfo = mood ? MOOD_COLORS.find((m) => m.emotion === mood) : null;
          const selected = isSelectedDate(day);

          return (
            <button
              key={day}
              onClick={() => {
                const date = new Date(viewYear, currentMonth.getMonth(), day);
                onDateSelect(date);
              }}
              className={`aspect-square rounded-lg flex items-center justify-center text-sm transition-all ${
                selected
                  ? 'bg-violet-500 text-white'
                  : mood
                  ? ''
                  : 'text-slate-400 hover:bg-white/5'
              }`}
              style={
                !selected && moodInfo
                  ? { backgroundColor: `${moodInfo.color}30`, color: moodInfo.color }
                  : {}
              }
            >
              {mood ? MOOD_EMOTIONS.find((m) => m.key === mood)?.emoji : day}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-white/10">
        {MOOD_EMOTIONS.slice(0, 5).map((mood) => (
          <div key={mood.key} className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: mood.color }}
            />
            <span className="text-xs text-slate-400">{mood.emoji}</span>
          </div>
        ))}
        <span className="text-xs text-slate-500 ml-auto">Click to see details</span>
      </div>
    </div>
  );
}

// Year view calendar
export function YearCalendar({ entries }: { entries: MoodEntry[] }) {
  const [year, setYear] = useState(new Date().getFullYear());
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  const getMonthMood = (month: number) => {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    const monthEntries = entries.filter(
      (entry) => entry.createdAt >= startDate && entry.createdAt <= endDate
    );

    if (monthEntries.length === 0) return null;

    // Calculate average intensity
    const avgIntensity =
      monthEntries.reduce((sum, e) => sum + e.intensity, 0) / monthEntries.length;

    // Get dominant mood
    const moodCounts: Record<string, number> = {};
    monthEntries.forEach((entry) => {
      moodCounts[entry.emotion] = (moodCounts[entry.emotion] || 0) + 1;
    });

    const dominant = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];
    const dominantMood = dominant ? (dominant[0] as typeof entries[0]['emotion']) : null;

    return {
      avgIntensity,
      dominantMood,
      entryCount: monthEntries.length,
    };
  };

  return (
    <div className="glass rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{year} Overview</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setYear(year - 1)}
            className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-white font-medium">{year}</span>
          <button
            onClick={() => setYear(year + 1)}
            className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Month grid */}
      <div className="grid grid-cols-4 gap-3">
        {months.map((monthName, index) => {
          const monthData = getMonthMood(index);
          const moodInfo = monthData?.dominantMood
            ? MOOD_COLORS.find((m) => m.emotion === monthData.dominantMood)
            : null;

          return (
            <div
              key={monthName}
              className={`p-3 rounded-lg transition-all ${
                moodInfo
                  ? ''
                  : 'bg-white/5'
              }`}
              style={
                moodInfo
                  ? { backgroundColor: `${moodInfo.color}20`, borderLeft: `3px solid ${moodInfo.color}` }
                  : {}
              }
            >
              <p className="text-xs text-slate-400 mb-1">{monthName}</p>
              {monthData ? (
                <>
                  <p className="text-white font-medium">
                    {MOOD_EMOTIONS.find((m) => m.key === monthData.dominantMood)?.emoji}
                  </p>
                  <p className="text-xs text-slate-500">
                    {monthData.entryCount} entries • Avg: {monthData.avgIntensity.toFixed(1)}
                  </p>
                </>
              ) : (
                <p className="text-slate-600 text-sm">No data</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

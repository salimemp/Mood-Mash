import { useState, useMemo } from 'react';
import { useMood, MoodEmotion, MOOD_EMOTIONS } from '../contexts/MoodContext';
import { MoodEntry } from '../contexts/MoodContext';
import {
  Calendar,
  Clock,
  Filter,
  ChevronLeft,
  ChevronRight,
  Search,
  Tag,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  Trash2,
  Plus,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';

type TimelineView = 'day' | 'week' | 'month' | 'all';

export function MoodTimeline() {
  const { entries, deleteEntry, getEntryById } = useMood();
  const [view, setView] = useState<TimelineView>('week');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<MoodEntry | null>(null);

  const filteredEntries = useMemo(() => {
    let filtered = [...entries];

    // Filter by view
    const now = new Date();
    switch (view) {
      case 'day':
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endOfToday = new Date(today);
        endOfToday.setHours(23, 59, 59, 999);
        filtered = filtered.filter(e => e.createdAt >= today && e.createdAt <= endOfToday);
        break;
      case 'week':
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        filtered = filtered.filter(e => e.createdAt >= weekAgo);
        break;
      case 'month':
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        filtered = filtered.filter(e => e.createdAt >= monthAgo);
        break;
      case 'all':
        break;
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(e =>
        e.emotion.toLowerCase().includes(query) ||
        e.note?.toLowerCase().includes(query) ||
        e.tags?.some(t => t.toLowerCase().includes(query))
      );
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(e =>
        e.tags?.some(t => selectedTags.includes(t))
      );
    }

    return filtered;
  }, [entries, view, searchQuery, selectedTags]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    entries.forEach(e => e.tags?.forEach(t => tags.add(t)));
    return Array.from(tags);
  }, [entries]);

  const chartData = useMemo(() => {
    const grouped: Record<string, { date: string; avgIntensity: number; count: number }> = {};

    filteredEntries.forEach(entry => {
      const dateKey = entry.createdAt.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });

      if (!grouped[dateKey]) {
        grouped[dateKey] = { date: dateKey, avgIntensity: 0, count: 0 };
      }

      grouped[dateKey].avgIntensity = (
        (grouped[dateKey].avgIntensity * grouped[dateKey].count + entry.intensity) /
        (grouped[dateKey].count + 1)
      );
      grouped[dateKey].count++;
    });

    return Object.values(grouped).sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [filteredEntries]);

  const emotionDistribution = useMemo(() => {
    const distribution: Record<string, number> = {};
    filteredEntries.forEach(e => {
      distribution[e.emotion] = (distribution[e.emotion] || 0) + 1;
    });

    return Object.entries(distribution)
      .map(([emotion, count]) => ({
        emotion,
        count,
        emotionData: MOOD_EMOTIONS.find(m => m.key === emotion),
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredEntries]);

  const getEmotionColor = (emotion: MoodEmotion) => {
    return MOOD_EMOTIONS.find(m => m.key === emotion)?.color || '#8B5CF6';
  };

  const getTimelinePosition = (entry: MoodEntry) => {
    const date = new Date(entry.createdAt);
    const hours = date.getHours();
    const minutes = date.getMinutes();

    // Map hours (0-24) to position (0-100%)
    const left = ((hours * 60 + minutes) / (24 * 60)) * 100;
    return left;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getTrendIndicator = (entries: MoodEntry[]) => {
    if (entries.length < 2) return null;
    const firstHalf = entries.slice(0, Math.floor(entries.length / 2));
    const secondHalf = entries.slice(Math.floor(entries.length / 2));

    const firstAvg = firstHalf.reduce((sum, e) => sum + e.intensity, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, e) => sum + e.intensity, 0) / secondHalf.length;

    if (secondAvg > firstAvg + 0.5) return { icon: TrendingUp, color: 'text-emerald-400', label: 'Improving' };
    if (secondAvg < firstAvg - 0.5) return { icon: TrendingDown, color: 'text-red-400', label: 'Declining' };
    return { icon: TrendingUp, color: 'text-slate-400', label: 'Stable' };
  };

  const trend = getTrendIndicator(filteredEntries);
  const TrendIcon = trend?.icon || TrendingUp;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Mood Timeline</h2>
          <p className="text-slate-400">Explore your emotional journey over time</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search moods..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg border transition-all ${
              showFilters || selectedTags.length > 0
                ? 'bg-violet-500/20 border-violet-500/50 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="glass rounded-xl p-4 animate-in slide-in-from-top-2">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-sm text-slate-400 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Filter by tags:
            </span>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => {
                  setSelectedTags(prev =>
                    prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                  );
                }}
                className={`px-3 py-1 rounded-full text-xs transition-all ${
                  selectedTags.includes(tag)
                    ? 'bg-violet-500 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {tag}
              </button>
            ))}
            {allTags.length === 0 && (
              <span className="text-slate-500 text-sm">No tags yet</span>
            )}
          </div>

          {selectedTags.length > 0 && (
            <button
              onClick={() => setSelectedTags([])}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* View Tabs */}
      <div className="flex items-center gap-2">
        {(['day', 'week', 'month', 'all'] as TimelineView[]).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              view === v
                ? 'bg-violet-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {v === 'all' ? 'All Time' : v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <div className="lg:col-span-2 glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Intensity Trend</h3>
            {trend && (
              <div className={`flex items-center gap-2 text-sm ${trend.color}`}>
                <TrendIcon className="w-4 h-4" />
                <span>{trend.label}</span>
              </div>
            )}
          </div>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                {/* @ts-ignore */}
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 12 }}
                />
                {/* @ts-ignore */}
                <YAxis
                  domain={[0, 10]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 12 }}
                />
                {/* @ts-ignore */}
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                  formatter={(value: number) => [`${value.toFixed(1)}/10`, 'Avg Intensity']}
                />
                {/* @ts-ignore */}
                <Line
                  type="monotone"
                  dataKey="avgIntensity"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 mt-4 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-violet-500" />
              <span>Average Intensity</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">{filteredEntries.length} entries</span>
            </div>
          </div>
        </div>

        {/* Emotion Distribution */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Emotions</h3>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={emotionDistribution} layout="vertical">
                {/* @ts-ignore */}
                <XAxis type="number" hide />
                {/* @ts-ignore */}
                <YAxis
                  type="category"
                  dataKey="emotion"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 12 }}
                  width={80}
                />
                {/* @ts-ignore */}
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                  formatter={(value: number, name: string) => [
                    `${value} entries`,
                    name === 'emotion' ? 'Count' : name,
                  ]}
                />
                {/* @ts-ignore */}
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {emotionDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.emotionData?.color || '#8B5CF6'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
            {emotionDistribution.slice(0, 5).map((entry) => (
              <div key={entry.emotion} className="flex items-center gap-3">
                <span className="text-xl">{entry.emotionData?.emoji}</span>
                <span className="text-sm text-slate-300 flex-1 capitalize">{entry.emotion}</span>
                <span className="text-xs text-slate-500">{entry.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline Entries */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Entries ({filteredEntries.length})
        </h3>

        {filteredEntries.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📭</div>
            <p className="text-slate-400 mb-4">No entries found</p>
            <button className="px-4 py-2 bg-violet-500 text-white rounded-lg text-sm font-medium hover:bg-violet-600 transition-colors">
              Log Your First Mood
            </button>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className="bg-slate-800/50 rounded-xl p-4 hover:bg-slate-800 transition-colors group"
              >
                <div className="flex items-start gap-4">
                  {/* Time */}
                  <div className="text-center">
                    <div className="text-sm text-slate-400">
                      {entry.createdAt.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                    <div className="text-xs text-slate-500">
                      {formatTime(entry.createdAt)}
                    </div>
                  </div>

                  {/* Emotion */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ backgroundColor: getEmotionColor(entry.emotion) + '30' }}
                  >
                    {MOOD_EMOTIONS.find(m => m.key === entry.emotion)?.emoji}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white capitalize">{entry.emotion}</span>
                      <span className="text-xs text-slate-500">
                        Intensity: {entry.intensity}/10
                      </span>
                    </div>

                    {entry.note && (
                      <p className="text-sm text-slate-400 line-clamp-2">{entry.note}</p>
                    )}

                    {entry.tags && entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {entry.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-slate-700 rounded text-xs text-slate-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setSelectedEntry(entry)}
                      className="p-2 rounded-lg bg-slate-700 text-slate-400 hover:text-white transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 rounded-lg bg-slate-700 text-slate-400 hover:text-white transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Entry Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md glass rounded-2xl p-6">
            <button
              onClick={() => setSelectedEntry(null)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              ✕
            </button>

            <div className="text-center mb-6">
              <div
                className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center text-4xl mb-4"
                style={{ backgroundColor: getEmotionColor(selectedEntry.emotion) + '30' }}
              >
                {MOOD_EMOTIONS.find(m => m.key === selectedEntry.emotion)?.emoji}
              </div>
              <h3 className="text-xl font-bold text-white capitalize">{selectedEntry.emotion}</h3>
              <p className="text-slate-400 text-sm">
                {selectedEntry.createdAt.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-sm text-slate-400">Intensity</span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-violet-500 to-fuchsia-500 h-2 rounded-full"
                      style={{ width: `${(selectedEntry.intensity / 10) * 100}%` }}
                    />
                  </div>
                  <span className="text-white font-medium">{selectedEntry.intensity}/10</span>
                </div>
              </div>

              {selectedEntry.note && (
                <div>
                  <span className="text-sm text-slate-400">Note</span>
                  <p className="text-white mt-1">{selectedEntry.note}</p>
                </div>
              )}

              {selectedEntry.tags && selectedEntry.tags.length > 0 && (
                <div>
                  <span className="text-sm text-slate-400">Tags</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedEntry.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-slate-700 rounded-full text-sm text-slate-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MoodTimeline;

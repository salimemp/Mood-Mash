// @ts-nocheck
import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useMood, MOOD_EMOTIONS } from '../contexts/MoodContext';
import {
  TrendingUp,
  Calendar,
  Flame,
  Award,
  BarChart2,
  Activity,
} from 'lucide-react';

interface MoodStatisticsProps {
  range?: 'week' | 'month' | 'year';
}

// Custom Tooltip component to avoid type issues
const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; color: string }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl">
        <p className="text-slate-300 text-sm mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-white text-sm font-medium">
            {entry.dataKey}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function MoodStatisticsChart({ range = 'month' }: MoodStatisticsProps) {
  const { getStatistics } = useMood();
  const stats = getStatistics(range);

  const chartData = useMemo(() => {
    return range === 'week' ? stats.weeklyTrend : stats.monthlyTrend;
  }, [range, stats]);

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-violet-400" />
          Mood Trend
        </h3>
        <div className="flex items-center gap-2">
          {range === 'week' ? (
            <span className="text-xs text-slate-400">Last 7 days</span>
          ) : range === 'month' ? (
            <span className="text-xs text-slate-400">Last 30 days</span>
          ) : (
            <span className="text-xs text-slate-400">Last year</span>
          )}
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="date"
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={[1, 10]}
              ticks={[1, 3, 5, 7, 9, 10]}
            />
            {/* @ts-expect-error - recharts type incompatibility with React 18 strict mode */}
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="averageIntensity"
              stroke="#8B5CF6"
              strokeWidth={2}
              fill="url(#moodGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-violet-500" />
          <span className="text-slate-400">Average Intensity</span>
        </div>
      </div>
    </div>
  );
}

export function MoodDistributionChart({ range = 'month' }: MoodStatisticsProps) {
  const { getStatistics } = useMood();
  const stats = getStatistics(range);

  const pieData = useMemo(() => {
    return Object.entries(stats.emotionCounts)
      .filter(([, count]) => count > 0)
      .map(([emotion, count]) => {
        const mood = MOOD_EMOTIONS.find((m) => m.key === emotion);
        return {
          name: mood?.label || emotion,
          value: count,
          color: mood?.color || '#6B7FD7',
          emoji: mood?.emoji,
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [stats]);

  if (pieData.length === 0) {
    return (
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-violet-400" />
          Mood Distribution
        </h3>
        <div className="h-64 flex items-center justify-center">
          <p className="text-slate-400">No mood data to display</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <BarChart2 className="w-5 h-5 text-violet-400" />
        Mood Distribution
      </h3>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            {/* @ts-expect-error - recharts type incompatibility with React 18 strict mode */}
            <Tooltip
              formatter={(value: number, name: string) => {
                const entry = pieData.find((d) => d.name === name);
                return [`${value} entries`, entry ? `${entry.emoji} ${name}` : name];
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        {pieData.slice(0, 6).map((entry) => (
          <div key={entry.name} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-slate-400 truncate">
              {entry.emoji} {entry.name}
            </span>
            <span className="text-xs text-slate-500 ml-auto">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MoodSummaryCards({ range = 'month' }: MoodStatisticsProps) {
  const { getStatistics } = useMood();
  const stats = getStatistics(range);

  const summaryCards = [
    {
      title: 'Total Entries',
      value: stats.totalEntries,
      icon: Calendar,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
    },
    {
      title: 'Avg Intensity',
      value: stats.averageIntensity.toFixed(1),
      icon: Activity,
      color: 'text-violet-400',
      bgColor: 'bg-violet-500/20',
      subtitle: 'out of 10',
    },
    {
      title: 'Current Streak',
      value: stats.streak,
      icon: Flame,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
      subtitle: 'days',
    },
    {
      title: 'Top Mood',
      value: stats.mostFrequentEmotion
        ? MOOD_EMOTIONS.find((m) => m.key === stats.mostFrequentEmotion)?.emoji
        : '-',
      icon: Award,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/20',
      subtitle: stats.mostFrequentEmotion
        ? MOOD_EMOTIONS.find((m) => m.key === stats.mostFrequentEmotion)?.label
        : 'No data',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {summaryCards.map((card) => (
        <div
          key={card.title}
          className="glass rounded-xl p-4 hover:border-white/20 transition-all"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-xl ${card.bgColor} flex items-center justify-center`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{card.value}</p>
          <p className="text-xs text-slate-400">{card.title}</p>
          {card.subtitle && (
            <p className="text-xs text-slate-500 mt-1">{card.subtitle}</p>
          )}
        </div>
      ))}
    </div>
  );
}

export function WeeklyComparisonChart() {
  const { getStatistics } = useMood();
  const weekStats = getStatistics('week');

  // Get data for this week and last week
  const thisWeekData = weekStats.weeklyTrend;

  // Mock last week data (in production, this would come from the API)
  const lastWeekData = thisWeekData.map((_, index) => ({
    date: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index],
    thisWeek: thisWeekData[index]?.averageIntensity || 5,
    lastWeek: Math.random() * 4 + 3, // Mock data
  }));

  return (
    <div className="glass rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-violet-400" />
        Weekly Comparison
      </h3>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={lastWeekData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            {/* @ts-expect-error - recharts type incompatibility with React 18 strict mode */}
            <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
            {/* @ts-expect-error - recharts type incompatibility with React 18 strict mode */}
            <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} domain={[0, 10]} />
            {/* @ts-expect-error - recharts type incompatibility with React 18 strict mode */}
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            {/* @ts-expect-error - recharts type incompatibility with React 18 strict mode */}
            <Legend />
            <Bar
              dataKey="lastWeek"
              name="Last Week"
              fill="#6B7FD7"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="thisWeek"
              name="This Week"
              fill="#8B5CF6"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

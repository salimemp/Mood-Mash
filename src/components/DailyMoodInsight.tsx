import { useState, useEffect, useMemo } from 'react';
import { useMood, MoodEmotion, MOOD_EMOTIONS } from '../contexts/MoodContext';
import { useGamification } from '../contexts/GamificationContext';
import { getWellnessTip } from '../data/wellnessContent';
import {
  Sun,
  SunMedium,
  Moon,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  Quote,
  Lightbulb,
  Calendar,
  Clock,
  Target,
  Award,
  Zap,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export function DailyMoodInsight() {
  const { entries, getEntriesByDate, getStatistics } = useMood();
  const { profile, currentStreak } = useGamification();
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening'>('morning');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay('morning');
    else if (hour < 18) setTimeOfDay('afternoon');
    else setTimeOfDay('evening');
  }, []);

  const todayEntries = useMemo(() => {
    const today = new Date();
    return getEntriesByDate(today);
  }, [getEntriesByDate, entries]);

  const weekData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayEntries = getEntriesByDate(date);
      const avgIntensity = dayEntries.length > 0
        ? dayEntries.reduce((sum, e) => sum + e.intensity, 0) / dayEntries.length
        : 0;
      data.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        avg: avgIntensity,
        count: dayEntries.length,
        isToday: i === 0,
      });
    }
    return data;
  }, [getEntriesByDate, entries]);

  const stats = getStatistics('week');

  const wellnessTip = useMemo(() => {
    const recentMood = todayEntries.length > 0 ? todayEntries[0].emotion : undefined;
    return getWellnessTip(timeOfDay, recentMood);
  }, [timeOfDay, todayEntries]);

  const getTimeIcon = () => {
    if (timeOfDay === 'morning') return <Sun className="w-5 h-5 text-amber-400" />;
    if (timeOfDay === 'afternoon') return <SunMedium className="w-5 h-5 text-orange-400" />;
    return <Moon className="w-5 h-5 text-indigo-400" />;
  };

  const getTimeGreeting = () => {
    if (timeOfDay === 'morning') return 'Good Morning';
    if (timeOfDay === 'afternoon') return 'Good Afternoon';
    return 'Good Evening';
  };

  const getTrend = () => {
    const yesterday = weekData[weekData.length - 2]?.avg || 0;
    const today = weekData[weekData.length - 1]?.avg || 0;
    if (today > yesterday) return { icon: TrendingUp, color: 'text-emerald-400', label: 'Improving' };
    if (today < yesterday) return { icon: TrendingDown, color: 'text-red-400', label: 'Declining' };
    return { icon: Minus, color: 'text-slate-400', label: 'Stable' };
  };

  const trend = getTrend();
  const TrendIcon = trend.icon;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="glass rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            {getTimeIcon()}
            <span className="text-slate-400 text-sm capitalize">{timeOfDay}</span>
          </div>

          <h2 className="text-3xl font-bold text-white mb-2">{getTimeGreeting()}</h2>
          <p className="text-slate-400">Here's your daily wellness overview</p>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Clock className="w-3 h-3" />
                <span>Current Streak</span>
              </div>
              <div className="text-2xl font-bold text-white">{currentStreak} 🔥</div>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Calendar className="w-3 h-3" />
                <span>Entries Today</span>
              </div>
              <div className="text-2xl font-bold text-white">{todayEntries.length}</div>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Zap className="w-3 h-3" />
                <span>Level</span>
              </div>
              <div className="text-2xl font-bold text-white">{profile.level}</div>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <TrendIcon className={`w-3 h-3 ${trend.color}`} />
                <span>Trend</span>
              </div>
              <div className={`text-2xl font-bold ${trend.color}`}>{trend.label}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mood Trend Chart */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Weekly Mood Trend</h3>
            <p className="text-slate-400 text-sm">Your emotional patterns over the week</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">Intensity:</span>
            <span className="text-white font-medium">
              {stats.averageIntensity.toFixed(1)}/10
            </span>
          </div>
        </div>

        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weekData}>
              <defs>
                <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              {/* @ts-ignore */}
              <XAxis
                dataKey="day"
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
              <Area
                type="monotone"
                dataKey="avg"
                stroke="#8B5CF6"
                strokeWidth={3}
                fill="url(#moodGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Current Mood & Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Mood */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Current Mood</h3>
              <p className="text-slate-400 text-sm">
                {todayEntries.length > 0 ? 'Your latest entry' : 'No entry yet today'}
              </p>
            </div>
          </div>

          {todayEntries.length > 0 ? (
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                style={{
                  backgroundColor: MOOD_EMOTIONS.find(e => e.key === todayEntries[0].emotion)?.color + '30',
                }}
              >
                {MOOD_EMOTIONS.find(e => e.key === todayEntries[0].emotion)?.emoji}
              </div>
              <div>
                <div className="text-xl font-semibold text-white capitalize">
                  {todayEntries[0].emotion}
                </div>
                <div className="text-slate-400 text-sm">
                  Intensity: {todayEntries[0].intensity}/10
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📝</div>
              <p className="text-slate-400">Log your first mood today!</p>
            </div>
          )}
        </div>

        {/* Wellness Tip */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Wellness Tip</h3>
              <p className="text-slate-400 text-sm">Personalized for you</p>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="flex gap-2 text-amber-400 mb-2">
              <Quote className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs text-amber-300/70">Tip of the day</span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
              {wellnessTip}
            </p>
          </div>
        </div>
      </div>

      {/* Today's Challenge */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Today's Focus</h3>
            <p className="text-slate-400 text-sm">Your daily wellness goal</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl p-4 border border-emerald-500/20">
          <div className="flex items-start gap-4">
            <div className="text-3xl">🎯</div>
            <div>
              <h4 className="text-white font-medium mb-1">Mindful Moments</h4>
              <p className="text-slate-400 text-sm mb-3">
                Take three mindful breaths at different times throughout your day.
              </p>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-xs text-emerald-400">
                    0/3
                  </div>
                </div>
                <span className="text-xs text-slate-500">Complete for +50 XP</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements Progress */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
            <Award className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Achievement Progress</h3>
            <p className="text-slate-400 text-sm">Keep going to unlock badges</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'First Step', icon: '🌟', progress: todayEntries.length > 0 ? 100 : 0, target: 1 },
            { name: 'Week Warrior', icon: '💪', progress: Math.min(currentStreak / 7 * 100, 100), target: 7 },
            { name: 'Mood Tracker', icon: '📈', progress: Math.min(stats.totalEntries / 50 * 100, 100), target: 50 },
            { name: 'Zen Master', icon: '☯️', progress: 0, target: 100 },
          ].map((achievement) => (
            <div
              key={achievement.name}
              className="bg-slate-800/50 rounded-xl p-4 text-center"
            >
              <div className="text-3xl mb-2">{achievement.icon}</div>
              <div className="text-white font-medium text-sm mb-2">{achievement.name}</div>
              <div className="w-full bg-slate-700 rounded-full h-2 mb-1">
                <div
                  className="bg-gradient-to-r from-violet-500 to-fuchsia-500 h-2 rounded-full transition-all"
                  style={{ width: `${achievement.progress}%` }}
                />
              </div>
              <div className="text-xs text-slate-500">
                {achievement.target === 1
                  ? achievement.progress >= 100 ? 'Complete!' : '1 entry needed'
                  : `${Math.floor(achievement.progress * achievement.target / 100)}/${achievement.target}`}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DailyMoodInsight;

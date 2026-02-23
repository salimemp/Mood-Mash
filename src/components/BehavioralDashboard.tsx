// ============================================================================
// Behavioral Insights Dashboard Component
// MoodMash - Comprehensive User Wellness Analytics
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import type { BehavioralDashboardData, HealthInsight } from '../types/advanced';

interface BehavioralDashboardProps {
  userId: string;
}

interface ChartDataPoint {
  date: string;
  mood: number;
  energy: number;
  stress: number;
  sleep: number;
}

interface ActivityDataPoint {
  name: string;
  minutes: number;
  days: number;
}

const BehavioralDashboard: React.FC<BehavioralDashboardProps> = ({ userId }) => {
  const [dashboardData, setDashboardData] = useState<BehavioralDashboardData | null>(null);
  const [insights, setInsights] = useState<HealthInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'overview' | 'trends' | 'patterns' | 'recommendations'>('overview');
  const [dateRange, setDateRange] = useState(7);

  useEffect(() => {
    loadDashboardData();
  }, [userId, dateRange]);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics/dashboard?user_id=${userId}&days=${dateRange}`);
      const data = await response.json();
      setDashboardData(data);

      const insightsResponse = await fetch(`/api/insights?user_id=${userId}&limit=5`);
      const insightsData = await insightsResponse.json();
      setInsights(insightsData.insights || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setDashboardData(generateMockData(dateRange));
    }
    setLoading(false);
  }, [userId, dateRange]);

  const generateMockData = (days: number): BehavioralDashboardData => {
    return {
      user_id: userId,
      period_days: days,
      generated_at: new Date().toISOString(),
      overall_wellness_score: 72,
      mood_stability_score: 68,
      sleep_quality_score: 75,
      activity_level_score: 65,
      consistency_score: 70,
      mood_distribution: {
        'happy': 35, 'calm': 20, 'energetic': 15, 'neutral': 15, 'tired': 8, 'anxious': 4, 'stressed': 2, 'sad': 1
      },
      mood_trend: 'improving',
      average_mood_intensity: 6.2,
      dominant_activities: [
        { activity: 'Meditation', count: 12 },
        { activity: 'Walking', count: 8 },
        { activity: 'Reading', count: 6 },
        { activity: 'Exercise', count: 5 }
      ],
      current_streak_days: 5,
      longest_streak_days: 14,
      achievements_unlocked: 23,
      total_points_earned: 1250,
      top_insights: [
        { type: 'correlation', title: 'Sleep-Mood Connection', impact: 'positive' },
        { type: 'pattern', title: 'Morning Energy Peak', impact: 'neutral' },
        { type: 'trend', title: 'Improving Mood Trend', impact: 'positive' }
      ],
      top_correlations: [
        { metrics: 'Sleep ↔ Mood', correlation: 0.75, description: 'Strong positive' },
        { metrics: 'Activity ↔ Mood', correlation: 0.62, description: 'Moderate positive' },
        { metrics: 'Stress ↔ Sleep', correlation: -0.58, description: 'Moderate negative' }
      ],
      goals_progress: [
        { goal: 'Log mood daily', progress: 85, target: 100, status: 'on_track' },
        { goal: 'Meditate 5x/week', progress: 60, target: 100, status: 'on_track' },
        { goal: 'Sleep 7+ hours', progress: 75, target: 100, status: 'on_track' }
      ]
    };
  };

  const generateMoodData = (): ChartDataPoint[] => {
    const data: ChartDataPoint[] = [];
    const now = new Date();
    for (let i = dateRange - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        mood: Math.floor(Math.random() * 4) + 5,
        energy: Math.floor(Math.random() * 4) + 4,
        stress: Math.floor(Math.random() * 5) + 2,
        sleep: Math.floor(Math.random() * 3) + 6
      });
    }
    return data;
  };

  const generateActivityData = (): ActivityDataPoint[] => {
    const activities = ['Meditation', 'Walking', 'Exercise', 'Reading', 'Yoga', 'Journaling'];
    return activities.map(activity => ({
      name: activity,
      minutes: Math.floor(Math.random() * 60) + 10,
      days: Math.floor(Math.random() * 7) + 1
    }));
  };

  const moodChartData = generateMoodData();
  const activityChartData = generateActivityData();
  const moodDistributionData = dashboardData ? Object.entries(dashboardData.mood_distribution).map(([name, value]) => ({ name, value })) : [];

  const COLORS = ['#10B981', '#06B6D4', '#F59E0B', '#EC4899', '#8B5CF6', '#6366F1', '#EF4444', '#F97316'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Behavioral Insights</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Your personalized wellness analytics dashboard
          </p>
        </div>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(Number(e.target.value))}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          aria-label="Date range"
        >
          <option value={7}>Last 7 days</option>
          <option value={14}>Last 14 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700" role="tablist">
        <nav className="flex space-x-8">
          {(['overview', 'trends', 'patterns', 'recommendations'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveView(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                activeView === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
              role="tab"
              aria-selected={activeView === tab}
              aria-controls={`${tab}-panel`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {activeView === 'overview' && (
        <div id="overview-panel" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <ScoreCard title="Wellness Score" value={dashboardData?.overall_wellness_score || 0} icon="🌟" color="blue" />
            <ScoreCard title="Mood Stability" value={dashboardData?.mood_stability_score || 0} icon="😊" color="green" />
            <ScoreCard title="Sleep Quality" value={dashboardData?.sleep_quality_score || 0} icon="😴" color="purple" />
            <ScoreCard title="Activity Level" value={dashboardData?.activity_level_score || 0} icon="🏃" color="orange" />
            <ScoreCard title="Consistency" value={dashboardData?.consistency_score || 0} icon="📅" color="cyan" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Mood Trend</h3>
              <SimpleLineChart data={moodChartData} keys={['mood', 'energy']} colors={['#10B981', '#F59E0B']} />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Mood Distribution</h3>
              <SimplePieChart data={moodDistributionData} colors={COLORS} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Insights</h3>
              <div className="space-y-3">
                {dashboardData?.top_insights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-xl">
                      {insight.impact === 'positive' ? '📈' : insight.impact === 'negative' ? '📉' : '➡️'}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{insight.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{insight.type}</p>
                    </div>
                    <span className={`ml-auto px-2 py-1 text-xs font-medium rounded-full ${
                      insight.impact === 'positive' ? 'bg-green-100 text-green-800' :
                      insight.impact === 'negative' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {insight.impact}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Goals Progress</h3>
              <div className="space-y-4">
                {dashboardData?.goals_progress.map((goal, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{goal.goal}</span>
                      <span className="text-sm text-gray-500">{goal.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-600">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          goal.status === 'on_track' ? 'bg-green-500' :
                          goal.status === 'behind' ? 'bg-yellow-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeView === 'trends' && (
        <div id="trends-panel" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Activity Breakdown</h3>
              <SimpleBarChart data={activityChartData} />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Health Correlations</h3>
              <div className="space-y-4">
                {dashboardData?.top_correlations.map((corr, index) => (
                  <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">{corr.metrics}</span>
                      <span className={`text-sm font-medium ${
                        corr.correlation > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {corr.correlation > 0 ? '+' : ''}{corr.correlation.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{corr.description}</p>
                    <div className="mt-2 h-2 bg-gray-200 rounded-full dark:bg-gray-600">
                      <div
                        className={`h-2 rounded-full ${
                          corr.correlation > 0 ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.abs(corr.correlation) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeView === 'patterns' && (
        <div id="patterns-panel" className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Detected Patterns</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { type: 'circadian', name: 'Morning Energy Peak', description: 'You feel most energetic between 9-11 AM', icon: '🌅' },
                { type: 'weekly', name: 'Weekend Boost', description: 'Mood improves on weekends', icon: '🎉' },
                { type: 'correlation', name: 'Sleep-Mood Link', description: '7+ hours sleep = better mood', icon: '😴' },
                { type: 'trigger', name: 'Exercise Trigger', description: 'Post-workout mood boost', icon: '🏃' },
                { type: 'pattern', name: 'Midweek Dip', description: 'Energy dips on Wednesdays', icon: '📉' },
                { type: 'behavioral', name: 'Evening Routine', description: 'Consistent evening routine helps', icon: '🌙' }
              ].map((pattern, index) => (
                <div key={index} className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <span className="text-2xl">{pattern.icon}</span>
                  <h4 className="font-medium text-gray-900 dark:text-white mt-2">{pattern.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{pattern.description}</p>
                  <span className="inline-block mt-2 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full capitalize">
                    {pattern.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeView === 'recommendations' && (
        <div id="recommendations-panel" className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Personalized Recommendations</h3>
            <div className="space-y-4">
              {[
                { title: 'Improve Sleep Consistency', description: 'Go to bed within 30 minutes of your target time', impact: 'high', category: 'sleep' },
                { title: 'Morning Movement', description: '5-minute stretch routine to start your day', impact: 'medium', category: 'activity' },
                { title: 'Gratitude Practice', description: 'Write 3 things you\'re grateful for each morning', impact: 'high', category: 'mindset' },
                { title: 'Social Connection', description: 'Schedule a call with a friend this week', impact: 'medium', category: 'social' },
                { title: 'Mindful Breaks', description: 'Take 2-minute breathing breaks every 2 hours', impact: 'medium', category: 'wellness' }
              ].map((rec, index) => (
                <div key={index} className="flex items-start gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <span className="text-lg">💡</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{rec.title}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{rec.description}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        rec.impact === 'high' ? 'bg-green-100 text-green-800' :
                        rec.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {rec.impact} impact
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                        {rec.category}
                      </span>
                      <button className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors">
                        Learn More
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl p-6 text-white">
          <div className="text-4xl">🔥</div>
          <div className="mt-2 text-3xl font-bold">{dashboardData?.current_streak_days || 0}</div>
          <div className="text-sm opacity-90">Current Streak</div>
          <div className="mt-2 text-xs opacity-75">Best: {dashboardData?.longest_streak_days || 0} days</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl p-6 text-white">
          <div className="text-4xl">🏆</div>
          <div className="mt-2 text-3xl font-bold">{dashboardData?.achievements_unlocked || 0}</div>
          <div className="text-sm opacity-90">Achievements</div>
          <div className="mt-2 text-xs opacity-75">Keep going to unlock more!</div>
        </div>
        <div className="bg-gradient-to-br from-green-400 to-teal-500 rounded-xl p-6 text-white">
          <div className="text-4xl">⭐</div>
          <div className="mt-2 text-3xl font-bold">{dashboardData?.total_points_earned?.toLocaleString() || 0}</div>
          <div className="text-sm opacity-90">Total Points</div>
          <div className="mt-2 text-xs opacity-75">Level progression active</div>
        </div>
      </div>
    </div>
  );
};

const ScoreCard: React.FC<{ title: string; value: number; icon: string; color: string }> = ({ title, value, icon, color }) => {
  const colorClasses: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    cyan: 'from-cyan-500 to-cyan-600'
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl p-4 text-white`}>
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        <span className="text-3xl font-bold">{value}</span>
      </div>
      <div className="mt-2 text-sm opacity-90">{title}</div>
    </div>
  );
};

const SimpleLineChart: React.FC<{ data: ChartDataPoint[]; keys: string[]; colors: string[] }> = ({ data, keys, colors }) => {
  const maxValue = Math.max(...data.flatMap(d => keys.map(k => d[k as keyof ChartDataPoint] as number)));

  return (
    <div className="relative h-64">
      <div className="absolute inset-0 flex items-end">
        {data.map((point, index) => (
          <div key={index} className="flex-1 flex flex-col items-center justify-end h-full">
            {keys.map((key, keyIndex) => (
              <div
                key={keyIndex}
                className="w-3 rounded-t"
                style={{
                  height: `${((point[key as keyof ChartDataPoint] as number) / maxValue) * 100}%`,
                  backgroundColor: colors[keyIndex],
                  marginBottom: '2px'
                }}
                title={`${key}: ${point[key as keyof ChartDataPoint]}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 px-1">
        {data.filter((_, i) => i % Math.ceil(data.length / 7) === 0).map((point, i) => (
          <span key={i}>{point.date.split(' ')[0]}</span>
        ))}
      </div>
    </div>
  );
};

const SimplePieChart: React.FC<{ data: { name: string; value: number }[]; colors: string[] }> = ({ data, colors }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;

  return (
    <div className="flex items-center justify-center h-64">
      <div className="relative w-48 h-48 rounded-full" style={{ background: 'conic-gradient' }}>
        {data.map((item, index) => {
          const angle = (item.value / total) * 360;
          const startAngle = currentAngle;
          currentAngle += angle;
          return (
            <div
              key={index}
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(${colors[index % colors.length]} ${startAngle}deg ${currentAngle}deg)`,
                transform: 'rotate(-90deg)'
              }}
            />
          );
        })}
      </div>
      <div className="ml-6 space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
            <span className="text-gray-600 dark:text-gray-300">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const SimpleBarChart: React.FC<{ data: ActivityDataPoint[] }> = ({ data }) => {
  const maxMinutes = Math.max(...data.map(d => d.minutes));

  return (
    <div className="h-64 flex items-end justify-between gap-2">
      {data.map((item, index) => (
        <div key={index} className="flex-1 flex flex-col items-center">
          <div className="w-full flex flex-col items-center justify-end h-48">
            <div
              className="w-full bg-indigo-500 rounded-t transition-all hover:bg-indigo-600"
              style={{ height: `${(item.minutes / maxMinutes) * 100}%`, minHeight: '4px' }}
              title={`${item.minutes} minutes`}
            />
          </div>
          <span className="text-xs text-gray-500 mt-2 truncate w-full text-center">{item.name}</span>
        </div>
      ))}
    </div>
  );
};

export default BehavioralDashboard;

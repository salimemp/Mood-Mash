import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCompliance } from '../contexts/ComplianceContext';
import { useMood } from '../contexts/MoodContext';
import { useGamification } from '../contexts/GamificationContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import {
  MoodSummaryCards,
  MoodDistributionChart,
  MoodStatisticsChart,
  WeeklyComparisonChart,
} from '../components/MoodStatistics';
import { MoodLogger, QuickMoodEntry } from '../components/MoodLogger';
import { MoodHistory, YearCalendar } from '../components/MoodHistory';
import { AIInsights } from '../components/AIInsights';
import { DataExport } from '../components/DataExport';
import { DailyMoodInsight } from '../components/DailyMoodInsight';
import { MoodTimeline } from '../components/MoodTimeline';
import { Challenges } from '../components/Challenges';
import { Leaderboard } from '../components/Leaderboard';
import { AchievementBadges } from '../components/AchievementBadges';
import { GuidedMeditation } from '../components/GuidedMeditation';
import { YogaPractice } from '../components/YogaPractice';
import { MusicTherapy } from '../components/MusicTherapy';
import { ARExperienceHub } from '../components/ARExperienceHub';
import BreathingExerciseComponent from '../components/BreathingExercise';
import SleepRestComponent from '../components/SleepRest';
import ExerciseMovementComponent from '../components/ExerciseMovement';
import {
  Shield,
  Settings,
  Lock,
  Eye,
  ChevronRight,
  Sparkles,
  Bell,
  Sun,
  Moon,
  Calendar,
  BarChart2,
  History,
  Brain,
  Download,
  Heart,
  Target,
  Trophy,
  Award,
  Zap,
  Users,
  Music,
  Activity,
  Glasses,
  Wind,
  Cloud,
  Dumbbell,
} from 'lucide-react';

type DashboardView = 'overview' | 'statistics' | 'history' | 'calendar' | 'insights' | 'export' | 'wellness' | 'timeline' | 'challenges' | 'leaderboard' | 'achievements' | 'meditation' | 'yoga' | 'music' | 'ar' | 'breathing' | 'sleep' | 'exercise';

export function Dashboard() {
  const { user, logout } = useAuth();
  const { getComplianceStatus } = useCompliance();
  const { entries } = useMood();
  const { profile } = useGamification();

  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [showMoodLogger, setShowMoodLogger] = useState(false);
  const [currentView, setCurrentView] = useState<DashboardView>('overview');

  const gdprStatus = getComplianceStatus('gdpr');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const mainNavItems = [
    { id: 'overview' as DashboardView, icon: Sparkles, label: 'Overview' },
    { id: 'wellness' as DashboardView, icon: Heart, label: 'Wellness' },
    { id: 'timeline' as DashboardView, icon: Activity, label: 'Timeline' },
    { id: 'statistics' as DashboardView, icon: BarChart2, label: 'Statistics' },
  ];

  const wellnessNavItems = [
    { id: 'challenges' as DashboardView, icon: Target, label: 'Challenges' },
    { id: 'leaderboard' as DashboardView, icon: Trophy, label: 'Leaderboard' },
    { id: 'achievements' as DashboardView, icon: Award, label: 'Achievements' },
    { id: 'meditation' as DashboardView, icon: Zap, label: 'Meditation' },
    { id: 'yoga' as DashboardView, icon: Activity, label: 'Yoga' },
    { id: 'music' as DashboardView, icon: Music, label: 'Music' },
    { id: 'breathing' as DashboardView, icon: Wind, label: 'Breathing' },
    { id: 'sleep' as DashboardView, icon: Cloud, label: 'Sleep' },
    { id: 'exercise' as DashboardView, icon: Dumbbell, label: 'Exercise' },
  ];

  const toolsNavItems = [
    { id: 'history' as DashboardView, icon: History, label: 'History' },
    { id: 'calendar' as DashboardView, icon: Calendar, label: 'Calendar' },
    { id: 'insights' as DashboardView, icon: Brain, label: 'AI Insights' },
    { id: 'export' as DashboardView, icon: Download, label: 'Export' },
  ];

  const arNavItems = [
    { id: 'ar' as DashboardView, icon: Glasses, label: 'AR Experience' },
  ];

  const allNavItems = [...mainNavItems, ...wellnessNavItems, ...toolsNavItems, ...arNavItems];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                MoodMash
              </h1>
            </Link>
          </div>

          {/* Navigation Tabs */}
          <div className="hidden lg:flex items-center gap-1 glass rounded-full p-1">
            {allNavItems.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setCurrentView(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  currentView === id
                    ? 'bg-violet-500 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>

          {/* Mobile Wellness Dropdown */}
          <div className="lg:hidden">
            <select
              value={currentView}
              onChange={(e) => setCurrentView(e.target.value as DashboardView)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <optgroup label="Main">
                {mainNavItems.map(({ id, label }) => (
                  <option key={id} value={id}>{label}</option>
                ))}
              </optgroup>
              <optgroup label="Wellness">
                {wellnessNavItems.map(({ id, label }) => (
                  <option key={id} value={id}>{label}</option>
                ))}
              </optgroup>
              <optgroup label="Tools">
                {toolsNavItems.map(({ id, label }) => (
                  <option key={id} value={id}>{label}</option>
                ))}
              </optgroup>
            </select>
          </div>

          <div className="flex items-center gap-4">
            {/* Encryption Status Badge */}
            <div className="hidden md:flex items-center gap-2 glass px-3 py-1.5 rounded-full">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span className="text-xs text-slate-300">E2E Encrypted</span>
            </div>

            {/* Compliance Badge */}
            <div className="hidden md:flex items-center gap-2 glass px-3 py-1.5 rounded-full">
              <Shield className="w-3 h-3 text-violet-400" />
              <span className="text-xs text-slate-300">{gdprStatus?.compliant ? 'GDPR' : 'Privacy'}</span>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Notifications */}
            <button className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-violet-500 rounded-full" />
            </button>

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-semibold">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${showUserMenu ? 'rotate-90' : ''}`} />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 glass rounded-xl shadow-xl overflow-hidden">
                  <div className="p-4 border-b border-white/10">
                    <p className="text-white font-medium">{user?.name || 'User'}</p>
                    <p className="text-slate-400 text-sm">{user?.email || 'user@example.com'}</p>
                  </div>
                  <div className="p-2">
                    <Link
                      to="/settings/security"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Shield className="w-4 h-4 text-violet-400" />
                      Security Settings
                    </Link>
                    <Link
                      to="/settings/privacy"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Eye className="w-4 h-4 text-fuchsia-400" />
                      Privacy Settings
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      General Settings
                    </Link>
                  </div>
                  <div className="p-2 border-t border-white/10">
                    <button
                      onClick={() => logout()}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Overview View */}
        {currentView === 'overview' && (
          <>
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">{getGreeting()}!</h2>
                <p className="text-slate-400">Here's your mood summary for this {selectedPeriod}</p>
              </div>
              <div className="flex items-center gap-3 mt-4 md:mt-0">
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value as 'week' | 'month' | 'year')}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
                <button
                  onClick={() => setShowMoodLogger(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-lg text-white font-medium hover:from-violet-500 hover:to-fuchsia-500 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  Log Mood
                </button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="mb-8">
              <MoodSummaryCards range={selectedPeriod} />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <MoodStatisticsChart range={selectedPeriod} />
              <MoodDistributionChart range={selectedPeriod} />
            </div>

            {/* Weekly Comparison */}
            <div className="mb-8">
              <WeeklyComparisonChart />
            </div>

            {/* Quick Mood Entry */}
            <div className="mb-8">
              <QuickMoodEntry onClick={() => setShowMoodLogger(true)} />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button
                onClick={() => setShowMoodLogger(true)}
                className="bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl p-6 text-left hover:from-violet-500 hover:to-fuchsia-500 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Log Today's Mood</h3>
                <p className="text-slate-300 text-sm group-hover:text-white transition-colors">How are you feeling right now?</p>
              </button>

              <button
                onClick={() => setCurrentView('insights')}
                className="glass rounded-2xl p-6 text-left hover:bg-slate-800/50 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-violet-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">AI Insights</h3>
                <p className="text-slate-400 text-sm group-hover:text-white transition-colors">Discover patterns in your mood</p>
              </button>

              <button
                onClick={() => setCurrentView('export')}
                className="glass rounded-2xl p-6 text-left hover:bg-slate-800/50 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4">
                  <Download className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Export Data</h3>
                <p className="text-slate-400 text-sm group-hover:text-white transition-colors">Download your mood history</p>
              </button>
            </div>
          </>
        )}

        {/* Statistics View */}
        {currentView === 'statistics' && (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Mood Statistics</h2>
                <p className="text-slate-400">Track your emotional patterns over time</p>
              </div>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as 'week' | 'month' | 'year')}
                className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>

            <div className="mb-8">
              <MoodSummaryCards range={selectedPeriod} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <MoodStatisticsChart range={selectedPeriod} />
              <MoodDistributionChart range={selectedPeriod} />
            </div>

            <div className="mb-8">
              <WeeklyComparisonChart />
            </div>
          </>
        )}

        {/* History View */}
        {currentView === 'history' && (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Mood History</h2>
              <p className="text-slate-400">Browse and manage your mood entries</p>
            </div>

            <MoodHistory />
          </>
        )}

        {/* Calendar View */}
        {currentView === 'calendar' && (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Mood Calendar</h2>
              <p className="text-slate-400">Visualize your emotional journey over time</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <MoodHistory showCalendar />
              </div>
              <div>
                <YearCalendar entries={entries} />
              </div>
            </div>
          </>
        )}

        {/* AI Insights View */}
        {currentView === 'insights' && (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">AI Insights</h2>
              <p className="text-slate-400">Personalized analysis of your mood patterns using Gemini AI</p>
            </div>

            <AIInsights />
          </>
        )}

        {/* Export View */}
        {currentView === 'export' && (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Data Export</h2>
              <p className="text-slate-400">Export your mood data in various formats</p>
            </div>

            <DataExport />
          </>
        )}

        {/* Wellness View */}
        {currentView === 'wellness' && (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Daily Wellness</h2>
              <p className="text-slate-400">Your personalized wellness journey</p>
            </div>

            <DailyMoodInsight />
          </>
        )}

        {/* Timeline View */}
        {currentView === 'timeline' && (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Mood Timeline</h2>
              <p className="text-slate-400">Explore your emotional journey over time</p>
            </div>

            <MoodTimeline />
          </>
        )}

        {/* Challenges View */}
        {currentView === 'challenges' && (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Challenges</h2>
              <p className="text-slate-400">Complete challenges to earn XP and level up</p>
            </div>

            <Challenges />
          </>
        )}

        {/* Leaderboard View */}
        {currentView === 'leaderboard' && (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Leaderboard</h2>
              <p className="text-slate-400">See how you rank against other users</p>
            </div>

            <Leaderboard />
          </>
        )}

        {/* Achievements View */}
        {currentView === 'achievements' && (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Achievements</h2>
              <p className="text-slate-400">Track your progress and unlock badges</p>
            </div>

            <AchievementBadges />
          </>
        )}

        {/* Meditation View */}
        {currentView === 'meditation' && (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Guided Meditation</h2>
              <p className="text-slate-400">Find peace with 100+ meditation sessions</p>
            </div>

            <GuidedMeditation />
          </>
        )}

        {/* Yoga View */}
        {currentView === 'yoga' && (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Yoga Practice</h2>
              <p className="text-slate-400">Explore 100+ yoga poses and guided routines</p>
            </div>

            <YogaPractice />
          </>
        )}

        {/* Music View */}
        {currentView === 'music' && (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Music Therapy</h2>
              <p className="text-slate-400">Curated playlists for every mood</p>
            </div>

            <MusicTherapy />
          </>
        )}

        {/* Breathing Exercises View */}
        {currentView === 'breathing' && (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Breathing Exercises</h2>
              <p className="text-slate-400">Practice Pranayama and breathing techniques for wellness</p>
            </div>

            <BreathingExerciseComponent />
          </>
        )}

        {/* Sleep & Rest View */}
        {currentView === 'sleep' && (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Sleep & Rest</h2>
              <p className="text-slate-400">Discover peaceful content for better sleep</p>
            </div>

            <SleepRestComponent />
          </>
        )}

        {/* Exercise & Movement View */}
        {currentView === 'exercise' && (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Exercise & Movement</h2>
              <p className="text-slate-400">Find the perfect movement for your body and mind</p>
            </div>

            <ExerciseMovementComponent />
          </>
        )}

        {/* AR Experience View */}
        {currentView === 'ar' && (
          <ARExperienceHub
            onClose={() => setCurrentView('overview')}
            userId={user?.id || 'user1'}
            userName={user?.name || 'User'}
          />
        )}

        {/* Compliance Footer */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <span className="text-slate-500 text-sm">Your data is protected under:</span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs text-emerald-400">GDPR</span>
              <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs text-blue-400">CCPA</span>
              <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-xs text-purple-400">HIPAA</span>
              <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs text-amber-400">SOC 2</span>
              <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-xs text-cyan-400">PIPEDA</span>
            </div>
          </div>
        </div>
      </main>

      {/* Mood Logger Modal */}
      {showMoodLogger && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg">
            <button
              onClick={() => setShowMoodLogger(false)}
              className="absolute -top-2 -right-2 z-10 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <MoodLogger
              onClose={() => setShowMoodLogger(false)}
              onSave={() => setShowMoodLogger(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;

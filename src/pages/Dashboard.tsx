import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCompliance } from '../contexts/ComplianceContext';
import { Shield, Settings, Lock, Eye, User, TrendingUp, Plus, ChevronRight, Sparkles, Bell, Sun, Moon } from 'lucide-react';

const mockData = [
  { date: 'Mon', mood: 6, energy: 7 },
  { date: 'Tue', mood: 5, energy: 6 },
  { date: 'Wed', mood: 7, energy: 8 },
  { date: 'Thu', mood: 8, energy: 7 },
  { date: 'Fri', mood: 6, energy: 6 },
  { date: 'Sat', mood: 9, energy: 9 },
  { date: 'Sun', mood: 8, energy: 8 },
];

export function Dashboard() {
  const { user, logout } = useAuth();
  const { getComplianceStatus } = useCompliance();

  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const gdprStatus = getComplianceStatus('gdpr');

  // Calculate averages
  const avgMood = mockData.reduce((acc, d) => acc + d.mood, 0) / mockData.length;
  const avgEnergy = mockData.reduce((acc, d) => acc + d.energy, 0) / mockData.length;

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
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Good afternoon!</h2>
            <p className="text-slate-400">Here's your mood summary for this {selectedPeriod}</p>
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-lg text-white font-medium hover:from-violet-500 hover:to-fuchsia-500 transition-all">
              <Plus className="w-4 h-4" />
              Log Mood
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-sm">Average Mood</span>
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-violet-400" />
              </div>
            </div>
            <p className="text-4xl font-bold text-white mb-2">{avgMood.toFixed(1)}</p>
            <p className="text-emerald-400 text-sm flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +12% from last week
            </p>
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-sm">Average Energy</span>
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <p className="text-4xl font-bold text-white mb-2">{avgEnergy.toFixed(1)}</p>
            <p className="text-emerald-400 text-sm flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +8% from last week
            </p>
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-sm">Total Entries</span>
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <User className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <p className="text-4xl font-bold text-white mb-2">28</p>
            <p className="text-slate-400 text-sm">This month</p>
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-sm">Current Streak</span>
              <div className="w-10 h-10 rounded-xl bg-fuchsia-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-fuchsia-400" />
              </div>
            </div>
            <p className="text-4xl font-bold text-white mb-2">5</p>
            <p className="text-amber-400 text-sm flex items-center gap-1">
              Days logging
            </p>
          </div>
        </div>

        {/* Weekly Summary Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Mood Card */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Mood This Week</h3>
              <span className="text-slate-400 text-sm">Mon - Sun</span>
            </div>
            <div className="space-y-4">
              {mockData.map((day) => (
                <div key={day.date} className="flex items-center gap-4">
                  <span className="w-8 text-slate-400 text-sm font-medium">{day.date}</span>
                  <div className="flex-1 h-3 bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all"
                      style={{ width: `${(day.mood / 10) * 100}%` }}
                    />
                  </div>
                  <span className="text-white text-sm w-8 font-medium">{day.mood}/10</span>
                </div>
              ))}
            </div>
          </div>

          {/* Energy Card */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Energy This Week</h3>
              <span className="text-slate-400 text-sm">Mon - Sun</span>
            </div>
            <div className="space-y-4">
              {mockData.map((day) => (
                <div key={day.date} className="flex items-center gap-4">
                  <span className="w-8 text-slate-400 text-sm font-medium">{day.date}</span>
                  <div className="flex-1 h-3 bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all"
                      style={{ width: `${(day.energy / 10) * 100}%` }}
                    />
                  </div>
                  <span className="text-white text-sm w-8 font-medium">{day.energy}/10</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button className="bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl p-6 text-left hover:from-violet-500 hover:to-fuchsia-500 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Log Today's Mood</h3>
            <p className="text-slate-300 text-sm group-hover:text-white transition-colors">How are you feeling right now?</p>
          </button>

          <Link
            to="/settings/privacy"
            className="glass rounded-2xl p-6 text-left hover:bg-slate-800/50 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center mb-4">
              <Eye className="w-6 h-6 text-violet-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Privacy Dashboard</h3>
            <p className="text-slate-400 text-sm group-hover:text-white transition-colors">Manage your data and consents</p>
          </Link>

          <Link
            to="/settings/security"
            className="glass rounded-2xl p-6 text-left hover:bg-slate-800/50 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-fuchsia-500/20 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-fuchsia-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Security Center</h3>
            <p className="text-slate-400 text-sm group-hover:text-white transition-colors">2FA, passkeys, and sessions</p>
          </Link>
        </div>

        {/* Compliance Footer */}
        <div className="mt-8 pt-8 border-t border-slate-800">
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
    </div>
  );
}

export default Dashboard;

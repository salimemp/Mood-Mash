import { useState, useMemo } from 'react';
import { useMood, MoodEmotion, MOOD_EMOTIONS } from '../contexts/MoodContext';
import { useGamification } from '../contexts/GamificationContext';
import { MEDITATION_SESSIONS, MeditationSession, MeditationCategory, getRecommendedMeditations } from '../data/wellnessContent';
import {
  Play,
  Pause,
  Clock,
  Headphones,
  Star,
  Filter,
  Search,
  Calendar,
  User,
  Volume2,
  X,
  ChevronRight,
  Sparkles,
  Moon,
  Sun,
  Wind,
  Heart,
  Brain,
  Smile,
  Coffee,
  CheckCircle,
} from 'lucide-react';

const CATEGORY_CONFIG: Record<MeditationCategory, { icon: typeof Brain; color: string; label: string }> = {
  stress: { icon: Wind, color: '#26DE81', label: 'Stress Relief' },
  sleep: { icon: Moon, color: '#6B7FD7', label: 'Sleep' },
  anxiety: { icon: Heart, color: '#A8D8EA', label: 'Anxiety' },
  focus: { icon: Sparkles, color: '#FFD93D', label: 'Focus' },
  gratitude: { icon: Heart, color: '#26DE81', label: 'Gratitude' },
  self_love: { icon: Heart, color: '#F0932B', label: 'Self Love' },
  morning: { icon: Sun, color: '#FFD93D', label: 'Morning' },
  evening: { icon: Moon, color: '#6B7FD7', label: 'Evening' },
  energy: { icon: Wind, color: '#22A6B3', label: 'Energy' },
  breathing: { icon: Wind, color: '#22A6B3', label: 'Breathwork' },
};

export function GuidedMeditation() {
  const { entries, getEntriesByDate } = useMood();
  const { logSession, addExperience } = useGamification();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MeditationCategory | 'all'>('all');
  const [selectedLevel, setSelectedLevel] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [selectedSession, setSelectedSession] = useState<MeditationSession | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [moodBefore, setMoodBefore] = useState<MoodEmotion | null>(null);
  const [moodAfter, setMoodAfter] = useState<MoodEmotion | null>(null);

  const todayEntries = useMemo(() => {
    const today = new Date();
    return getEntriesByDate(today);
  }, [getEntriesByDate, entries]);

  const recommendedSessions = useMemo(() => {
    if (todayEntries.length > 0) {
      return getRecommendedMeditations(todayEntries[0].emotion);
    }
    return MEDITATION_SESSIONS.filter(s => s.category === 'stress').slice(0, 5);
  }, [todayEntries]);

  const filteredSessions = useMemo(() => {
    let filtered = [...MEDITATION_SESSIONS];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query) ||
        s.tags.some(t => t.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(s => s.category === selectedCategory);
    }

    // Level filter
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(s => s.level === selectedLevel);
    }

    return filtered;
  }, [searchQuery, selectedCategory, selectedLevel]);

  const handleSessionComplete = () => {
    if (selectedSession && moodBefore) {
      logSession({
        type: 'meditation',
        category: selectedSession.category,
        name: selectedSession.name,
        duration: selectedSession.duration,
        moodBefore,
        moodAfter: moodAfter || undefined,
      });
    }
    setSelectedSession(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setMoodBefore(null);
    setMoodAfter(null);
    setShowMoodSelector(false);
  };

  const handleStartSession = (session: MeditationSession) => {
    setSelectedSession(session);
    setCurrentTime(0);
    setIsPlaying(false);
    setShowMoodSelector(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
              <Headphones className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Guided Meditation</h2>
              <p className="text-slate-400">Find your inner peace with 100+ sessions</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-violet-400">
                {MEDITATION_SESSIONS.length}
              </div>
              <div className="text-xs text-slate-400">Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">
                {Object.keys(CATEGORY_CONFIG).length}
              </div>
              <div className="text-xs text-slate-400">Categories</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended for You */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Recommended for You</h3>
            <p className="text-slate-400 text-sm">
              Based on your recent mood: {todayEntries.length > 0 ? todayEntries[0].emotion : 'No mood logged'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {recommendedSessions.slice(0, 5).map((session) => (
            <button
              key={session.id}
              onClick={() => handleStartSession(session)}
              className="bg-slate-800/50 rounded-xl p-4 text-left hover:bg-slate-800 transition-colors group"
            >
              <div className="text-2xl mb-2">{session.icon}</div>
              <h4 className="text-sm font-medium text-white mb-1 line-clamp-1">{session.name}</h4>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Clock className="w-3 h-3" />
                <span>{session.duration} min</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search meditations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as MeditationCategory | 'all')}
          className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          <option value="all">All Categories</option>
          {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
            <option key={key} value={key}>{config.label}</option>
          ))}
        </select>

        <select
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value as 'all' | 'beginner' | 'intermediate' | 'advanced')}
          className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          <option value="all">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      {/* Category Quick Access */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(CATEGORY_CONFIG) as MeditationCategory[]).map((category) => {
          const config = CATEGORY_CONFIG[category];
          const count = MEDITATION_SESSIONS.filter(s => s.category === category).length;
          const isActive = selectedCategory === category;

          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(isActive ? 'all' : category)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isActive
                  ? 'text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
              style={isActive ? { backgroundColor: config.color + '40' } : undefined}
            >
              <config.icon className="w-4 h-4" style={{ color: config.color }} />
              <span>{config.label}</span>
              <span className="text-xs opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSessions.map((session) => (
          <MeditationCard
            key={session.id}
            session={session}
            onStart={() => handleStartSession(session)}
          />
        ))}
      </div>

      {filteredSessions.length === 0 && (
        <div className="text-center py-12">
          <Headphones className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No meditations found matching your criteria</p>
        </div>
      )}

      {/* Mood Before/After Selector */}
      {showMoodSelector && selectedSession && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md glass rounded-2xl p-6">
            <button
              onClick={() => {
                setShowMoodSelector(false);
                setSelectedSession(null);
              }}
              className="absolute top-4 right-4 p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="text-4xl mb-2">{selectedSession.icon}</div>
              <h3 className="text-xl font-bold text-white">{selectedSession.name}</h3>
              <p className="text-slate-400 text-sm">{selectedSession.duration} minutes</p>
            </div>

            {/* Mood Before */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-white mb-3">How are you feeling before?</h4>
              <MoodSelector
                selectedMood={moodBefore}
                onSelect={setMoodBefore}
              />
            </div>

            {/* Start Button */}
            <button
              onClick={() => setShowMoodSelector(false)}
              disabled={!moodBefore}
              className="w-full py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl text-white font-medium hover:from-violet-500 hover:to-fuchsia-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" />
              Start Meditation
            </button>
          </div>
        </div>
      )}

      {/* Active Session Player */}
      {selectedSession && !showMoodSelector && (
        <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-900/50 to-indigo-900/50" />

          {/* Content */}
          <div className="relative flex-1 flex flex-col items-center justify-center p-6">
            <button
              onClick={() => {
                setSelectedSession(null);
                setIsPlaying(false);
                setCurrentTime(0);
              }}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-6xl mb-6">{selectedSession.icon}</div>
            <h2 className="text-3xl font-bold text-white mb-2">{selectedSession.name}</h2>
            <p className="text-slate-300 text-center max-w-md mb-8">{selectedSession.description}</p>

            {/* Timer */}
            <div className="text-5xl font-bold text-white mb-8">
              {Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')}
            </div>

            {/* Progress */}
            <div className="w-full max-w-md mb-8">
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-white h-2 rounded-full transition-all"
                  style={{ width: `${(currentTime / (selectedSession.duration * 60)) * 100}%` }}
                />
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-6">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-20 h-20 rounded-full bg-white text-violet-600 flex items-center justify-center hover:scale-105 transition-transform"
              >
                {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
              </button>
            </div>

            {/* Session Info */}
            <div className="mt-8 flex items-center gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{selectedSession.narrator}</span>
              </div>
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                <span>Normal</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{selectedSession.duration} min</span>
              </div>
            </div>
          </div>

          {/* Complete Button */}
          <div className="relative p-6 border-t border-white/10">
            <button
              onClick={handleSessionComplete}
              className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl text-white font-medium hover:from-violet-500 hover:to-fuchsia-500 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Complete Session
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface MeditationCardProps {
  session: MeditationSession;
  onStart: () => void;
}

function MeditationCard({ session, onStart }: MeditationCardProps) {
  const categoryConfig = CATEGORY_CONFIG[session.category];

  return (
    <div className="glass rounded-xl overflow-hidden hover:ring-2 hover:ring-violet-500/50 transition-all group">
      <div
        className="h-32 flex items-center justify-center relative"
        style={{ background: `linear-gradient(135deg, ${categoryConfig.color}30, transparent)` }}
      >
        <span className="text-5xl">{session.icon}</span>
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            session.level === 'beginner' ? 'bg-emerald-500/20 text-emerald-400' :
            session.level === 'intermediate' ? 'bg-amber-500/20 text-amber-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            {session.level}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <categoryConfig.icon className="w-4 h-4" style={{ color: categoryConfig.color }} />
          <span className="text-xs text-slate-400">{categoryConfig.label}</span>
        </div>

        <h3 className="text-lg font-semibold text-white mb-1">{session.name}</h3>
        <p className="text-sm text-slate-400 line-clamp-2 mb-4">{session.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {session.duration} min
            </span>
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {session.narrator}
            </span>
          </div>

          <button
            onClick={onStart}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center text-white hover:scale-105 transition-transform"
          >
            <Play className="w-5 h-5 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

interface MoodSelectorProps {
  selectedMood: MoodEmotion | null;
  onSelect: (mood: MoodEmotion) => void;
}

function MoodSelector({ selectedMood, onSelect }: MoodSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {MOOD_EMOTIONS.slice(0, 8).map((mood) => (
        <button
          key={mood.key}
          onClick={() => onSelect(mood.key)}
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all ${
            selectedMood === mood.key
              ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900'
              : 'opacity-70 hover:opacity-100'
          }`}
          style={{ backgroundColor: mood.color + '30' }}
          title={mood.label}
        >
          {mood.emoji}
        </button>
      ))}
    </div>
  );
}

export default GuidedMeditation;

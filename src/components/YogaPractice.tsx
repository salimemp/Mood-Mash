import { useState, useMemo } from 'react';
import { useMood, MoodEmotion, MOOD_EMOTIONS } from '../contexts/MoodContext';
import { useGamification } from '../contexts/GamificationContext';
import { YOGA_POSES, YogaPose, YogaCategory, getRecommendedYoga } from '../data/wellnessContent';
import {
  Play,
  Pause,
  Clock,
  Star,
  Search,
  Filter,
  ChevronRight,
  User,
  Target,
  Flame,
  BookOpen,
  X,
  CheckCircle,
  RotateCcw,
  Activity,
} from 'lucide-react';

const CATEGORY_CONFIG: Record<YogaCategory, { icon: typeof Activity; color: string; label: string }> = {
  standing: { icon: Activity, color: '#26DE81', label: 'Standing' },
  seated: { icon: Activity, color: '#22A6B3', label: 'Seated' },
  supine: { icon: Activity, color: '#6B7FD7', label: 'Supine' },
  prone: { icon: Activity, color: '#F0932B', label: 'Prone' },
  balance: { icon: Activity, color: '#BE2EDD', label: 'Balance' },
  twist: { icon: Activity, color: '#FF6B6B', label: 'Twist' },
  backbend: { icon: Activity, color: '#EB4D4B', label: 'Backbend' },
  forward_fold: { icon: Activity, color: '#A8D8EA', label: 'Forward Fold' },
  inversion: { icon: Activity, color: '#FFD93D', label: 'Inversion' },
  restorative: { icon: Activity, color: '#7ED6DF', label: 'Restorative' },
};

export function YogaPractice() {
  const { entries, getEntriesByDate } = useMood();
  const { logSession } = useGamification();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<YogaCategory | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [selectedPose, setSelectedPose] = useState<YogaPose | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [moodBefore, setMoodBefore] = useState<MoodEmotion | null>(null);
  const [moodAfter, setMoodAfter] = useState<MoodEmotion | null>(null);

  const todayEntries = useMemo(() => {
    const today = new Date();
    return getEntriesByDate(today);
  }, [getEntriesByDate, entries]);

  const filteredPoses = useMemo(() => {
    let filtered = [...YOGA_POSES];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.sanskritName.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(p => p.level === selectedDifficulty);
    }

    return filtered;
  }, [searchQuery, selectedCategory, selectedDifficulty]);

  const posesByCategory = useMemo(() => {
    const grouped: Record<string, YogaPose[]> = {};
    YOGA_POSES.forEach(pose => {
      if (!grouped[pose.category]) {
        grouped[pose.category] = [];
      }
      grouped[pose.category].push(pose);
    });
    return grouped;
  }, []);

  const handleCompleteSession = () => {
    if (selectedPose && moodBefore) {
      logSession({
        type: 'yoga',
        category: selectedPose.category,
        name: selectedPose.name,
        duration: selectedPose.duration,
        moodBefore,
        moodAfter: moodAfter || undefined,
      });
    }
    setSelectedPose(null);
    setIsPlaying(false);
    setCurrentStep(0);
    setMoodBefore(null);
    setMoodAfter(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Yoga Practice</h2>
              <p className="text-slate-400">100+ poses and guided routines</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-400">{YOGA_POSES.length}</div>
              <div className="text-xs text-slate-400">Poses</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">10</div>
              <div className="text-xs text-slate-400">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-400">25</div>
              <div className="text-xs text-slate-400">Routines</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search poses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as YogaCategory | 'all')}
          className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="all">All Categories</option>
          {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
            <option key={key} value={key}>{config.label}</option>
          ))}
        </select>

        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value as 'all' | 'beginner' | 'intermediate' | 'advanced')}
          className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="all">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      {/* Category Quick Access */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(CATEGORY_CONFIG) as YogaCategory[]).map((category) => {
          const config = CATEGORY_CONFIG[category];
          const count = posesByCategory[category]?.length || 0;
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

      {/* Poses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPoses.map((pose) => (
          <PoseCard
            key={pose.id}
            pose={pose}
            onSelect={() => setSelectedPose(pose)}
          />
        ))}
      </div>

      {filteredPoses.length === 0 && (
        <div className="text-center py-12">
          <Activity className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No poses found matching your criteria</p>
        </div>
      )}

      {/* Selected Pose Detail Modal */}
      {selectedPose && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl glass rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setSelectedPose(null);
                setIsPlaying(false);
                setCurrentStep(0);
              }}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="bg-gradient-to-br from-teal-500/20 to-emerald-500/20 p-6">
              <div className="text-6xl mb-4 text-center">🧘</div>
              <h2 className="text-2xl font-bold text-white text-center">{selectedPose.name}</h2>
              <p className="text-slate-400 text-center italic">{selectedPose.sanskritName}</p>

              <div className="flex items-center justify-center gap-4 mt-4">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  selectedPose.level === 'beginner' ? 'bg-emerald-500/20 text-emerald-400' :
                  selectedPose.level === 'intermediate' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {selectedPose.level}
                </span>
                <span className="flex items-center gap-1 text-sm text-slate-400">
                  <Clock className="w-4 h-4" />
                  {selectedPose.duration}s hold
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <p className="text-slate-300">{selectedPose.description}</p>

              {/* Benefits */}
              <div>
                <h3 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                  <Star className="w-4 h-4 text-teal-400" />
                  Benefits
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedPose.benefits.map((benefit, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-teal-500/20 text-teal-400 rounded-full text-sm"
                    >
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>

              {/* Contraindications */}
              {selectedPose.precautions.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4 text-amber-400" />
                    Precautions
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPose.precautions.map((contra, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm"
                      >
                        {contra}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div>
                <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-violet-400" />
                  Instructions
                </h3>
                <ol className="space-y-2">
                  {selectedPose.instructions.map((instruction, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-300 text-sm">
                      <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      {instruction}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Mood Before/After */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-white mb-2">Mood Before</h4>
                  <MoodSelector selectedMood={moodBefore} onSelect={setMoodBefore} />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-white mb-2">Mood After</h4>
                  <MoodSelector selectedMood={moodAfter} onSelect={setMoodAfter} />
                </div>
              </div>

              {/* Start Button */}
              <button
                onClick={handleCompleteSession}
                disabled={!moodBefore}
                className="w-full py-4 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl text-white font-medium hover:from-teal-400 hover:to-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Complete Pose
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface PoseCardProps {
  pose: YogaPose;
  onSelect: () => void;
}

function PoseCard({ pose, onSelect }: PoseCardProps) {
  const categoryConfig = CATEGORY_CONFIG[pose.category];

  return (
    <button
      onClick={onSelect}
      className="glass rounded-xl p-4 text-left hover:ring-2 hover:ring-teal-500/50 transition-all group w-full"
    >
      <div className="flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ backgroundColor: categoryConfig.color + '30' }}
        >
          🧘
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-white">{pose.name}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              pose.level === 'beginner' ? 'bg-emerald-500/20 text-emerald-400' :
              pose.level === 'intermediate' ? 'bg-amber-500/20 text-amber-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {pose.level}
            </span>
          </div>

          <p className="text-xs text-slate-400 italic mb-2">{pose.sanskritName}</p>

          <p className="text-sm text-slate-300 line-clamp-2 mb-3">{pose.description}</p>

          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {pose.duration}s
            </span>
            <span
              className="flex items-center gap-1"
              style={{ color: categoryConfig.color }}
            >
              {categoryConfig.label}
            </span>
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-teal-400 transition-colors flex-shrink-0 mt-2" />
      </div>
    </button>
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
          className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${
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

export default YogaPractice;

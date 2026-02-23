import { useState, useMemo } from 'react';
import { useGamification, Achievement, AchievementCategory } from '../contexts/GamificationContext';
import {
  Award,
  Trophy,
  Star,
  Flame,
  Zap,
  Heart,
  Users,
  Globe,
  Sparkles,
  Search,
  Filter,
  Lock,
  CheckCircle,
  Trophy as TrophyIcon,
  Crown,
  Medal,
} from 'lucide-react';

const CATEGORY_CONFIG: Record<AchievementCategory, { icon: typeof Award; color: string; label: string }> = {
  mood: { icon: Sparkles, color: '#FFD93D', label: 'Mood' },
  streak: { icon: Flame, color: '#FF6B6B', label: 'Streak' },
  meditation: { icon: Heart, color: '#26DE81', label: 'Meditation' },
  yoga: { icon: Star, color: '#22A6B3', label: 'Yoga' },
  music: { icon: Zap, color: '#A8D8EA', label: 'Music' },
  social: { icon: Users, color: '#F0932B', label: 'Social' },
  exploration: { icon: Globe, color: '#BE2EDD', label: 'Explore' },
  mastery: { icon: Trophy, color: '#8B5CF6', label: 'Mastery' },
};

const RARITY_COLORS = {
  common: { bg: 'bg-slate-600/20', border: 'border-slate-500/30', glow: '' },
  rare: { bg: 'bg-blue-500/20', border: 'border-blue-500/50', glow: 'shadow-blue-500/20' },
  epic: { bg: 'bg-violet-500/20', border: 'border-violet-500/50', glow: 'shadow-violet-500/20' },
  legendary: { bg: 'bg-amber-500/20', border: 'border-amber-500/50', glow: 'shadow-amber-500/20' },
};

export function AchievementBadges() {
  const { achievements, unlockAchievement, getAchievementProgress } = useGamification();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all');
  const [showUnlocked, setShowUnlocked] = useState<boolean | undefined>(undefined);

  const filteredAchievements = useMemo(() => {
    let filtered = [...achievements];

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a =>
        a.name.toLowerCase().includes(query) ||
        a.description.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(a => a.category === selectedCategory);
    }

    // Filter by status
    if (showUnlocked !== undefined) {
      filtered = filtered.filter(a => showUnlocked ? !!a.unlockedAt : !a.unlockedAt);
    }

    // Sort: unlocked first, then by rarity
    filtered.sort((a, b) => {
      if (a.unlockedAt && !b.unlockedAt) return -1;
      if (!a.unlockedAt && b.unlockedAt) return 1;
      const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
      return rarityOrder[a.rarity] - rarityOrder[b.rarity];
    });

    return filtered;
  }, [achievements, searchQuery, selectedCategory, showUnlocked]);

  const stats = useMemo(() => {
    const unlocked = achievements.filter(a => a.unlockedAt).length;
    const totalXP = achievements
      .filter(a => a.unlockedAt)
      .reduce((sum, a) => sum + a.xpReward, 0);
    const byCategory = Object.keys(CATEGORY_CONFIG).reduce((acc, cat) => {
      const categoryAchievements = achievements.filter(a => a.category === cat);
      acc[cat as AchievementCategory] = {
        total: categoryAchievements.length,
        unlocked: categoryAchievements.filter(a => a.unlockedAt).length,
      };
      return acc;
    }, {} as Record<AchievementCategory, { total: number; unlocked: number }>);

    return { unlocked, total: achievements.length, totalXP, byCategory };
  }, [achievements]);

  const getRaritySort = (rarity: string) => {
    const order = { legendary: 0, epic: 1, rare: 2, common: 3 };
    return order[rarity as keyof typeof order] || 4;
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="glass rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Award className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Achievements</h2>
              <p className="text-slate-400">Collect badges by reaching milestones</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-400">{stats.unlocked}</div>
              <div className="text-xs text-slate-400">Unlocked</div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-white">{stats.total}</div>
              <div className="text-xs text-slate-400">Total Badges</div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-400">{stats.totalXP.toLocaleString()}</div>
              <div className="text-xs text-slate-400">XP Earned</div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-violet-400">
                {Math.round((stats.unlocked / stats.total) * 100)}%
              </div>
              <div className="text-xs text-slate-400">Completion</div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Progress */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(Object.keys(CATEGORY_CONFIG) as AchievementCategory[]).map((category) => {
          const config = CATEGORY_CONFIG[category];
          const categoryStats = stats.byCategory[category];
          const progress = categoryStats.total > 0
            ? (categoryStats.unlocked / categoryStats.total) * 100
            : 0;

          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(
                selectedCategory === category ? 'all' : category
              )}
              className={`glass rounded-xl p-4 text-left transition-all ${
                selectedCategory === category
                  ? 'ring-2 ring-violet-500'
                  : 'hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: config.color + '30' }}
                >
                  <config.icon className="w-5 h-5" style={{ color: config.color }} />
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium text-sm">{config.label}</div>
                  <div className="text-xs text-slate-400">
                    {categoryStats.unlocked}/{categoryStats.total}
                  </div>
                </div>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: config.color,
                  }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search achievements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUnlocked(undefined)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              showUnlocked === undefined
                ? 'bg-violet-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setShowUnlocked(true)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              showUnlocked === true
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Unlocked
          </button>
          <button
            onClick={() => setShowUnlocked(false)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              showUnlocked === false
                ? 'bg-slate-700 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Locked
          </button>
        </div>

        {selectedCategory !== 'all' && (
          <button
            onClick={() => setSelectedCategory('all')}
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            Clear filter
          </button>
        )}
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredAchievements.map((achievement) => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            onUnlock={() => unlockAchievement(achievement.id)}
          />
        ))}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="text-center py-12">
          <Award className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No achievements found</p>
        </div>
      )}

      {/* Rarity Legend */}
      <div className="glass rounded-xl p-4">
        <h4 className="text-sm font-medium text-white mb-3">Rarity Levels</h4>
        <div className="flex flex-wrap items-center gap-4">
          {Object.entries(RARITY_COLORS).map(([rarity, colors]) => (
            <div key={rarity} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${colors.bg} border ${colors.border}`} />
              <span className="text-xs text-slate-400 capitalize">{rarity}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface AchievementCardProps {
  achievement: Achievement;
  onUnlock: () => void;
}

function AchievementCard({ achievement, onUnlock }: AchievementCardProps) {
  const isUnlocked = !!achievement.unlockedAt;
  const progress = Math.min((achievement.progress / achievement.requirement) * 100, 100);
  const rarityColors = RARITY_COLORS[achievement.rarity];

  const getRarityGlow = () => {
    switch (achievement.rarity) {
      case 'legendary':
        return 'shadow-amber-500/50';
      case 'epic':
        return 'shadow-violet-500/40';
      case 'rare':
        return 'shadow-blue-500/30';
      default:
        return '';
    }
  };

  return (
    <div
      className={`glass rounded-xl p-4 relative overflow-hidden transition-all ${
        isUnlocked
          ? `shadow-lg ${getRarityGlow()}`
          : 'opacity-70 hover:opacity-100'
      }`}
    >
      {/* Locked Overlay */}
      {!isUnlocked && (
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/80 z-10" />
      )}

      {/* Unlocked Badge */}
      {isUnlocked && (
        <div className="absolute top-2 right-2">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
        </div>
      )}

      {/* Lock Icon */}
      {!isUnlocked && (
        <div className="absolute top-2 right-2">
          <Lock className="w-4 h-4 text-slate-500" />
        </div>
      )}

      {/* Icon */}
      <div
        className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-4xl mb-3 ${
          isUnlocked
            ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500'
            : 'bg-slate-700'
        }`}
        style={{ opacity: isUnlocked ? 1 : 0.5 }}
      >
        {achievement.icon}
      </div>

      {/* Content */}
      <div className="text-center">
        <h3 className={`font-semibold mb-1 ${isUnlocked ? 'text-white' : 'text-slate-400'}`}>
          {achievement.name}
        </h3>
        <p className="text-xs text-slate-500 mb-3">{achievement.description}</p>

        {/* Rarity Badge */}
        <div className={`inline-flex px-2 py-0.5 rounded-full text-xs mb-3 ${rarityColors.bg} ${rarityColors.border} border`}>
          <span className={`capitalize ${
            achievement.rarity === 'legendary' ? 'text-amber-400' :
            achievement.rarity === 'epic' ? 'text-violet-400' :
            achievement.rarity === 'rare' ? 'text-blue-400' :
            'text-slate-400'
          }`}>
            {achievement.rarity}
          </span>
        </div>

        {/* Progress */}
        {!isUnlocked && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-500">Progress</span>
              <span className="text-slate-400">
                {achievement.progress}/{achievement.requirement}
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-1.5">
              <div
                className="bg-gradient-to-r from-violet-500 to-fuchsia-500 h-1.5 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* XP Reward */}
        <div className="flex items-center justify-center gap-1 text-sm">
          <Star className="w-4 h-4 text-amber-400" />
          <span className={isUnlocked ? 'text-amber-400' : 'text-slate-500'}>
            +{achievement.xpReward} XP
          </span>
        </div>

        {/* Unlocked Date */}
        {isUnlocked && achievement.unlockedAt && (
          <div className="text-xs text-slate-500 mt-2">
            Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
}

export default AchievementBadges;

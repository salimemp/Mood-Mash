import { useState } from 'react';
import { useGamification } from '../contexts/GamificationContext';
import {
  Target,
  Calendar,
  Clock,
  Trophy,
  Star,
  Flame,
  RefreshCw,
  CheckCircle,
  Circle,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { DailyChallenge, WeeklyChallenge } from '../contexts/GamificationContext';

export function Challenges() {
  const {
    dailyChallenges,
    weeklyChallenges,
    completeChallenge,
    refreshChallenges,
    profile,
    getLevelFromXP,
  } = useGamification();

  const [activeTab, setActiveTab] = useState<'daily' | 'weekly'>('daily');

  const levelInfo = getLevelFromXP(profile.experience);

  const getProgressColor = (current: number, target: number) => {
    const progress = current / target;
    if (progress >= 1) return 'bg-emerald-500';
    if (progress >= 0.5) return 'bg-violet-500';
    return 'bg-slate-600';
  };

  const getProgressGradient = (current: number, target: number) => {
    const progress = current / target;
    if (progress >= 1) return 'from-emerald-500 to-teal-500';
    if (progress >= 0.5) return 'from-violet-500 to-fuchsia-500';
    return 'from-slate-600 to-slate-500';
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="glass rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Challenges</h2>
              <p className="text-slate-400">Complete challenges to earn XP</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Level */}
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{profile.level}</div>
              <div className="text-xs text-slate-400">Level</div>
            </div>

            {/* XP Progress */}
            <div className="w-32">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-400">XP</span>
                <span className="text-slate-300">
                  {levelInfo.currentXP}/{levelInfo.requiredXP}
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-violet-500 to-fuchsia-500 h-2 rounded-full transition-all"
                  style={{ width: `${levelInfo.progress}%` }}
                />
              </div>
            </div>

            {/* Streak */}
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-400">{profile.streak}</div>
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Flame className="w-3 h-3 text-orange-400" />
                <span>Day Streak</span>
              </div>
            </div>

            {/* Refresh Button */}
            <button
              onClick={refreshChallenges}
              className="p-3 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              title="Refresh challenges"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab('daily')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
            activeTab === 'daily'
              ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-5 h-5" />
          Daily
          <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
            {dailyChallenges.filter(c => c.completed).length}/{dailyChallenges.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('weekly')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
            activeTab === 'weekly'
              ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-5 h-5" />
          Weekly
          <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
            {weeklyChallenges.filter(c => c.completed).length}/{weeklyChallenges.length}
          </span>
        </button>
      </div>

      {/* Daily Challenges */}
      {activeTab === 'daily' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {dailyChallenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              isDaily
              onComplete={() => completeChallenge(challenge.id, true)}
              getProgressColor={getProgressColor}
              getProgressGradient={getProgressGradient}
            />
          ))}
        </div>
      )}

      {/* Weekly Challenges */}
      {activeTab === 'weekly' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {weeklyChallenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              isDaily={false}
              onComplete={() => completeChallenge(challenge.id, false)}
              getProgressColor={getProgressColor}
              getProgressGradient={getProgressGradient}
            />
          ))}
        </div>
      )}

      {/* Challenge Guide */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">How Challenges Work</h3>
            <p className="text-slate-400 text-sm">Complete daily and weekly challenges to earn XP</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center mb-3">
              <Circle className="w-5 h-5 text-violet-400" />
            </div>
            <h4 className="text-white font-medium mb-1">Discover</h4>
            <p className="text-slate-400 text-sm">
              New challenges appear each day. Some are easy, some push you to grow.
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center mb-3">
              <Target className="w-5 h-5 text-amber-400" />
            </div>
            <h4 className="text-white font-medium mb-1">Complete</h4>
            <p className="text-slate-400 text-sm">
              Log moods, practice wellness, and engage with the community.
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-3">
              <Star className="w-5 h-5 text-emerald-400" />
            </div>
            <h4 className="text-white font-medium mb-1">Earn</h4>
            <p className="text-slate-400 text-sm">
              Earn XP for each completed challenge and level up your profile.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ChallengeCardProps {
  challenge: DailyChallenge | WeeklyChallenge;
  isDaily: boolean;
  onComplete: () => void;
  getProgressColor: (current: number, target: number) => string;
  getProgressGradient: (current: number, target: number) => string;
}

function ChallengeCard({
  challenge,
  isDaily,
  onComplete,
  getProgressColor,
  getProgressGradient,
}: ChallengeCardProps) {
  const progress = isDaily
    ? (challenge.current / challenge.target) * 100
    : ('progress' in challenge ? challenge.progress : (challenge.current / challenge.target) * 100);

  const isComplete = challenge.completed || challenge.current >= challenge.target;

  return (
    <div
      className={`glass rounded-2xl p-6 relative overflow-hidden transition-all ${
        isComplete ? 'border-emerald-500/30' : ''
      }`}
    >
      {/* Complete Badge */}
      {isComplete && (
        <div className="absolute top-4 right-4">
          <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500/20 rounded-full text-xs text-emerald-400">
            <CheckCircle className="w-3 h-3" />
            <span>Complete!</span>
          </div>
        </div>
      )}

      {/* Icon */}
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-4"
        style={{
          background: `linear-gradient(135deg, ${getProgressColor(challenge.current, challenge.target).replace('bg-', '').replace('-500', '-400')}20, ${getProgressColor(challenge.current, challenge.target).replace('bg-', '').replace('-500', '-500')}10)`,
        }}
      >
        {challenge.icon}
      </div>

      {/* Content */}
      <h3 className="text-lg font-semibold text-white mb-1">{challenge.title}</h3>
      <p className="text-slate-400 text-sm mb-4">{challenge.description}</p>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-slate-400">Progress</span>
          <span className="text-white font-medium">
            {challenge.current}/{challenge.target}
          </span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all bg-gradient-to-r ${getProgressGradient(challenge.current, challenge.target)}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-400" />
          <span className="text-sm text-amber-400">+{challenge.xpReward} XP</span>
        </div>

        {!isComplete && (
          <button
            onClick={onComplete}
            className="px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-lg text-sm text-white font-medium hover:from-violet-500 hover:to-fuchsia-500 transition-all flex items-center gap-2"
          >
            Check In
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {isComplete && (
          <div className="flex items-center gap-2 text-emerald-400 text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>Done!</span>
          </div>
        )}
      </div>

      {/* Expiry */}
      {isDaily && (
        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-500">
          <span>Daily Challenge</span>
          <span>Expires at midnight</span>
        </div>
      )}

      {!isDaily && (
        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-500">
          <span>Weekly Challenge</span>
          <span>
            {new Date(challenge.expiresAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
      )}
    </div>
  );
}

export default Challenges;

import { useState, useMemo } from 'react';
import { useGamification, LeaderboardEntry } from '../contexts/GamificationContext';
import { useAuth } from '../contexts/AuthContext';
import {
  Trophy,
  Users,
  Flame,
  Star,
  Medal,
  Crown,
  ChevronUp,
  ChevronDown,
  Minus,
  Search,
  Filter,
} from 'lucide-react';

export function Leaderboard() {
  const { globalLeaderboard, friendLeaderboard, getUserRank, profile } = useGamification();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'global' | 'friends'>('global');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'rank' | 'points' | 'streak'>('rank');

  const currentUserRank = useMemo(() => {
    const score = profile.points + (profile.experience * 10);
    return getUserRank(score);
  }, [profile, getUserRank]);

  const displayData = useMemo(() => {
    const data = activeTab === 'global' ? globalLeaderboard : friendLeaderboard;

    // Add current user to the list
    const userEntry: LeaderboardEntry = {
      rank: currentUserRank,
      userId: profile.id,
      name: user?.name || 'You',
      avatar: profile.avatar,
      score: profile.points + (profile.experience * 10),
      level: profile.level,
      streak: profile.streak,
      isFriend: activeTab === 'friends',
      isCurrentUser: true,
    };

    const combined = [...data.filter(e => !e.isCurrentUser), userEntry];

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return combined.filter(e => e.name.toLowerCase().includes(query));
    }

    // Sort
    return combined.sort((a, b) => {
      if (sortBy === 'streak') return b.streak - a.streak;
      if (sortBy === 'points') return b.score - a.score;
      return a.rank - b.rank;
    });
  }, [activeTab, globalLeaderboard, friendLeaderboard, currentUserRank, profile, user, searchQuery, sortBy]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return { icon: Crown, color: 'text-yellow-400', bg: 'bg-yellow-400/20' };
    if (rank === 2) return { icon: Medal, color: 'text-slate-300', bg: 'bg-slate-300/20' };
    if (rank === 3) return { icon: Medal, color: 'text-amber-600', bg: 'bg-amber-600/20' };
    return { icon: Minus, color: 'text-slate-400', bg: 'bg-slate-700' };
  };

  const getPositionChange = (entry: LeaderboardEntry) => {
    // Mock position change for demo
    const changes = [-2, -1, 0, 1, 2];
    return changes[Math.floor(Math.random() * changes.length)];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Leaderboard</h2>
              <p className="text-slate-400">See how you rank against others</p>
            </div>
          </div>

          {/* Your Stats */}
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">#{currentUserRank}</div>
              <div className="text-xs text-slate-400">Your Rank</div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-violet-400">{profile.level}</div>
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Star className="w-3 h-3 text-violet-400" />
                <span>Level</span>
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-orange-400">{profile.streak}</div>
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Flame className="w-3 h-3 text-orange-400" />
                <span>Streak</span>
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-400">
                {profile.points + Math.floor(profile.experience * 10)}
              </div>
              <div className="text-xs text-slate-400">Points</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab('global')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
            activeTab === 'global'
              ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Trophy className="w-5 h-5" />
          Global
        </button>

        <button
          onClick={() => setActiveTab('friends')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
            activeTab === 'friends'
              ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-5 h-5" />
          Friends
          {friendLeaderboard.length > 0 && (
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
              {friendLeaderboard.length}
            </span>
          )}
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'rank' | 'points' | 'streak')}
          className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          <option value="rank">Sort by Rank</option>
          <option value="points">Sort by Points</option>
          <option value="streak">Sort by Streak</option>
        </select>
      </div>

      {/* Top 3 Podium */}
      {activeTab === 'global' && searchQuery === '' && (
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Top Performers</h3>

          <div className="flex items-end justify-center gap-4">
            {/* 2nd Place */}
            {displayData[1] && (
              <div className="text-center">
                <div className="mb-2 relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center text-3xl mx-auto">
                    {displayData[1].avatar}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-slate-400 flex items-center justify-center">
                    <Medal className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="text-slate-300 font-medium">{displayData[1].name}</div>
                <div className="text-sm text-slate-400">Level {displayData[1].level}</div>
                <div className="mt-2 px-3 py-1 bg-slate-700 rounded-full text-sm text-white">
                  #{displayData[1].rank}
                </div>
                <div className="h-24 w-24 bg-gradient-to-t from-slate-600 to-slate-500 rounded-t-xl mt-4" />
              </div>
            )}

            {/* 1st Place */}
            {displayData[0] && (
              <div className="text-center">
                <div className="mb-2 relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-4xl mx-auto ring-4 ring-yellow-400/30">
                    {displayData[0].avatar}
                  </div>
                  <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center">
                    <Crown className="w-5 h-5 text-yellow-900" />
                  </div>
                </div>
                <div className="text-white font-semibold text-lg">{displayData[0].name}</div>
                <div className="text-sm text-yellow-400">Level {displayData[0].level}</div>
                <div className="mt-2 px-4 py-1 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full text-sm text-yellow-900 font-medium">
                  #{displayData[0].rank}
                </div>
                <div className="h-32 w-28 bg-gradient-to-t from-yellow-600 to-yellow-500 rounded-t-xl mt-4" />
              </div>
            )}

            {/* 3rd Place */}
            {displayData[2] && (
              <div className="text-center">
                <div className="mb-2 relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center text-3xl mx-auto">
                    {displayData[2].avatar}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center">
                    <Medal className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="text-slate-300 font-medium">{displayData[2].name}</div>
                <div className="text-sm text-slate-400">Level {displayData[2].level}</div>
                <div className="mt-2 px-3 py-1 bg-slate-700 rounded-full text-sm text-white">
                  #{displayData[2].rank}
                </div>
                <div className="h-16 w-24 bg-gradient-to-t from-amber-700 to-amber-600 rounded-t-xl mt-4" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Leaderboard List */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 bg-slate-800/50 text-xs text-slate-400 uppercase tracking-wider">
          <div className="col-span-1 text-center">Rank</div>
          <div className="col-span-5">User</div>
          <div className="col-span-2 text-center">Level</div>
          <div className="col-span-2 text-center">Streak</div>
          <div className="col-span-2 text-right">Points</div>
        </div>

        <div className="divide-y divide-white/5">
          {displayData.slice(0, 20).map((entry, index) => {
            const { icon: RankIcon, color, bg } = getRankIcon(entry.rank);
            const positionChange = getPositionChange(entry);

            return (
              <div
                key={entry.userId}
                className={`grid grid-cols-12 gap-4 p-4 items-center transition-colors ${
                  entry.isCurrentUser
                    ? 'bg-violet-500/10 border-l-4 border-violet-500'
                    : 'hover:bg-slate-800/30'
                }`}
              >
                {/* Rank */}
                <div className="col-span-1 text-center">
                  <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mx-auto`}>
                    <RankIcon className={`w-4 h-4 ${color}`} />
                  </div>
                </div>

                {/* User */}
                <div className="col-span-5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center text-xl">
                    {entry.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{entry.name}</span>
                      {entry.isFriend && (
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                          Friend
                        </span>
                      )}
                      {entry.isCurrentUser && (
                        <span className="px-2 py-0.5 bg-violet-500/20 text-violet-400 text-xs rounded-full">
                          You
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>#{entry.rank}</span>
                      {positionChange !== 0 && (
                        <span className={`flex items-center gap-1 ${
                          positionChange > 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {positionChange > 0 ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                          {Math.abs(positionChange)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Level */}
                <div className="col-span-2 text-center">
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-slate-800 rounded-full">
                    <Star className="w-3 h-3 text-violet-400" />
                    <span className="text-sm text-white">{entry.level}</span>
                  </div>
                </div>

                {/* Streak */}
                <div className="col-span-2 text-center">
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-orange-500/20 rounded-full">
                    <Flame className="w-3 h-3 text-orange-400" />
                    <span className="text-sm text-white">{entry.streak}</span>
                  </div>
                </div>

                {/* Points */}
                <div className="col-span-2 text-right">
                  <span className="text-sm font-medium text-white">
                    {entry.score.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {displayData.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No users found</p>
          </div>
        )}
      </div>

      {/* Your Performance */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Your Performance</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-white mb-1">#{currentUserRank}</div>
            <div className="text-sm text-slate-400">Global Rank</div>
            <div className="mt-2 text-xs text-emerald-400">
              Top {Math.min(Math.round((currentUserRank / globalLeaderboard.length) * 100), 99)}%
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-violet-400 mb-1">{profile.level}</div>
            <div className="text-sm text-slate-400">Current Level</div>
            <div className="mt-2 text-xs text-slate-500">
              Level {profile.level + 1} in {100 - Math.round(profile.experience / 100)} entries
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-orange-400 mb-1">{profile.streak}</div>
            <div className="text-sm text-slate-400">Day Streak</div>
            <div className="mt-2 text-xs text-slate-500">
              Best: {profile.longestStreak} days
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-emerald-400 mb-1">
              {profile.points + Math.floor(profile.experience * 10)}
            </div>
            <div className="text-sm text-slate-400">Total Points</div>
            <div className="mt-2 text-xs text-slate-500">
              +{Math.floor(profile.experience * 10)} this week
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;

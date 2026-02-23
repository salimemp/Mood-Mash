import { useState, useMemo, useRef, useEffect } from 'react';
import { useMood, MoodEmotion, MOOD_EMOTIONS } from '../contexts/MoodContext';
import { useGamification } from '../contexts/GamificationContext';
import { MUSIC_PLAYLISTS, MusicPlaylist, getRecommendedPlaylist } from '../data/wellnessContent';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Shuffle,
  Repeat,
  Heart,
  Clock,
  Search,
  ChevronRight,
  Music2,
  Sparkles,
  X,
  CheckCircle,
} from 'lucide-react';

export function MusicTherapy() {
  const { entries, getEntriesByDate } = useMood();
  const { logSession } = useGamification();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMood, setSelectedMood] = useState<MoodEmotion | 'all'>('all');
  const [selectedPlaylist, setSelectedPlaylist] = useState<MusicPlaylist | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeat, setRepeat] = useState<'off' | 'all' | 'one'>('off');
  const [progress, setProgress] = useState(0);
  const [moodAfter, setMoodAfter] = useState<MoodEmotion | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  const todayEntries = useMemo(() => {
    const today = new Date();
    return getEntriesByDate(today);
  }, [getEntriesByDate, entries]);

  const currentMood = todayEntries.length > 0 ? todayEntries[0].emotion : null;
  const recommendedPlaylist = useMemo(() => {
    if (currentMood) {
      const playlists = getRecommendedPlaylist(currentMood);
      return playlists.length > 0 ? playlists[0] : MUSIC_PLAYLISTS[0];
    }
    return MUSIC_PLAYLISTS[0];
  }, [currentMood]);

  const filteredPlaylists = useMemo(() => {
    let filtered = [...MUSIC_PLAYLISTS];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.genre.toLowerCase().includes(query) ||
        p.tags.some(t => t.toLowerCase().includes(query))
      );
    }

    if (selectedMood !== 'all') {
      filtered = filtered.filter(p => p.mood === selectedMood);
    }

    return filtered;
  }, [searchQuery, selectedMood]);

  const moodOptions: { value: MoodEmotion | 'all'; label: string; emoji: string }[] = [
    { value: 'all', label: 'All Moods', emoji: '🎵' },
    { value: 'happy', label: 'Happy', emoji: '😊' },
    { value: 'calm', label: 'Calm', emoji: '😌' },
    { value: 'excited', label: 'Energetic', emoji: '⚡' },
    { value: 'confident', label: 'Focus', emoji: '🎯' },
    { value: 'tired', label: 'Sleepy', emoji: '😴' },
    { value: 'sad', label: 'Sad', emoji: '😢' },
    { value: 'stressed', label: 'Stressed', emoji: '😣' },
  ];

  // Simulate audio playback
  useEffect(() => {
    if (isPlaying) {
      progressInterval.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            handleNext();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [isPlaying]);

  const handleNext = () => {
    if (selectedPlaylist) {
      const nextIndex = isShuffle
        ? Math.floor(Math.random() * selectedPlaylist.tracks.length)
        : (currentTrackIndex + 1) % selectedPlaylist.tracks.length;
      setCurrentTrackIndex(nextIndex);
      setProgress(0);
    }
  };

  const handlePrev = () => {
    if (selectedPlaylist) {
      const prevIndex = currentTrackIndex === 0
        ? selectedPlaylist.tracks.length - 1
        : currentTrackIndex - 1;
      setCurrentTrackIndex(prevIndex);
      setProgress(0);
    }
  };

  const handleComplete = () => {
    if (selectedPlaylist && moodAfter) {
      logSession({
        type: 'music',
        category: selectedPlaylist.mood,
        name: selectedPlaylist.name,
        duration: Math.ceil(selectedPlaylist.duration * progress / 100),
        moodAfter,
      });
    }
    setIsPlaying(false);
    setSelectedPlaylist(null);
    setProgress(0);
    setCurrentTrackIndex(0);
    setMoodAfter(null);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
              <Music2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Music Therapy</h2>
              <p className="text-slate-400">Curated playlists for every mood</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-400">{MUSIC_PLAYLISTS.length}</div>
              <div className="text-xs text-slate-400">Playlists</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">
                {MUSIC_PLAYLISTS.reduce((sum, p) => sum + p.trackCount, 0)}
              </div>
              <div className="text-xs text-slate-400">Tracks</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-rose-400">35+</div>
              <div className="text-xs text-slate-400">Hours</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended */}
      {recommendedPlaylist && (
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Recommended for You</h3>
              <p className="text-slate-400 text-sm">
                Based on your current mood: {currentMood || 'No mood logged'}
              </p>
            </div>
          </div>

          <div
            className="relative h-48 rounded-xl overflow-hidden cursor-pointer group"
            onClick={() => setSelectedPlaylist(recommendedPlaylist)}
          >
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${recommendedPlaylist.color}40, #1E293B)`,
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-8 h-8 text-white ml-1" />
              </div>
            </div>
            <div className="absolute bottom-4 left-4 right-4">
              <div className="text-2xl mb-1">🎵</div>
              <h4 className="text-xl font-bold text-white">{recommendedPlaylist.name}</h4>
              <p className="text-sm text-slate-300">{recommendedPlaylist.description}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                <span>{recommendedPlaylist.duration} min</span>
                <span>{recommendedPlaylist.trackCount} tracks</span>
                <span>{recommendedPlaylist.genre}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search playlists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {moodOptions.map((mood) => (
            <button
              key={mood.value}
              onClick={() => setSelectedMood(mood.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedMood === mood.value
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span>{mood.emoji}</span>
              <span>{mood.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Playlists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlaylists.map((playlist) => (
          <PlaylistCard
            key={playlist.id}
            playlist={playlist}
            onSelect={() => setSelectedPlaylist(playlist)}
          />
        ))}
      </div>

      {filteredPlaylists.length === 0 && (
        <div className="text-center py-12">
          <Music2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No playlists found</p>
        </div>
      )}

      {/* Player Modal */}
      {selectedPlaylist && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl glass rounded-2xl overflow-hidden">
            {/* Close Button */}
            <button
              onClick={() => {
                setIsPlaying(false);
                setSelectedPlaylist(null);
                setProgress(0);
              }}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Background */}
            <div
              className="absolute inset-0 opacity-30"
              style={{ backgroundColor: selectedPlaylist.color }}
            />

            {/* Content */}
            <div className="relative p-8">
              {/* Album Art */}
              <div className="w-48 h-48 mx-auto mb-6 rounded-xl flex items-center justify-center text-6xl shadow-2xl"
                style={{ backgroundColor: selectedPlaylist.color + '40' }}
              >
                {selectedPlaylist.mood === 'tired' ? '🌙' :
                 selectedPlaylist.mood === 'calm' ? '🌊' :
                 selectedPlaylist.mood === 'stressed' ? '🌿' :
                 selectedPlaylist.mood === 'energetic' ? '⚡' : '🎵'}
              </div>

              {/* Info */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-1">{selectedPlaylist.name}</h2>
                <p className="text-slate-300 text-sm mb-2">{selectedPlaylist.description}</p>
                <div className="flex items-center justify-center gap-4 text-sm text-slate-400">
                  <span>{selectedPlaylist.genre}</span>
                  <span>•</span>
                  <span>{selectedPlaylist.trackCount} tracks</span>
                  <span>•</span>
                  <span>{selectedPlaylist.duration} min</span>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="w-full bg-white/20 rounded-full h-1 mb-2 cursor-pointer">
                  <div
                    className="bg-white h-1 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>{formatDuration(Math.floor(progress * selectedPlaylist.duration * 60 / 100))}</span>
                  <span>{formatDuration(selectedPlaylist.duration * 60)}</span>
                </div>
              </div>

              {/* Current Track */}
              {selectedPlaylist.tracks[currentTrackIndex] && (
                <div className="text-center mb-6">
                  <div className="text-white font-medium">
                    {selectedPlaylist.tracks[currentTrackIndex].title}
                  </div>
                  <div className="text-sm text-slate-400">
                    {selectedPlaylist.tracks[currentTrackIndex].artist}
                  </div>
                </div>
              )}

              {/* Controls */}
              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={() => setIsShuffle(!isShuffle)}
                  className={`p-3 rounded-full transition-colors ${
                    isShuffle ? 'bg-pink-500 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Shuffle className="w-5 h-5" />
                </button>

                <button
                  onClick={handlePrev}
                  className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  <SkipBack className="w-6 h-6" />
                </button>

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center text-white hover:scale-105 transition-transform"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                </button>

                <button
                  onClick={handleNext}
                  className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  <SkipForward className="w-6 h-6" />
                </button>

                <button
                  onClick={() => setRepeat(prev => {
                    if (prev === 'off') return 'all';
                    if (prev === 'all') return 'one';
                    return 'off';
                  })}
                  className={`p-3 rounded-full transition-colors ${
                    repeat !== 'off' ? 'bg-pink-500 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Repeat className="w-5 h-5" />
                </button>
              </div>

              {/* Volume */}
              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(Number(e.target.value));
                    setIsMuted(false);
                  }}
                  className="w-24 accent-pink-500"
                />
              </div>

              {/* Mood After & Complete */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <h4 className="text-sm font-medium text-white mb-3 text-center">How do you feel after listening?</h4>
                <MoodSelector selectedMood={moodAfter} onSelect={setMoodAfter} />

                <button
                  onClick={handleComplete}
                  disabled={!moodAfter}
                  className="w-full mt-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl text-white font-medium hover:from-pink-400 hover:to-rose-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Complete Session
                </button>
              </div>
            </div>

            {/* Track List */}
            <div className="relative bg-slate-900/80 max-h-48 overflow-y-auto">
              {selectedPlaylist.tracks.map((track, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentTrackIndex(index);
                    setProgress(0);
                  }}
                  className={`w-full flex items-center gap-4 p-3 hover:bg-white/5 transition-colors ${
                    index === currentTrackIndex ? 'bg-pink-500/20' : ''
                  }`}
                >
                  <span className="text-slate-500 w-6 text-center">
                    {index === currentTrackIndex && isPlaying ? (
                      <span className="flex items-center justify-center gap-0.5">
                        <span className="w-1 h-3 bg-pink-500 animate-pulse" />
                        <span className="w-1 h-4 bg-pink-500 animate-pulse" style={{ animationDelay: '0.1s' }} />
                        <span className="w-1 h-2 bg-pink-500 animate-pulse" style={{ animationDelay: '0.2s' }} />
                      </span>
                    ) : (
                      index + 1
                    )}
                  </span>
                  <div className="flex-1 text-left">
                    <div className={`text-sm ${index === currentTrackIndex ? 'text-pink-400' : 'text-white'}`}>
                      {track.title}
                    </div>
                    <div className="text-xs text-slate-500">{track.artist}</div>
                  </div>
                  <span className="text-xs text-slate-500">{formatDuration(track.duration)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface PlaylistCardProps {
  playlist: MusicPlaylist;
  onSelect: () => void;
}

function PlaylistCard({ playlist, onSelect }: PlaylistCardProps) {
  return (
    <button
      onClick={onSelect}
      className="glass rounded-xl overflow-hidden hover:ring-2 hover:ring-pink-500/50 transition-all group text-left"
    >
      <div
        className="h-32 flex items-center justify-center relative"
        style={{ background: `linear-gradient(135deg, ${playlist.color}40, transparent)` }}
      >
        <span className="text-5xl">{playlist.mood === 'tired' ? '🌙' :
         playlist.mood === 'calm' ? '🌊' :
         playlist.mood === 'stressed' ? '🌿' :
         playlist.mood === 'energetic' ? '⚡' : '🎵'}</span>

        <div className="absolute bottom-3 right-3">
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5 text-white ml-0.5" />
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-white mb-1">{playlist.name}</h3>
        <p className="text-sm text-slate-400 line-clamp-2 mb-3">{playlist.description}</p>

        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Music2 className="w-3 h-3" />
              {playlist.trackCount}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {playlist.duration}m
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-slate-700">{playlist.genre}</span>
        </div>

        <div className="flex flex-wrap gap-1 mt-3">
          {playlist.tags.slice(0, 3).map((tag, i) => (
            <span
              key={i}
              className="px-2 py-0.5 bg-slate-700/50 rounded text-xs text-slate-400"
            >
              {tag}
            </span>
          ))}
        </div>
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
    <div className="flex flex-wrap justify-center gap-2">
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

export default MusicTherapy;

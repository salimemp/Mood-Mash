import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Moon,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Smartphone,
  Sparkles,
  Clock,
  Target,
  Heart,
  Music,
  CloudRain,
  Wind,
  ChevronRight,
  X,
  BookOpen,
  Headphones,
  Mic,
  Waves,
  Sun,
  Star,
  Cloud
} from 'lucide-react';
import {
  SLEEP_CONTENT,
  SleepContent,
  getRecommendedSleep
} from '../data/wellnessContent';
import { useMood } from '../contexts/MoodContext';
import { createWellnessSession } from '../services/wellnessService';

interface SleepSessionProps {
  content?: SleepContent;
  onComplete?: (duration: number, contentId: string) => void;
  onARStart?: () => void;
}

const SleepRestComponent: React.FC<SleepSessionProps> = ({
  content: initialContent,
  onComplete,
  onARStart
}) => {
  const [selectedContent, setSelectedContent] = useState<SleepContent | null>(initialContent || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showAR, setShowAR] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [volume, setVolume] = useState(70);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { entries } = useMood();

  // Get the most recent mood entry for personalized recommendations
  const currentMood = entries.length > 0 ? entries[0] : null;

  const categories = [
    { id: 'all', label: 'All', icon: Moon },
    { id: 'story', label: 'Stories', icon: BookOpen },
    { id: 'soundscape', label: 'Soundscapes', icon: Cloud },
    { id: 'asmr', label: 'ASMR', icon: Headphones },
    { id: 'binaural', label: 'Binaural', icon: Waves },
    { id: 'meditation', label: 'Meditation', icon: Star },
    { id: 'education', label: 'Education', icon: Sun },
  ];

  const getContent = useCallback(() => {
    const hour = new Date().getHours();
    let timeCategory = 'evening';
    if (hour >= 5 && hour < 12) timeCategory = 'morning';
    else if (hour >= 12 && hour < 18) timeCategory = 'afternoon';
    else if (hour >= 18 && hour < 22) timeCategory = 'evening';
    else timeCategory = 'night';

    if (selectedCategory === 'all') {
      if (currentMood) {
        return getRecommendedSleep(currentMood.emotion, timeCategory);
      }
      return SLEEP_CONTENT.slice(0, 12);
    }
    return SLEEP_CONTENT.filter(c => c.category === selectedCategory);
  }, [selectedCategory, currentMood]);

  const startContent = useCallback((content: SleepContent) => {
    setSelectedContent(content);
    setTotalTime(content.duration * 60);
    setTimeRemaining(content.duration * 60);
    setIsPlaying(false);
    setIsPaused(false);
  }, []);

  const startPlayback = useCallback(() => {
    if (!selectedContent) return;

    setIsPlaying(true);
    setIsPaused(false);

    if (soundEnabled && audioRef.current) {
      audioRef.current.volume = volume / 100;
      audioRef.current.play().catch(console.error);
    }
  }, [selectedContent, soundEnabled, volume]);

  const pausePlayback = useCallback(() => {
    setIsPaused(true);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  const resumePlayback = useCallback(() => {
    setIsPaused(false);
    if (audioRef.current && soundEnabled) {
      audioRef.current.play().catch(console.error);
    }
  }, [soundEnabled]);

  const resetPlayback = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setIsPaused(false);
    setTimeRemaining(selectedContent ? selectedContent.duration * 60 : 0);
  }, [selectedContent]);

  useEffect(() => {
    if (!isPlaying || isPaused || !selectedContent) return;

    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0.1) {
          setIsPlaying(false);

          // Save session to backend
          if (selectedContent) {
            const durationMinutes = Math.round((selectedContent.duration * 60 - (selectedContent.duration * 60 - prev)) / 60) || selectedContent.duration;
            createWellnessSession({
              type: 'sleep',
              category: selectedContent.category,
              name: selectedContent.name,
              description: selectedContent.description,
              duration_minutes: durationMinutes,
              guided: true,
            }).then(result => {
              if (result.success) {
                console.log('[SleepRest] Session saved to backend');
              } else {
                console.log('[SleepRest] Session save failed:', result.error);
              }
            });
          }

          if (onComplete && selectedContent) {
            onComplete(selectedContent.duration * 60, selectedContent.id);
          }
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, isPaused, selectedContent, onComplete]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'story': return BookOpen;
      case 'soundscape': return Cloud;
      case 'asmr': return Headphones;
      case 'binaural': return Waves;
      case 'meditation': return Star;
      case 'education': return Sun;
      default: return Moon;
    }
  };

  const handleARToggle = () => {
    setShowAR(!showAR);
    if (!showAR && onARStart) {
      onARStart();
    }
  };

  if (!selectedContent) {
    return (
      <div className="min-h-screen bg-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/20 mb-4">
              <Moon className="w-8 h-8 text-indigo-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Sleep & Rest</h1>
            <p className="text-slate-400">Discover peaceful content for better sleep</p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-500 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <cat.icon className="w-4 h-4" />
                {cat.label}
              </button>
            ))}
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getContent().map(content => (
              <button
                key={content.id}
                onClick={() => startContent(content)}
                className="glass rounded-xl p-4 text-left hover:bg-white/5 transition-all group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className={`p-2 rounded-lg ${
                    content.category === 'story' ? 'bg-amber-500/20 text-amber-400' :
                    content.category === 'soundscape' ? 'bg-blue-500/20 text-blue-400' :
                    content.category === 'asmr' ? 'bg-pink-500/20 text-pink-400' :
                    content.category === 'binaural' ? 'bg-purple-500/20 text-purple-400' :
                    content.category === 'meditation' ? 'bg-indigo-500/20 text-indigo-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {React.createElement(getCategoryIcon(content.category), { className: 'w-5 h-5' })}
                  </div>
                  <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">
                    {content.duration} min
                  </span>
                </div>
                <h3 className="text-white font-semibold group-hover:text-indigo-400 transition-colors mb-1">
                  {content.name}
                </h3>
                <p className="text-slate-400 text-sm mb-3">{content.description}</p>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {content.duration} min
                  </span>
                  <span className="flex items-center gap-1 capitalize">
                    <Target className="w-3 h-3" />
                    {content.level}
                  </span>
                  {content.narrator && (
                    <span className="flex items-center gap-1">
                      <Mic className="w-3 h-3" />
                      {content.narrator}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1 mt-3">
                  {content.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-xs text-indigo-400/70 bg-indigo-500/10 px-2 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => setSelectedContent(null)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
            Back to Content
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            {selectedContent.arEnvironment && (
              <button
                onClick={handleARToggle}
                className={`p-2 rounded-lg transition-colors ${
                  showAR ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-800 text-slate-400'
                }`}
              >
                <Sparkles className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Volume Slider */}
        {soundEnabled && (
          <div className="mb-6 glass rounded-xl p-4">
            <div className="flex items-center gap-4">
              <VolumeX className="w-5 h-5 text-slate-400" />
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <Volume2 className="w-5 h-5 text-slate-400" />
            </div>
          </div>
        )}

        {/* Content Info */}
        <div className="text-center mb-8">
          <div className={`inline-flex p-4 rounded-2xl mb-4 ${
            selectedContent.category === 'story' ? 'bg-amber-500/20' :
            selectedContent.category === 'soundscape' ? 'bg-blue-500/20' :
            selectedContent.category === 'asmr' ? 'bg-pink-500/20' :
            selectedContent.category === 'binaural' ? 'bg-purple-500/20' :
            selectedContent.category === 'meditation' ? 'bg-indigo-500/20' :
            'bg-green-500/20'
          }`}>
            {React.createElement(getCategoryIcon(selectedContent.category), {
              className: `w-10 h-10 ${
                selectedContent.category === 'story' ? 'text-amber-400' :
                selectedContent.category === 'soundscape' ? 'text-blue-400' :
                selectedContent.category === 'asmr' ? 'text-pink-400' :
                selectedContent.category === 'binaural' ? 'text-purple-400' :
                selectedContent.category === 'meditation' ? 'text-indigo-400' :
                'text-green-400'
              }`
            })}
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{selectedContent.name}</h1>
          <p className="text-slate-400 mb-4">{selectedContent.description}</p>
          <div className="flex items-center justify-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {selectedContent.duration} min
            </span>
            <span className="flex items-center gap-1 capitalize">
              <Target className="w-4 h-4" />
              {selectedContent.level}
            </span>
            {selectedContent.narrator && (
              <span className="flex items-center gap-1">
                <Mic className="w-4 h-4" />
                {selectedContent.narrator}
              </span>
            )}
          </div>
        </div>

        {/* Audio Visualizer Placeholder */}
        <div className="relative flex items-center justify-center mb-8">
          <div className="w-80 h-40 glass rounded-2xl flex items-center justify-center overflow-hidden">
            {isPlaying ? (
              <div className="flex items-end gap-1 h-20">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t"
                    style={{
                      height: `${Math.random() * 100}%`,
                      animation: `soundBar ${0.5 + Math.random() * 0.5}s ease-in-out infinite`,
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center">
                <Moon className="w-16 h-16 text-indigo-400/50 mx-auto mb-2" />
                <p className="text-slate-400">Press play to begin</p>
              </div>
            )}
          </div>
        </div>

        {/* Timer Display */}
        <div className="text-center mb-8">
          <p className="text-5xl font-bold text-white mb-2">
            {Math.floor(timeRemaining / 60)}:{(Math.floor(timeRemaining % 60)).toString().padStart(2, '0')}
          </p>
          <p className="text-slate-400">
            {isPlaying && timeRemaining > 0
              ? `${Math.floor((selectedContent.duration * 60 - timeRemaining) / 60)}m ${Math.floor((selectedContent.duration * 60 - timeRemaining) % 60)}s elapsed`
              : `${selectedContent.duration} minutes`
            }
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          {!isPlaying && timeRemaining === selectedContent.duration * 60 && (
            <button
              onClick={startPlayback}
              className="flex items-center gap-2 px-8 py-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full font-semibold transition-all"
            >
              <Play className="w-5 h-5" />
              Play
            </button>
          )}

          {isPlaying && !isPaused && (
            <button
              onClick={pausePlayback}
              className="flex items-center gap-2 px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-full font-semibold transition-all"
            >
              <Pause className="w-5 h-5" />
              Pause
            </button>
          )}

          {isPaused && (
            <button
              onClick={resumePlayback}
              className="flex items-center gap-2 px-8 py-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full font-semibold transition-all"
            >
              <Play className="w-5 h-5" />
              Resume
            </button>
          )}

          {(isPlaying || timeRemaining < selectedContent.duration * 60) && (
            <button
              onClick={resetPlayback}
              className="p-4 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-full transition-all"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Benefits */}
        <div className="mt-8 glass rounded-xl p-4">
          <p className="text-center text-slate-400 mb-4">Benefits</p>
          <div className="flex flex-wrap justify-center gap-2">
            {selectedContent.benefits.map(benefit => (
              <span key={benefit} className="px-4 py-2 bg-indigo-500/20 text-indigo-400 rounded-full text-sm">
                {benefit}
              </span>
            ))}
          </div>
        </div>

        {/* Audio Type Info */}
        <div className="mt-4 glass rounded-xl p-4">
          <p className="text-center text-slate-400 mb-2">Audio Type</p>
          <div className="flex items-center justify-center gap-2 text-white">
            {selectedContent.audioType === 'narration' && <><BookOpen className="w-5 h-5 text-amber-400" /> Narration</>}
            {selectedContent.audioType === 'ambient' && <><CloudRain className="w-5 h-5 text-blue-400" /> Ambient Sounds</>}
            {selectedContent.audioType === 'music' && <><Music className="w-5 h-5 text-pink-400" /> Music</>}
            {selectedContent.audioType === 'binaural' && <><Waves className="w-5 h-5 text-purple-400" /> Binaural Beats</>}
          </div>
        </div>

        {/* Completion */}
        {timeRemaining === 0 && (
          <div className="mt-8 text-center">
            <h3 className="text-xl font-semibold text-white mb-4">Sweet Dreams!</h3>
            <p className="text-slate-400 mb-6">Your sleep content has finished playing</p>
            <button
              onClick={() => setSelectedContent(null)}
              className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full font-semibold transition-all"
            >
              Try Another Content
            </button>
          </div>
        )}
      </div>

      {/* AR Overlay */}
      {showAR && (
        <div className="fixed inset-0 z-50 bg-slate-900/95 flex items-center justify-center">
          <div className="absolute top-4 right-4">
            <button
              onClick={() => setShowAR(false)}
              className="p-2 bg-slate-800 rounded-full text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="text-center">
            <div className="w-64 h-64 mx-auto mb-8 rounded-full bg-gradient-to-br from-indigo-500/50 to-purple-500/50 flex items-center justify-center animate-pulse">
              <Moon className="w-24 h-24 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">AR Experience</h3>
            <p className="text-slate-400">
              AR environment: {selectedContent.arEnvironment || 'Default'}
            </p>
          </div>
        </div>
      )}

      {/* Hidden Audio Element */}
      <audio ref={audioRef} loop>
        <source src="" type="audio/mp3" />
      </audio>
    </div>
  );
};

export default SleepRestComponent;

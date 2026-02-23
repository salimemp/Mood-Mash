import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Wind,
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
  Zap,
  Moon,
  Brain,
  ChevronRight,
  X
} from 'lucide-react';
import {
  BREATHING_EXERCISES,
  BreathingExercise,
  getRecommendedBreathing
} from '../data/wellnessContent';
import { useMood } from '../contexts/MoodContext';
import { createWellnessSession } from '../services/wellnessService';

type BreathPhase = 'inhale' | 'holdInhale' | 'exhale' | 'holdExhale' | 'ready' | 'complete';

interface BreathingSessionProps {
  exercise?: BreathingExercise;
  onComplete?: (duration: number, exerciseId: string) => void;
  onARStart?: () => void;
}

const BreathingExerciseComponent: React.FC<BreathingSessionProps> = ({
  exercise: initialExercise,
  onComplete,
  onARStart
}) => {
  const [selectedExercise, setSelectedExercise] = useState<BreathingExercise | null>(initialExercise || null);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [phase, setPhase] = useState<BreathPhase>('ready');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [showAR, setShowAR] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const phaseTimeRef = useRef(0);
  const { entries } = useMood();

  // Get the most recent mood entry for personalized recommendations
  const currentMood = entries.length > 0 ? entries[0] : null;

  const categories = [
    { id: 'all', label: 'All', icon: Sparkles },
    { id: 'calming', label: 'Calming', icon: Wind },
    { id: 'energizing', label: 'Energizing', icon: Zap },
    { id: 'balancing', label: 'Balancing', icon: Target },
    { id: 'sleep', label: 'Sleep', icon: Moon },
    { id: 'focus', label: 'Focus', icon: Brain },
    { id: 'advanced', label: 'Advanced', icon: Heart },
  ];

  const getExercises = useCallback(() => {
    if (selectedCategory === 'all') {
      if (currentMood) {
        return getRecommendedBreathing('morning', currentMood.emotion);
      }
      return BREATHING_EXERCISES.slice(0, 12);
    }
    return BREATHING_EXERCISES.filter(e => e.category === selectedCategory);
  }, [selectedCategory, currentMood]);

  const startExercise = useCallback((exercise: BreathingExercise) => {
    setSelectedExercise(exercise);
    setTotalTime(exercise.duration * 60);
    setTimeRemaining(exercise.duration * 60);
    setCycleCount(0);
    setPhase('ready');
    setIsActive(false);
    setIsPaused(false);
  }, []);

  const startSession = useCallback(() => {
    if (!selectedExercise) return;

    setIsActive(true);
    setIsPaused(false);
    setPhase('inhale');
    phaseTimeRef.current = 0;
  }, [selectedExercise]);

  const pauseSession = useCallback(() => {
    setIsPaused(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  const resumeSession = useCallback(() => {
    setIsPaused(false);
  }, []);

  const resetSession = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsActive(false);
    setIsPaused(false);
    setPhase('ready');
    setTimeRemaining(selectedExercise ? selectedExercise.duration * 60 : 0);
    setCycleCount(0);
    phaseTimeRef.current = 0;
  }, [selectedExercise]);

  useEffect(() => {
    if (!isActive || isPaused || !selectedExercise) return;

    const { pattern } = selectedExercise;
    const cycleDuration = pattern.inhale + pattern.holdAfterInhale + pattern.exhale + pattern.holdAfterExhale;

    intervalRef.current = setInterval(() => {
      phaseTimeRef.current += 0.1;
      setTimeRemaining(prev => Math.max(0, prev - 0.1));

      const currentPhaseTime = phaseTimeRef.current;

      let newPhase: BreathPhase = phase;

      if (currentPhaseTime < pattern.inhale) {
        newPhase = 'inhale';
      } else if (currentPhaseTime < pattern.inhale + pattern.holdAfterInhale) {
        newPhase = 'holdInhale';
      } else if (currentPhaseTime < pattern.inhale + pattern.holdAfterInhale + pattern.exhale) {
        newPhase = 'exhale';
      } else if (currentPhaseTime < cycleDuration) {
        newPhase = 'holdExhale';
      } else {
        phaseTimeRef.current = 0;
        setCycleCount(prev => prev + 1);
        newPhase = 'inhale';

        if (hapticsEnabled && navigator.vibrate) {
          navigator.vibrate(100);
        }
      }

      setPhase(newPhase);

      if (timeRemaining <= 0) {
        setPhase('complete');
        setIsActive(false);

        // Save session to backend
        if (selectedExercise) {
          const durationMinutes = Math.round((selectedExercise.duration * 60 - timeRemaining) / 60) || selectedExercise.duration;
          createWellnessSession({
            type: 'breathing',
            category: selectedExercise.category,
            name: selectedExercise.name,
            description: selectedExercise.description,
            duration_minutes: durationMinutes,
            guided: true,
          }).then(result => {
            if (result.success) {
              console.log('[BreathingExercise] Session saved to backend');
            } else {
              console.log('[BreathingExercise] Session save failed:', result.error);
            }
          });
        }

        if (onComplete && selectedExercise) {
          onComplete(selectedExercise.duration * 60, selectedExercise.id);
        }
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
    }, 100);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isPaused, selectedExercise, timeRemaining, hapticsEnabled, onComplete]);

  const getPhaseInstruction = () => {
    switch (phase) {
      case 'ready': return 'Ready';
      case 'inhale': return 'Breathe In';
      case 'holdInhale': return 'Hold';
      case 'exhale': return 'Breathe Out';
      case 'holdExhale': return 'Hold';
      case 'complete': return 'Complete!';
      default: return '';
    }
  };

  const getProgress = () => {
    if (!selectedExercise) return 0;
    const { pattern } = selectedExercise;
    const cycleDuration = pattern.inhale + pattern.holdAfterInhale + pattern.exhale + pattern.holdAfterExhale;
    const currentPosition = phaseTimeRef.current % cycleDuration;
    return (currentPosition / cycleDuration) * 100;
  };

  const getCircleScale = () => {
    if (!selectedExercise) return 1;
    const { pattern } = selectedExercise;
    const cycleDuration = pattern.inhale + pattern.holdAfterInhale + pattern.exhale + pattern.holdAfterExhale;
    const currentPosition = phaseTimeRef.current % cycleDuration;

    if (currentPosition < pattern.inhale) {
      return 1 + (currentPosition / pattern.inhale) * 0.5;
    } else if (currentPosition < pattern.inhale + pattern.holdAfterInhale) {
      return 1.5;
    } else if (currentPosition < pattern.inhale + pattern.holdAfterInhale + pattern.exhale) {
      const exhalePosition = currentPosition - pattern.inhale - pattern.holdAfterInhale;
      return 1.5 - (exhalePosition / pattern.exhale) * 0.5;
    } else {
      return 1;
    }
  };

  const handleARToggle = () => {
    setShowAR(!showAR);
    if (!showAR && onARStart) {
      onARStart();
    }
  };

  if (!selectedExercise) {
    return (
      <div className="min-h-screen bg-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-sky-500/20 mb-4">
              <Wind className="w-8 h-8 text-sky-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Breathing Exercises</h1>
            <p className="text-slate-400">Choose a breathing practice to begin</p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-sky-500 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <cat.icon className="w-4 h-4" />
                {cat.label}
              </button>
            ))}
          </div>

          {/* Exercise Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getExercises().map(exercise => (
              <button
                key={exercise.id}
                onClick={() => startExercise(exercise)}
                className="glass rounded-xl p-4 text-left hover:bg-white/5 transition-all group"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-white font-semibold group-hover:text-sky-400 transition-colors">
                    {exercise.name}
                  </h3>
                  <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">
                    {exercise.duration} min
                  </span>
                </div>
                <p className="text-slate-400 text-sm mb-3">{exercise.description}</p>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {exercise.duration} min
                  </span>
                  <span className="flex items-center gap-1 capitalize">
                    <Target className="w-3 h-3" />
                    {exercise.level}
                  </span>
                  {exercise.haptics && (
                    <span className="flex items-center gap-1">
                      <Smartphone className="w-3 h-3" />
                      Haptic
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1 mt-3">
                  {exercise.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-xs text-sky-400/70 bg-sky-500/10 px-2 py-0.5 rounded">
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
            onClick={() => setSelectedExercise(null)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
            Back to Exercises
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setHapticsEnabled(!hapticsEnabled)}
              className={`p-2 rounded-lg transition-colors ${
                hapticsEnabled ? 'bg-sky-500/20 text-sky-400' : 'bg-slate-800 text-slate-400'
              }`}
            >
              <Smartphone className="w-5 h-5" />
            </button>
            {selectedExercise.arEnvironment && (
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

        {/* Exercise Info */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">{selectedExercise.name}</h1>
          <p className="text-slate-400">{selectedExercise.description}</p>
          <div className="flex items-center justify-center gap-4 mt-4 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {selectedExercise.duration} min
            </span>
            <span className="flex items-center gap-1 capitalize">
              <Target className="w-4 h-4" />
              {selectedExercise.level}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              {selectedExercise.benefits[0]}
            </span>
          </div>
        </div>

        {/* Breathing Circle */}
        <div className="relative flex items-center justify-center mb-8">
          {/* Outer Ring */}
          <div className="absolute w-80 h-80 rounded-full border-2 border-slate-700" />

          {/* Progress Ring */}
          <svg className="absolute w-80 h-80 -rotate-90">
            <circle
              cx="160"
              cy="160"
              r="156"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray={`${getProgress() * 9.82} 982`}
              className="text-sky-500 transition-all duration-100"
            />
          </svg>

          {/* Breathing Circle */}
          <div
            className="w-64 h-64 rounded-full bg-gradient-to-br from-sky-500/30 to-purple-500/30 flex items-center justify-center transition-all duration-500"
            style={{
              transform: `scale(${getCircleScale()})`,
            }}
          >
            <div className="text-center">
              <p className="text-3xl font-bold text-white mb-2">{getPhaseInstruction()}</p>
              {isActive && (
                <p className="text-sky-400">
                  Cycle {cycleCount + 1}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Timer Display */}
        <div className="text-center mb-8">
          <p className="text-5xl font-bold text-white mb-2">
            {Math.floor(timeRemaining / 60)}:{(Math.floor(timeRemaining % 60)).toString().padStart(2, '0')}
          </p>
          <p className="text-slate-400">
            {phase === 'complete'
              ? 'Session Complete!'
              : `${selectedExercise.duration * 60 - Math.floor(timeRemaining)}s / ${selectedExercise.duration * 60}s`
            }
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          {!isActive && phase !== 'complete' && (
            <button
              onClick={startSession}
              className="flex items-center gap-2 px-8 py-4 bg-sky-500 hover:bg-sky-600 text-white rounded-full font-semibold transition-all"
            >
              <Play className="w-5 h-5" />
              Start
            </button>
          )}

          {isActive && !isPaused && (
            <button
              onClick={pauseSession}
              className="flex items-center gap-2 px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-full font-semibold transition-all"
            >
              <Pause className="w-5 h-5" />
              Pause
            </button>
          )}

          {isPaused && (
            <button
              onClick={resumeSession}
              className="flex items-center gap-2 px-8 py-4 bg-sky-500 hover:bg-sky-600 text-white rounded-full font-semibold transition-all"
            >
              <Play className="w-5 h-5" />
              Resume
            </button>
          )}

          {(isActive || phase !== 'ready') && (
            <button
              onClick={resetSession}
              className="p-4 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-full transition-all"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Pattern Info */}
        {phase !== 'complete' && (
          <div className="mt-8 glass rounded-xl p-4">
            <p className="text-center text-slate-400 mb-4">Breathing Pattern</p>
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <p className="text-sky-400 font-semibold">{selectedExercise.pattern.inhale}s</p>
                <p className="text-xs text-slate-500">Inhale</p>
              </div>
              <div className="text-center">
                <p className="text-purple-400 font-semibold">{selectedExercise.pattern.holdAfterInhale}s</p>
                <p className="text-xs text-slate-500">Hold</p>
              </div>
              <div className="text-center">
                <p className="text-sky-400 font-semibold">{selectedExercise.pattern.exhale}s</p>
                <p className="text-xs text-slate-500">Exhale</p>
              </div>
              <div className="text-center">
                <p className="text-purple-400 font-semibold">{selectedExercise.pattern.holdAfterExhale}s</p>
                <p className="text-xs text-slate-500">Hold</p>
              </div>
            </div>
          </div>
        )}

        {/* Benefits */}
        {phase === 'complete' && (
          <div className="mt-8 text-center">
            <h3 className="text-xl font-semibold text-white mb-4">Great job!</h3>
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {selectedExercise.benefits.map(benefit => (
                <span key={benefit} className="px-4 py-2 bg-sky-500/20 text-sky-400 rounded-full text-sm">
                  {benefit}
                </span>
              ))}
            </div>
            <button
              onClick={() => setSelectedExercise(null)}
              className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-full font-semibold transition-all"
            >
              Try Another Exercise
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
            <div className="w-64 h-64 mx-auto mb-8 rounded-full bg-gradient-to-br from-sky-500/50 to-purple-500/50 flex items-center justify-center animate-pulse">
              <Wind className="w-24 h-24 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">AR Experience</h3>
            <p className="text-slate-400">
              AR environment: {selectedExercise.arEnvironment || 'Default'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BreathingExerciseComponent;

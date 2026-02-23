import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Activity,
  Play,
  Pause,
  RotateCcw,
  Smartphone,
  Sparkles,
  Clock,
  Target,
  Heart,
  Zap,
  Wind,
  ChevronRight,
  X,
  Flame,
  Timer,
  AlertCircle,
  CheckCircle,
  Footprints,
  Dumbbell,
  Music,
  Users
} from 'lucide-react';
import {
  EXERCISE_MOVEMENTS,
  ExerciseMovement,
  getRecommendedExercise
} from '../data/wellnessContent';
import { useMood } from '../contexts/MoodContext';
import { createWellnessSession } from '../services/wellnessService';

interface ExerciseSessionProps {
  exercise?: ExerciseMovement;
  onComplete?: (duration: number, exerciseId: string) => void;
  onARStart?: () => void;
}

const ExerciseMovementComponent: React.FC<ExerciseSessionProps> = ({
  exercise: initialExercise,
  onComplete,
  onARStart
}) => {
  const [selectedExercise, setSelectedExercise] = useState<ExerciseMovement | null>(initialExercise || null);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [showAR, setShowAR] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [caloriesBurned, setCaloriesBurned] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { entries } = useMood();

  // Get the most recent mood entry for personalized recommendations
  const currentMood = entries.length > 0 ? entries[0] : null;

  const categories = [
    { id: 'all', label: 'All', icon: Activity },
    { id: 'tai_chi', label: 'Tai Chi', icon: Wind },
    { id: 'qigong', label: 'Qigong', icon: Zap },
    { id: 'stretching', label: 'Stretching', icon: Target },
    { id: 'walking', label: 'Walking', icon: Footprints },
    { id: 'chair', label: 'Chair', icon: Users },
    { id: 'hiit', label: 'HIIT', icon: Flame },
    { id: 'bodyweight', label: 'Bodyweight', icon: Dumbbell },
    { id: 'dance', label: 'Dance', icon: Music },
  ];

  const getExercises = useCallback(() => {
    if (selectedCategory === 'all') {
      return getRecommendedExercise('intermediate', 20);
    }
    return EXERCISE_MOVEMENTS.filter(e => e.category === selectedCategory);
  }, [selectedCategory]);

  const startExercise = useCallback((exercise: ExerciseMovement) => {
    setSelectedExercise(exercise);
    setTotalTime(exercise.duration * 60);
    setTimeRemaining(exercise.duration * 60);
    setCurrentStep(0);
    setCaloriesBurned(0);
    setIsActive(false);
    setIsPaused(false);
  }, []);

  const startSession = useCallback(() => {
    if (!selectedExercise) return;

    setIsActive(true);
    setIsPaused(false);
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
    setTimeRemaining(selectedExercise ? selectedExercise.duration * 60 : 0);
    setCurrentStep(0);
    setCaloriesBurned(0);
  }, [selectedExercise]);

  useEffect(() => {
    if (!isActive || isPaused || !selectedExercise) return;

    const caloriesPerSecond = selectedExercise.caloriesBurned / (selectedExercise.duration * 60);

    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0.1) {
          setIsActive(false);

          // Save session to backend
          if (selectedExercise) {
            const durationMinutes = Math.round((selectedExercise.duration * 60 - prev) / 60) || selectedExercise.duration;
            createWellnessSession({
              type: 'stretching',
              category: selectedExercise.category,
              name: selectedExercise.name,
              description: selectedExercise.description,
              duration_minutes: durationMinutes,
              guided: true,
            }).then(result => {
              if (result.success) {
                console.log('[ExerciseMovement] Session saved to backend');
              } else {
                console.log('[ExerciseMovement] Session save failed:', result.error);
              }
            });
          }

          if (onComplete && selectedExercise) {
            onComplete(selectedExercise.duration * 60, selectedExercise.id);
          }
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          return 0;
        }
        return prev - 0.1;
      });

      setCaloriesBurned(prev => prev + caloriesPerSecond * 0.1);

      // Update current step based on progress
      const progress = 1 - (timeRemaining / totalTime);
      const stepIndex = Math.min(
        Math.floor(progress * selectedExercise.instructions.length),
        selectedExercise.instructions.length - 1
      );
      setCurrentStep(stepIndex);
    }, 100);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isPaused, selectedExercise, timeRemaining, totalTime, onComplete]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'tai_chi': return Wind;
      case 'qigong': return Zap;
      case 'stretching': return Target;
      case 'walking': return Footprints;
      case 'chair': return Users;
      case 'hiit': return Flame;
      case 'bodyweight': return Dumbbell;
      case 'dance': return Music;
      default: return Activity;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'tai_chi': return 'bg-teal-500/20 text-teal-400';
      case 'qigong': return 'bg-orange-500/20 text-orange-400';
      case 'stretching': return 'bg-blue-500/20 text-blue-400';
      case 'walking': return 'bg-green-500/20 text-green-400';
      case 'chair': return 'bg-purple-500/20 text-purple-400';
      case 'hiit': return 'bg-red-500/20 text-red-400';
      case 'bodyweight': return 'bg-amber-500/20 text-amber-400';
      case 'dance': return 'bg-pink-500/20 text-pink-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  const handleARToggle = () => {
    setShowAR(!showAR);
    if (!showAR && onARStart) {
      onARStart();
    }
  };

  const getProgress = () => {
    if (!selectedExercise) return 0;
    return ((selectedExercise.duration * 60 - timeRemaining) / (selectedExercise.duration * 60)) * 100;
  };

  if (!selectedExercise) {
    return (
      <div className="min-h-screen bg-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-500/20 mb-4">
              <Activity className="w-8 h-8 text-orange-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Exercise & Movement</h1>
            <p className="text-slate-400">Find the perfect movement for your body and mind</p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-orange-500 text-white'
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
                  <div className={`p-2 rounded-lg ${getCategoryColor(exercise.category)}`}>
                    {React.createElement(getCategoryIcon(exercise.category), { className: 'w-5 h-5' })}
                  </div>
                  <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">
                    {exercise.duration} min
                  </span>
                </div>
                <h3 className="text-white font-semibold group-hover:text-orange-400 transition-colors mb-1">
                  {exercise.name}
                </h3>
                <p className="text-slate-400 text-sm mb-3">{exercise.description}</p>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {exercise.duration} min
                  </span>
                  <span className="flex items-center gap-1">
                    <Flame className="w-3 h-3" />
                    {exercise.caloriesBurned} cal
                  </span>
                  <span className="flex items-center gap-1 capitalize">
                    <Target className="w-3 h-3" />
                    {exercise.level}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mt-3">
                  {exercise.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-xs text-orange-400/70 bg-orange-500/10 px-2 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
                {exercise.arPoseDetection && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-purple-400">
                    <Smartphone className="w-3 h-3" />
                    AR Pose Detection
                  </div>
                )}
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
            {selectedExercise.arPoseDetection && (
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
          <div className={`inline-flex p-4 rounded-2xl mb-4 ${getCategoryColor(selectedExercise.category)}`}>
            {React.createElement(getCategoryIcon(selectedExercise.category), { className: 'w-10 h-10' })}
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{selectedExercise.name}</h1>
          <p className="text-slate-400 mb-4">{selectedExercise.description}</p>
          <div className="flex items-center justify-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {selectedExercise.duration} min
            </span>
            <span className="flex items-center gap-1">
              <Flame className="w-4 h-4" />
              {selectedExercise.caloriesBurned} cal
            </span>
            <span className="flex items-center gap-1 capitalize">
              <Target className="w-4 h-4" />
              {selectedExercise.level}
            </span>
          </div>
        </div>

        {/* Progress Ring */}
        <div className="relative flex items-center justify-center mb-8">
          <div className="w-64 h-64 rounded-full border-4 border-slate-700 flex items-center justify-center">
            <div className="text-center">
              <p className="text-4xl font-bold text-white mb-1">
                {Math.floor(timeRemaining / 60)}:{(Math.floor(timeRemaining % 60)).toString().padStart(2, '0')}
              </p>
              <p className="text-slate-400 text-sm">remaining</p>
            </div>
            <svg className="absolute w-64 h-64 -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="120"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray={`${getProgress() * 7.54} 754`}
                className="text-orange-500 transition-all duration-100"
              />
            </svg>
          </div>
        </div>

        {/* Current Instruction */}
        {isActive && (
          <div className="mb-8 glass rounded-xl p-6 text-center">
            <p className="text-slate-400 text-sm mb-2">Current Step</p>
            <p className="text-xl font-semibold text-white">
              {selectedExercise.instructions[currentStep]}
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              {[...Array(selectedExercise.instructions.length)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === currentStep ? 'bg-orange-500' : i < currentStep ? 'bg-orange-500/50' : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Calories Display */}
        <div className="flex items-center justify-center gap-8 mb-8">
          <div className="text-center">
            <div className="flex items-center gap-2 text-orange-400 mb-1">
              <Flame className="w-5 h-5" />
              <span className="text-2xl font-bold">{Math.round(caloriesBurned)}</span>
            </div>
            <p className="text-slate-400 text-sm">Calories Burned</p>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-2 text-sky-400 mb-1">
              <Timer className="w-5 h-5" />
              <span className="text-2xl font-bold">{Math.floor((selectedExercise.duration * 60 - timeRemaining) / 60)}</span>
            </div>
            <p className="text-slate-400 text-sm">Minutes</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          {!isActive && timeRemaining === selectedExercise.duration * 60 && (
            <button
              onClick={startSession}
              className="flex items-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-semibold transition-all"
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
              className="flex items-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-semibold transition-all"
            >
              <Play className="w-5 h-5" />
              Resume
            </button>
          )}

          {(isActive || timeRemaining < selectedExercise.duration * 60) && (
            <button
              onClick={resetSession}
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
            {selectedExercise.benefits.map(benefit => (
              <span key={benefit} className="px-4 py-2 bg-orange-500/20 text-orange-400 rounded-full text-sm">
                {benefit}
              </span>
            ))}
          </div>
        </div>

        {/* Precautions */}
        {selectedExercise.precautions.length > 0 && (
          <div className="mt-4 glass rounded-xl p-4">
            <div className="flex items-center gap-2 text-amber-400 mb-2">
              <AlertCircle className="w-5 h-5" />
              <p className="font-semibold">Precautions</p>
            </div>
            <ul className="space-y-1">
              {selectedExercise.precautions.map((precaution, index) => (
                <li key={index} className="text-slate-400 text-sm flex items-start gap-2">
                  <span className="text-amber-400">•</span>
                  {precaution}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Completion */}
        {timeRemaining === 0 && (
          <div className="mt-8 text-center">
            <div className="inline-flex p-4 rounded-full bg-green-500/20 mb-4">
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Great Work!</h3>
            <p className="text-slate-400 mb-4">You burned {Math.round(caloriesBurned)} calories</p>
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {selectedExercise.benefits.map(benefit => (
                <span key={benefit} className="px-4 py-2 bg-orange-500/20 text-orange-400 rounded-full text-sm">
                  {benefit}
                </span>
              ))}
            </div>
            <button
              onClick={() => setSelectedExercise(null)}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-semibold transition-all"
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
            <div className="w-64 h-64 mx-auto mb-8 rounded-full bg-gradient-to-br from-orange-500/50 to-red-500/50 flex items-center justify-center animate-pulse">
              <Activity className="w-24 h-24 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">AR Pose Detection</h3>
            <p className="text-slate-400">
              AR environment: {selectedExercise.arEnvironment || 'Default'}
            </p>
            <p className="text-slate-500 text-sm mt-2">
              Real-time pose tracking enabled
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseMovementComponent;

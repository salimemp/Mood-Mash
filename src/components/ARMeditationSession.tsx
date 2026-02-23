import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, Wind, Sparkles, Heart, Brain } from 'lucide-react';
import { MeditationSession } from '../data/wellnessContent';
import { ARSessionManager, AREnvironment, generateBreathingGuide } from '../data/arIntegration';

interface ARMeditationSessionProps {
  session: MeditationSession;
  onComplete: (duration: number, mindfulnessScore: number) => void;
  onClose: () => void;
  environment?: AREnvironment;
}

interface SessionState {
  isPlaying: boolean;
  isPaused: boolean;
  currentPhase: string;
  phaseProgress: number;
  overallProgress: number;
  breathingPhase: string;
  breathingCount: number;
  mindfulnessScore: number;
  audioEnabled: boolean;
  environment: AREnvironment;
  showStats: boolean;
}

interface BreathingGuide {
  phase: string;
  duration: number;
  progress: number;
}

const DEFAULT_ENVIRONMENT: AREnvironment = {
  type: 'nature',
  timeOfDay: 'sunset',
  weather: 'clear',
};

export function ARMeditationSession({
  session,
  onComplete,
  onClose,
  environment = DEFAULT_ENVIRONMENT,
}: ARMeditationSessionProps) {
  const [state, setState] = useState<SessionState>({
    isPlaying: false,
    isPaused: false,
    currentPhase: 'preparation',
    phaseProgress: 0,
    overallProgress: 0,
    breathingPhase: 'inhale',
    breathingCount: 4,
    mindfulnessScore: 0,
    audioEnabled: true,
    environment,
    showStats: true,
  });

  const arManager = React.useRef<ARSessionManager | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const breathingStopRef = useRef<(() => void) | null>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Initialize AR
  useEffect(() => {
    const initAR = async () => {
      arManager.current = new ARSessionManager();
      await arManager.current.initialize({
        type: 'meditation',
        environment: state.environment,
        enableAudioGuide: state.audioEnabled,
        enablePoseOverlay: false,
        enableHapticFeedback: true,
        difficulty: session.level as 'beginner' | 'intermediate' | 'advanced',
      });

      if (containerRef.current) {
        arManager.current.mountToElement(containerRef.current, state.environment);
      }
    };

    initAR();

    return () => {
      if (breathingStopRef.current) {
        breathingStopRef.current();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (arManager.current) {
        arManager.current.endSession();
      }
    };
  }, [state.environment, state.audioEnabled, session.level]);

  // Start meditation session
  const startSession = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: true, isPaused: false }));
    startTimeRef.current = Date.now();

    // Start breathing guide
    breathingStopRef.current = generateBreathingGuide(
      session.category === 'breathing' ? '4-7-8' : 'coherent',
      (phase, duration) => {
        setState(prev => ({
          ...prev,
          breathingPhase: phase,
          breathingCount: duration,
        }));
      }
    );

    // Start animation loop
    runAnimation();
  }, [session.category]);

  // Animation loop for visual effects
  const runAnimation = useCallback(() => {
    if (!startTimeRef.current) return;

    const elapsed = Date.now() - startTimeRef.current;
    const totalDuration = session.duration * 60 * 1000; // Convert to milliseconds

    if (elapsed >= totalDuration) {
      // Session complete
      const finalScore = calculateMindfulnessScore(elapsed);
      setState(prev => ({
        ...prev,
        isPlaying: false,
        overallProgress: 100,
        mindfulnessScore: finalScore,
      }));
      onComplete(elapsed, finalScore);
      return;
    }

    // Calculate progress
    const overallProgress = (elapsed / totalDuration) * 100;
    const phaseLength = totalDuration / 4;
    const phaseIndex = Math.floor(elapsed / phaseLength);
    const phases = ['preparation', 'breathing', 'main', 'cool-down'];
    const currentPhase = phases[Math.min(phaseIndex, 3)];
    const phaseProgress = ((elapsed % phaseLength) / phaseLength) * 100;

    // Calculate mindfulness score (simulated based on engagement)
    const mindfulnessScore = Math.min(100, 50 + (overallProgress * 0.4) + Math.random() * 10);

    setState(prev => ({
      ...prev,
      currentPhase,
      phaseProgress,
      overallProgress,
      mindfulnessScore,
    }));

    animationRef.current = requestAnimationFrame(runAnimation);
  }, [session.duration, onComplete]);

  // Toggle play/pause
  const togglePlayPause = useCallback(() => {
    if (state.isPaused) {
      // Resume
      setState(prev => ({ ...prev, isPaused: false }));
      startTimeRef.current = Date.now() - (state.overallProgress / 100) * session.duration * 60 * 1000;
      runAnimation();
    } else {
      // Pause
      setState(prev => ({ ...prev, isPaused: true }));
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
  }, [state.isPaused, state.overallProgress, session.duration, runAnimation]);

  // Reset session
  const resetSession = useCallback(() => {
    if (breathingStopRef.current) {
      breathingStopRef.current();
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    setState(prev => ({
      ...prev,
      isPlaying: false,
      isPaused: false,
      currentPhase: 'preparation',
      phaseProgress: 0,
      overallProgress: 0,
      breathingPhase: 'inhale',
      breathingCount: 4,
      mindfulnessScore: 0,
    }));

    startTimeRef.current = null;
  }, []);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    setState(prev => ({ ...prev, audioEnabled: !prev.audioEnabled }));
  }, []);

  // Toggle stats
  const toggleStats = useCallback(() => {
    setState(prev => ({ ...prev, showStats: !prev.showStats }));
  }, []);

  // Calculate mindfulness score
  const calculateMindfulnessScore = (duration: number): number => {
    const durationScore = Math.min(100, (duration / (session.duration * 60 * 1000)) * 80);
    return Math.round(durationScore + Math.random() * 20);
  };

  // Get phase description
  const getPhaseDescription = (phase: string): string => {
    switch (phase) {
      case 'preparation':
        return 'Settle into a comfortable position';
      case 'breathing':
        return 'Focus on your breath';
      case 'main':
        return 'Deepen your practice';
      case 'cool-down':
        return 'Gently return to awareness';
      default:
        return '';
    }
  };

  // Get breathing animation class
  const getBreathingAnimation = (): string => {
    switch (state.breathingPhase) {
      case 'inhale': return 'scale-110';
      case 'hold': return 'scale-100';
      case 'exhale': return 'scale-90';
      default: return 'scale-100';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
      {/* AR Environment Container */}
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 0 }}
      />

      {/* Animated breathing overlay */}
      {state.isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-5">
          <div
            className={`w-64 h-64 rounded-full bg-gradient-to-r from-cyan-400/20 to-purple-400/20 border-2 border-cyan-400/30 transition-all duration-1000 ${getBreathingAnimation()}`}
            style={{
              animation: state.breathingPhase === 'hold' ? 'pulse 2s infinite' : 'none',
            }}
          />
          <div
            className={`absolute w-48 h-48 rounded-full bg-gradient-to-r from-cyan-500/30 to-purple-500/30 transition-all duration-1000 ${getBreathingAnimation()}`}
            style={{ animationDelay: '0.2s' }}
          />
          <div
            className={`absolute w-32 h-32 rounded-full bg-gradient-to-r from-cyan-600/40 to-purple-600/40 transition-all duration-1000 ${getBreathingAnimation()}`}
            style={{ animationDelay: '0.4s' }}
          />
        </div>
      )}

      {/* Overlay UI */}
      <div className="relative z-10 flex flex-col h-full p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white">{session.name}</h2>
            <span className="px-2 py-1 bg-cyan-500/30 text-cyan-300 rounded-full text-sm">
              {session.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleStats}
              className={`p-2 rounded-full transition-colors ${
                state.showStats
                  ? 'bg-cyan-500 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              aria-label="Toggle stats"
            >
              <Brain className="w-5 h-5" />
            </button>

            <button
              onClick={toggleAudio}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label={state.audioEnabled ? 'Mute audio' : 'Enable audio'}
            >
              {state.audioEnabled ? (
                <Volume2 className="w-5 h-5 text-white" />
              ) : (
                <VolumeX className="w-5 h-5 text-white" />
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Close session"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-white/70 text-sm mb-2">
            <span>{getPhaseDescription(state.currentPhase)}</span>
            <span>{Math.round(state.overallProgress)}%</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-300"
              style={{ width: `${state.overallProgress}%` }}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Visual Focus Point */}
          <div className="relative mb-8">
            <div
              className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-1000 ${
                state.isPlaying ? getBreathingAnimation() : 'scale-100'
              }`}
            >
              {/* Orb */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400/40 to-purple-400/40 blur-xl" />
              <div className="relative z-10">
                {state.currentPhase === 'breathing' ? (
                  <Wind className="w-12 h-12 text-white/80" />
                ) : state.currentPhase === 'main' ? (
                  <Sparkles className="w-12 h-12 text-white/80" />
                ) : (
                  <Heart className="w-12 h-12 text-white/80" />
                )}
              </div>
            </div>

            {/* Phase indicator */}
            {state.isPlaying && (
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2">
                <span className="text-cyan-300 font-medium capitalize">
                  {state.breathingPhase}
                </span>
                <span className="text-white/60">
                  {state.breathingCount}s
                </span>
              </div>
            )}
          </div>

          {/* Session Info Card */}
          <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-6 max-w-md w-full border border-white/10">
            {/* Duration */}
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-white mb-2">
                {formatTime((session.duration * 60) - Math.floor((state.overallProgress / 100) * session.duration * 60))}
              </div>
              <div className="text-white/60 text-sm">remaining</div>
            </div>

            {/* Stats */}
            {state.showStats && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Brain className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs text-white/60">Mindfulness</span>
                  </div>
                  <div className="text-2xl font-bold text-cyan-300">
                    {Math.round(state.mindfulnessScore)}%
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Wind className="w-4 h-4 text-purple-400" />
                    <span className="text-xs text-white/60">Breaths</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-300">
                    {Math.floor(state.overallProgress * session.duration / 10)}
                  </div>
                </div>
              </div>
            )}

            {/* Session description */}
            <p className="text-white/70 text-sm text-center mb-4">
              {session.description}
            </p>

            {/* Benefits */}
            <div className="flex flex-wrap gap-2 justify-center">
              {session.benefits.slice(0, 3).map((benefit, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-xs"
                >
                  {benefit}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-auto pt-4">
          {/* Main Controls */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <button
              onClick={resetSession}
              className="p-4 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Reset session"
            >
              <RotateCcw className="w-6 h-6 text-white" />
            </button>

            <button
              onClick={() => {
                if (!state.isPlaying) {
                  startSession();
                } else {
                  togglePlayPause();
                }
              }}
              className="p-8 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 transition-all shadow-lg shadow-cyan-500/30"
              aria-label={state.isPlaying ? 'Pause' : 'Start session'}
            >
              {state.isPlaying ? (
                <Pause className="w-8 h-8 text-white" />
              ) : (
                <Play className="w-8 h-8 text-white" />
              )}
            </button>

            <button
              className="p-4 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Fullscreen"
            >
              <Maximize2 className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Status */}
          {state.isPlaying && (
            <div className="text-center text-white/60 text-sm">
              {state.isPaused ? 'Session paused' : 'Breathe deeply and focus on the present moment'}
            </div>
          )}

          {/* Completion */}
          {!state.isPlaying && state.mindfulnessScore > 0 && (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-300 px-4 py-2 rounded-full">
                <Sparkles className="w-5 h-5" />
                <span>Meditation Complete! Mindfulness Score: {Math.round(state.mindfulnessScore)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Animation styles */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}

// Helper function to format time
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default ARMeditationSession;

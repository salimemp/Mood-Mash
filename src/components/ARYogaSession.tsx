import React, { useState, useEffect, useCallback } from 'react';
import { X, Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, Settings, CheckCircle, AlertCircle } from 'lucide-react';
import { YogaPose } from '../data/wellnessContent';
import { ARSessionManager, ARMetrics, AREnvironment } from '../data/arIntegration';

interface ARYogaSessionProps {
  poses: YogaPose[];
  onComplete: (metrics: ARMetrics) => void;
  onClose: () => void;
  environment?: AREnvironment;
}

interface SessionState {
  currentPoseIndex: number;
  isPlaying: boolean;
  isPaused: boolean;
  progress: number;
  currentPoseProgress: number;
  metrics: ARMetrics | null;
  instruction: string;
  showGuidance: boolean;
  audioEnabled: boolean;
  environment: AREnvironment;
}

const DEFAULT_ENVIRONMENT: AREnvironment = {
  type: 'nature',
  timeOfDay: 'noon',
  weather: 'clear',
};

export function ARYogaSession({
  poses,
  onComplete,
  onClose,
  environment = DEFAULT_ENVIRONMENT,
}: ARYogaSessionProps) {
  const [state, setState] = useState<SessionState>({
    currentPoseIndex: 0,
    isPlaying: false,
    isPaused: false,
    progress: 0,
    currentPoseProgress: 0,
    metrics: null,
    instruction: '',
    showGuidance: true,
    audioEnabled: true,
    environment,
  });

  const arManager = React.useRef<ARSessionManager | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Initialize AR session
  useEffect(() => {
    const initAR = async () => {
      arManager.current = new ARSessionManager();
      await arManager.current.initialize({
        type: 'yoga',
        environment: state.environment,
        enablePoseOverlay: true,
        enableAudioGuide: state.audioEnabled,
        enableHapticFeedback: true,
        difficulty: 'intermediate',
      });

      if (containerRef.current) {
        arManager.current.mountToElement(containerRef.current, state.environment);
      }
    };

    initAR();

    return () => {
      if (arManager.current) {
        arManager.current.endSession();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Start session
  const startSession = useCallback(() => {
    if (!arManager.current) return;

    setState(prev => ({ ...prev, isPlaying: true, isPaused: false }));

    const currentPose = poses[state.currentPoseIndex];

    arManager.current.startYogaSession(
      poses,
      (progress, instruction, metrics) => {
        setState(prev => ({
          ...prev,
          progress,
          currentPoseProgress: progress,
          instruction,
          metrics,
        }));
      },
      (finalMetrics) => {
        setState(prev => ({
          ...prev,
          isPlaying: false,
          metrics: finalMetrics,
        }));
        onComplete(finalMetrics);
      }
    );
  }, [poses, state.currentPoseIndex, onComplete]);

  // Toggle play/pause
  const togglePlayPause = useCallback(() => {
    if (!arManager.current) return;

    const status = arManager.current.getStatus();

    if (state.isPaused) {
      // Resume
      setState(prev => ({ ...prev, isPaused: false }));
      // In a real implementation, would resume the session
    } else {
      // Pause
      setState(prev => ({ ...prev, isPaused: true }));
    }
  }, [state.isPaused]);

  // Reset session
  const resetSession = useCallback(() => {
    if (!arManager.current) return;

    arManager.current.endSession();
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setState(prev => ({
      ...prev,
      currentPoseIndex: 0,
      isPlaying: false,
      isPaused: false,
      progress: 0,
      currentPoseProgress: 0,
      metrics: null,
      instruction: '',
    }));
  }, []);

  // Skip to next pose
  const nextPose = useCallback(() => {
    if (state.currentPoseIndex < poses.length - 1) {
      setState(prev => ({
        ...prev,
        currentPoseIndex: prev.currentPoseIndex + 1,
        currentPoseProgress: 0,
      }));
    }
  }, [poses.length, state.currentPoseIndex]);

  // Skip to previous pose
  const previousPose = useCallback(() => {
    if (state.currentPoseIndex > 0) {
      setState(prev => ({
        ...prev,
        currentPoseIndex: prev.currentPoseIndex - 1,
        currentPoseProgress: 0,
      }));
    }
  }, [state.currentPoseIndex]);

  // Toggle guidance
  const toggleGuidance = useCallback(() => {
    setState(prev => ({ ...prev, showGuidance: !prev.showGuidance }));
  }, []);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    setState(prev => ({ ...prev, audioEnabled: !prev.audioEnabled }));
  }, []);

  const currentPose = poses[state.currentPoseIndex];
  const overallProgress = (state.currentPoseIndex / poses.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
      {/* AR Environment Container */}
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 0 }}
      />

      {/* Overlay UI */}
      <div className="relative z-10 flex flex-col h-full p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white">AR Yoga Session</h2>
            <span className="px-2 py-1 bg-purple-500/30 text-purple-300 rounded-full text-sm">
              {state.environment.type}
            </span>
          </div>

          <div className="flex items-center gap-2">
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
              onClick={toggleGuidance}
              className={`p-2 rounded-full transition-colors ${
                state.showGuidance
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              aria-label="Toggle guidance"
            >
              <Settings className="w-5 h-5" />
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

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-white/70 text-sm mb-2">
            <span>Progress</span>
            <span>{Math.round(overallProgress)}%</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        {/* Current Pose Display */}
        {currentPose && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-6 max-w-md w-full border border-white/10">
              {/* Pose Visual */}
              <div className="aspect-square bg-gradient-to-br from-purple-900/50 to-indigo-900/50 rounded-2xl mb-4 flex items-center justify-center relative overflow-hidden">
                {/* 3D-style pose representation */}
                <div className="text-8xl filter drop-shadow-2xl">
                  {getPoseEmoji(currentPose.category)}
                </div>

                {/* Pose accuracy indicator */}
                {state.metrics && (
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-green-400 text-sm font-medium">
                        Accuracy: {Math.round(state.metrics.poseAccuracy * 100)}%
                      </span>
                    </div>
                  </div>
                )}

                {/* Timer */}
                <div className="absolute top-4 right-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1">
                    <span className="text-white font-mono">
                      {formatTime(state.currentPoseProgress * 90)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pose Info */}
              <h3 className="text-2xl font-bold text-white mb-2">{currentPose.name}</h3>
              <p className="text-white/70 mb-4">{currentPose.sanskritName}</p>

              {/* Instructions */}
              {state.showGuidance && (
                <div className="bg-white/5 rounded-xl p-4 mb-4">
                  <h4 className="text-purple-300 text-sm font-semibold mb-2">Instructions</h4>
                  <ul className="space-y-2">
                    {currentPose.instructions.slice(0, 3).map((instruction, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-white/80">
                        <span className="w-5 h-5 rounded-full bg-purple-500/30 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        {instruction}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Precautions */}
              {currentPose.precautions && currentPose.precautions.length > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-amber-300 text-sm font-semibold mb-1">Precautions</h4>
                    <p className="text-sm text-white/70">{currentPose.precautions[0]}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

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
              onClick={previousPose}
              disabled={state.currentPoseIndex === 0 || state.isPlaying}
              className="p-4 rounded-full bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
              aria-label="Previous pose"
            >
              <span className="text-white text-xl">⏮</span>
            </button>

            <button
              onClick={() => {
                if (!state.isPlaying) {
                  startSession();
                } else {
                  togglePlayPause();
                }
              }}
              className="p-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/30"
              aria-label={state.isPlaying ? 'Pause' : 'Start session'}
            >
              {state.isPlaying ? (
                <Pause className="w-8 h-8 text-white" />
              ) : (
                <Play className="w-8 h-8 text-white" />
              )}
            </button>

            <button
              onClick={nextPose}
              disabled={state.currentPoseIndex >= poses.length - 1 || state.isPlaying}
              className="p-4 rounded-full bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
              aria-label="Next pose"
            >
              <span className="text-white text-xl">⏭</span>
            </button>

            <button
              className="p-4 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Fullscreen"
            >
              <Maximize2 className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Session Status */}
          {state.isPlaying && (
            <div className="text-center text-white/60 text-sm">
              {state.isPaused ? 'Session paused' : state.instruction || 'Session in progress...'}
            </div>
          )}

          {/* Completion Message */}
          {state.metrics && !state.isPlaying && (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-300 px-4 py-2 rounded-full">
                <CheckCircle className="w-5 h-5" />
                <span>Session Complete!</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function to get emoji based on pose category
function getPoseEmoji(category: string): string {
  const emojiMap: Record<string, string> = {
    'standing': '🧘',
    'seated': '🧘‍♀️',
    'balance': '🧘‍♂️',
    'backbend': '🙆',
    'forward_fold': '🤸',
    'twist': '🔄',
    'inversion': '🤸‍♀️',
    'restorative': '😌',
    'prone': '🛌',
    'supine': '🛋️',
  };
  return emojiMap[category] || '🧘';
}

// Helper function to format time
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default ARYogaSession;

import React, { useState, useEffect, useCallback } from 'react';
import {
  X, Brain, TrendingUp, TrendingDown, Minus, Calendar, Clock,
  Sparkles, Lightbulb, Target, Activity, Zap, Heart, ChevronRight,
  BarChart3, PieChart as PieChartIcon, RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import {
  mlService,
  MoodPredictionResult,
  PatternResult,
  RecommendationResult,
  SentimentResult,
} from '../data/mlModels';
import { MoodEntry } from '../contexts/MoodContext';

// Minimal wellness history type
interface WellnessHistoryEntry {
  type: string;
  category: string;
  name: string;
  completedAt: Date;
  moodBefore?: number;
  moodAfter?: number;
}

interface MLInsightsDashboardProps {
  moodHistory: MoodEntry[];
  wellnessHistory: WellnessHistoryEntry[];
  onClose: () => void;
  onStartSession: (type: string, id: string) => void;
}

type TabType = 'predictions' | 'patterns' | 'recommendations' | 'sentiment';

interface DashboardState {
  activeTab: TabType;
  predictions: MoodPredictionResult | null;
  patterns: PatternResult | null;
  recommendations: RecommendationResult | null;
  sentiment: SentimentResult | null;
  isLoading: boolean;
  modelAccuracy: number;
}

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export function MLInsightsDashboard({
  moodHistory,
  wellnessHistory,
  onClose,
  onStartSession,
}: MLInsightsDashboardProps) {
  const [state, setState] = useState<DashboardState>({
    activeTab: 'predictions',
    predictions: null,
    patterns: null,
    recommendations: null,
    sentiment: null,
    isLoading: true,
    modelAccuracy: 0,
  });

  // Load ML insights
  useEffect(() => {
    loadInsights();
  }, [moodHistory, wellnessHistory]);

  const loadInsights = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));

    // Simulate async ML processing
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generate predictions
    const predictions = mlService.predictMoods(
      moodHistory.map(m => ({
        emotion: m.emotion,
        intensity: m.intensity,
        timestamp: new Date(m.createdAt),
      })),
      7
    );

    // Detect patterns
    const patterns = mlService.detectPatterns(
      moodHistory.map(m => ({
        emotion: m.emotion,
        intensity: m.intensity,
        timestamp: new Date(m.createdAt),
      })),
      wellnessHistory.map(w => ({
        type: w.type,
        category: w.category,
        moodBefore: w.moodBefore,
        moodAfter: w.moodAfter,
        completedAt: new Date(w.completedAt),
      }))
    );

    // Get recommendations
    const recommendations = {
      recommendations: [],
      personalizedTips: [
        'Continue tracking your mood for better insights',
        'Try morning meditation for improved daily mood',
        'Regular yoga practice correlates with emotional stability',
      ],
      optimalSchedule: [],
    };

    // Get model accuracy
    const modelState = mlService.getModelState();

    setState(prev => ({
      ...prev,
      predictions,
      patterns,
      recommendations,
      sentiment: null,
      isLoading: false,
      modelAccuracy: modelState.accuracy * 100,
    }));
  }, [moodHistory, wellnessHistory]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-5 h-5 text-green-400" />;
      case 'declining': return <TrendingDown className="w-5 h-5 text-red-400" />;
      default: return <Minus className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return 'text-green-400';
    if (confidence >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const renderPredictionsTab = () => {
    if (!state.predictions) return null;

    return (
      <div className="space-y-6">
        {/* Trend Summary */}
        <div className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-2xl p-6 border border-purple-500/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Brain className="w-6 h-6 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">7-Day Mood Forecast</h3>
            </div>
            {getTrendIcon(state.predictions.trend)}
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {state.predictions.confidence.toFixed(0)}%
              </div>
              <div className="text-xs text-white/60">Model Confidence</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1 capitalize">
                {state.predictions.trend}
              </div>
              <div className="text-xs text-white/60">Mood Trend</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {state.predictions.predictions.length}
              </div>
              <div className="text-xs text-white/60">Predictions</div>
            </div>
          </div>

          {/* Factors */}
          {state.predictions.factors.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-white/80">Contributing Factors</h4>
              {state.predictions.factors.map((factor, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  {factor.direction === 'positive' ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                  <span className="text-white/70">{factor.description}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Predictions List */}
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-white">Daily Predictions</h4>
          {state.predictions.predictions.map((prediction, idx) => (
            <div
              key={idx}
              className="bg-white/5 rounded-xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/30 to-cyan-500/30 flex items-center justify-center">
                  <span className="text-xl">{getEmotionEmoji(prediction.emotion)}</span>
                </div>
                <div>
                  <div className="font-medium text-white">{format(prediction.date, 'EEEE, MMM d')}</div>
                  <div className="text-sm text-white/60 capitalize">{prediction.emotion}</div>
                </div>
              </div>
              <div className={`text-sm font-medium ${getConfidenceColor(prediction.confidence)}`}>
                {Math.round(prediction.confidence * 100)}% confidence
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPatternsTab = () => {
    if (!state.patterns) return null;

    return (
      <div className="space-y-6">
        {/* Insights */}
        {state.patterns.insights.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-400" />
              Discovered Patterns
            </h3>

            {state.patterns.insights.map((insight, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl p-4 border border-cyan-500/20"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-white">{insight.title}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    insight.confidence >= 0.7
                      ? 'bg-green-500/20 text-green-400'
                      : insight.confidence >= 0.5
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {Math.round(insight.confidence * 100)}% confidence
                  </span>
                </div>
                <p className="text-sm text-white/70 mb-3">{insight.description}</p>
                {insight.actionable && (
                  <div className="bg-cyan-500/10 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Target className="w-4 h-4 text-cyan-400 mt-0.5" />
                      <p className="text-sm text-cyan-300">{insight.recommendation}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-white/30 mx-auto mb-4" />
            <p className="text-white/60">Not enough data to detect patterns yet.</p>
            <p className="text-sm text-white/40">Keep logging your mood to unlock insights!</p>
          </div>
        )}

        {/* Recommendations */}
        {state.patterns.recommendations.length > 0 && (
          <div className="bg-white/5 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Personalized Recommendations</h3>
            <div className="space-y-3">
              {state.patterns.recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-purple-300">{idx + 1}</span>
                  </div>
                  <span className="text-white/80">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderRecommendationsTab = () => {
    if (!state.recommendations) return null;

    return (
      <div className="space-y-6">
        {/* Personalized Tips */}
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl p-6 border border-green-500/20">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-6 h-6 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Personalized Tips</h3>
          </div>
          <div className="space-y-3">
            {state.recommendations.personalizedTips.map((tip, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <span className="text-white/80">{tip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Session Recommendations */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Recommended Sessions</h3>

          {state.recommendations.recommendations.length > 0 ? (
            state.recommendations.recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors cursor-pointer"
                onClick={() => onStartSession(rec.sessionType, rec.sessionId)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      rec.sessionType === 'meditation' ? 'bg-purple-500/30' :
                      rec.sessionType === 'yoga' ? 'bg-cyan-500/30' :
                      'bg-pink-500/30'
                    }`}>
                      {rec.sessionType === 'meditation' ? '🧘' :
                       rec.sessionType === 'yoga' ? '🧘‍♀️' : '🎵'}
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{rec.name}</h4>
                      <span className="text-xs text-white/60 capitalize">{rec.sessionType}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      rec.urgency === 'high' ? 'bg-red-500/20 text-red-400' :
                      rec.urgency === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {rec.urgency}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-white/70 mb-3">{rec.predictedEffect}</p>

                <div className="flex flex-wrap gap-2 mb-3">
                  {rec.reasoning.map((reason, rIdx) => (
                    <span
                      key={rIdx}
                      className="px-2 py-1 bg-white/5 rounded-full text-xs text-white/60"
                    >
                      {reason}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-cyan-500"
                        style={{ width: `${rec.score * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-white/60">{Math.round(rec.score * 100)}% match</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/40" />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white/5 rounded-xl">
              <Brain className="w-12 h-12 text-white/30 mx-auto mb-4" />
              <p className="text-white/60">Complete more sessions to get personalized recommendations!</p>
            </div>
          )}
        </div>

        {/* Optimal Schedule */}
        {state.recommendations.optimalSchedule.length > 0 && (
          <div className="bg-white/5 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Your Optimal Schedule</h3>
            <div className="grid gap-3">
              {state.recommendations.optimalSchedule.map((schedule, idx) => (
                <div key={idx} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
                  <div className="w-16 text-center">
                    <Clock className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                    <span className="text-sm text-white font-medium">{schedule.timeSlot}</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-white">{schedule.activity}</div>
                    <div className="text-xs text-white/60">{schedule.reason}</div>
                  </div>
                  <div className="text-xs text-white/40">
                    {Math.round(schedule.confidence * 100)}% confidence
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSentimentTab = () => {
    return (
      <div className="text-center py-16">
        <Brain className="w-16 h-16 text-white/20 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Journal Analysis</h3>
        <p className="text-white/60 mb-4">Add journal entries to analyze your emotional patterns</p>
        <button className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors">
          Write a Journal Entry
        </button>
      </div>
    );
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'predictions', label: 'Predictions', icon: <Brain className="w-4 h-4" /> },
    { id: 'patterns', label: 'Patterns', icon: <Activity className="w-4 h-4" /> },
    { id: 'recommendations', label: 'For You', icon: <Target className="w-4 h-4" /> },
    { id: 'sentiment', label: 'Sentiment', icon: <Heart className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">AI Insights</h2>
              <div className="flex items-center gap-2 text-xs text-white/60">
                <span>Model accuracy: {state.modelAccuracy.toFixed(0)}%</span>
                <span className="text-white/40">•</span>
                <span>Last updated: just now</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadInsights}
              disabled={state.isLoading}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
              aria-label="Refresh insights"
            >
              <RefreshCw className={`w-5 h-5 text-white ${state.isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-4 border-b border-white/10 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setState(prev => ({ ...prev, activeTab: tab.id }))}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                state.activeTab === tab.id
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {state.isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-white/60">Analyzing your data...</p>
              </div>
            </div>
          ) : (
            <>
              {state.activeTab === 'predictions' && renderPredictionsTab()}
              {state.activeTab === 'patterns' && renderPatternsTab()}
              {state.activeTab === 'recommendations' && renderRecommendationsTab()}
              {state.activeTab === 'sentiment' && renderSentimentTab()}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function to get emotion emoji
function getEmotionEmoji(emotion: string): string {
  const emojiMap: Record<string, string> = {
    'happy': '😊',
    'calm': '😌',
    'energetic': '⚡',
    'grateful': '🙏',
    'motivated': '🔥',
    'sad': '😢',
    'anxious': '😰',
    'stressed': '😓',
    'tired': '😴',
    'frustrated': '😤',
  };
  return emojiMap[emotion.toLowerCase()] || '😐';
}

export default MLInsightsDashboard;

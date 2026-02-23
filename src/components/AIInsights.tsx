import { useState, useEffect, useCallback } from 'react';
import { useMood } from '../contexts/MoodContext';
import { analyzePatterns, MoodPattern } from '../utils/patternAnalysis';
import {
  generateMoodInsights,
  analyzePatterns as aiAnalyzePatterns,
  getAPIKey,
  setAPIKey,
  AIInsight,
  AIAnalysisResponse,
} from '../services/aiInsights';
import {
  Sparkles,
  Brain,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  TrendingUp,
  Heart,
  MessageCircle,
  Calendar,
  Settings,
  AlertCircle,
  Check,
} from 'lucide-react';

type Timeframe = 'week' | 'month' | 'year';

interface AIInsightsProps {
  compact?: boolean;
}

export function AIInsights({ compact = false }: AIInsightsProps) {
  const { entries } = useMood();
  const [timeframe, setTimeframe] = useState<Timeframe>('week');
  const [patterns, setPatterns] = useState<MoodPattern[]>([]);
  const [aiResponse, setAiResponse] = useState<AIAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [apiKey, setApiKeyState] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [expandedInsights, setExpandedInsights] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  // Load API key from storage
  useEffect(() => {
    const storedKey = getAPIKey();
    if (storedKey) {
      setApiKeyState(storedKey);
      setShowApiKeyInput(false);
    } else {
      setShowApiKeyInput(true);
    }
  }, []);

  // Analyze patterns when entries change
  useEffect(() => {
    if (entries.length > 0) {
      const newPatterns = analyzePatterns(entries);
      setPatterns(newPatterns);
    } else {
      setPatterns([]);
    }
  }, [entries.length, entries]);

  const handleGenerateAIInsights = useCallback(async () => {
    if (!apiKey) {
      setError('Please enter your Gemini API key first');
      return;
    }

    setIsAILoading(true);
    setError(null);

    try {
      const response = await generateMoodInsights(entries, apiKey, timeframe);
      setAiResponse(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate insights');
    } finally {
      setIsAILoading(false);
    }
  }, [entries, apiKey, timeframe]);

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      setAPIKey(apiKey.trim());
      setShowApiKeyInput(false);
      setError(null);
    }
  };

  const toggleInsightExpanded = (id: string) => {
    setExpandedInsights((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'summary':
        return <Calendar className="w-5 h-5 text-violet-400" />;
      case 'pattern':
        return <TrendingUp className="w-5 h-5 text-blue-400" />;
      case 'recommendation':
        return <Lightbulb className="w-5 h-5 text-amber-400" />;
      case 'reflection':
        return <MessageCircle className="w-5 h-5 text-pink-400" />;
      default:
        return <Brain className="w-5 h-5 text-violet-400" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-emerald-500';
    if (confidence >= 0.6) return 'bg-amber-500';
    return 'bg-slate-500';
  };

  if (compact) {
    return (
      <div className="glass rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-violet-400" />
            <h3 className="text-white font-medium">AI Insights</h3>
          </div>
          <button
            onClick={handleGenerateAIInsights}
            disabled={isAILoading || entries.length < 5}
            className="flex items-center gap-1 px-3 py-1.5 bg-violet-500/20 text-violet-400 rounded-lg text-sm hover:bg-violet-500/30 transition-colors disabled:opacity-50"
          >
            {isAILoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Generate
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg mb-3">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {showApiKeyInput ? (
          <div className="space-y-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKeyState(e.target.value)}
              placeholder="Enter Gemini API Key"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <button
              onClick={handleSaveApiKey}
              className="w-full py-2 bg-violet-500 text-white rounded-lg text-sm font-medium hover:bg-violet-600 transition-colors"
            >
              Save API Key
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as Timeframe)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>

            {patterns.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-slate-500 mb-2">Detected Patterns</p>
                {patterns.slice(0, 2).map((pattern) => (
                  <div
                    key={pattern.type}
                    className="p-2 bg-white/5 rounded-lg mb-2"
                  >
                    <p className="text-white text-sm font-medium">{pattern.title}</p>
                    <p className="text-slate-400 text-xs mt-1">{pattern.description}</p>
                  </div>
                ))}
              </div>
            )}

            {aiResponse && aiResponse.insights.length > 0 && (
              <div className="mt-3 space-y-2">
                {aiResponse.insights.slice(0, 2).map((insight) => (
                  <div
                    key={insight.id}
                    className="p-2 bg-violet-500/10 border border-violet-500/20 rounded-lg"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {getInsightIcon(insight.type)}
                      <p className="text-white text-sm font-medium">{insight.title}</p>
                    </div>
                    <p className="text-slate-400 text-xs line-clamp-2">
                      {insight.content}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {entries.length < 5 && (
              <p className="text-slate-500 text-xs text-center">
                Log at least 5 moods to unlock AI insights
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">AI Insights</h2>
            <p className="text-slate-400 text-sm">Personalized analysis of your mood patterns</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as Timeframe)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>

          <button
            onClick={handleGenerateAIInsights}
            disabled={isAILoading || entries.length < 5}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-lg text-white font-medium hover:from-violet-500 hover:to-fuchsia-500 transition-all disabled:opacity-50"
          >
            {isAILoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Insights
              </>
            )}
          </button>
        </div>
      </div>

      {/* API Key Setup */}
      {showApiKeyInput && (
        <div className="glass rounded-xl p-6 border-amber-500/30">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-white font-medium mb-2">Enter Gemini API Key</h3>
              <p className="text-slate-400 text-sm mb-4">
                To use AI-powered insights, you need a Gemini API key from Google AI Studio.
                <a
                  href="https://aistudio.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-400 hover:underline ml-1"
                >
                  Get a free API key
                </a>
              </p>
              <div className="flex gap-3">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKeyState(e.target.value)}
                  placeholder="Enter your Gemini API key"
                  className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <button
                  onClick={handleSaveApiKey}
                  className="px-4 py-2 bg-violet-500 text-white rounded-lg font-medium hover:bg-violet-600 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-slate-400 hover:text-white"
          >
            ×
          </button>
        </div>
      )}

      {/* Patterns Section */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Detected Patterns</h3>
        </div>

        {patterns.length > 0 ? (
          <div className="space-y-4">
            {patterns.map((pattern, index) => (
              <div
                key={index}
                className="border border-white/10 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => toggleInsightExpanded(`pattern-${index}`)}
                  className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${getConfidenceColor(pattern.confidence)}`} />
                    <span className="text-white font-medium">{pattern.title}</span>
                  </div>
                  {expandedInsights.has(`pattern-${index}`) ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </button>

                {expandedInsights.has(`pattern-${index}`) && (
                  <div className="p-4 border-t border-white/10">
                    <p className="text-slate-300 mb-4">{pattern.description}</p>

                    <div className="mb-4">
                      <p className="text-xs text-slate-500 uppercase mb-2">Evidence</p>
                      <ul className="space-y-1">
                        {pattern.evidence.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-slate-400 text-sm">
                            <span className="text-violet-400">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500 uppercase mb-2">Suggestions</p>
                      <ul className="space-y-1">
                        {pattern.suggestions.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-slate-400 text-sm">
                            <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/10">
                      <p className="text-xs text-slate-500">
                        Confidence: {Math.round(pattern.confidence * 100)}%
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Brain className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">
              {entries.length > 0
                ? 'Not enough patterns detected yet. Keep logging!'
                : 'Start logging your mood to discover patterns'}
            </p>
          </div>
        )}
      </div>

      {/* AI Insights Section */}
      {aiResponse && (
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-violet-400" />
            <h3 className="text-lg font-semibold text-white">AI Analysis</h3>
          </div>

          <div className="space-y-4">
            {aiResponse.insights.map((insight) => (
              <div
                key={insight.id}
                className={`p-4 rounded-xl ${
                  insight.type === 'summary'
                    ? 'bg-violet-500/10 border border-violet-500/20'
                    : insight.type === 'recommendation'
                    ? 'bg-amber-500/10 border border-amber-500/20'
                    : 'bg-white/5 border border-white/10'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  {getInsightIcon(insight.type)}
                  <span className="text-white font-medium">{insight.title}</span>
                  <div className="ml-auto flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getConfidenceColor(insight.confidence)}`} />
                    <span className="text-xs text-slate-500">
                      {Math.round(insight.confidence * 100)}% confidence
                    </span>
                  </div>
                </div>
                <p className="text-slate-300 whitespace-pre-wrap">{insight.content}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-500">
            <span>Generated at {aiResponse.generatedAt.toLocaleTimeString()}</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(aiResponse.summary);
              }}
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <Check className="w-3 h-3" />
              Copy Summary
            </button>
          </div>
        </div>
      )}

      {/* Not Enough Data State */}
      {entries.length > 0 && entries.length < 5 && (
        <div className="glass rounded-xl p-6 text-center">
          <Heart className="w-12 h-12 text-pink-400 mx-auto mb-3" />
          <h3 className="text-white font-medium mb-2">Building Your Profile</h3>
          <p className="text-slate-400 text-sm">
            You have {entries.length} entries. Log at least 5 moods to unlock full AI insights and pattern analysis.
          </p>
          <div className="mt-4">
            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                style={{ width: `${(entries.length / 5) * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">{5 - entries.length} more entries needed</p>
          </div>
        </div>
      )}

      {/* API Key Settings */}
      <div className="flex items-center justify-end">
        <button
          onClick={() => setShowApiKeyInput(!showApiKeyInput)}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
        >
          <Settings className="w-4 h-4" />
          {apiKey ? 'Update API Key' : 'Set API Key'}
        </button>
      </div>
    </div>
  );
}

export default AIInsights;

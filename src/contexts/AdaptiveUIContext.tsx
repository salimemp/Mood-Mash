// ============================================================================
// Adaptive UI Context for MoodMash
// Learns user behavior to personalize dashboard, layout, and content
// ============================================================================

import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface InteractionEvent {
  componentId: string;
  componentType: 'module' | 'button' | 'card' | 'nav' | 'feature';
  action: 'click' | 'view' | 'hover' | 'dwell' | 'dismiss' | 'pin' | 'unpin';
  timestamp: number;
  duration?: number; // milliseconds for dwell
  metadata?: Record<string, unknown>;
}

export interface ComponentUsageStats {
  componentId: string;
  componentType: string;
  interactions: number;
  totalDwellTime: number;
  lastInteraction: number;
  priority: number; // 0-100, higher = more important
  isPinned: boolean;
  isHidden: boolean;
}

export interface LayoutConfig {
  mode: 'dashboard' | 'focus' | 'compact';
  columnCount: number;
  showGamification: boolean;
  showSocial: boolean;
  showWeather: boolean;
}

export interface CircadianTheme {
  mode: 'morning' | 'afternoon' | 'evening' | 'night';
  primaryColor: string;
  backgroundColor: string;
  accentColor: string;
  contrastLevel: 'high' | 'medium' | 'low';
}

export interface ContentPreferences {
  preferredCategories: string[];
  dislikedCategories: string[];
  contentDensity: 'compact' | 'standard' | 'expanded';
  showRecommendations: boolean;
  personalizationLevel: 'none' | 'minimal' | 'full';
}

export interface AdaptiveState {
  // Usage tracking
  componentStats: Map<string, ComponentUsageStats>;
  recentInteractions: InteractionEvent[];

  // Layout
  layoutConfig: LayoutConfig;

  // Theming
  circadianTheme: CircadianTheme;

  // Content
  contentPreferences: ContentPreferences;

  // Learning
  isLearning: boolean;
  lastUpdated: number;
  userProfile: UserBehaviorProfile;
}

export interface UserBehaviorProfile {
  preferredTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'night' | 'mixed';
  engagementPattern: 'explorer' | 'routine' | 'casual';
  primaryGoal: 'self_improvement' | 'stress_relief' | 'monitoring' | 'social' | 'content';
  interactionVelocity: number; // interactions per minute
  preferredContentTypes: string[];
  moodCorrelation: Record<string, string[]>; // mood -> correlated features
}

export interface AdaptiveContextValue {
  // State
  state: AdaptiveState;

  // Interaction tracking
  trackInteraction: (event: Omit<InteractionEvent, 'timestamp'>) => void;
  trackDwell: (componentId: string, duration: number) => void;

  // Layout control
  setLayoutMode: (mode: LayoutConfig['mode']) => void;
  toggleGamification: () => void;
  toggleSocial: () => void;
  pinComponent: (componentId: string) => void;
  unpinComponent: (componentId: string) => void;
  hideComponent: (componentId: string) => void;
  showComponent: (componentId: string) => void;
  resetLayout: () => void;

  // Content preferences
  updateContentPreferences: (prefs: Partial<ContentPreferences>) => void;
  setPreferredCategories: (categories: string[]) => void;
  setDislikedCategories: (categories: string[]) => void;

  // Learning control
  toggleLearning: () => void;
  resetLearning: () => void;

  // Computed values
  getComponentPriority: (componentId: string) => number;
  getAdaptiveLayout: () => ComponentUsageStats[];
  getRecommendedFeatures: () => string[];
  getCircadianConfig: () => CircadianTheme;

  // Widget states
  getWidgetState: (componentId: string) => 'compact' | 'standard' | 'hero';
}

// ============================================================================
// Constants
// ============================================================================

const INTERACTION_DECAY = 7 * 24 * 60 * 60 * 1000; // 7 days
const PRIORITY_THRESHOLD_PIN = 80;
const PRIORITY_THRESHOLD_HERO = 60;
const PRIORITY_THRESHOLD_STANDARD = 30;
const MIN_INTERACTIONS_TO_LEARN = 5;
const LAYOUT_STORAGE_KEY = 'moodmash_adaptive_layout';
const INTERACTIONS_STORAGE_KEY = 'moodmash_interactions';
const PROFILE_STORAGE_KEY = 'moodmash_user_profile';
const PREFERENCES_STORAGE_KEY = 'moodmash_content_prefs';

const DEFAULT_LAYOUT: LayoutConfig = {
  mode: 'dashboard',
  columnCount: 3,
  showGamification: true,
  showSocial: true,
  showWeather: true,
};

const DEFAULT_CIRCADIAN: CircadianTheme = {
  mode: 'afternoon',
  primaryColor: '#6366f1',
  backgroundColor: '#0f172a',
  accentColor: '#8b5cf6',
  contrastLevel: 'high',
};

const DEFAULT_CONTENT_PREFS: ContentPreferences = {
  preferredCategories: [],
  dislikedCategories: [],
  contentDensity: 'standard',
  showRecommendations: true,
  personalizationLevel: 'full',
};

const DEFAULT_PROFILE: UserBehaviorProfile = {
  preferredTimeOfDay: 'mixed',
  engagementPattern: 'casual',
  primaryGoal: 'self_improvement',
  interactionVelocity: 0,
  preferredContentTypes: [],
  moodCorrelation: {},
};

// ============================================================================
// Helper Functions
// ============================================================================

function getCircadianTheme(): CircadianTheme {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 9) {
    return {
      mode: 'morning',
      primaryColor: '#0ea5e9',
      backgroundColor: '#f0f9ff',
      accentColor: '#38bdf8',
      contrastLevel: 'high',
    };
  } else if (hour >= 9 && hour < 17) {
    return {
      mode: 'afternoon',
      primaryColor: '#6366f1',
      backgroundColor: '#0f172a',
      accentColor: '#8b5cf6',
      contrastLevel: 'high',
    };
  } else if (hour >= 17 && hour < 21) {
    return {
      mode: 'evening',
      primaryColor: '#f59e0b',
      backgroundColor: '#1c1917',
      accentColor: '#fbbf24',
      contrastLevel: 'medium',
    };
  } else {
    return {
      mode: 'night',
      primaryColor: '#cf6679',
      backgroundColor: '#121212',
      accentColor: '#ff7961',
      contrastLevel: 'low',
    };
  }
}

function calculatePriority(stats: ComponentUsageStats): number {
  const now = Date.now();
  const timeSinceLastInteraction = now - stats.lastInteraction;

  // Decay factor based on time since last interaction
  const recencyWeight = Math.max(0, 1 - (timeSinceLastInteraction / INTERACTION_DECAY));

  // Calculate priority based on interactions and dwell time
  const interactionScore = Math.min(stats.interactions / 50, 1) * 0.4;
  const dwellScore = Math.min(stats.totalDwellTime / 600000, 1) * 0.4; // 10 hours max
  const recencyScore = recencyWeight * 0.2;

  let priority = (interactionScore + dwellScore + recencyScore) * 100;

  // Boost for pinned components
  if (stats.isPinned) {
    priority = Math.max(priority, PRIORITY_THRESHOLD_PIN);
  }

  // Reduce for hidden components
  if (stats.isHidden) {
    priority = 0;
  }

  return Math.round(priority);
}

function analyzeEngagementPattern(interactions: InteractionEvent[]): UserBehaviorProfile {
  if (interactions.length < MIN_INTERACTIONS_TO_LEARN) {
    return DEFAULT_PROFILE;
  }

  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  const recentInteractions = interactions.filter(i => i.timestamp > oneDayAgo);

  // Calculate interaction velocity
  const velocity = recentInteractions.length / (24 * 60); // interactions per minute

  // Determine time of day preference
  const hourCounts: Record<string, number> = { morning: 0, afternoon: 0, evening: 0, night: 0 };
  interactions.forEach(i => {
    const hour = new Date(i.timestamp).getHours();
    if (hour >= 5 && hour < 9) hourCounts.morning++;
    else if (hour >= 9 && hour < 17) hourCounts.afternoon++;
    else if (hour >= 17 && hour < 21) hourCounts.evening++;
    else hourCounts.night++;
  });

  const maxTime = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
  const preferredTime = maxTime[1] > interactions.length * 0.3 ? maxTime[0] as UserBehaviorProfile['preferredTimeOfDay'] : 'mixed';

  // Determine engagement pattern
  const uniqueComponents = new Set(interactions.map(i => i.componentId)).size;
  let engagementPattern: UserBehaviorProfile['engagementPattern'] = 'casual';

  if (velocity > 0.5 && uniqueComponents > 10) {
    engagementPattern = 'explorer';
  } else if (velocity < 0.1 && uniqueComponents < 5) {
    engagementPattern = 'routine';
  }

  // Determine primary goal based on component usage
  const featureCounts: Record<string, number> = {};
  interactions.forEach(i => {
    if (i.componentType === 'module' || i.componentType === 'feature') {
      featureCounts[i.componentId] = (featureCounts[i.componentId] || 0) + 1;
    }
  });

  const topFeature = Object.entries(featureCounts).sort((a, b) => b[1] - a[1])[0];
  let primaryGoal: UserBehaviorProfile['primaryGoal'] = 'self_improvement';

  if (topFeature) {
    const feature = topFeature[0].toLowerCase();
    if (feature.includes('social') || feature.includes('friend')) primaryGoal = 'social';
    else if (feature.includes('meditat') || feature.includes('yoga') || feature.includes('music')) primaryGoal = 'stress_relief';
    else if (feature.includes('mood') || feature.includes('track')) primaryGoal = 'monitoring';
  }

  return {
    preferredTimeOfDay: preferredTime,
    engagementPattern,
    primaryGoal,
    interactionVelocity: velocity,
    preferredContentTypes: Object.keys(featureCounts).slice(0, 5),
    moodCorrelation: {},
  };
}

// ============================================================================
// Context
// ============================================================================

const defaultState: AdaptiveState = {
  componentStats: new Map(),
  recentInteractions: [],
  layoutConfig: DEFAULT_LAYOUT,
  circadianTheme: DEFAULT_CIRCADIAN,
  contentPreferences: DEFAULT_CONTENT_PREFS,
  isLearning: true,
  lastUpdated: Date.now(),
  userProfile: DEFAULT_PROFILE,
};

export const AdaptiveContext = createContext<AdaptiveContextValue | null>(null);

// ============================================================================
// Provider Component
// ============================================================================

interface AdaptiveProviderProps {
  children: ReactNode;
}

export function AdaptiveProvider({ children }: AdaptiveProviderProps) {
  const [state, setState] = useState<AdaptiveState>(() => {
    // Load from localStorage
    try {
      const savedLayout = localStorage.getItem(LAYOUT_STORAGE_KEY);
      const savedInteractions = localStorage.getItem(INTERACTIONS_STORAGE_KEY);
      const savedProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
      const savedPrefs = localStorage.getItem(PREFERENCES_STORAGE_KEY);

      const componentStats = new Map<string, ComponentUsageStats>();

      if (savedLayout) {
        const layout = JSON.parse(savedLayout);
        if (layout.componentStats) {
          Object.entries(layout.componentStats).forEach(([id, stats]) => {
            componentStats.set(id, stats as ComponentUsageStats);
          });
        }
      }

      return {
        componentStats,
        recentInteractions: savedInteractions ? JSON.parse(savedInteractions) : [],
        layoutConfig: savedLayout ? JSON.parse(savedLayout).layoutConfig : DEFAULT_LAYOUT,
        circadianTheme: getCircadianTheme(),
        contentPreferences: savedPrefs ? JSON.parse(savedPrefs) : DEFAULT_CONTENT_PREFS,
        isLearning: true,
        lastUpdated: Date.now(),
        userProfile: savedProfile ? JSON.parse(savedProfile) : DEFAULT_PROFILE,
      };
    } catch {
      return { ...defaultState, circadianTheme: getCircadianTheme() };
    }
  });

  // Update circadian theme periodically
  useEffect(() => {
    const updateCircadian = () => {
      setState(prev => ({ ...prev, circadianTheme: getCircadianTheme() }));
    };

    updateCircadian();
    const interval = setInterval(updateCircadian, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  // Save to localStorage periodically
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      try {
        const layoutData = {
          layoutConfig: state.layoutConfig,
          componentStats: Object.fromEntries(state.componentStats),
        };
        localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layoutData));
        localStorage.setItem(INTERACTIONS_STORAGE_KEY, JSON.stringify(state.recentInteractions.slice(-500)));
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(state.userProfile));
        localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(state.contentPreferences));
      } catch (e) {
        console.warn('Failed to save adaptive UI state:', e);
      }
    }, 5000);

    return () => clearTimeout(saveTimeout);
  }, [state.componentStats, state.recentInteractions, state.layoutConfig, state.userProfile, state.contentPreferences]);

  // Analyze behavior periodically
  useEffect(() => {
    if (!state.isLearning || state.recentInteractions.length < MIN_INTERACTIONS_TO_LEARN) {
      return;
    }

    const analysisTimeout = setTimeout(() => {
      const profile = analyzeEngagementPattern(state.recentInteractions);

      // Update priorities based on new profile
      const newStats = new Map(state.componentStats);
      newStats.forEach((stats, id) => {
        const updated = { ...stats, priority: calculatePriority(stats) };
        newStats.set(id, updated);
      });

      // Determine layout mode based on engagement pattern
      let layoutMode: LayoutConfig['mode'] = 'dashboard';
      if (profile.engagementPattern === 'routine') {
        layoutMode = 'focus';
      } else if (profile.engagementPattern === 'explorer') {
        layoutMode = 'dashboard';
      }

      // Reduce gamification for monitoring-focused users
      const showGamification = profile.primaryGoal !== 'monitoring';

      setState(prev => ({
        ...prev,
        componentStats: newStats,
        userProfile: profile,
        layoutConfig: {
          ...prev.layoutConfig,
          mode: layoutMode,
          showGamification,
        },
        lastUpdated: Date.now(),
      }));
    }, 10000);

    return () => clearTimeout(analysisTimeout);
  }, [state.isLearning, state.recentInteractions.length]);

  // Track interaction
  const trackInteraction = useCallback((event: Omit<InteractionEvent, 'timestamp'>) => {
    const fullEvent: InteractionEvent = {
      ...event,
      timestamp: Date.now(),
    };

    setState(prev => {
      const newInteractions = [...prev.recentInteractions, fullEvent].slice(-1000);

      // Update component stats
      const newStats = new Map(prev.componentStats);
      const existingStats = newStats.get(event.componentId) || {
        componentId: event.componentId,
        componentType: event.componentType,
        interactions: 0,
        totalDwellTime: 0,
        lastInteraction: Date.now(),
        priority: 0,
        isPinned: false,
        isHidden: false,
      };

      existingStats.interactions += 1;
      existingStats.lastInteraction = Date.now();
      existingStats.priority = calculatePriority(existingStats);
      newStats.set(event.componentId, existingStats);

      return {
        ...prev,
        recentInteractions: newInteractions,
        componentStats: newStats,
      };
    });
  }, []);

  // Track dwell time
  const trackDwell = useCallback((componentId: string, duration: number) => {
    setState(prev => {
      const newStats = new Map(prev.componentStats);
      const existingStats = newStats.get(componentId);

      if (existingStats) {
        existingStats.totalDwellTime += duration;
        existingStats.priority = calculatePriority(existingStats);
        newStats.set(componentId, existingStats);
      }

      return { ...prev, componentStats: newStats };
    });
  }, []);

  // Layout controls
  const setLayoutMode = useCallback((mode: LayoutConfig['mode']) => {
    setState(prev => ({
      ...prev,
      layoutConfig: { ...prev.layoutConfig, mode },
    }));
  }, []);

  const toggleGamification = useCallback(() => {
    setState(prev => ({
      ...prev,
      layoutConfig: { ...prev.layoutConfig, showGamification: !prev.layoutConfig.showGamification },
    }));
  }, []);

  const toggleSocial = useCallback(() => {
    setState(prev => ({
      ...prev,
      layoutConfig: { ...prev.layoutConfig, showSocial: !prev.layoutConfig.showSocial },
    }));
  }, []);

  const pinComponent = useCallback((componentId: string) => {
    setState(prev => {
      const newStats = new Map(prev.componentStats);
      const stats = newStats.get(componentId) || {
        componentId,
        componentType: 'module',
        interactions: 0,
        totalDwellTime: 0,
        lastInteraction: Date.now(),
        priority: 0,
        isPinned: false,
        isHidden: false,
      };
      stats.isPinned = true;
      stats.priority = Math.max(stats.priority, PRIORITY_THRESHOLD_PIN);
      newStats.set(componentId, stats);
      return { ...prev, componentStats: newStats };
    });
  }, []);

  const unpinComponent = useCallback((componentId: string) => {
    setState(prev => {
      const newStats = new Map(prev.componentStats);
      const stats = newStats.get(componentId);
      if (stats) {
        stats.isPinned = false;
        stats.priority = calculatePriority(stats);
        newStats.set(componentId, stats);
      }
      return { ...prev, componentStats: newStats };
    });
  }, []);

  const hideComponent = useCallback((componentId: string) => {
    setState(prev => {
      const newStats = new Map(prev.componentStats);
      const stats = newStats.get(componentId) || {
        componentId,
        componentType: 'module',
        interactions: 0,
        totalDwellTime: 0,
        lastInteraction: Date.now(),
        priority: 0,
        isPinned: false,
        isHidden: false,
      };
      stats.isHidden = true;
      stats.priority = 0;
      newStats.set(componentId, stats);
      return { ...prev, componentStats: newStats };
    });
  }, []);

  const showComponent = useCallback((componentId: string) => {
    setState(prev => {
      const newStats = new Map(prev.componentStats);
      const stats = newStats.get(componentId);
      if (stats) {
        stats.isHidden = false;
        stats.priority = calculatePriority(stats);
        newStats.set(componentId, stats);
      }
      return { ...prev, componentStats: newStats };
    });
  }, []);

  const resetLayout = useCallback(() => {
    setState(prev => ({
      ...prev,
      componentStats: new Map(),
      recentInteractions: [],
      layoutConfig: DEFAULT_LAYOUT,
      userProfile: DEFAULT_PROFILE,
    }));
    localStorage.removeItem(LAYOUT_STORAGE_KEY);
    localStorage.removeItem(INTERACTIONS_STORAGE_KEY);
    localStorage.removeItem(PROFILE_STORAGE_KEY);
  }, []);

  // Content preferences
  const updateContentPreferences = useCallback((prefs: Partial<ContentPreferences>) => {
    setState(prev => ({
      ...prev,
      contentPreferences: { ...prev.contentPreferences, ...prefs },
    }));
  }, []);

  const setPreferredCategories = useCallback((categories: string[]) => {
    setState(prev => ({
      ...prev,
      contentPreferences: { ...prev.contentPreferences, preferredCategories: categories },
    }));
  }, []);

  const setDislikedCategories = useCallback((categories: string[]) => {
    setState(prev => ({
      ...prev,
      contentPreferences: { ...prev.contentPreferences, dislikedCategories: categories },
    }));
  }, []);

  // Learning control
  const toggleLearning = useCallback(() => {
    setState(prev => ({ ...prev, isLearning: !prev.isLearning }));
  }, []);

  const resetLearning = useCallback(() => {
    setState(prev => ({
      ...prev,
      componentStats: new Map(),
      recentInteractions: [],
      userProfile: DEFAULT_PROFILE,
    }));
    localStorage.removeItem(LAYOUT_STORAGE_KEY);
    localStorage.removeItem(INTERACTIONS_STORAGE_KEY);
    localStorage.removeItem(PROFILE_STORAGE_KEY);
  }, []);

  // Computed values
  const getComponentPriority = useCallback((componentId: string): number => {
    const stats = state.componentStats.get(componentId);
    return stats?.priority ?? 0;
  }, [state.componentStats]);

  const getAdaptiveLayout = useCallback((): ComponentUsageStats[] => {
    const statsArray = Array.from(state.componentStats.values());
    return statsArray
      .filter(s => !s.isHidden)
      .sort((a, b) => b.priority - a.priority);
  }, [state.componentStats]);

  const getRecommendedFeatures = useCallback((): string[] => {
    return state.userProfile.preferredContentTypes;
  }, [state.userProfile]);

  const getCircadianConfig = useCallback((): CircadianTheme => {
    return state.circadianTheme;
  }, [state.circadianTheme]);

  const getWidgetState = useCallback((componentId: string): 'compact' | 'standard' | 'hero' => {
    const priority = getComponentPriority(componentId);
    if (priority >= PRIORITY_THRESHOLD_HERO) return 'hero';
    if (priority >= PRIORITY_THRESHOLD_STANDARD) return 'standard';
    return 'compact';
  }, [getComponentPriority]);

  const value: AdaptiveContextValue = {
    state,
    trackInteraction,
    trackDwell,
    setLayoutMode,
    toggleGamification,
    toggleSocial,
    pinComponent,
    unpinComponent,
    hideComponent,
    showComponent,
    resetLayout,
    updateContentPreferences,
    setPreferredCategories,
    setDislikedCategories,
    toggleLearning,
    resetLearning,
    getComponentPriority,
    getAdaptiveLayout,
    getRecommendedFeatures,
    getCircadianConfig,
    getWidgetState,
  };

  return (
    <AdaptiveContext.Provider value={value}>
      {children}
    </AdaptiveContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useAdaptive(): AdaptiveContextValue {
  const context = useContext(AdaptiveContext);
  if (!context) {
    throw new Error('useAdaptive must be used within an AdaptiveProvider');
  }
  return context;
}

// ============================================================================
// Component Tracker Hook
// ============================================================================

interface UseComponentTrackerProps {
  componentId: string;
  componentType: 'module' | 'button' | 'card' | 'nav' | 'feature';
}

export function useComponentTracker({ componentId, componentType }: UseComponentTrackerProps) {
  const { trackInteraction, trackDwell, getWidgetState, pinComponent, unpinComponent, hideComponent, showComponent } = useAdaptive();
  const [isPinned, setIsPinned] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [widgetState, setWidgetState] = useState<'compact' | 'standard' | 'hero'>('standard');
  const dwellStartTime = useRef<number | null>(null);

  useEffect(() => {
    setWidgetState(getWidgetState(componentId));
  }, [componentId, getWidgetState]);

  const handleClick = useCallback(() => {
    trackInteraction({ componentId, componentType, action: 'click' });
    setWidgetState(getWidgetState(componentId));
  }, [componentId, componentType, trackInteraction, getWidgetState]);

  const handleView = useCallback(() => {
    trackInteraction({ componentId, componentType, action: 'view' });
    dwellStartTime.current = Date.now();
  }, [componentId, componentType, trackInteraction]);

  const handleHover = useCallback(() => {
    trackInteraction({ componentId, componentType, action: 'hover' });
  }, [componentId, componentType, trackInteraction]);

  const handleDismiss = useCallback(() => {
    trackInteraction({ componentId, componentType, action: 'dismiss' });
    hideComponent(componentId);
    setIsHidden(true);
  }, [componentId, componentType, trackInteraction, hideComponent]);

  const handlePin = useCallback(() => {
    trackInteraction({ componentId, componentType, action: 'pin' });
    if (isPinned) {
      unpinComponent(componentId);
      setIsPinned(false);
    } else {
      pinComponent(componentId);
      setIsPinned(true);
    }
  }, [componentId, componentType, trackInteraction, pinComponent, unpinComponent, isPinned]);

  const handleShow = useCallback(() => {
    showComponent(componentId);
    setIsHidden(false);
  }, [componentId, showComponent]);

  // Track dwell time on unmount
  useEffect(() => {
    return () => {
      if (dwellStartTime.current) {
        const dwellTime = Date.now() - dwellStartTime.current;
        if (dwellTime > 1000) { // Only track if > 1 second
          trackDwell(componentId, dwellTime);
        }
      }
    };
  }, [componentId, trackDwell]);

  return {
    widgetState,
    isPinned,
    isHidden,
    handlers: {
      onClick: handleClick,
      onView: handleView,
      onHover: handleHover,
      onDismiss: handleDismiss,
      onPin: handlePin,
      onShow: handleShow,
    },
  };
}

export default AdaptiveContext;

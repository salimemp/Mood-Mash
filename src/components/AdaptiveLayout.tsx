// ============================================================================
// Adaptive Layout Component
// Dynamic dashboard layout that adapts to user behavior
// ============================================================================

import React, { useState, useMemo } from 'react';
import { useAdaptive, ComponentUsageStats } from '../contexts/AdaptiveUIContext';
import { Settings, Layout, Maximize2, Minimize2, Grid, List, Sparkles, X, GripVertical } from 'lucide-react';

interface AdaptiveLayoutProps {
  children: React.ReactNode;
  className?: string;
}

interface LayoutWidget {
  id: string;
  component: React.ReactNode;
  defaultPriority: number;
  minSize?: 'compact' | 'standard' | 'hero';
  maxSize?: 'compact' | 'standard' | 'hero';
  isPinnable?: boolean;
}

export function AdaptiveLayout({ children, className = '' }: AdaptiveLayoutProps) {
  const {
    state,
    setLayoutMode,
    toggleGamification,
    toggleSocial,
    resetLayout,
  } = useAdaptive();

  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Get layout mode styles
  const layoutStyles = useMemo(() => {
    switch (state.layoutConfig.mode) {
      case 'focus':
        return {
          container: 'max-w-2xl mx-auto',
          grid: 'grid-cols-1',
          widget: 'col-span-1',
        };
      case 'compact':
        return {
          container: 'max-w-6xl mx-auto',
          grid: 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6',
          widget: 'col-span-1',
        };
      case 'dashboard':
      default:
        return {
          container: 'max-w-7xl mx-auto',
          grid: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
          widget: 'col-span-1 md:col-span-1',
        };
    }
  }, [state.layoutConfig.mode]);

  return (
    <div className={`adaptive-layout ${className}`}>
      {/* Layout Controls */}
      <div className="flex items-center justify-between mb-4 px-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLayoutMode('dashboard')}
            className={`p-2 rounded-lg transition-colors ${
              state.layoutConfig.mode === 'dashboard'
                ? 'bg-indigo-500/20 text-indigo-400'
                : 'hover:bg-slate-800 text-slate-400'
            }`}
            title="Dashboard View"
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setLayoutMode('focus')}
            className={`p-2 rounded-lg transition-colors ${
              state.layoutConfig.mode === 'focus'
                ? 'bg-indigo-500/20 text-indigo-400'
                : 'hover:bg-slate-800 text-slate-400'
            }`}
            title="Focus Mode"
          >
            <Minimize2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setLayoutMode('compact')}
            className={`p-2 rounded-lg transition-colors ${
              state.layoutConfig.mode === 'compact'
                ? 'bg-indigo-500/20 text-indigo-400'
                : 'hover:bg-slate-800 text-slate-400'
            }`}
            title="Compact Mode"
          >
            <List className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleGamification}
            className={`p-2 rounded-lg transition-colors ${
              state.layoutConfig.showGamification
                ? 'bg-indigo-500/20 text-indigo-400'
                : 'hover:bg-slate-800 text-slate-400'
            }`}
            title="Toggle Gamification"
          >
            <Sparkles className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`p-2 rounded-lg transition-colors ${
              isEditing
                ? 'bg-indigo-500/20 text-indigo-400'
                : 'hover:bg-slate-800 text-slate-400'
            }`}
            title="Edit Layout"
          >
            <Layout className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className={`grid ${layoutStyles.grid} gap-4 ${isExpanded ? 'px-0' : 'px-4'}`}>
        {React.Children.map(children, (child, index) => {
          if (!React.isValidElement(child)) return null;

          const childProps = child.props as { 'data-widget-id'?: string };
          const widgetId = childProps['data-widget-id'] || `widget-${index}`;

          return (
            <AdaptiveWidget
              key={widgetId}
              widgetId={widgetId}
              isEditing={isEditing}
              layoutMode={state.layoutConfig.mode}
            >
              {child}
            </AdaptiveWidget>
          );
        })}
      </div>

      {/* Layout Reset */}
      {isEditing && (
        <div className="fixed bottom-20 right-4 z-50">
          <button
            onClick={resetLayout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors"
          >
            <Settings className="w-4 h-4" />
            Reset Layout
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Adaptive Widget Component
// Individual widget that adapts its size based on user behavior
// ============================================================================

interface AdaptiveWidgetProps {
  children: React.ReactNode;
  widgetId: string;
  isEditing?: boolean;
  layoutMode?: 'dashboard' | 'focus' | 'compact';
  defaultSize?: 'compact' | 'standard' | 'hero';
}

export function AdaptiveWidget({
  children,
  widgetId,
  isEditing = false,
  layoutMode = 'dashboard',
  defaultSize = 'standard',
}: AdaptiveWidgetProps) {
  const { getWidgetState, state } = useAdaptive();

  const widgetState = getWidgetState(widgetId);

  // Calculate span based on widget state and layout mode
  const getSpanClass = (): string => {
    const size = defaultSize === 'hero' ? 'hero' : widgetState;

    // Override size based on layout mode
    const effectiveSize = layoutMode === 'compact' ? 'compact' : size;

    switch (effectiveSize) {
      case 'hero':
        return 'md:col-span-2 lg:col-span-2 row-span-2';
      case 'compact':
        return 'col-span-1';
      case 'standard':
      default:
        return 'col-span-1 md:col-span-1';
    }
  };

  // Get priority indicator
  const priority = state.componentStats.get(widgetId)?.priority ?? 0;

  return (
    <div
      className={`
        relative
        rounded-2xl
        transition-all
        duration-300
        ${getSpanClass()}
        ${isEditing ? 'ring-2 ring-indigo-500/50 hover:ring-indigo-500' : ''}
        ${priority >= 80 ? 'ring-1 ring-amber-500/30' : ''}
      `}
      data-widget-id={widgetId}
    >
      {/* Priority Indicator (Editing Mode) */}
      {isEditing && (
        <div className="absolute -top-2 -right-2 z-10 flex items-center gap-1">
          <span className="px-2 py-1 bg-indigo-500/90 text-white text-xs rounded-full">
            {priority}%
          </span>
          <button className="p-1 bg-slate-800 rounded-full hover:bg-slate-700">
            <GripVertical className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      )}

      {/* Content */}
      <div className="h-full">
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// Adaptive Widget Wrapper
// HOC to wrap components with adaptive behavior
// ============================================================================

interface AdaptiveWrapperProps {
  widgetId: string;
  children: React.ReactNode;
  priority?: number;
}

export function withAdaptive<P extends object>(
  Component: React.ComponentType<P>,
  widgetId: string,
  defaultPriority: number = 50
): React.FC<P> {
  return function AdaptiveWrapper(props: P) {
    const { trackInteraction, getWidgetState } = useAdaptive();
    const widgetState = getWidgetState(widgetId);

    const handleClick = () => {
      trackInteraction({
        componentId: widgetId,
        componentType: 'module',
        action: 'click',
      });
    };

    return (
      <div onClick={handleClick} data-widget-id={widgetId}>
        <Component {...props} />
      </div>
    );
  };
}

// ============================================================================
// Circadian Theme Wrapper
// Applies time-based theming
// ============================================================================

interface CircadianWrapperProps {
  children: React.ReactNode;
}

export function CircadianWrapper({ children }: CircadianWrapperProps) {
  const { getCircadianConfig } = useAdaptive();
  const theme = getCircadianConfig();

  return (
    <div
      className="circadian-theme"
      data-theme={theme.mode}
      style={{
        '--circadian-primary': theme.primaryColor,
        '--circadian-background': theme.backgroundColor,
        '--circadian-accent': theme.accentColor,
        '--circadian-contrast': theme.contrastLevel === 'high' ? '1' : theme.contrastLevel === 'medium' ? '0.8' : '0.6',
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

// ============================================================================
// Content Density Controller
// Controls content density based on user preference
// ============================================================================

interface ContentDensityProps {
  children: React.ReactNode;
  density?: 'compact' | 'standard' | 'expanded';
}

export function ContentDensity({ children, density = 'standard' }: ContentDensityProps) {
  const densityClasses = {
    compact: 'text-sm p-2 gap-2',
    standard: 'text-base p-4 gap-4',
    expanded: 'text-lg p-6 gap-6',
  };

  return (
    <div className={`content-density ${densityClasses[density]}`}>
      {children}
    </div>
  );
}

// ============================================================================
// Focus Mode Component
// ============================================================================

interface FocusModeProps {
  children: React.ReactNode;
  featureId: string;
}

export function FocusMode({ children, featureId }: FocusModeProps) {
  const { trackInteraction } = useAdaptive();
  const [isActive, setIsActive] = useState(false);

  const handleToggle = () => {
    const newState = !isActive;
    setIsActive(newState);
    trackInteraction({
      componentId: featureId,
      componentType: 'feature',
      action: newState ? 'click' : 'dismiss',
    });
  };

  if (!isActive) {
    return (
      <button
        onClick={handleToggle}
        className="w-full py-8 border-2 border-dashed border-slate-700 rounded-2xl text-slate-500 hover:border-indigo-500 hover:text-indigo-400 transition-colors"
      >
        <Maximize2 className="w-8 h-8 mx-auto mb-2" />
        Enter Focus Mode
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-xl">
      <button
        onClick={handleToggle}
        className="absolute top-4 right-4 p-2 bg-slate-800 rounded-lg hover:bg-slate-700"
      >
        <X className="w-5 h-5" />
      </button>
      <div className="max-w-3xl mx-auto pt-20">
        {children}
      </div>
    </div>
  );
}

export default AdaptiveLayout;

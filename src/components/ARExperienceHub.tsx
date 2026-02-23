// ============================================================================
// AR Experience Hub Component
// Central hub for all AR experiences: Meditation, Yoga, Mood, Social
// ============================================================================

import React, { useState } from 'react';
import {
  Sparkles, Wind, Activity, Users, Heart, Zap,
  Mountain, Waves, Trees, Stars, Sun,
  ChevronRight, Play, Clock, Star, TrendingUp,
  Volume2, Video, MessageCircle, Share2
} from 'lucide-react';
import ARMoodVisualization from './ARMoodVisualization';
import ARSocialSpace from './ARSocialSpace';
import { AREnvironment } from '../services/arServices';

interface ARExperienceHubProps {
  onClose: () => void;
  userId: string;
  userName: string;
}

interface ARActivity {
  id: string;
  title: string;
  description: string;
  type: 'meditation' | 'yoga' | 'mood' | 'social';
  icon: React.ReactNode;
  duration?: string;
  participants?: number;
  environment?: AREnvironment;
  isNew?: boolean;
  isPopular?: boolean;
}

interface RecentActivity {
  id: string;
  type: 'meditation' | 'yoga' | 'mood' | 'social';
  title: string;
  timestamp: Date;
  duration?: number;
  mood?: string;
}

// ============================================================================
// AR Experience Hub
// ============================================================================

export function ARExperienceHub({ onClose, userId, userName }: ARExperienceHubProps) {
  const [activeView, setActiveView] = useState<'hub' | 'meditation' | 'yoga' | 'mood' | 'social'>('hub');
  const [selectedEnvironment, setSelectedEnvironment] = useState<AREnvironment>({
    type: 'nature',
    timeOfDay: 'sunset',
    weather: 'clear',
    lighting: {
      intensity: 0.8,
      color: '#ffd700',
      shadows: true,
      ambientColor: '#ffffff',
      sunPosition: { x: 5, y: 10, z: 5 }
    }
  });
  const [showMoodVisualization, setShowMoodVisualization] = useState(false);
  const [showSocialSpace, setShowSocialSpace] = useState(false);

  // Mock activities data
  const activities: ARActivity[] = [
    {
      id: 'meditation-1',
      title: 'Guided Breathing Journey',
      description: 'Immersive breathing meditation in a serene forest environment',
      type: 'meditation',
      icon: <Wind className="w-6 h-6" />,
      duration: '10 min',
      environment: { type: 'forest', timeOfDay: 'morning', weather: 'clear' },
      isNew: true
    },
    {
      id: 'meditation-2',
      title: 'Ocean Wave Meditation',
      description: 'Relax to the sounds and visuals of ocean waves',
      type: 'meditation',
      icon: <Waves className="w-6 h-6" />,
      duration: '15 min',
      environment: { type: 'ocean', timeOfDay: 'sunset', weather: 'clear' }
    },
    {
      id: 'meditation-3',
      title: 'Mountain Peak Mindfulness',
      description: 'Elevated meditation with panoramic mountain views',
      type: 'meditation',
      icon: <Mountain className="w-6 h-6" />,
      duration: '20 min',
      environment: { type: 'mountain', timeOfDay: 'noon', weather: 'clear' },
      isPopular: true
    },
    {
      id: 'yoga-1',
      title: 'Morning Flow',
      description: 'Energizing yoga session to start your day',
      type: 'yoga',
      icon: <Activity className="w-6 h-6" />,
      duration: '30 min',
      environment: { type: 'garden', timeOfDay: 'morning', weather: 'clear' }
    },
    {
      id: 'yoga-2',
      title: 'Sunset Yoga',
      description: 'Relaxing evening yoga practice with sunset views',
      type: 'yoga',
      icon: <Sun className="w-6 h-6" />,
      duration: '25 min',
      environment: { type: 'beach', timeOfDay: 'sunset', weather: 'clear' }
    },
    {
      id: 'yoga-3',
      title: 'Starlight Yoga',
      description: 'Nighttime yoga under a canopy of stars',
      type: 'yoga',
      icon: <Stars className="w-6 h-6" />,
      duration: '20 min',
      environment: { type: 'nature', timeOfDay: 'night', weather: 'stars' }
    },
    {
      id: 'mood-1',
      title: 'Mood Sphere Visualization',
      description: 'See your emotions in 3D with particle effects',
      type: 'mood',
      icon: <Sparkles className="w-6 h-6" />,
      isNew: true
    },
    {
      id: 'mood-2',
      title: 'Mood Journey Timeline',
      description: 'Visualize your emotional journey through time',
      type: 'mood',
      icon: <TrendingUp className="w-6 h-6" />,
      isPopular: true
    },
    {
      id: 'social-1',
      title: 'Group Meditation',
      description: 'Meditate together with others in shared space',
      type: 'social',
      icon: <Users className="w-6 h-6" />,
      participants: 12,
      environment: { type: 'temple', timeOfDay: 'sunset', weather: 'clear' }
    },
    {
      id: 'social-2',
      title: 'Support Circle',
      description: 'Connect with others in a supportive environment',
      type: 'social',
      icon: <Heart className="w-6 h-6" />,
      participants: 8
    }
  ];

  // Mock recent activities
  const recentActivities: RecentActivity[] = [
    { id: 'rec1', type: 'meditation', title: 'Forest Breathing', timestamp: new Date(Date.now() - 3600000), duration: 15, mood: 'calm' },
    { id: 'rec2', type: 'yoga', title: 'Morning Flow', timestamp: new Date(Date.now() - 86400000), duration: 30, mood: 'energized' },
    { id: 'rec3', type: 'social', title: 'Group Meditation', timestamp: new Date(Date.now() - 172800000), duration: 20, mood: 'grateful' }
  ];

  // Environment options
  const environmentOptions: AREnvironment[] = [
    { type: 'nature', timeOfDay: 'morning', weather: 'clear' },
    { type: 'nature', timeOfDay: 'noon', weather: 'clear' },
    { type: 'nature', timeOfDay: 'sunset', weather: 'clear' },
    { type: 'nature', timeOfDay: 'night', weather: 'stars' },
    { type: 'ocean', timeOfDay: 'sunset', weather: 'clear' },
    { type: 'forest', timeOfDay: 'morning', weather: 'fog' },
    { type: 'mountain', timeOfDay: 'noon', weather: 'clear' },
    { type: 'temple', timeOfDay: 'sunset', weather: 'clear' }
  ];

  // Get activity icon background color
  const getActivityColor = (type: string): string => {
    switch (type) {
      case 'meditation': return 'from-cyan-500 to-blue-500';
      case 'yoga': return 'from-purple-500 to-pink-500';
      case 'mood': return 'from-yellow-500 to-orange-500';
      case 'social': return 'from-green-500 to-teal-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  // Get mood emoji
  const getMoodEmoji = (mood?: string): string => {
    const emojis: Record<string, string> = {
      calm: '😌', energized: '⚡', grateful: '🙏', happy: '😊',
      peaceful: '😌', neutral: '😐', sad: '😢', anxious: '😰'
    };
    return mood ? emojis[mood] || '😐' : '😐';
  };

  // Format time ago
  const formatTimeAgo = (date: Date): string => {
    const hours = Math.floor((Date.now() - date.getTime()) / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  // Activity type icon mapping
  const getTypeIcon = (type: string): React.ReactNode => {
    switch (type) {
      case 'meditation': return <Wind className="w-4 h-4" />;
      case 'yoga': return <Activity className="w-4 h-4" />;
      case 'mood': return <Sparkles className="w-4 h-4" />;
      case 'social': return <Users className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  // If showing specific AR experience
  if (activeView === 'mood') {
    return (
      <ARMoodVisualization
        moodHistory={[
          { date: new Date(Date.now() - 86400000 * 7), mood: 'happy', intensity: 0.8 },
          { date: new Date(Date.now() - 86400000 * 6), mood: 'calm', intensity: 0.7 },
          { date: new Date(Date.now() - 86400000 * 5), mood: 'energetic', intensity: 0.9 },
          { date: new Date(Date.now() - 86400000 * 4), mood: 'neutral', intensity: 0.5 },
          { date: new Date(Date.now() - 86400000 * 3), mood: 'grateful', intensity: 0.8 },
          { date: new Date(Date.now() - 86400000 * 2), mood: 'happy', intensity: 0.85 },
          { date: new Date(Date.now() - 86400000), mood: 'peaceful', intensity: 0.75 }
        ]}
        currentMood="happy"
        onClose={onClose}
        onShare={(blob) => console.log('Shared:', blob)}
      />
    );
  }

  if (showSocialSpace) {
    return (
      <ARSocialSpace
        onClose={() => setShowSocialSpace(false)}
        userId={userId}
        userName={userName}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">AR Experience Hub</h2>
            <p className="text-sm text-white/60">Immersive wellness experiences</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <span className="text-white">✕</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Environment Selector */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-white/70 mb-3">Choose Environment</h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {environmentOptions.map((env, index) => (
              <button
                key={index}
                onClick={() => setSelectedEnvironment({ ...env, lighting: selectedEnvironment.lighting })}
                className={`flex-shrink-0 p-3 rounded-xl border transition-all ${
                  selectedEnvironment.type === env.type && selectedEnvironment.timeOfDay === env.timeOfDay
                    ? 'bg-purple-500/20 border-purple-500'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  {env.type === 'nature' && <Trees className="w-4 h-4 text-green-400" />}
                  {env.type === 'ocean' && <Waves className="w-4 h-4 text-blue-400" />}
                  {env.type === 'forest' && <Trees className="w-4 h-4 text-emerald-400" />}
                  {env.type === 'mountain' && <Mountain className="w-4 h-4 text-gray-400" />}
                  {env.type === 'temple' && <div className="w-4 h-4 rounded-full bg-yellow-400" />}
                  <span className="text-white text-sm capitalize">{env.timeOfDay}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        {recentActivities.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-white/70 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Recent Sessions
            </h3>
            <div className="space-y-2">
              {recentActivities.map(activity => (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getActivityColor(activity.type)} flex items-center justify-center text-white`}>
                    {getTypeIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-medium">{activity.title}</h4>
                    <p className="text-white/50 text-sm">
                      {activity.duration} min • {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                  {activity.mood && (
                    <span className="text-xl">{getMoodEmoji(activity.mood)}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity Categories */}
        <div className="space-y-6">
          {/* Meditation */}
          <div>
            <h3 className="text-sm font-medium text-white/70 mb-3 flex items-center gap-2">
              <Wind className="w-4 h-4 text-cyan-400" />
              AR Meditation
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {activities.filter(a => a.type === 'meditation').map(activity => (
                <button
                  key={activity.id}
                  onClick={() => setActiveView('meditation')}
                  className="relative p-4 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl border border-cyan-500/30 hover:border-cyan-500/50 transition-all text-left group"
                >
                  {activity.isNew && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
                      NEW
                    </span>
                  )}
                  {activity.isPopular && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 bg-yellow-500 text-black text-xs rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3" /> POPULAR
                    </span>
                  )}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getActivityColor(activity.type)} flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform`}>
                    {activity.icon}
                  </div>
                  <h4 className="text-white font-semibold mb-1">{activity.title}</h4>
                  <p className="text-white/60 text-sm mb-2">{activity.description}</p>
                  <div className="flex items-center gap-2 text-white/50 text-sm">
                    <Clock className="w-4 h-4" />
                    {activity.duration}
                  </div>
                  <ChevronRight className="absolute bottom-4 right-4 w-5 h-5 text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </div>

          {/* Yoga & Fitness */}
          <div>
            <h3 className="text-sm font-medium text-white/70 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              AR Yoga & Fitness
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {activities.filter(a => a.type === 'yoga').map(activity => (
                <button
                  key={activity.id}
                  onClick={() => setActiveView('yoga')}
                  className="relative p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-500/30 hover:border-purple-500/50 transition-all text-left group"
                >
                  {activity.isPopular && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 bg-yellow-500 text-black text-xs rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3" /> POPULAR
                    </span>
                  )}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getActivityColor(activity.type)} flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform`}>
                    {activity.icon}
                  </div>
                  <h4 className="text-white font-semibold mb-1">{activity.title}</h4>
                  <p className="text-white/60 text-sm mb-2">{activity.description}</p>
                  <div className="flex items-center gap-2 text-white/50 text-sm">
                    <Clock className="w-4 h-4" />
                    {activity.duration}
                  </div>
                  <ChevronRight className="absolute bottom-4 right-4 w-5 h-5 text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </div>

          {/* Mood Visualization */}
          <div>
            <h3 className="text-sm font-medium text-white/70 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              AR Mood Visualization
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activities.filter(a => a.type === 'mood').map(activity => (
                <button
                  key={activity.id}
                  onClick={() => setActiveView('mood')}
                  className="relative p-4 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl border border-yellow-500/30 hover:border-yellow-500/50 transition-all text-left group"
                >
                  {activity.isNew && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
                      NEW
                    </span>
                  )}
                  {activity.isPopular && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 bg-yellow-500 text-black text-xs rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3" /> POPULAR
                    </span>
                  )}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getActivityColor(activity.type)} flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform`}>
                    {activity.icon}
                  </div>
                  <h4 className="text-white font-semibold mb-1">{activity.title}</h4>
                  <p className="text-white/60 text-sm">{activity.description}</p>
                  <ChevronRight className="absolute bottom-4 right-4 w-5 h-5 text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </div>

          {/* Social Spaces */}
          <div>
            <h3 className="text-sm font-medium text-white/70 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-green-400" />
              AR Social Spaces
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activities.filter(a => a.type === 'social').map(activity => (
                <button
                  key={activity.id}
                  onClick={() => setShowSocialSpace(true)}
                  className="relative p-4 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-2xl border border-green-500/30 hover:border-green-500/50 transition-all text-left group"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getActivityColor(activity.type)} flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform`}>
                    {activity.icon}
                  </div>
                  <h4 className="text-white font-semibold mb-1">{activity.title}</h4>
                  <p className="text-white/60 text-sm mb-2">{activity.description}</p>
                  <div className="flex items-center gap-2 text-white/50 text-sm">
                    <Users className="w-4 h-4" />
                    {activity.participants} participants
                  </div>
                  <ChevronRight className="absolute bottom-4 right-4 w-5 h-5 text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center justify-between text-sm text-white/50">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Video className="w-4 h-4" /> AR Ready
            </span>
            <span className="flex items-center gap-1">
              <Volume2 className="w-4 h-4" /> Spatial Audio
            </span>
          </div>
          <span>Powered by WebXR</span>
        </div>
      </div>
    </div>
  );
}

export default ARExperienceHub;

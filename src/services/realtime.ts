// ============================================================================
// Real-time Service for MoodMash
// Supabase Realtime subscriptions
// ============================================================================

import { getSupabaseClient, subscribeToChannel, unsubscribe, unsubscribeAll } from '../lib/supabase';
import type { MoodEntry, WellnessSession, Achievement, Notification, Challenge } from '../types/database';

// ============================================================================
// Types
// ============================================================================

type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE';

interface RealtimePayload<T> {
  eventType: RealtimeEvent;
  new?: T;
  old?: T;
  commitTimestamp: string;
}

type MoodCallback = (payload: RealtimePayload<MoodEntry>) => void;
type WellnessCallback = (payload: RealtimePayload<WellnessSession>) => void;
type AchievementCallback = (payload: RealtimePayload<Achievement>) => void;
type NotificationCallback = (payload: RealtimePayload<Notification>) => void;
type ChallengeCallback = (payload: RealtimePayload<Challenge>) => void;

interface SubscriptionIds {
  mood: string | null;
  wellness: string | null;
  achievement: string | null;
  notification: string | null;
  challenge: string | null;
}

// ============================================================================
// Subscription Manager
// ============================================================================

const subscriptions: SubscriptionIds = {
  mood: null,
  wellness: null,
  achievement: null,
  notification: null,
  challenge: null,
};

const listeners: {
  mood: Set<MoodCallback>;
  wellness: Set<WellnessCallback>;
  achievement: Set<AchievementCallback>;
  notification: Set<NotificationCallback>;
  challenge: Set<ChallengeCallback>;
} = {
  mood: new Set(),
  wellness: new Set(),
  achievement: new Set(),
  notification: new Set(),
  challenge: new Set(),
};

// ============================================================================
// Mood Subscriptions
// ============================================================================

/**
 * Subscribe to mood entry changes
 */
export function subscribeToMoods(callback: MoodCallback): () => void {
  listeners.mood.add(callback);

  // If not already subscribed, create subscription
  if (!subscriptions.mood) {
    const subscription = subscribeToChannel(
      'mood-changes',
      '*',
      'mood_entries',
      (payload) => {
        const realtimePayload = payload as RealtimePayload<MoodEntry>;
        listeners.mood.forEach((cb) => cb(realtimePayload));
      }
    );
    subscriptions.mood = subscription.id;
  }

  // Return unsubscribe function
  return () => {
    listeners.mood.delete(callback);
    if (listeners.mood.size === 0 && subscriptions.mood) {
      unsubscribe(subscriptions.mood);
      subscriptions.mood = null;
    }
  };
}

/**
 * Subscribe to a specific mood entry
 */
export function subscribeToMoodEntry(
  entryId: string,
  callback: MoodCallback
): () => void {
  return subscribeToMoods((payload) => {
    if (payload.new?.id === entryId || payload.old?.id === entryId) {
      callback(payload);
    }
  });
}

// ============================================================================
// Wellness Subscriptions
// ============================================================================

/**
 * Subscribe to wellness session changes
 */
export function subscribeToWellness(callback: WellnessCallback): () => void {
  listeners.wellness.add(callback);

  if (!subscriptions.wellness) {
    const subscription = subscribeToChannel(
      'wellness-changes',
      '*',
      'wellness_sessions',
      (payload) => {
        const realtimePayload = payload as RealtimePayload<WellnessSession>;
        listeners.wellness.forEach((cb) => cb(realtimePayload));
      }
    );
    subscriptions.wellness = subscription.id;
  }

  return () => {
    listeners.wellness.delete(callback);
    if (listeners.wellness.size === 0 && subscriptions.wellness) {
      unsubscribe(subscriptions.wellness);
      subscriptions.wellness = null;
    }
  };
}

/**
 * Subscribe to wellness sessions by type
 */
export function subscribeToWellnessByType(
  type: WellnessSession['type'],
  callback: WellnessCallback
): () => void {
  return subscribeToWellness((payload) => {
    if (payload.new?.type === type || payload.old?.type === type) {
      callback(payload);
    }
  });
}

// ============================================================================
// Achievement Subscriptions
// ============================================================================

/**
 * Subscribe to achievement updates
 */
export function subscribeToAchievements(callback: AchievementCallback): () => void {
  listeners.achievement.add(callback);

  if (!subscriptions.achievement) {
    const subscription = subscribeToChannel(
      'achievement-changes',
      '*',
      'achievements',
      (payload) => {
        const realtimePayload = payload as RealtimePayload<Achievement>;
        listeners.achievement.forEach((cb) => cb(realtimePayload));
      }
    );
    subscriptions.achievement = subscription.id;
  }

  return () => {
    listeners.achievement.delete(callback);
    if (listeners.achievement.size === 0 && subscriptions.achievement) {
      unsubscribe(subscriptions.achievement);
      subscriptions.achievement = null;
    }
  };
}

/**
 * Subscribe to new achievements
 */
export function subscribeToNewAchievements(callback: AchievementCallback): () => void {
  return subscribeToAchievements((payload) => {
    if (payload.eventType === 'INSERT' && payload.new?.unlocked_at) {
      callback(payload);
    }
  });
}

// ============================================================================
// Notification Subscriptions
// ============================================================================

/**
 * Subscribe to notification updates
 */
export function subscribeToNotifications(callback: NotificationCallback): () => void {
  listeners.notification.add(callback);

  if (!subscriptions.notification) {
    const subscription = subscribeToChannel(
      'notification-changes',
      '*',
      'notifications',
      (payload) => {
        const realtimePayload = payload as RealtimePayload<Notification>;
        listeners.notification.forEach((cb) => cb(realtimePayload));
      }
    );
    subscriptions.notification = subscription.id;
  }

  return () => {
    listeners.notification.delete(callback);
    if (listeners.notification.size === 0 && subscriptions.notification) {
      unsubscribe(subscriptions.notification);
      subscriptions.notification = null;
    }
  };
}

/**
 * Subscribe to unread notifications
 */
export function subscribeToUnreadNotifications(callback: NotificationCallback): () => void {
  return subscribeToNotifications((payload) => {
    if (!payload.new?.is_read) {
      callback(payload);
    }
  });
}

// ============================================================================
// Challenge Subscriptions
// ============================================================================

/**
 * Subscribe to challenge updates
 */
export function subscribeToChallenges(callback: ChallengeCallback): () => void {
  listeners.challenge.add(callback);

  if (!subscriptions.challenge) {
    const subscription = subscribeToChannel(
      'challenge-changes',
      '*',
      'challenges',
      (payload) => {
        const realtimePayload = payload as RealtimePayload<Challenge>;
        listeners.challenge.forEach((cb) => cb(realtimePayload));
      }
    );
    subscriptions.challenge = subscription.id;
  }

  return () => {
    listeners.challenge.delete(callback);
    if (listeners.challenge.size === 0 && subscriptions.challenge) {
      unsubscribe(subscriptions.challenge);
      subscriptions.challenge = null;
    }
  };
}

// ============================================================================
// Broadcast Subscriptions
// ============================================================================

interface BroadcastMessage {
  type: string;
  data: unknown;
  senderId?: string;
}

/**
 * Subscribe to broadcast messages
 */
export function subscribeToBroadcast(
  channelName: string,
  callback: (message: BroadcastMessage) => void
): () => void {
  const client = getSupabaseClient();

  const channel = client.channel(`broadcast:${channelName}`).on(
    'broadcast',
    { event: 'message' },
    (payload) => {
      callback(payload.payload as BroadcastMessage);
    }
  ).subscribe();

  return () => {
    client.removeChannel(channel);
  };
}

/**
 * Send a broadcast message
 */
export async function sendBroadcast(
  channelName: string,
  message: BroadcastMessage
): Promise<void> {
  const client = getSupabaseClient();
  const channel = client.channel(`broadcast:${channelName}`);

  await channel.send({
    type: 'broadcast',
    event: 'message',
    payload: message,
  });
}

// ============================================================================
// Presence Subscriptions
// ============================================================================

interface PresenceState {
  userId: string;
  onlineAt: string;
  metadata?: Record<string, unknown>;
}

/**
 * Subscribe to presence changes (online users)
 */
export function subscribeToPresence(
  roomName: string,
  callback: (state: Record<string, PresenceState>) => void
): () => void {
  const client = getSupabaseClient();
  const channel = client.channel(`presence:${roomName}`);

  channel
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState() as Record<string, PresenceState[]>;
      const mergedState: Record<string, PresenceState> = {};

      Object.entries(state).forEach(([key, presences]) => {
        if (presences.length > 0) {
          mergedState[key] = presences[0] as PresenceState;
        }
      });

      callback(mergedState);
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          userId: 'current-user', // This should be replaced with actual user ID
          onlineAt: new Date().toISOString(),
        });
      }
    });

  return () => {
    client.removeChannel(channel);
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get all active subscription IDs
 */
export function getActiveSubscriptions(): SubscriptionIds {
  return { ...subscriptions };
}

/**
 * Check if a subscription is active
 */
export function isSubscribed(type: keyof SubscriptionIds): boolean {
  return subscriptions[type] !== null;
}

/**
 * Subscribe to all user-related changes at once
 */
export function subscribeToAll(): void {
  // Subscribe to all relevant tables
  subscribeToMoods(() => {});
  subscribeToWellness(() => {});
  subscribeToAchievements(() => {});
  subscribeToNotifications(() => {});
  subscribeToChallenges(() => {});
}

/**
 * Unsubscribe from all realtime updates
 */
export function unsubscribeFromAll(): void {
  unsubscribeAll();

  // Clear subscription IDs
  Object.keys(subscriptions).forEach((key) => {
    (subscriptions as unknown as Record<string, null | undefined>)[key] = null;
  });

  // Clear listeners
  Object.values(listeners).forEach((listenerSet) => {
    listenerSet.clear();
  });
}

/**
 * Subscribe to realtime updates with automatic cleanup on unmount
 */
export function useRealtimeSubscriptions(): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  // Subscribe to all
  subscribeToAll();

  // Return cleanup function
  return () => {
    unsubscribeFromAll();
  };
}

// ============================================================================
// Event Type Exports
// ============================================================================

export type { RealtimePayload, MoodCallback, WellnessCallback, AchievementCallback, NotificationCallback, ChallengeCallback };

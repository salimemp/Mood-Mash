// ============================================================================
// Supabase Client Configuration
// MoodMash Backend - Database Connection
// ============================================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ============================================================================
// Environment Configuration
// ============================================================================

interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
}

/**
 * Get Supabase configuration from environment variables
 * Returns placeholder values if credentials not yet provided
 */
function getSupabaseConfig(): SupabaseConfig {
  const url = import.meta.env['VITE_SUPABASE_URL'] || 'https://your-project.supabase.co';
  const anonKey = import.meta.env['VITE_SUPABASE_ANON_KEY'] || 'placeholder-anon-key';
  const serviceRoleKey = import.meta.env['SUPABASE_SERVICE_ROLE_KEY'] || undefined;

  return {
    url,
    anonKey,
    serviceRoleKey,
  };
}

/**
 * Check if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
  const config = getSupabaseConfig();
  return (
    config.url !== 'https://your-project.supabase.co' &&
    config.anonKey !== 'placeholder-anon-key' &&
    config.url.startsWith('https://') &&
    config.url.includes('.supabase.co')
  );
}

// ============================================================================
// Client Creation
// ============================================================================

// Standard client for authenticated user operations
let supabaseClient: SupabaseClient | null = null;

/**
 * Get or create the Supabase client
 * Uses anon key for public operations
 */
export function getSupabaseClient(): SupabaseClient {
  if (supabaseClient) {
    return supabaseClient;
  }

  const config = getSupabaseConfig();

  const options = {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  };

  supabaseClient = createClient(config.url, config.anonKey, options);

  console.log('[Supabase] Client initialized:', isSupabaseConfigured() ? 'Production mode' : 'Mock/Placeholder mode');

  return supabaseClient;
}

// Admin client for privileged operations (server-side only)
let adminClient: SupabaseClient | null = null;

/**
 * Get admin client with service role key
 * Only use on server-side or with proper access controls
 */
export function getAdminClient(): SupabaseClient | null {
  if (typeof window !== 'undefined') {
    console.warn('[Supabase] Admin client requested from browser - denied');
    return null;
  }

  if (adminClient) {
    return adminClient;
  }

  const config = getSupabaseConfig();

  if (!config.serviceRoleKey) {
    console.warn('[Supabase] Service role key not configured');
    return null;
  }

  const options = {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  };

  adminClient = createClient(config.url, config.serviceRoleKey, options);

  return adminClient;
}

// ============================================================================
// Session Management
// ============================================================================

/**
 * Get current session
 */
export async function getCurrentSession() {
  const client = getSupabaseClient();
  const { data, error } = await client.auth.getSession();

  if (error) {
    console.error('[Supabase] Session error:', error);
    return null;
  }

  return data.session;
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  const client = getSupabaseClient();
  const { data, error } = await client.auth.getUser();

  if (error) {
    console.error('[Supabase] User fetch error:', error);
    return null;
  }

  return data.user;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getCurrentSession();
  return session !== null && session.expires_at !== null && session.expires_at * 1000 > Date.now();
}

// ============================================================================
// Supabase Helpers
// ============================================================================

/**
 * Handle Supabase errors consistently
 */
export function handleSupabaseError(error: unknown, context: string): never {
  console.error(`[Supabase] ${context}:`, error);

  const supabaseError = error as {
    message?: string;
    code?: string;
    details?: string;
    hint?: string;
  };

  const errorMessage = supabaseError.message || 'An unexpected error occurred';
  const errorCode = supabaseError.code || 'UNKNOWN_ERROR';

  throw new Error(`[${errorCode}] ${context}: ${errorMessage}`);
}

/**
 * Safe Supabase query wrapper
 */
export async function safeQuery<T>(
  query: () => Promise<{ data: T | null; error: unknown }>,
  context: string
): Promise<T> {
  const { data, error } = await query();

  if (error) {
    handleSupabaseError(error, context);
  }

  if (!data) {
    throw new Error(`[${context}] No data returned`);
  }

  return data;
}

/**
 * Pagination helper
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  from?: number;
  to?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * Create pagination params from page/limit
 */
export function getPaginationParams(
  page: number = 1,
  limit: number = 20
): { from: number; to: number } {
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  return { from, to };
}

/**
 * Format paginated result
 */
export function formatPaginatedResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / limit);
  return {
    data,
    total,
    page,
    limit,
    totalPages,
    hasMore: page < totalPages,
  };
}

// ============================================================================
// Realtime Subscription Management
// ============================================================================

type SubscriptionCallback = (payload: unknown) => void;

interface Subscription {
  id: string;
  channel: string;
  callback: SubscriptionCallback;
  unsubscribe: () => void;
}

const subscriptions: Map<string, Subscription> = new Map();

/**
 * Subscribe to a Supabase channel
 */
export function subscribeToChannel(
  channelName: string,
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*',
  table: string,
  callback: SubscriptionCallback
): Subscription {
  const client = getSupabaseClient();
  const subscriptionId = `${channelName}-${Date.now()}`;

  const channel = client
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event,
        schema: 'public',
        table,
      },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe();

  const subscription: Subscription = {
    id: subscriptionId,
    channel: channelName,
    callback,
    unsubscribe: () => {
      client.removeChannel(channel);
      subscriptions.delete(subscriptionId);
    },
  };

  subscriptions.set(subscriptionId, subscription);

  return subscription;
}

/**
 * Unsubscribe from a channel
 */
export function unsubscribe(subscriptionId: string): void {
  const subscription = subscriptions.get(subscriptionId);
  if (subscription) {
    subscription.unsubscribe();
    subscriptions.delete(subscriptionId);
  }
}

/**
 * Unsubscribe from all channels
 */
export function unsubscribeAll(): void {
  subscriptions.forEach((subscription) => {
    subscription.unsubscribe();
  });
  subscriptions.clear();
}

// ============================================================================
// Export Types
// ============================================================================

export type { SupabaseClient };
export type { Session, User, AuthError } from '@supabase/supabase-js';

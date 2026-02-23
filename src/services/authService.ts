// ============================================================================
// Authentication Service for MoodMash
// Supabase Auth integration with JWT handling
// ============================================================================

import {
  getSupabaseClient,
  getCurrentSession,
  getCurrentUser,
  isAuthenticated,
  handleSupabaseError,
} from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

// ============================================================================
// Types
// ============================================================================

export interface SignUpData {
  email: string;
  password: string;
  fullName?: string;
  metadata?: Record<string, unknown>;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface PasswordResetData {
  email: string;
}

export interface UpdatePasswordData {
  newPassword: string;
  refreshToken?: string;
}

export interface UpdateProfileData {
  fullName?: string;
  avatarUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  session: Session | null;
  error: string | null;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  session?: Session;
  error?: {
    code: string;
    message: string;
  };
}

// ============================================================================
// Authentication Errors
// ============================================================================

export const AUTH_ERRORS = {
  USER_NOT_FOUND: 'AUTH_ERROR_USER_NOT_FOUND',
  INVALID_CREDENTIALS: 'AUTH_ERROR_INVALID_CREDENTIALS',
  EMAIL_NOT_CONFIRMED: 'AUTH_ERROR_EMAIL_NOT_CONFIRMED',
  WEAK_PASSWORD: 'AUTH_ERROR_WEAK_PASSWORD',
  EMAIL_TAKEN: 'AUTH_ERROR_EMAIL_TAKEN',
  SESSION_EXPIRED: 'AUTH_ERROR_SESSION_EXPIRED',
  NETWORK_ERROR: 'AUTH_ERROR_NETWORK_ERROR',
  UNKNOWN: 'AUTH_ERROR_UNKNOWN',
} as const;

// ============================================================================
// Sign Up
// ============================================================================

/**
 * Create a new user account
 */
export async function signUp(data: SignUpData): Promise<AuthResult> {
  try {
    const client = getSupabaseClient();

    const { data: authData, error } = await client.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          ...data.metadata,
        },
        emailRedirectTo: `${import.meta.env['VITE_APP_URL']}/auth/callback`,
      },
    });

    if (error) {
      // Handle specific error codes
      if (error.message?.includes('email') && error.message?.includes('already')) {
        return {
          success: false,
          error: {
            code: AUTH_ERRORS.EMAIL_TAKEN,
            message: 'An account with this email already exists',
          },
        };
      }

      return {
        success: false,
        error: {
          code: AUTH_ERRORS.UNKNOWN,
          message: error.message || 'Failed to create account',
        },
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: {
          code: AUTH_ERRORS.UNKNOWN,
          message: 'User was not created',
        },
      };
    }

    console.log('[Auth] User signed up:', authData.user.id);

    return {
      success: true,
      user: authData.user,
      session: authData.session || undefined,
    };
  } catch (error) {
    console.error('[Auth] Sign up error:', error);
    return {
      success: false,
      error: {
        code: AUTH_ERRORS.UNKNOWN,
        message: 'An unexpected error occurred during sign up',
      },
    };
  }
}

// ============================================================================
// Sign In
// ============================================================================

/**
 * Sign in with email and password
 */
export async function signIn(data: SignInData): Promise<AuthResult> {
  try {
    const client = getSupabaseClient();

    const { data: authData, error } = await client.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      // Handle specific error messages
      const message = error.message?.toLowerCase() || '';

      if (message.includes('invalid') || message.includes('credentials')) {
        return {
          success: false,
          error: {
            code: AUTH_ERRORS.INVALID_CREDENTIALS,
            message: 'Invalid email or password',
          },
        };
      }

      if (message.includes('confirm') || message.includes('email')) {
        return {
          success: false,
          error: {
            code: AUTH_ERRORS.EMAIL_NOT_CONFIRMED,
            message: 'Please confirm your email address to sign in',
          },
        };
      }

      return {
        success: false,
        error: {
          code: AUTH_ERRORS.UNKNOWN,
          message: error.message || 'Failed to sign in',
        },
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: {
          code: AUTH_ERRORS.USER_NOT_FOUND,
          message: 'User not found',
        },
      };
    }

    console.log('[Auth] User signed in:', authData.user.id);

    return {
      success: true,
      user: authData.user,
      session: authData.session || undefined,
    };
  } catch (error) {
    console.error('[Auth] Sign in error:', error);
    return {
      success: false,
      error: {
        code: AUTH_ERRORS.UNKNOWN,
        message: 'An unexpected error occurred during sign in',
      },
    };
  }
}

// ============================================================================
// Sign Out
// ============================================================================

/**
 * Sign out the current user
 */
export async function signOut(): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getSupabaseClient();
    const { error } = await client.auth.signOut();

    if (error) {
      console.error('[Auth] Sign out error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log('[Auth] User signed out');
    return { success: true };
  } catch (error) {
    console.error('[Auth] Sign out error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred during sign out',
    };
  }
}

// ============================================================================
// Password Reset
// ============================================================================

/**
 * Send password reset email
 */
export async function sendPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getSupabaseClient();
    const redirectUrl = `${import.meta.env['VITE_APP_URL']}/reset-password`;

    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    console.log('[Auth] Password reset email sent to:', email);
    return { success: true };
  } catch (error) {
    console.error('[Auth] Password reset error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Update password (after reset)
 */
export async function updatePassword(data: UpdatePasswordData): Promise<AuthResult> {
  try {
    const client = getSupabaseClient();

    // If we have a refresh token, use it to update
    if (data.refreshToken) {
      const { data: refreshData, error: refreshError } = await client.auth.refreshSession({
        refresh_token: data.refreshToken,
      });

      if (refreshError) {
        return {
          success: false,
          error: {
            code: AUTH_ERRORS.SESSION_EXPIRED,
            message: 'Session has expired, please request a new password reset',
          },
        };
      }

      if (!refreshData.user) {
        return {
          success: false,
          error: {
            code: AUTH_ERRORS.SESSION_EXPIRED,
            message: 'Session has expired',
          },
        };
      }
    }

    const { data: updateData, error } = await client.auth.updateUser({
      password: data.newPassword,
    });

    if (error) {
      const message = error.message?.toLowerCase() || '';

      if (message.includes('weak') || message.includes('password')) {
        return {
          success: false,
          error: {
            code: AUTH_ERRORS.WEAK_PASSWORD,
            message: 'Password is too weak. Please use at least 8 characters with a mix of letters and numbers',
          },
        };
      }

      return {
        success: false,
        error: {
          code: AUTH_ERRORS.UNKNOWN,
          message: error.message || 'Failed to update password',
        },
      };
    }

    console.log('[Auth] Password updated for user:', updateData.user?.id);

    return {
      success: true,
      user: updateData.user || undefined,
    };
  } catch (error) {
    console.error('[Auth] Update password error:', error);
    return {
      success: false,
      error: {
        code: AUTH_ERRORS.UNKNOWN,
        message: 'An unexpected error occurred',
      },
    };
  }
}

// ============================================================================
// Profile Management
// ============================================================================

/**
 * Update user profile
 */
export async function updateProfile(data: UpdateProfileData): Promise<AuthResult> {
  try {
    const client = getSupabaseClient();

    const updates: { data?: Record<string, unknown> } = {};

    if (data.fullName || data.avatarUrl || data.metadata) {
      updates.data = {};
      if (data.fullName) updates.data.full_name = data.fullName;
      if (data.avatarUrl) updates.data.avatar_url = data.avatarUrl;
      if (data.metadata) {
        Object.assign(updates.data, data.metadata);
      }
    }

    if (Object.keys(updates).length === 0) {
      return { success: false, error: { code: 'NO_UPDATES', message: 'No updates provided' } };
    }

    const { data: userData, error } = await client.auth.updateUser(updates);

    if (error) {
      return {
        success: false,
        error: {
          code: AUTH_ERRORS.UNKNOWN,
          message: error.message || 'Failed to update profile',
        },
      };
    }

    console.log('[Auth] Profile updated for user:', userData.user?.id);

    return {
      success: true,
      user: userData.user || undefined,
    };
  } catch (error) {
    console.error('[Auth] Update profile error:', error);
    return {
      success: false,
      error: {
        code: AUTH_ERRORS.UNKNOWN,
        message: 'An unexpected error occurred',
      },
    };
  }
}

// ============================================================================
// Session Management
// ============================================================================

/**
 * Get current session
 */
export async function getSession(): Promise<Session | null> {
  return await getCurrentSession();
}

/**
 * Get current user
 */
export async function getUser(): Promise<User | null> {
  return await getCurrentUser();
}

/**
 * Check if user is authenticated
 */
export async function checkAuth(): Promise<boolean> {
  return await isAuthenticated();
}

/**
 * Refresh session
 */
export async function refreshSession(): Promise<AuthResult> {
  try {
    const client = getSupabaseClient();

    const { data, error } = await client.auth.refreshSession();

    if (error) {
      return {
        success: false,
        error: {
          code: AUTH_ERRORS.SESSION_EXPIRED,
          message: 'Failed to refresh session',
        },
      };
    }

    return {
      success: true,
      user: data.user || undefined,
      session: data.session || undefined,
    };
  } catch (error) {
    console.error('[Auth] Refresh session error:', error);
    return {
      success: false,
      error: {
        code: AUTH_ERRORS.UNKNOWN,
        message: 'An unexpected error occurred',
      },
    };
  }
}

// ============================================================================
// Token Management
// ============================================================================

/**
 * Get access token for API calls
 */
export async function getAccessToken(): Promise<string | null> {
  const session = await getSession();
  return session?.access_token || null;
}

/**
 * Get refresh token for token refresh
 */
export async function getRefreshToken(): Promise<string | null> {
  const session = await getSession();
  return session?.refresh_token || null;
}

// ============================================================================
// OAuth Providers
// ============================================================================

interface OAuthProvider {
  provider: 'google' | 'github' | 'apple';
  redirectTo?: string;
}

/**
 * Sign in with OAuth provider
 */
export async function signInWithOAuth(provider: OAuthProvider): Promise<void> {
  try {
    const client = getSupabaseClient();

    const { data, error } = await client.auth.signInWithOAuth({
      provider: provider.provider,
      options: {
        redirectTo: provider.redirectTo || `${import.meta.env['VITE_APP_URL']}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error('[Auth] OAuth error:', error);
      throw new Error(error.message);
    }

    // Redirect will happen automatically
    console.log('[Auth] OAuth initiated for:', provider.provider);
  } catch (error) {
    console.error('[Auth] OAuth sign in error:', error);
    throw error;
  }
}

// ============================================================================
// Event Listeners
// ============================================================================

type AuthCallback = (event: 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED', session: Session | null) => void;

/**
 * Listen for auth state changes
 */
export function onAuthStateChange(callback: AuthCallback): () => void {
  const client = getSupabaseClient();

  const {
    data: { subscription },
  } = client.auth.onAuthStateChange((event, session) => {
    console.log('[Auth] State changed:', event, session?.user?.id);
    callback(event as 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED', session);
  });

  return () => {
    subscription.unsubscribe();
  };
}

// ============================================================================
// Verification
// ============================================================================

/**
 * Resend email confirmation
 */
export async function resendConfirmationEmail(): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getSupabaseClient();
    const user = await getUser();

    if (!user || !user.email) {
      return {
        success: false,
        error: 'No authenticated user found',
      };
    }

    const { error } = await client.auth.resend({
      type: 'signup',
      email: user.email,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    console.log('[Auth] Confirmation email resent');
    return { success: true };
  } catch (error) {
    console.error('[Auth] Resend confirmation error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Verify email with token
 */
export async function verifyEmail(token: string): Promise<AuthResult> {
  try {
    const client = getSupabaseClient();

    const { data, error } = await client.auth.verifyOtp({
      token_hash: token,
      type: 'signup',
    });

    if (error) {
      return {
        success: false,
        error: {
          code: AUTH_ERRORS.UNKNOWN,
          message: error.message || 'Invalid or expired verification token',
        },
      };
    }

    return {
      success: true,
      user: data.user || undefined,
      session: data.session || undefined,
    };
  } catch (error) {
    console.error('[Auth] Verify email error:', error);
    return {
      success: false,
      error: {
        code: AUTH_ERRORS.UNKNOWN,
        message: 'An unexpected error occurred',
      },
    };
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get user display name
 */
export function getUserDisplayName(user: User | null): string {
  if (!user) return 'Guest';

  // Check metadata first
  const fullName = user.user_metadata?.full_name as string | undefined;
  if (fullName) return fullName;

  // Check email
  if (user.email) {
    return user.email.split('@')[0];
  }

  return 'User';
}

/**
 * Get user avatar URL
 */
export function getUserAvatarUrl(user: User | null): string | null {
  if (!user) return null;

  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;
  if (avatarUrl) return avatarUrl;

  // Check app metadata for provider avatars
  const provider = user.app_metadata?.provider as string | undefined;
  if (provider === 'google' || provider === 'github') {
    // Could return provider avatar URL here
    return null;
  }

  return null;
}

/**
 * Check if email is confirmed
 */
export function isEmailConfirmed(user: User | null): boolean {
  if (!user) return false;
  return !!user.email_confirmed_at;
}

/**
 * Get auth error message for display
 */
export function getAuthErrorMessage(error: { code: string; message: string }): string {
  const errorMessages: Record<string, string> = {
    [AUTH_ERRORS.INVALID_CREDENTIALS]: 'The email or password you entered is incorrect.',
    [AUTH_ERRORS.EMAIL_NOT_CONFIRMED]: 'Please check your email and click the confirmation link.',
    [AUTH_ERRORS.WEAK_PASSWORD]: 'Password must be at least 8 characters long.',
    [AUTH_ERRORS.EMAIL_TAKEN]: 'An account with this email already exists.',
    [AUTH_ERRORS.SESSION_EXPIRED]: 'Your session has expired. Please sign in again.',
    [AUTH_ERRORS.USER_NOT_FOUND]: 'No account found with this email.',
    [AUTH_ERRORS.NETWORK_ERROR]: 'Network error. Please check your connection.',
  };

  return errorMessages[error.code] || error.message || 'An error occurred. Please try again.';
}

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  passkeyEnabled: boolean;
  biometricEnabled: boolean;
  createdAt: Date;
  lastLoginAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  deviceType: string;
  browser: string;
  os: string;
  location?: string;
  createdAt: Date;
  expiresAt: Date;
  lastActivityAt: Date;
}

export interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'fair' | 'good' | 'strong';
}

export type SecurityAlertType =
  | 'new_device'
  | 'new_location'
  | 'suspicious_activity'
  | 'password_change'
  | 'two_factor_enabled'
  | 'two_factor_disabled';

export interface SecurityAlert {
  id: string;
  type: SecurityAlertType;
  timestamp: Date;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  read: boolean;
  metadata?: Record<string, string>;
}

export type AuthError =
  | 'invalid_email'
  | 'invalid_password'
  | 'user_not_found'
  | 'user_not_verified'
  | 'email_already_exists'
  | 'incorrect_2fa_code'
  | 'expired_2fa_code'
  | 'invalid_magic_link'
  | 'expired_magic_link'
  | 'passkey_not_supported'
  | 'passkey_registration_failed'
  | 'passkey_login_failed'
  | 'biometric_not_supported'
  | 'biometric_not_enrolled'
  | 'biometric_verification_failed'
  | 'session_expired'
  | 'rate_limit_exceeded'
  | 'network_error'
  | 'password_breached'
  | 'unknown_error';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;
  requiresTwoFactor: boolean;
  session: Session | null;
  securityAlerts: SecurityAlert[];
  unreadAlertCount: number;
}

interface AuthContextType extends AuthState {
  // Email/Password
  loginWithEmail: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;

  // Social
  loginWithGoogle: () => Promise<void>;
  loginWithGitHub: () => Promise<void>;

  // Passwordless
  loginWithMagicLink: (email: string) => Promise<void>;
  verifyMagicLink: (token: string) => Promise<void>;

  // Passkey/Biometric
  loginWithPasskey: () => Promise<void>;
  registerPasskey: () => Promise<void>;
  removePasskey: (keyId: string) => Promise<void>;
  loginWithBiometric: () => Promise<void>;
  enableBiometric: () => Promise<void>;
  disableBiometric: () => Promise<void>;

  // 2FA
  setup2FA: () => Promise<TwoFactorSetup>;
  verify2FA: (code: string) => Promise<void>;
  disable2FA: (code: string) => Promise<void>;

  // Session
  logout: () => Promise<void>;
  getSessions: () => Promise<Session[]>;
  revokeSession: (sessionId: string) => Promise<void>;
  revokeAllSessions: () => Promise<void>;

  // Password Management
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;

  // Helpers
  clearError: () => void;
  validatePassword: (password: string) => PasswordValidationResult;
  checkBreachedPassword: (password: string) => Promise<boolean>;

  // Email Verification
  resendVerificationEmail: (email: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;

  // Security Alerts
  addSecurityAlert: (type: SecurityAlertType, message: string, severity: SecurityAlert['severity'], metadata?: Record<string, string>) => void;
  markAlertAsRead: (alertId: string) => void;
  markAllAlertsAsRead: () => void;
  clearSecurityAlerts: () => void;
}

// ============================================================================
// Mock Data
// ============================================================================

const mockUsers: Map<string, User & { password: string }> = new Map([
  [
    'demo@moodmash.com',
    {
      id: 'user-demo-001',
      email: 'demo@moodmash.com',
      password: 'Demo123!@#',
      name: 'Demo User',
      emailVerified: true,
      twoFactorEnabled: false,
      passkeyEnabled: false,
      biometricEnabled: false,
      createdAt: new Date('2024-01-01'),
      lastLoginAt: new Date(),
    },
  ],
]);

// ============================================================================
// Context
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// Utilities
// ============================================================================

const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c: string): string => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// ============================================================================
// Password Validation Utilities
// ============================================================================

// Mock list of breached passwords for demo purposes
// In production, this would check against Have I Been Pwned API
const BREACHED_PASSWORDS: Set<string> = new Set([
  'password', '123456', '123456789', '12345678', '12345', '1234567', 'qwerty',
  'password123', 'abc123', 'letmein', 'welcome', 'admin', 'login', 'passw0rd',
  'password1', '123123', '654321', 'password!', 'P@ssw0rd', 'Password123',
  'iloveyou', 'sunshine', 'princess', 'football', 'baseball', 'soccer',
  'hockey', 'basketball', 'dragon', 'monkey', 'master', 'shadow', 'superman',
  'qazwsx', 'michael', 'football', 'jesus', 'justin', 'liverpool', 'arsenal',
  'chelsea', 'manchester', 'spurs', 'newcastle', 'liverpool', 'chelsea'
]);

// Common password patterns to reject
const COMMON_PATTERNS: RegExp[] = [
  /^(.)\1{3,}$/, // Same character repeated 4+ times
  /^[0-9]+$/, // Only numbers
  /^[a-zA-Z]+$/, // Only letters
  /^[!@#$%^&*(),.?":{}|<>]+$/, // Only special characters
  /password/i, // Contains "password"
  /123456/i, // Contains common number sequences
  /qwerty/i, // Contains keyboard patterns
  /^[a-z]{4,}$/i, // Too simple all lowercase
];

/**
 * Validates a password against security requirements
 * Requirements:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 * - Not a breached password
 * - No common patterns
 */
const validatePasswordStrength = (password: string): PasswordValidationResult => {
  const errors: string[] = [];
  let metRequirements = 0;
  const totalRequirements = 5;

  // Length check
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else {
    metRequirements++;
  }

  // Uppercase check
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else {
    metRequirements++;
  }

  // Lowercase check
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else {
    metRequirements++;
  }

  // Number check
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  } else {
    metRequirements++;
  }

  // Special character check
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  } else {
    metRequirements++;
  }

  // Check for common patterns
  for (const pattern of COMMON_PATTERNS) {
    if (pattern.test(password)) {
      errors.push('Password contains a common pattern that is too easy to guess');
      break;
    }
  }

  // Calculate strength
  let strength: 'weak' | 'fair' | 'good' | 'strong';
  const ratio = metRequirements / totalRequirements;

  if (ratio <= 0.4 || errors.length > 3) {
    strength = 'weak';
  } else if (ratio <= 0.6) {
    strength = 'fair';
  } else if (ratio < 1 || errors.length > 0) {
    strength = 'good';
  } else {
    strength = 'strong';
  }

  return {
    isValid: errors.length === 0 && metRequirements === totalRequirements,
    errors,
    strength,
  };
};

/**
 * Checks if a password has been found in a data breach
 * In production, this would use the Have I Been Pwned API (k-anonymity model)
 */
const isBreachedPassword = async (password: string): Promise<boolean> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // For demo, check against our mock list
  // In production, use: https://api.pwnedpasswords.com/range/{first5chars}
  return BREACHED_PASSWORDS.has(password.toLowerCase());
};

const DEMO_MODE = true;

// ============================================================================
// Provider
// ============================================================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    requiresTwoFactor: false,
    session: null,
    securityAlerts: [],
    unreadAlertCount: 0,
  });

  const setError = useCallback((error: AuthError) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // ============================================================================
  // Email/Password Authentication
  // ============================================================================

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const user = mockUsers.get(email);

      if (!user) {
        setError('user_not_found');
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      if (user.password !== password) {
        setError('invalid_password');
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      if (!user.emailVerified) {
        setError('user_not_verified');
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      const session: Session = {
        id: generateUUID(),
        userId: user.id,
        deviceType: 'web',
        browser: navigator.userAgent,
        os: navigator.platform,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        lastActivityAt: new Date(),
      };

      if (DEMO_MODE) {
        localStorage.setItem('moodmash_user', JSON.stringify(user));
        localStorage.setItem('moodmash_session', JSON.stringify(session));
      }

      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        requiresTwoFactor: false,
        session,
        securityAlerts: [],
        unreadAlertCount: 0,
      });
    } catch {
      setError('network_error');
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [setError]);

  const register = useCallback(async (email: string, password: string, name: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      if (password.length < 8) {
        setError('invalid_password');
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      if (mockUsers.has(email)) {
        setError('email_already_exists');
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      const newUser: User & { password: string } = {
        id: generateUUID(),
        email,
        password,
        name,
        emailVerified: false,
        twoFactorEnabled: false,
        passkeyEnabled: false,
        biometricEnabled: false,
        createdAt: new Date(),
        lastLoginAt: new Date(),
      };

      mockUsers.set(email, newUser);

      setState((prev) => ({ ...prev, isLoading: false }));

      alert('Registration successful! Please check your email to verify your account.');
    } catch {
      setError('unknown_error');
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [setError]);

  // ============================================================================
  // Social Authentication
  // ============================================================================

  const loginWithGoogle = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockGoogleUser: User = {
        id: 'google-' + generateUUID(),
        email: 'user@gmail.com',
        name: 'Google User',
        emailVerified: true,
        twoFactorEnabled: false,
        passkeyEnabled: false,
        biometricEnabled: false,
        createdAt: new Date(),
        lastLoginAt: new Date(),
      };

      const session: Session = {
        id: generateUUID(),
        userId: mockGoogleUser.id,
        deviceType: 'web',
        browser: navigator.userAgent,
        os: navigator.platform,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() * 2),
        lastActivityAt: new Date(),
      };

      localStorage.setItem('moodmash_user', JSON.stringify(mockGoogleUser));
      localStorage.setItem('moodmash_session', JSON.stringify(session));

      setState({
        user: mockGoogleUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        requiresTwoFactor: false,
        session,
        securityAlerts: [],
        unreadAlertCount: 0,
      });
    } catch {
      setError('network_error');
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const loginWithGitHub = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockGitHubUser: User = {
        id: 'github-' + generateUUID(),
        email: 'user@github.com',
        name: 'GitHub User',
        emailVerified: true,
        twoFactorEnabled: false,
        passkeyEnabled: false,
        biometricEnabled: false,
        createdAt: new Date(),
        lastLoginAt: new Date(),
      };

      const session: Session = {
        id: generateUUID(),
        userId: mockGitHubUser.id,
        deviceType: 'web',
        browser: navigator.userAgent,
        os: navigator.platform,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() * 2),
        lastActivityAt: new Date(),
      };

      localStorage.setItem('moodmash_user', JSON.stringify(mockGitHubUser));
      localStorage.setItem('moodmash_session', JSON.stringify(session));

      setState({
        user: mockGitHubUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        requiresTwoFactor: false,
        session,
        securityAlerts: [],
        unreadAlertCount: 0,
      });
    } catch {
      setError('network_error');
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  // ============================================================================
  // Magic Link Authentication
  // ============================================================================

  const loginWithMagicLink = useCallback(async (_email: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setState((prev) => ({ ...prev, isLoading: false }));

      alert(`Magic link sent! (Demo: check console for token)`);
      console.log('[Demo] Magic link token:', generateUUID());
    } catch {
      setError('network_error');
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const verifyMagicLink = useCallback(async (_token: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockUser: User = {
        id: 'magic-' + generateUUID(),
        email: 'user@magic.link',
        name: 'Magic User',
        emailVerified: true,
        twoFactorEnabled: false,
        passkeyEnabled: false,
        biometricEnabled: false,
        createdAt: new Date(),
        lastLoginAt: new Date(),
      };

      setState({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        requiresTwoFactor: false,
        session: null,
        securityAlerts: [],
        unreadAlertCount: 0,
      });
    } catch {
      setError('invalid_magic_link');
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  // ============================================================================
  // Passkey Authentication (WebAuthn)
  // ============================================================================

  const loginWithPasskey = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      if (!window.PublicKeyCredential) {
        setError('passkey_not_supported');
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 1500));

      const mockUser: User = {
        id: 'passkey-' + generateUUID(),
        email: 'passkey@moodmash.com',
        name: 'Passkey User',
        emailVerified: true,
        twoFactorEnabled: false,
        passkeyEnabled: true,
        biometricEnabled: false,
        createdAt: new Date(),
        lastLoginAt: new Date(),
      };

      setState({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        requiresTwoFactor: false,
        session: null,
        securityAlerts: [],
        unreadAlertCount: 0,
      });
    } catch {
      setError('passkey_login_failed');
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const registerPasskey = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      if (!window.PublicKeyCredential) {
        setError('passkey_not_supported');
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log('[Demo] Passkey registered successfully');

      setState((prev) => {
        if (prev.user) {
          const updatedUser = { ...prev.user, passkeyEnabled: true };
          localStorage.setItem('moodmash_user', JSON.stringify(updatedUser));
          return { ...prev, user: updatedUser, isLoading: false };
        }
        return { ...prev, isLoading: false };
      });

      alert('Passkey registered successfully!');
    } catch {
      setError('passkey_registration_failed');
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  // ============================================================================
  // Biometric Authentication
  // ============================================================================

  const loginWithBiometric = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      if (!window.PublicKeyCredential) {
        setError('biometric_not_supported');
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      const isAvailable = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();

      if (!isAvailable) {
        setError('biometric_not_enrolled');
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockUser: User = {
        id: 'biometric-' + generateUUID(),
        email: 'biometric@moodmash.com',
        name: 'Biometric User',
        emailVerified: true,
        twoFactorEnabled: false,
        passkeyEnabled: false,
        biometricEnabled: true,
        createdAt: new Date(),
        lastLoginAt: new Date(),
      };

      setState({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        requiresTwoFactor: false,
        session: null,
        securityAlerts: [],
        unreadAlertCount: 0,
      });
    } catch {
      setError('biometric_verification_failed');
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const enableBiometric = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      if (!window.PublicKeyCredential) {
        setError('biometric_not_supported');
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      const isAvailable = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();

      if (!isAvailable) {
        setError('biometric_not_enrolled');
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));

      setState((prev) => {
        if (prev.user) {
          const updatedUser = { ...prev.user, biometricEnabled: true };
          localStorage.setItem('moodmash_user', JSON.stringify(updatedUser));
          return { ...prev, user: updatedUser, isLoading: false };
        }
        return { ...prev, isLoading: false };
      });

      alert('Biometric authentication enabled!');
    } catch {
      setError('biometric_verification_failed');
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const disableBiometric = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setState((prev) => {
        if (prev.user) {
          const updatedUser = { ...prev.user, biometricEnabled: false };
          localStorage.setItem('moodmash_user', JSON.stringify(updatedUser));
          return { ...prev, user: updatedUser, isLoading: false };
        }
        return { ...prev, isLoading: false };
      });

      alert('Biometric authentication disabled.');
    } catch {
      setError('unknown_error');
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const removePasskey = useCallback(async (keyId: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log('[Demo] Passkey removed:', keyId);

      setState((prev) => ({ ...prev, isLoading: false }));
    } catch {
      setError('unknown_error');
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  // ============================================================================
  // Two-Factor Authentication
  // ============================================================================

  const setup2FA = useCallback(async (): Promise<TwoFactorSetup> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const secret = 'JBSWY3DPEHPK3PXP';
      const setup: TwoFactorSetup = {
        secret,
        qrCodeUrl: `otpauth://totp/MoodMash:demo@moodmash.com?secret=${secret}&issuer=MoodMash&algorithm=SHA1&digits=6&period=30`,
        backupCodes: ['ABC-123', 'DEF-456', 'GHI-789', 'JKL-012', 'MNO-345', 'PQR-678', 'STU-901', 'VWX-234'],
      };

      setState((prev) => ({ ...prev, isLoading: false }));

      return setup;
    } catch {
      setError('unknown_error');
      setState((prev) => ({ ...prev, isLoading: false }));
      throw new Error('Failed to setup 2FA');
    }
  }, []);

  const verify2FA = useCallback(async (code: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (code.length !== 6 || !/^\d+$/.test(code)) {
        setError('incorrect_2fa_code');
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      setState((prev) => {
        if (prev.user) {
          const updatedUser = { ...prev.user, twoFactorEnabled: true };
          localStorage.setItem('moodmash_user', JSON.stringify(updatedUser));
          return {
            ...prev,
            user: updatedUser,
            isLoading: false,
            isAuthenticated: true,
            requiresTwoFactor: false,
          };
        }
        return { ...prev, isLoading: false };
      });
    } catch {
      setError('unknown_error');
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const disable2FA = useCallback(async (code: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (code.length !== 6 || !/^\d+$/.test(code)) {
        setError('incorrect_2fa_code');
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      setState((prev) => {
        if (prev.user) {
          const updatedUser = { ...prev.user, twoFactorEnabled: false };
          localStorage.setItem('moodmash_user', JSON.stringify(updatedUser));
          return { ...prev, user: updatedUser, isLoading: false };
        }
        return { ...prev, isLoading: false };
      });

      alert('Two-factor authentication disabled.');
    } catch {
      setError('unknown_error');
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  // ============================================================================
  // Session Management
  // ============================================================================

  const logout = useCallback(async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    localStorage.removeItem('moodmash_user');
    localStorage.removeItem('moodmash_session');

    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      requiresTwoFactor: false,
      session: null,
      securityAlerts: [],
      unreadAlertCount: 0,
    });
  }, []);

  const getSessions = useCallback(async (): Promise<Session[]> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    return [
      {
        id: 'session-1',
        userId: state.user?.id || '',
        deviceType: 'web',
        browser: 'Chrome',
        os: 'Windows',
        location: 'New York, US',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        lastActivityAt: new Date(),
      },
    ];
  }, [state.user?.id]);

  const revokeSession = useCallback(async (sessionId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log('[Demo] Session revoked:', sessionId);
  }, []);

  const revokeAllSessions = useCallback(async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    localStorage.removeItem('moodmash_user');
    localStorage.removeItem('moodmash_session');

    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      requiresTwoFactor: false,
      session: null,
      securityAlerts: [],
      unreadAlertCount: 0,
    });

    alert('All other sessions have been revoked.');
  }, []);

  // ============================================================================
  // Password Management
  // ============================================================================

  const requestPasswordReset = useCallback(async (email: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log('[Demo] Password reset email would be sent to:', email);
      alert('Password reset email sent! Check your inbox.');

      setState((prev) => ({ ...prev, isLoading: false }));
    } catch {
      setError('network_error');
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const resetPassword = useCallback(async (token: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
        setError('invalid_password');
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      console.log('[Demo] Password reset with token:', token);
      alert('Password reset successful!');

      setState((prev) => ({ ...prev, isLoading: false }));
    } catch {
      setError('network_error');
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  // ============================================================================
  // Password Validation Helpers
  // ============================================================================

  const validatePassword = useCallback((password: string): PasswordValidationResult => {
    return validatePasswordStrength(password);
  }, []);

  const checkBreachedPassword = useCallback(async (password: string): Promise<boolean> => {
    return isBreachedPassword(password);
  }, []);

  // ============================================================================
  // Email Verification
  // ============================================================================

  const resendVerificationEmail = useCallback(async (email: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log('[Demo] Verification email would be sent to:', email);
      alert('Verification email sent! Check your inbox.');

      setState((prev) => ({ ...prev, isLoading: false }));
    } catch {
      setError('network_error');
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [setError]);

  const verifyEmail = useCallback(async (token: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log('[Demo] Email verification token:', token);

      setState((prev) => {
        if (prev.user) {
          const updatedUser = { ...prev.user, emailVerified: true };
          localStorage.setItem('moodmash_user', JSON.stringify(updatedUser));
          return {
            ...prev,
            user: updatedUser,
            isLoading: false,
          };
        }
        return { ...prev, isLoading: false };
      });

      alert('Email verified successfully!');
    } catch {
      setError('unknown_error');
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [setError]);

  // ============================================================================
  // Security Alerts
  // ============================================================================

  const getSeverityForAlertType = (type: SecurityAlertType): SecurityAlert['severity'] => {
    switch (type) {
      case 'suspicious_activity':
        return 'critical';
      case 'new_device':
      case 'password_change':
        return 'high';
      case 'new_location':
        return 'medium';
      case 'two_factor_enabled':
      case 'two_factor_disabled':
        return 'low';
      default:
        return 'medium';
    }
  };

  const getMessageForAlertType = (type: SecurityAlertType, metadata?: Record<string, string>): string => {
    switch (type) {
      case 'new_device':
        return `New device logged in: ${metadata?.['device'] || 'Unknown device'} on ${metadata?.['browser'] || 'Unknown browser'}`;
      case 'new_location':
        return `Login from new location: ${metadata?.['location'] || 'Unknown location'}`;
      case 'suspicious_activity':
        return `Suspicious activity detected: ${metadata?.['activity'] || 'Unusual login pattern'}`;
      case 'password_change':
        return 'Your password was changed successfully';
      case 'two_factor_enabled':
        return 'Two-factor authentication has been enabled';
      case 'two_factor_disabled':
        return 'Two-factor authentication has been disabled';
      default:
        return 'Security alert';
    }
  };

  const addSecurityAlert = useCallback((
    type: SecurityAlertType,
    message: string,
    severity: SecurityAlert['severity'],
    metadata?: Record<string, string>
  ) => {
    const alert: SecurityAlert = {
      id: generateUUID(),
      type,
      timestamp: new Date(),
      message: message || getMessageForAlertType(type, metadata),
      severity: severity || getSeverityForAlertType(type),
      read: false,
      metadata,
    };

    setState((prev) => ({
      ...prev,
      securityAlerts: [alert, ...prev.securityAlerts].slice(0, 50),
      unreadAlertCount: prev.unreadAlertCount + 1,
    }));
  }, []);

  const markAlertAsRead = useCallback((alertId: string) => {
    setState((prev) => {
      const updatedAlerts = prev.securityAlerts.map((alert) =>
        alert.id === alertId ? { ...alert, read: true } : alert
      );
      const unreadCount = updatedAlerts.filter((alert) => !alert.read).length;
      return {
        ...prev,
        securityAlerts: updatedAlerts,
        unreadAlertCount: unreadCount,
      };
    });
  }, []);

  const markAllAlertsAsRead = useCallback(() => {
    setState((prev) => ({
      ...prev,
      securityAlerts: prev.securityAlerts.map((alert) => ({ ...alert, read: true })),
      unreadAlertCount: 0,
    }));
  }, []);

  const clearSecurityAlerts = useCallback(() => {
    setState((prev) => ({
      ...prev,
      securityAlerts: [],
      unreadAlertCount: 0,
    }));
  }, []);

  // ============================================================================
  // Context Value
  // ============================================================================

  const value: AuthContextType = {
    ...state,
    loginWithEmail,
    register,
    loginWithGoogle,
    loginWithGitHub,
    loginWithMagicLink,
    verifyMagicLink,
    loginWithPasskey,
    registerPasskey,
    removePasskey,
    loginWithBiometric,
    enableBiometric,
    disableBiometric,
    setup2FA,
    verify2FA,
    disable2FA,
    logout,
    getSessions,
    revokeSession,
    revokeAllSessions,
    requestPasswordReset,
    resetPassword,
    clearError,
    validatePassword,
    checkBreachedPassword,
    resendVerificationEmail,
    verifyEmail,
    addSecurityAlert,
    markAlertAsRead,
    markAllAlertsAsRead,
    clearSecurityAlerts,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================================================
// Hook
// ============================================================================

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

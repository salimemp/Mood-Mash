import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { Shield, Key, Fingerprint, Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, Check } from 'lucide-react';

type LoginMethod = 'email' | 'magic' | 'passkey' | 'biometric';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [method, setMethod] = useState<LoginMethod>('email');
  const [isLoading, setIsLoading] = useState(false);
  const { loginWithEmail, loginWithGoogle, loginWithGitHub, loginWithMagicLink, loginWithPasskey, loginWithBiometric, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setIsLoading(true);
    try {
      await loginWithEmail(email, password);
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setIsLoading(true);
    try {
      await loginWithMagicLink(email);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    clearError();
    setIsLoading(true);
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    clearError();
    setIsLoading(true);
    try {
      await loginWithGitHub();
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasskeyLogin = async () => {
    clearError();
    setIsLoading(true);
    try {
      await loginWithPasskey();
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    clearError();
    setIsLoading(true);
    try {
      await loginWithBiometric();
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-fuchsia-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" />
      </div>

      {/* Security Badge */}
      <div className="absolute top-4 right-4 glass px-4 py-2 rounded-full flex items-center gap-2 text-sm text-slate-300">
        <Shield className="w-4 h-4 text-emerald-400 shield-glow" />
        <span>End-to-End Encrypted</span>
        <Lock className="w-3 h-3 text-emerald-400 lock-pulse" />
      </div>

      {/* Language Switcher */}
      <div className="absolute top-4 left-4">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl glass glow-violet mb-4">
            <Sparkles className="w-8 h-8 text-violet-400" />
          </div>
          <h1 className="text-4xl font-bold text-gradient">MoodMash</h1>
          <p className="text-slate-300 mt-2">Sign in to your secure account</p>
        </div>

        {/* Main Glass Card */}
        <div className="glass rounded-3xl p-8 shadow-2xl">
          {/* Method Selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => setMethod('email')}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all ${
                  method === 'email'
                    ? 'gradient-primary text-white glow-violet'
                    : 'glass-light text-white hover:bg-white/20'
                }`}
              >
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </button>
              <button
                onClick={() => setMethod('magic')}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all ${
                  method === 'magic'
                    ? 'gradient-primary text-white glow-violet'
                    : 'glass-light text-white hover:bg-white/20'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Magic Link</span>
              </button>
              <button
                onClick={() => setMethod('passkey')}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all ${
                  method === 'passkey'
                    ? 'gradient-primary text-white glow-violet'
                    : 'glass-light text-white hover:bg-white/20'
                }`}
              >
                <Key className="w-4 h-4" />
                <span>Passkey</span>
              </button>
              <button
                onClick={() => setMethod('biometric')}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all ${
                  method === 'biometric'
                    ? 'gradient-primary text-white glow-violet'
                    : 'glass-light text-white hover:bg-white/20'
                }`}
              >
                <Fingerprint className="w-4 h-4" />
                <span>Biometric</span>
              </button>
            </div>

          {/* Email/Password Form */}
          {method === 'email' && (
            <>
              <form onSubmit={handleEmailLogin} className="space-y-5">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 glass-light rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-3 glass-light rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Remember & Forgot */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-slate-600 bg-slate-900/50 text-violet-500 focus:ring-violet-500 focus:ring-offset-slate-900"
                    />
                    <span className="text-sm text-slate-400">Remember me</span>
                  </label>
                  <Link to="/password-reset" className="text-sm text-violet-400 hover:text-violet-300 transition-colors">
                    Forgot password?
                  </Link>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    {error.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 gradient-primary hover:opacity-90 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/25 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 glass text-slate-400 text-sm">Or continue with</span>
                </div>
              </div>

              {/* Social Login Buttons - Original Design */}
              <div className="space-y-3">
                {/* Google Button - Original Design */}
                <button
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full relative group overflow-hidden rounded-xl transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#4285F4] via-[#34A853] to-[#FBBC05] opacity-90 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#4285F4] via-[#34A853] to-[#FBBC05] opacity-0 group-hover:opacity-20 blur-xl transition-opacity" />
                  <div className="relative flex items-center justify-center gap-3 py-3 px-4">
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    </div>
                    <span className="text-white font-medium">Continue with Google</span>
                  </div>
                </button>

                {/* GitHub Button - Original Design */}
                <button
                  onClick={handleGitHubLogin}
                  disabled={isLoading}
                  className="w-full relative group overflow-hidden rounded-xl transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#333] via-[#24292e] to-[#333] opacity-90 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#333] via-[#24292e] to-[#333] opacity-0 group-hover:opacity-20 blur-xl transition-opacity" />
                  <div className="relative flex items-center justify-center gap-3 py-3 px-4">
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#24292e">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                    </div>
                    <span className="text-white font-medium">Continue with GitHub</span>
                  </div>
                </button>
              </div>
            </>
          )}

          {/* Magic Link Form */}
          {method === 'magic' && (
            <form onSubmit={handleMagicLink} className="space-y-5">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-violet-500/20 mb-3">
                  <Mail className="w-6 h-6 text-violet-400" />
                </div>
                <p className="text-slate-300">We&apos;ll send you a magic link to sign in securely.</p>
              </div>

              <div>
                <label htmlFor="magic-email" className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="magic-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 glass-light rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 gradient-primary hover:opacity-90 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/25 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Send Magic Link</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Passkey Login */}
          {method === 'passkey' && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-500/20 mb-4">
                <Key className="w-8 h-8 text-violet-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Sign in with Passkey</h3>
              <p className="text-slate-400 mb-6">Use your device&apos;s biometric or PIN to authenticate securely.</p>
              <button
                onClick={handlePasskeyLogin}
                disabled={isLoading}
                className="py-3 px-6 gradient-primary hover:opacity-90 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/25 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <Key className="w-5 h-5" />
                    <span>Use Passkey</span>
                  </>
                )}
              </button>
              <p className="text-xs text-slate-500 mt-4">WebAuthn / FIDO2 compliant</p>
            </div>
          )}

          {/* Biometric Login */}
          {method === 'biometric' && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-fuchsia-500/20 mb-4 animate-pulse-glow">
                <Fingerprint className="w-8 h-8 text-fuchsia-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Biometric Authentication</h3>
              <p className="text-slate-400 mb-6">Use Face ID or Touch ID to sign in instantly.</p>
              <button
                onClick={handleBiometricLogin}
                disabled={isLoading}
                className="py-3 px-6 bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white font-semibold rounded-xl shadow-lg shadow-fuchsia-500/25 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Scanning...</span>
                  </>
                ) : (
                  <>
                    <Fingerprint className="w-5 h-5" />
                    <span>Scan Biometric</span>
                  </>
                )}
              </button>
              <p className="text-xs text-slate-500 mt-4">Touch ID / Face ID / Windows Hello</p>
            </div>
          )}
        </div>

        {/* Register Link */}
        <div className="mt-6 text-center">
          <p className="text-slate-400">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-violet-400 hover:text-violet-300 font-medium transition-colors inline-flex items-center gap-1">
              Sign up
              <ArrowRight className="w-4 h-4" />
            </Link>
          </p>
        </div>

        {/* Compliance Badges */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {['GDPR', 'CCPA', 'HIPAA', 'SOC 2'].map((framework) => (
            <div key={framework} className="glass px-3 py-1 rounded-full text-xs text-slate-400 flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-400" />
              {framework} Compliant
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Login;

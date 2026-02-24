import { useState, useCallback, FormEvent, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { Shield, Mail, Lock, Eye, EyeOff, User, CheckCircle, Sparkles, AlertTriangle, Check } from 'lucide-react';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong';

interface PasswordRequirement {
  test: (password: string) => boolean;
  label: string;
}

const passwordRequirements: PasswordRequirement[] = [
  { test: (p: string) => p.length >= 8, label: 'At least 8 characters' },
  { test: (p: string) => /[A-Z]/.test(p), label: 'One uppercase letter' },
  { test: (p: string) => /[a-z]/.test(p), label: 'One lowercase letter' },
  { test: (p: string) => /[0-9]/.test(p), label: 'One number' },
  { test: (p: string) => /[!@#$%^&*()_+\-={};':"|,.<>?[\]]/.test(p), label: 'One special character' },
];

export function Register() {
  const navigate = useNavigate();
  const { register, loginWithEmail, isLoading, validatePassword, checkBreachedPassword } = useAuth();
  const [form, setForm] = useState<RegisterForm>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [step, setStep] = useState<'details' | 'security' | 'complete'>('details');
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>('weak');
  const [isBreached, setIsBreached] = useState(false);

  // Real-time password validation
  useEffect(() => {
    if (form.password.length > 0) {
      const result = validatePassword(form.password);
      setPasswordStrength(result.strength);

      // Check for breached password
      if (result.isValid) {
        setIsBreached(false);
        checkBreachedPassword(form.password).then((breached) => {
          setIsBreached(breached);
        }).catch(() => {
          setIsBreached(false);
        });
      } else {
        setIsBreached(false);
      }
    } else {
      setPasswordStrength('weak');
      setIsBreached(false);
    }
  }, [form.password, validatePassword, checkBreachedPassword]);

  const getStrengthColor = useCallback((strength: PasswordStrength): string => {
    switch (strength) {
      case 'weak': return 'bg-red-500';
      case 'fair': return 'bg-orange-500';
      case 'good': return 'bg-amber-500';
      case 'strong': return 'bg-emerald-500';
    }
  }, []);

  const getStrengthWidth = useCallback((strength: PasswordStrength): string => {
    switch (strength) {
      case 'weak': return '25%';
      case 'fair': return '50%';
      case 'good': return '75%';
      case 'strong': return '100%';
    }
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!form.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (form.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!form.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (step === 'details') {
      if (!form.password) {
        newErrors.password = 'Password is required';
      } else {
        const result = validatePassword(form.password);
        if (!result.isValid) {
          newErrors.password = result.errors[0] || 'Password does not meet requirements';
        }
      }
    }

    if (step === 'security') {
      // Check password match
      if (form.password !== form.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }

      // Check all password requirements
      const result = validatePassword(form.password);
      if (!result.isValid) {
        newErrors.password = 'Password does not meet all requirements';
      }

      // Check for breached password
      if (isBreached) {
        newErrors.password = 'This password has been found in a data breach. Please choose a different password.';
      }

      if (!agreedToTerms) {
        newErrors.general = 'Please accept the Terms of Service';
      }

      if (!agreedToPrivacy) {
        newErrors.general = 'Please accept the Privacy Policy';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form, step, agreedToTerms, agreedToPrivacy, isBreached, validatePassword]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (step === 'details') {
      if (!validateForm()) return;
      setStep('security');
      return;
    }

    if (!validateForm()) return;

    try {
      await register(form.email, form.password, form.name);
      await loginWithEmail(form.email, form.password);

      navigate('/dashboard');
    } catch {
      setErrors({ general: 'Registration failed. Please try again.' });
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-40 w-80 h-80 bg-violet-500/30 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 -right-40 w-80 h-80 bg-fuchsia-500/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Security Badge */}
      <div className="absolute top-6 right-6 flex items-center gap-2 glass px-4 py-2 rounded-full">
        <Shield className="w-4 h-4 text-emerald-400" />
        <span className="text-xs text-slate-300">End-to-End Encrypted</span>
      </div>

      {/* Language Switcher */}
      <div className="absolute top-6 left-6">
        <LanguageSwitcher />
      </div>

      {/* Main Card */}
      <div className="w-full max-w-lg relative z-10">
        <div className="glass rounded-3xl p-8 glow-violet">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-slate-400">Join MoodMash and start tracking your journey</p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
              step === 'details' ? 'bg-violet-500 text-white' : 'bg-emerald-500 text-white'
            }`}>
              {step === 'details' ? '1' : <CheckCircle className="w-4 h-4" />}
            </div>
            <div className={`w-16 h-1 rounded-full transition-all ${step === 'complete' ? 'bg-emerald-500' : 'bg-slate-700'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
              step === 'security' ? 'bg-violet-500 text-white' : step === 'complete' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400'
            }`}>
              {step === 'complete' ? <CheckCircle className="w-4 h-4" /> : '2'}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 'details' && (
              <>
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                      placeholder="Enter your name"
                    />
                  </div>
                  {errors.name && <p className="mt-2 text-sm text-red-400">{errors.name}</p>}
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                      placeholder="you@example.com"
                    />
                  </div>
                  {errors.email && <p className="mt-2 text-sm text-red-400">{errors.email}</p>}
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-2 text-sm text-red-400">{errors.password}</p>}

                  {/* Password Strength Meter */}
                  {form.password.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {/* Strength Bar */}
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${getStrengthColor(passwordStrength)}`}
                          style={{ width: getStrengthWidth(passwordStrength) }}
                        />
                      </div>

                      {/* Strength Label */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">Password Strength:</span>
                        <span className={`text-xs font-medium capitalize ${
                          passwordStrength === 'weak' ? 'text-red-400' :
                          passwordStrength === 'fair' ? 'text-orange-400' :
                          passwordStrength === 'good' ? 'text-amber-400' :
                          'text-emerald-400'
                        }`}>
                          {passwordStrength}
                        </span>
                      </div>

                      {/* Breached Password Warning */}
                      {isBreached && (
                        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                          <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs text-red-400 font-medium">Password Compromised</p>
                            <p className="text-xs text-red-300/80">
                              This password has been found in a known data breach. Please choose a different password.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Requirement Checklist */}
                      <div className="space-y-1 pt-2">
                        {passwordRequirements.map((req, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                              req.test(form.password) ? 'bg-emerald-500/20' : 'bg-slate-700'
                            }`}>
                              {req.test(form.password) ? (
                                <Check className="w-2.5 h-2.5 text-emerald-400" />
                              ) : (
                                <span className="text-[10px] text-slate-500">{index + 1}</span>
                              )}
                            </div>
                            <span className={`text-xs ${
                              req.test(form.password) ? 'text-emerald-400' : 'text-slate-500'
                            }`}>
                              {req.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {step === 'security' && (
              <>
                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="mt-2 text-sm text-red-400">{errors.confirmPassword}</p>}
                </div>

                {/* Password Requirements */}
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-sm text-slate-400 mb-3">Password Requirements</p>
                  <div className="space-y-2">
                    {passwordRequirements.map((req, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          req.test(form.password) ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-500'
                        }`}>
                          {req.test(form.password) ? <CheckCircle className="w-3 h-3" /> : <span className="text-xs">{index + 1}</span>}
                        </div>
                        <span className={`text-sm ${req.test(form.password) ? 'text-emerald-400' : 'text-slate-500'}`}>
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      agreedToTerms ? 'bg-violet-500 border-violet-500' : 'border-slate-600 group-hover:border-violet-400'
                    }`}>
                      {agreedToTerms && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="hidden"
                    />
                    <span className="text-sm text-slate-400 group-hover:text-slate-300">
                      I agree to the <Link to="#" className="text-violet-400 hover:text-violet-300">Terms of Service</Link> and <Link to="#" className="text-violet-400 hover:text-violet-300">End User License Agreement</Link>
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      agreedToPrivacy ? 'bg-violet-500 border-violet-500' : 'border-slate-600 group-hover:border-violet-400'
                    }`}>
                      {agreedToPrivacy && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                    <input
                      type="checkbox"
                      checked={agreedToPrivacy}
                      onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                      className="hidden"
                    />
                    <span className="text-sm text-slate-400 group-hover:text-slate-300">
                      I agree to the <Link to="#" className="text-violet-400 hover:text-violet-300">Privacy Policy</Link> and consent to the processing of my personal data
                    </span>
                  </label>
                </div>

                {/* Back Button */}
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="w-full py-3 text-slate-400 hover:text-white transition-colors"
                >
                  Back to Details
                </button>
              </>
            )}

            {/* General Error */}
            {errors.general && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <p className="text-sm text-red-400">{errors.general}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl text-white font-semibold hover:from-violet-500 hover:to-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed glow-fuchsia"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating Account...
                </span>
              ) : step === 'details' ? (
                'Continue to Security'
              ) : (
                'Create Secure Account'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-violet-400 hover:text-violet-300 font-medium">
                Sign In
              </Link>
            </p>
          </div>

          {/* Compliance Badges */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-3">
            <span className="text-xs text-slate-500">Compliant with:</span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-xs text-emerald-400">GDPR</span>
              <span className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-400">CCPA</span>
              <span className="px-2 py-1 bg-purple-500/10 border border-purple-500/20 rounded text-xs text-purple-400">HIPAA</span>
              <span className="px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded text-xs text-amber-400">SOC 2</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;

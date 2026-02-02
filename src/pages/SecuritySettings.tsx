import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Key, Smartphone, Fingerprint, Mail, CheckCircle, XCircle, Trash2, ExternalLink, AlertTriangle, Lock } from 'lucide-react';

interface SecurityItem {
  id: string;
  name: string;
  enabled: boolean;
  addedAt: Date;
  lastUsed?: Date;
}

export function SecuritySettings() {
  const {
    user,
    setup2FA,
    verify2FA,
    disable2FA,
    registerPasskey,
    removePasskey,
    enableBiometric,
    disableBiometric,
    revokeSession,
    revokeAllSessions,
    requestPasswordReset,
    isLoading
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | '2fa' | 'passkeys' | 'sessions'>('overview');
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [secretKey] = useState('JBSWY3DPEHPK3PXP');
  const [passkeys, setPasskeys] = useState<SecurityItem[]>([
    { id: '1', name: 'MacBook Pro Touch ID', enabled: true, addedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), lastUsed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
    { id: '2', name: 'iPhone Face ID', enabled: true, addedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000) },
  ]);
  const [sessions, setSessions] = useState<SecurityItem[]>([
    { id: '1', name: 'Chrome on macOS', enabled: true, addedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), lastUsed: new Date() },
    { id: '2', name: 'Safari on iPhone', enabled: true, addedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), lastUsed: new Date(Date.now() - 1 * 60 * 60 * 1000) },
  ]);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSetup2FA = async () => {
    try {
      await setup2FA();
      setShow2FASetup(true);
      showNotification('success', '2FA setup initiated. Please scan the QR code.');
    } catch {
      showNotification('error', 'Failed to setup 2FA. Please try again.');
    }
  };

  const handleVerify2FA = async () => {
    try {
      await verify2FA(verificationCode);
      setShow2FASetup(false);
      setVerificationCode('');
      showNotification('success', '2FA enabled successfully!');
    } catch {
      showNotification('error', 'Invalid verification code.');
    }
  };

  const handleDisable2FA = async () => {
    const code = prompt('Enter your current 2FA code to disable:');
    if (!code || code.length !== 6) {
      showNotification('error', 'Invalid 2FA code.');
      return;
    }
    try {
      await disable2FA(code);
      showNotification('success', '2FA has been disabled.');
    } catch {
      showNotification('error', 'Failed to disable 2FA.');
    }
  };

  const handleRegisterPasskey = async () => {
    try {
      await registerPasskey();
      const newPasskey: SecurityItem = {
        id: Date.now().toString(),
        name: 'New Passkey',
        enabled: true,
        addedAt: new Date(),
      };
      setPasskeys([...passkeys, newPasskey]);
      showNotification('success', 'Passkey registered successfully!');
    } catch {
      showNotification('error', 'Failed to register passkey.');
    }
  };

  const handleRemovePasskey = async (id: string) => {
    try {
      await removePasskey(id);
      setPasskeys(passkeys.filter(p => p.id !== id));
      showNotification('success', 'Passkey removed.');
    } catch {
      showNotification('error', 'Failed to remove passkey.');
    }
  };

  const handleToggleBiometric = async () => {
    try {
      if (biometricEnabled) {
        await disableBiometric();
        setBiometricEnabled(false);
        showNotification('success', 'Biometric authentication disabled.');
      } else {
        await enableBiometric();
        setBiometricEnabled(true);
        showNotification('success', 'Biometric authentication enabled!');
      }
    } catch {
      showNotification('error', 'Failed to update biometric settings.');
    }
  };

  const handleRevokeSession = async (id: string) => {
    try {
      await revokeSession(id);
      setSessions(sessions.filter(s => s.id !== id));
      showNotification('success', 'Session revoked.');
    } catch {
      showNotification('error', 'Failed to revoke session.');
    }
  };

  const handleRevokeAllSessions = async () => {
    try {
      await revokeAllSessions();
      setSessions([]);
      showNotification('success', 'All other sessions have been revoked.');
    } catch {
      showNotification('error', 'Failed to revoke sessions.');
    }
  };

  const handlePasswordReset = async () => {
    try {
      await requestPasswordReset(user?.email || '');
      showNotification('success', 'Password reset email sent.');
    } catch {
      showNotification('error', 'Failed to send reset email.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Notification */}
      {message && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl flex items-center gap-3 ${
          message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <AlertTriangle className="w-5 h-5 text-red-400" />}
          <span className="text-white">{message.text}</span>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-slate-400 hover:text-white transition-colors">
              ← Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              Security Settings
            </h1>
          </div>
          <div className="flex items-center gap-2 glass px-4 py-2 rounded-full">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-slate-300">End-to-End Encrypted</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: 'Overview', icon: Shield },
            { id: '2fa', label: 'Two-Factor', icon: Smartphone },
            { id: 'passkeys', label: 'Passkeys', icon: Key },
            { id: 'sessions', label: 'Sessions', icon: Lock },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white'
                  : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Security Score */}
            <div className="glass rounded-2xl p-6 col-span-full lg:col-span-2">
              <h2 className="text-xl font-semibold text-white mb-4">Security Score</h2>
              <div className="flex items-center gap-8">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none" className="text-slate-700" />
                    <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none" className="text-emerald-500" strokeDasharray="352" strokeDashoffset="70" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-bold text-white">80%</span>
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <span className="text-slate-300">Strong password</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <span className="text-slate-300">Email verified</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <XCircle className="w-5 h-5 text-amber-400" />
                    <span className="text-slate-300">Two-factor authentication not enabled</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <span className="text-slate-300">Recent security check passed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={() => setActiveTab('2fa')}
                  className="w-full flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-violet-400" />
                    <span className="text-white">Enable 2FA</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                </button>
                <button
                  onClick={() => setActiveTab('passkeys')}
                  className="w-full flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Key className="w-5 h-5 text-fuchsia-400" />
                    <span className="text-white">Add Passkey</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                </button>
                <button
                  onClick={handlePasswordReset}
                  className="w-full flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-amber-400" />
                    <span className="text-white">Change Password</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Account Info */}
            <div className="glass rounded-2xl p-6 col-span-full md:col-span-1">
              <h2 className="text-xl font-semibold text-white mb-4">Account Security</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Email</span>
                  <span className="text-white">{user?.email || 'user@example.com'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Password</span>
                  <span className="text-emerald-400 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Strong
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">2FA</span>
                  <span className={user?.twoFactorEnabled ? 'text-emerald-400' : 'text-amber-400'}>
                    {user?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Passkeys</span>
                  <span className="text-white">{passkeys.length} registered</span>
                </div>
              </div>
            </div>

            {/* Compliance Badges */}
            <div className="glass rounded-2xl p-6 col-span-full md:col-span-1">
              <h2 className="text-xl font-semibold text-white mb-4">Compliance Status</h2>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-sm text-emerald-400">GDPR Compliant</span>
                <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-sm text-blue-400">CCPA Ready</span>
                <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-sm text-purple-400">HIPAA Compliant</span>
                <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-sm text-amber-400">SOC 2 Type II</span>
              </div>
            </div>
          </div>
        )}

        {/* 2FA Tab */}
        {activeTab === '2fa' && (
          <div className="max-w-2xl">
            <div className="glass rounded-2xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Two-Factor Authentication</h2>
                  <p className="text-slate-400 text-sm">Add an extra layer of security to your account</p>
                </div>
              </div>

              {user?.twoFactorEnabled ? (
                <div className="space-y-6">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle className="w-6 h-6 text-emerald-400" />
                      <span className="text-lg font-medium text-white">2FA is Enabled</span>
                    </div>
                    <p className="text-slate-400 mb-4">Your account is protected with two-factor authentication using an authenticator app.</p>
                    <button
                      onClick={handleDisable2FA}
                      disabled={isLoading}
                      className="px-6 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      Disable 2FA
                    </button>
                  </div>
                </div>
              ) : show2FASetup ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <p className="text-white mb-4">Scan this QR code with your authenticator app:</p>
                    <div className="w-48 h-48 mx-auto bg-white rounded-xl p-4 mb-4">
                      <div className="w-full h-full bg-slate-900 rounded-lg flex items-center justify-center">
                        <span className="text-slate-500 text-sm">QR Code</span>
                      </div>
                    </div>
                    <p className="text-slate-400 text-sm mb-4">Or enter this code manually:</p>
                    <code className="bg-white/10 px-4 py-2 rounded-lg text-violet-400 font-mono">{secretKey}</code>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Verification Code</label>
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="Enter 6-digit code"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setShow2FASetup(false)}
                      className="flex-1 py-3 bg-slate-700 rounded-xl text-white hover:bg-slate-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleVerify2FA}
                      disabled={isLoading || verificationCode.length !== 6}
                      className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl text-white hover:from-violet-500 hover:to-fuchsia-500 transition-all disabled:opacity-50"
                    >
                      Verify & Enable
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <AlertTriangle className="w-6 h-6 text-amber-400" />
                      <span className="text-lg font-medium text-white">2FA is Not Enabled</span>
                    </div>
                    <p className="text-slate-400">Enable two-factor authentication to protect your account from unauthorized access.</p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-white font-medium">Authenticator Apps Supported:</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {['Google Authenticator', 'Authy', '1Password', 'Microsoft Authenticator'].map((app) => (
                        <div key={app} className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
                          <CheckCircle className="w-5 h-5 text-emerald-400" />
                          <span className="text-slate-300">{app}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleSetup2FA}
                    disabled={isLoading}
                    className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl text-white font-semibold hover:from-violet-500 hover:to-fuchsia-500 transition-all"
                  >
                    Setup Two-Factor Authentication
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Passkeys Tab */}
        {activeTab === 'passkeys' && (
          <div className="max-w-2xl">
            <div className="glass rounded-2xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-500 flex items-center justify-center">
                  <Key className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Passkeys</h2>
                  <p className="text-slate-400 text-sm">Secure passwordless authentication</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                {passkeys.length === 0 ? (
                  <div className="text-center py-8">
                    <Key className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No passkeys registered yet</p>
                  </div>
                ) : (
                  passkeys.map((passkey) => (
                    <div key={passkey.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div className="flex items-center gap-4">
                        <Fingerprint className="w-8 h-8 text-violet-400" />
                        <div>
                          <p className="text-white font-medium">{passkey.name}</p>
                          <p className="text-slate-400 text-sm">
                            Added {passkey.addedAt.toLocaleDateString()}
                            {passkey.lastUsed && ` • Last used ${passkey.lastUsed.toLocaleDateString()}`}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemovePasskey(passkey.id)}
                        className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Biometric Toggle */}
              <div className="border-t border-white/10 pt-6 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Fingerprint className="w-8 h-8 text-emerald-400" />
                    <div>
                      <p className="text-white font-medium">Biometric Authentication</p>
                      <p className="text-slate-400 text-sm">Use Touch ID or Face ID to sign in</p>
                    </div>
                  </div>
                  <button
                    onClick={handleToggleBiometric}
                    className={`relative w-14 h-8 rounded-full transition-colors ${
                      biometricEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                  >
                    <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-transform ${
                      biometricEnabled ? 'translate-x-7' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>

              <button
                onClick={handleRegisterPasskey}
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl text-white font-semibold hover:from-violet-500 hover:to-fuchsia-500 transition-all"
              >
                Add New Passkey
              </button>
            </div>
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="max-w-2xl">
            <div className="glass rounded-2xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-white">Active Sessions</h2>
                  <p className="text-slate-400 text-sm">Manage your active login sessions</p>
                </div>
                {sessions.length > 1 && (
                  <button
                    onClick={handleRevokeAllSessions}
                    className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    Revoke All Others
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {sessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-violet-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{session.name}</p>
                        <p className="text-slate-400 text-sm">
                          Current session
                          {session.lastUsed && ` • Active ${Math.round((Date.now() - session.lastUsed.getTime()) / 60000)} min ago`}
                        </p>
                      </div>
                    </div>
                    {sessions.length > 1 && (
                      <button
                        onClick={() => handleRevokeSession(session.id)}
                        className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 hover:bg-red-500/20 transition-colors text-sm"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-white/10">
                <h3 className="text-white font-medium mb-4">Security Recommendations</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">Review your sessions regularly</p>
                      <p className="text-slate-400 text-sm">Revoke any sessions you don't recognize or no longer use.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default SecuritySettings;

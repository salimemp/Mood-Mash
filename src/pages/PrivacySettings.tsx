import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCompliance } from '../contexts/ComplianceContext';
import { Shield, Eye, Download, Trash2, Cookie, CheckCircle, AlertTriangle, ChevronRight, FileText, Globe, Lock } from 'lucide-react';
import type { ConsentType, DataRequest } from '../contexts/ComplianceContext';

type DataRequestType = DataRequest['type'];

const consentItems: { type: ConsentType; label: string; description: string; required?: boolean }[] = [
  { type: 'essential', label: 'Essential Cookies', description: 'Required for the app to function properly', required: true },
  { type: 'analytics', label: 'Analytics', description: 'Help us understand how you use the app', required: false },
  { type: 'marketing', label: 'Marketing', description: 'Used for personalized advertisements', required: false },
  { type: 'personalization', label: 'Personalization', description: 'Customize your experience', required: false },
  { type: 'third_party', label: 'Third-Party Sharing', description: 'Share data with trusted partners', required: false },
];

export function PrivacySettings() {
  const {
    getConsent,
    setConsent,
    acceptAllConsents,
    submitDataRequest,
    getComplianceStatus,
    exportUserData,
    deleteUserData,
  } = useCompliance();

  const [activeTab, setActiveTab] = useState<'overview' | 'consents' | 'data' | 'rights'>('overview');
  const [dataRequestType, setDataRequestType] = useState<DataRequestType>('access');
  const [dataRequestReason, setDataRequestReason] = useState('');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleToggleConsent = (type: ConsentType, current: boolean) => {
    setConsent(type, !current);
    showNotification('success', `${type.charAt(0).toUpperCase() + type.slice(1)} consent ${!current ? 'enabled' : 'disabled'}`);
  };

  const handleAcceptAll = () => {
    acceptAllConsents();
    showNotification('success', 'All optional consents have been enabled');
  };

  const handleExportData = async () => {
    setIsProcessing(true);
    try {
      const data = await exportUserData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `moodmash-data-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showNotification('success', 'Your data has been exported successfully');
    } catch {
      showNotification('error', 'Failed to export data');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmitDataRequest = async () => {
    setIsProcessing(true);
    try {
      const requestId = await submitDataRequest(dataRequestType);
      showNotification('success', `Data request submitted. Reference ID: ${requestId}`);
      setDataRequestReason('');
    } catch {
      showNotification('error', 'Failed to submit data request');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      showNotification('error', 'Please type DELETE to confirm');
      return;
    }

    setIsProcessing(true);
    try {
      await deleteUserData();
      showNotification('success', 'Your account and data have been deleted');
      setShowDeleteConfirmation(false);
      setDeleteConfirmText('');
    } catch {
      showNotification('error', 'Failed to delete account');
    } finally {
      setIsProcessing(false);
    }
  };

  const complianceStatuses = {
    gdpr: getComplianceStatus('gdpr'),
    ccpa: getComplianceStatus('ccpa'),
    pipeda: getComplianceStatus('pipeda'),
    hipaa: getComplianceStatus('hipaa'),
    soc2: getComplianceStatus('soc2'),
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
              Privacy Settings
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
            { id: 'overview', label: 'Overview', icon: Eye },
            { id: 'consents', label: 'Consents', icon: Cookie },
            { id: 'data', label: 'Data Management', icon: Download },
            { id: 'rights', label: 'Your Rights', icon: Globe },
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
            {/* Privacy Score */}
            <div className="glass rounded-2xl p-6 col-span-full lg:col-span-2">
              <h2 className="text-xl font-semibold text-white mb-4">Privacy Score</h2>
              <div className="flex items-center gap-8">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none" className="text-slate-700" />
                    <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none" className="text-violet-500" strokeDasharray="352" strokeDashoffset="106" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-bold text-white">70%</span>
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  <p className="text-slate-400">Your privacy protection level</p>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="p-4 bg-white/5 rounded-xl">
                      <p className="text-2xl font-bold text-white">4/5</p>
                      <p className="text-slate-400 text-sm">Consents Enabled</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl">
                      <p className="text-2xl font-bold text-white">5</p>
                      <p className="text-slate-400 text-sm">Compliance Frameworks</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={() => setActiveTab('data')}
                  className="w-full flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Download className="w-5 h-5 text-violet-400" />
                    <span className="text-white">Export My Data</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
                <button
                  onClick={() => setActiveTab('rights')}
                  className="w-full flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-fuchsia-400" />
                    <span className="text-white">Exercise My Rights</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
                <button
                  onClick={() => setActiveTab('consents')}
                  className="w-full flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Cookie className="w-5 h-5 text-amber-400" />
                    <span className="text-white">Manage Cookies</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Compliance Status */}
            <div className="glass rounded-2xl p-6 col-span-full md:col-span-1">
              <h2 className="text-xl font-semibold text-white mb-4">Compliance Status</h2>
              <div className="space-y-4">
                {[
                  { name: 'GDPR', status: complianceStatuses.gdpr?.compliant ? 'Compliant' : 'Pending' },
                  { name: 'CCPA', status: complianceStatuses.ccpa?.compliant ? 'Compliant' : 'Pending' },
                  { name: 'PIPEDA', status: complianceStatuses.pipeda?.compliant ? 'Compliant' : 'Pending' },
                  { name: 'HIPAA', status: complianceStatuses.hipaa?.compliant ? 'Compliant' : 'Pending' },
                  { name: 'SOC 2', status: complianceStatuses.soc2?.compliant ? 'Compliant' : 'Pending' },
                ].map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <span className="text-slate-300">{item.name}</span>
                    <span className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle className="w-4 h-4" />
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Summary */}
            <div className="glass rounded-2xl p-6 col-span-full md:col-span-1">
              <h2 className="text-xl font-semibold text-white mb-4">Your Data Summary</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-slate-400">Profile Information</span>
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-slate-400">Mood Entries</span>
                  <span className="text-white">28 entries</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-slate-400">Energy Logs</span>
                  <span className="text-white">28 entries</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-slate-400">Session History</span>
                  <span className="text-white">14 sessions</span>
                </div>
              </div>
            </div>

            {/* Privacy Policy Links */}
            <div className="glass rounded-2xl p-6 col-span-full md:col-span-1">
              <h2 className="text-xl font-semibold text-white mb-4">Documentation</h2>
              <div className="space-y-3">
                <a href="#" className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                  <FileText className="w-5 h-5 text-violet-400" />
                  <span className="text-slate-300 hover:text-white">Privacy Policy</span>
                </a>
                <a href="#" className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                  <FileText className="w-5 h-5 text-fuchsia-400" />
                  <span className="text-slate-300 hover:text-white">Terms of Service</span>
                </a>
                <a href="#" className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                  <Lock className="w-5 h-5 text-emerald-400" />
                  <span className="text-slate-300 hover:text-white">Cookie Policy</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Consents Tab */}
        {activeTab === 'consents' && (
          <div className="max-w-2xl">
            <div className="glass rounded-2xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                  <Cookie className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Cookie & Consent Preferences</h2>
                  <p className="text-slate-400 text-sm">Manage how we use your data</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                {consentItems.map((item) => {
                  const isEnabled = getConsent(item.type);
                  return (
                    <div key={item.type} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-medium">{item.label}</span>
                          {item.required && (
                            <span className="px-2 py-0.5 bg-slate-700 rounded text-xs text-slate-400">Required</span>
                          )}
                        </div>
                        <p className="text-slate-400 text-sm">{item.description}</p>
                      </div>
                      <button
                        onClick={() => handleToggleConsent(item.type, isEnabled)}
                        disabled={item.required}
                        className={`relative w-14 h-8 rounded-full transition-colors ${
                          isEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                        } ${item.required ? 'opacity-50' : ''}`}
                      >
                        <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-transform ${
                          isEnabled ? 'translate-x-7' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={handleAcceptAll}
                className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl text-white font-semibold hover:from-violet-500 hover:to-fuchsia-500 transition-all"
              >
                Enable All Optional Consents
              </button>
            </div>
          </div>
        )}

        {/* Data Management Tab */}
        {activeTab === 'data' && (
          <div className="max-w-2xl">
            <div className="glass rounded-2xl p-8 mb-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                  <Download className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Export Your Data</h2>
                  <p className="text-slate-400 text-sm">Download a copy of all your data</p>
                </div>
              </div>

              <p className="text-slate-400 mb-6">
                We'll prepare a comprehensive export of all your data including profile information,
                mood entries, preferences, and activity logs. The download will be available immediately.
              </p>

              <button
                onClick={handleExportData}
                disabled={isProcessing}
                className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl text-white font-semibold hover:from-violet-500 hover:to-fuchsia-500 transition-all disabled:opacity-50"
              >
                {isProcessing ? 'Preparing Export...' : 'Export All My Data'}
              </button>
            </div>

            {/* Delete Account */}
            <div className="glass rounded-2xl p-8 border border-red-500/20">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Delete Account</h2>
                  <p className="text-slate-400 text-sm">Permanently delete your account and data</p>
                </div>
              </div>

              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
                <p className="text-red-400 text-sm">
                  Warning: This action is irreversible. All your data will be permanently deleted within 30 days.
                </p>
              </div>

              {showDeleteConfirmation ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="Type DELETE to confirm"
                    className="w-full bg-white/5 border border-red-500/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <div className="flex gap-4">
                    <button
                      onClick={() => setShowDeleteConfirmation(false)}
                      className="flex-1 py-3 bg-slate-700 rounded-xl text-white hover:bg-slate-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={isProcessing || deleteConfirmText !== 'DELETE'}
                      className="flex-1 py-3 bg-red-500 rounded-xl text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      {isProcessing ? 'Deleting...' : 'Permanently Delete'}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowDeleteConfirmation(true)}
                  className="w-full py-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  Delete My Account
                </button>
              )}
            </div>
          </div>
        )}

        {/* Rights Tab */}
        {activeTab === 'rights' && (
          <div className="max-w-2xl">
            <div className="glass rounded-2xl p-8 mb-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Exercise Your Data Rights</h2>
                  <p className="text-slate-400 text-sm">Submit a request under applicable privacy laws</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                {([
                  { type: 'access' as const, label: 'Access Request', desc: 'Get a copy of all personal data we hold about you' },
                  { type: 'rectification' as const, label: 'Correction Request', desc: 'Update or correct inaccurate personal data' },
                  { type: 'erasure' as const, label: 'Deletion Request', desc: 'Request deletion of your personal data' },
                  { type: 'portability' as const, label: 'Data Portability', desc: 'Export your data in a machine-readable format' },
                  { type: 'restriction' as const, label: 'Restriction Request', desc: 'Limit how we process your personal data' },
                  { type: 'objection' as const, label: 'Objection', desc: 'Object to certain types of processing' },
                ]).map((option) => (
                  <button
                    key={option.type}
                    onClick={() => setDataRequestType(option.type)}
                    className={`w-full flex items-start gap-4 p-4 rounded-xl text-left transition-all ${
                      dataRequestType === option.type
                        ? 'bg-violet-500/20 border border-violet-500/30'
                        : 'bg-white/5 border border-transparent hover:bg-white/10'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                      dataRequestType === option.type ? 'border-violet-500 bg-violet-500' : 'border-slate-600'
                    }`}>
                      {dataRequestType === option.type && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                    <div>
                      <p className="text-white font-medium">{option.label}</p>
                      <p className="text-slate-400 text-sm">{option.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Reason for Request (Optional)
                </label>
                <textarea
                  value={dataRequestReason}
                  onChange={(e) => setDataRequestReason(e.target.value)}
                  placeholder="Please provide any additional context for your request..."
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <button
                onClick={handleSubmitDataRequest}
                disabled={isProcessing}
                className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl text-white font-semibold hover:from-violet-500 hover:to-fuchsia-500 transition-all disabled:opacity-50"
              >
                {isProcessing ? 'Submitting...' : 'Submit Data Request'}
              </button>
            </div>

            {/* Compliance Info */}
            <div className="glass rounded-2xl p-8">
              <h2 className="text-xl font-semibold text-white mb-4">Applicable Regulations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'GDPR', region: 'European Union', days: 30 },
                  { name: 'CCPA', region: 'California, USA', days: 45 },
                  { name: 'PIPEDA', region: 'Canada', days: 30 },
                  { name: 'HIPAA', region: 'Healthcare (USA)', days: 60 },
                ].map((reg) => (
                  <div key={reg.name} className="p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">{reg.name}</span>
                      <span className="text-xs text-slate-500">{reg.region}</span>
                    </div>
                    <p className="text-slate-400 text-sm">
                      Response within <span className="text-violet-400">{reg.days} days</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default PrivacySettings;

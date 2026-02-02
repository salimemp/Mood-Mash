import { Shield, ChevronLeft, FileText, Lock, Eye, Database, AlertCircle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/register" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
              <span>Back</span>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold">Privacy Policy</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 glass px-3 py-1.5 rounded-full">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span className="text-xs text-slate-300">Last Updated: Feb 2, 2026</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="glass rounded-2xl p-8 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Introduction</h2>
              <p className="text-slate-400">
                Welcome to MoodMash. We are committed to protecting your personal information and your right to privacy.
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information.
              </p>
            </div>
          </div>
        </div>

        {/* Information Collection */}
        <div className="glass rounded-2xl p-8 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
              <Database className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Information We Collect</h2>
              <p className="text-slate-400 mb-4">We collect information you provide and automatically collected data.</p>

              <div className="space-y-4 mt-6">
                <h3 className="text-lg font-semibold text-white">Information You Provide</h3>
                <ul className="space-y-2 text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                    <span>Account information (name, email, authentication credentials)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                    <span>Profile data and preferences you choose to provide</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                    <span>Mood entries, energy levels, and wellness information you log</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                    <span>Messages, feedback, and support requests</span>
                  </li>
                </ul>

                <h3 className="text-lg font-semibold text-white mt-6">Automatically Collected</h3>
                <ul className="space-y-2 text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                    <span>Usage data and interaction patterns</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                    <span>Device information and unique identifiers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                    <span>IP address, access times, and log data</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Encryption & Security */}
        <div className="glass rounded-2xl p-8 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
              <Lock className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Data Protection & Encryption</h2>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  <span className="font-semibold text-emerald-400">End-to-End Encryption</span>
                </div>
                <p className="text-slate-300 text-sm">
                  All mood entries and sensitive wellness data are protected with AES-256-GCM encryption.
                  Your data is encrypted on your device before transmission, and only you can decrypt it.
                </p>
              </div>

              <h3 className="text-lg font-semibold text-white mb-3">Security Measures</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  'TLS/SSL encryption for data in transit',
                  'Secure bcrypt password hashing',
                  'Regular security audits',
                  'Access controls and authentication',
                  'Secure data storage with redundancy',
                  'Incident response procedures'
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-white/5 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-sm text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Your Rights */}
        <div className="glass rounded-2xl p-8 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
              <Eye className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Your Privacy Rights</h2>
              <p className="text-slate-400 mb-4">You have the following rights regarding your personal data:</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: 'Access', desc: 'Request a copy of all personal data we hold' },
                  { title: 'Rectification', desc: 'Request correction of inaccurate data' },
                  { title: 'Erasure', desc: 'Request deletion of your personal data' },
                  { title: 'Portability', desc: 'Request machine-readable copy of your data' },
                  { title: 'Restriction', desc: 'Limit how we process your data' },
                  { title: 'Objection', desc: 'Object to certain types of processing' }
                ].map((right, index) => (
                  <div key={index} className="p-4 bg-white/5 rounded-xl">
                    <h4 className="font-semibold text-white mb-1">{right.title}</h4>
                    <p className="text-sm text-slate-400">{right.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Compliance Frameworks */}
        <div className="glass rounded-2xl p-8 mb-6">
          <h2 className="text-2xl font-bold mb-6">Compliance Frameworks</h2>
          <p className="text-slate-400 mb-4">MoodMash is designed to comply with major privacy regulations:</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'GDPR', region: 'European Union', color: 'emerald' },
              { name: 'CCPA', region: 'California, USA', color: 'blue' },
              { name: 'PIPEDA', region: 'Canada', color: 'cyan' },
              { name: 'HIPAA', region: 'Healthcare (USA)', color: 'purple' },
              { name: 'SOC 2', region: 'Type II Certified', color: 'amber' }
            ].map((framework, index) => (
              <div key={index} className={`p-4 bg-${framework.color}-500/10 border border-${framework.color}-500/20 rounded-xl`}>
                <span className={`text-${framework.color}-400 font-bold`}>{framework.name}</span>
                <p className="text-sm text-slate-400 mt-1">{framework.region}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Data Sharing */}
        <div className="glass rounded-2xl p-8 mb-6">
          <h2 className="text-2xl font-bold mb-4">Data Sharing</h2>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-amber-400">We Do Not Sell Your Data</p>
                <p className="text-sm text-slate-300">We never sell your personal information to third parties.</p>
              </div>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-white mb-3">Data may be shared with:</h3>
          <ul className="space-y-2 text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
              <span>Service providers who assist in operating our services</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
              <span>When required by law, court order, or government request</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
              <span>To protect our rights, privacy, safety, or property</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
              <span>In connection with a merger, acquisition, or sale of assets</span>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div className="glass rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
          <p className="text-slate-400 mb-4">For questions about this Privacy Policy or our data practices:</p>
          <div className="p-4 bg-white/5 rounded-xl">
            <p className="text-white"><strong>Data Protection Officer</strong></p>
            <p className="text-slate-400">MoodMash Inc.</p>
            <p className="text-violet-400">privacy@moodmash.com</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default PrivacyPolicy;

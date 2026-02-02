import { Shield, ChevronLeft, FileText, AlertTriangle, Gavel, Scale, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function TermsOfService() {

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
                <Scale className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold">Terms of Service</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 glass px-3 py-1.5 rounded-full">
            <Gavel className="w-3 h-3 text-amber-400" />
            <span className="text-xs text-slate-300">Last Updated: Feb 2, 2026</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Introduction */}
        <div className="glass rounded-2xl p-8 mb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Terms of Service</h2>
              <p className="text-slate-400">
                By accessing or using MoodMash, you agree to be bound by these Terms of Service and our Privacy Policy.
                If you do not agree, you may not access or use the Application.
              </p>
            </div>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
              <p className="text-sm text-amber-300">
                We reserve the right to modify, suspend, or discontinue any aspect of the Application at any time.
              </p>
            </div>
          </div>
        </div>

        {/* Key Points */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="glass rounded-xl p-4 text-center">
            <Shield className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <h3 className="font-semibold text-white">Your Data</h3>
            <p className="text-sm text-slate-400">End-to-end encrypted</p>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <Scale className="w-8 h-8 text-violet-400 mx-auto mb-2" />
            <h3 className="font-semibold text-white">Your Rights</h3>
            <p className="text-sm text-slate-400">Access, modify, delete</p>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <Gavel className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <h3 className="font-semibold text-white">Compliance</h3>
            <p className="text-sm text-slate-400">GDPR, CCPA, HIPAA</p>
          </div>
        </div>

        {/* Terms Sections */}
        <div className="space-y-6">
          {[
            {
              title: '1. Acceptance of Terms',
              content: 'By accessing or using MoodMash, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these Terms, you may not access or use the Application. The Application is operated by MoodMash Inc.',
              icon: CheckCircle,
              color: 'emerald'
            },
            {
              title: '2. Description of Service',
              content: 'MoodMash is a mood tracking application that allows users to log and track mood entries, view mood history and trends, access personalized insights, and manage privacy and security features. We reserve the right to add, modify, or discontinue any features at any time.',
              icon: FileText,
              color: 'blue'
            },
            {
              title: '3. User Accounts',
              content: 'To use certain features, you must create an account. You agree to provide accurate information, maintain account security, accept responsibility for all activities under your account, and notify us of unauthorized use. We may terminate accounts for violations of these Terms.',
              icon: Shield,
              color: 'violet'
            },
            {
              title: '4. Acceptable Use',
              content: 'You agree to use the Application only for lawful purposes. You agree NOT to: use for illegal activities, interfere with or disrupt the Application, attempt unauthorized access, transmit viruses, collect user data without consent, or reverse engineer the Application.',
              icon: AlertTriangle,
              color: 'red'
            },
            {
              title: '5. User Content',
              content: 'You retain ownership of all mood entries and content you submit. By submitting content, you grant us a license to store, process, and use it to provide our services. Your content must be accurate and not violate others rights.',
              icon: FileText,
              color: 'cyan'
            },
            {
              title: '6. Subscription and Payments',
              content: 'The Application may offer free and premium features. Premium features require a subscription billed in advance. Subscriptions auto-renew by default. You may cancel at any time. We may change fees with 30 days notice.',
              icon: Shield,
              color: 'amber'
            },
            {
              title: '7. Intellectual Property',
              content: 'All rights in the Application including design, code, trademarks, and branding are owned by us or our licensors. We grant you a limited license to use the Application for personal, non-commercial purposes.',
              icon: Scale,
              color: 'purple'
            },
            {
              title: '8. Disclaimers',
              content: 'MoodMash is NOT a medical device or healthcare service - it provides mood tracking, NOT medical advice. THE APPLICATION IS PROVIDED "AS IS" without warranties. We do not warrant uninterrupted or error-free service.',
              icon: AlertTriangle,
              color: 'orange'
            },
            {
              title: '9. Limitation of Liability',
              content: 'TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE for indirect, incidental, or consequential damages. Our total liability shall not exceed the greater of $100 USD or amounts paid in the past 12 months.',
              icon: Gavel,
              color: 'red'
            },
            {
              title: '10. Indemnification',
              content: 'You agree to indemnify, defend, and hold harmless MoodMash Inc. and its officers from any claims, damages, or expenses arising from your use of the Application or violation of these Terms.',
              icon: Shield,
              color: 'emerald'
            },
            {
              title: '11. Governing Law and Disputes',
              content: 'These Terms are governed by Delaware law. Any disputes shall be resolved through binding arbitration in accordance with AAA rules. You agree to resolve disputes individually and waive class action rights.',
              icon: Scale,
              color: 'violet'
            },
            {
              title: '12. Termination',
              content: 'You may stop using the Application at any time. We may terminate accounts for violations of these Terms. Upon termination, your right to use the Application ceases immediately. You may request a copy of your data within 30 days.',
              icon: AlertTriangle,
              color: 'amber'
            },
            {
              title: '13. General Provisions',
              content: 'These Terms constitute the entire agreement between you and us. If any provision is found unenforceable, the remaining provisions remain in effect. Our failure to enforce any right shall not constitute a waiver.',
              icon: FileText,
              color: 'blue'
            },
            {
              title: '14. End User License Agreement',
              content: 'We grant you a limited, non-exclusive, non-transferable license to use the Application for personal, non-commercial purposes. You may NOT copy, modify, distribute, reverse engineer, or use for commercial purposes without authorization.',
              icon: Gavel,
              color: 'purple'
            },
            {
              title: '15. Acceptance',
              content: 'BY CLICKING "I AGREE" OR USING THE APPLICATION, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS OF SERVICE AND THE END USER LICENSE AGREEMENT.',
              icon: CheckCircle,
              color: 'emerald'
            }
          ].map((section, index) => (
            <div key={index} className="glass rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl bg-${section.color}-500/20 flex items-center justify-center shrink-0`}>
                  <section.icon className={`w-5 h-5 text-${section.color}-400`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">{section.title}</h3>
                  <p className="text-slate-300 leading-relaxed">{section.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="glass rounded-2xl p-8 mt-6">
          <h2 className="text-xl font-bold mb-4">Questions About These Terms?</h2>
          <p className="text-slate-400 mb-4">For questions about these Terms, please contact:</p>
          <div className="p-4 bg-white/5 rounded-xl">
            <p className="text-white"><strong>MoodMash Inc.</strong></p>
            <p className="text-violet-400">legal@moodmash.com</p>
          </div>
        </div>

        {/* Version Info */}
        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm">Effective Date: February 2, 2026 | Version: 2.0.0</p>
        </div>
      </main>
    </div>
  );
}

export default TermsOfService;

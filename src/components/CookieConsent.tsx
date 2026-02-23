// ============================================================================
// Cookie Consent Banner Component
// MoodMash - GDPR Compliant Cookie Management
// ============================================================================

import React, { useState, useEffect } from 'react';

interface CookieConsentProps {
  onConsent: (consent: CookieConsentData) => void;
}

interface CookieConsentData {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  ad_personalization: boolean;
}

const CookieConsent: React.FC<CookieConsentProps> = ({ onConsent }) => {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [consent, setConsent] = useState<CookieConsentData>({
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false,
    ad_personalization: false
  });

  useEffect(() => {
    // Check if user has already given consent
    const storedConsent = localStorage.getItem('moodmash_cookie_consent');
    if (!storedConsent) {
      setShowBanner(true);
    } else {
      // Already consented, inform parent
      onConsent(JSON.parse(storedConsent));
    }
  }, [onConsent]);

  const handleAcceptAll = () => {
    const fullConsent: CookieConsentData = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
      ad_personalization: true
    };
    saveConsent(fullConsent);
  };

  const handleRejectAll = () => {
    const minimalConsent: CookieConsentData = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
      ad_personalization: false
    };
    saveConsent(minimalConsent);
  };

  const handleSavePreferences = () => {
    saveConsent(consent);
  };

  const saveConsent = (consentData: CookieConsentData) => {
    const consentRecord = {
      ...consentData,
      consent_version: '1.0',
      consent_given_at: new Date().toISOString(),
      session_id: getSessionId()
    };

    localStorage.setItem('moodmash_cookie_consent', JSON.stringify(consentRecord));
    setShowBanner(false);
    onConsent(consentData);
  };

  const getSessionId = (): string => {
    let sessionId = sessionStorage.getItem('moodmash_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('moodmash_session_id', sessionId);
    }
    return sessionId;
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-200 shadow-lg dark:bg-gray-900 dark:border-gray-700"
      role="dialog"
      aria-label="Cookie Consent"
      aria-describedby="cookie-consent-description"
    >
      {!showDetails ? (
        // Simple Banner View
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <p id="cookie-consent-description" className="text-sm text-gray-700 dark:text-gray-300">
              We use cookies to enhance your experience. By clicking "Accept All", you consent to our use of cookies.
              Read our <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a> and <a href="/terms" className="text-blue-600 hover:underline">Cookie Policy</a>.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowDetails(true)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              aria-label="Customize cookie preferences"
            >
              Customize
            </button>
            <button
              onClick={handleRejectAll}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
              aria-label="Reject all optional cookies"
            >
              Reject All
            </button>
            <button
              onClick={handleAcceptAll}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Accept all cookies"
            >
              Accept All
            </button>
          </div>
        </div>
      ) : (
        // Detailed Preferences View
        <div className="max-w-2xl mx-auto">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Cookie Preferences
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Customize which cookies you want to allow.
            </p>
          </div>

          <div className="space-y-4" role="group" aria-label="Cookie categories">
            {/* Necessary Cookies */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg dark:bg-gray-800">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="necessary"
                    checked={consent.necessary}
                    disabled
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    aria-describedby="necessary-description"
                  />
                  <label htmlFor="necessary" className="font-medium text-gray-900 dark:text-white">
                    Necessary Cookies
                  </label>
                </div>
                <p id="necessary-description" className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Required for the website to function properly. Cannot be disabled.
                </p>
              </div>
            </div>

            {/* Functional Cookies */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg dark:bg-gray-800">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="functional"
                    checked={consent.functional}
                    onChange={(e) => setConsent(prev => ({ ...prev, functional: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    aria-describedby="functional-description"
                  />
                  <label htmlFor="functional" className="font-medium text-gray-900 dark:text-white">
                    Functional Cookies
                  </label>
                </div>
                <p id="functional-description" className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Enable personalized features and remember your preferences.
                </p>
              </div>
            </div>

            {/* Analytics Cookies */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg dark:bg-gray-800">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="analytics"
                    checked={consent.analytics}
                    onChange={(e) => setConsent(prev => ({ ...prev, analytics: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    aria-describedby="analytics-description"
                  />
                  <label htmlFor="analytics" className="font-medium text-gray-900 dark:text-white">
                    Analytics Cookies
                  </label>
                </div>
                <p id="analytics-description" className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Help us understand how visitors interact with our website.
                </p>
              </div>
            </div>

            {/* Marketing Cookies */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg dark:bg-gray-800">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="marketing"
                    checked={consent.marketing}
                    onChange={(e) => setConsent(prev => ({ ...prev, marketing: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    aria-describedby="marketing-description"
                  />
                  <label htmlFor="marketing" className="font-medium text-gray-900 dark:text-white">
                    Marketing Cookies
                  </label>
                </div>
                <p id="marketing-description" className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Used to deliver personalized advertisements.
                </p>
              </div>
            </div>

            {/* Ad Personalization */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg dark:bg-gray-800">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="ad_personalization"
                    checked={consent.ad_personalization}
                    onChange={(e) => setConsent(prev => ({ ...prev, ad_personalization: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    aria-describedby="ad-personalization-description"
                  />
                  <label htmlFor="ad_personalization" className="font-medium text-gray-900 dark:text-white">
                    Ad Personalization
                  </label>
                </div>
                <p id="ad-personalization-description" className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Allow ads to be personalized based on your interests.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-6">
            <button
              onClick={() => setShowDetails(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              aria-label="Go back to simple consent view"
            >
              Back
            </button>
            <button
              onClick={handleRejectAll}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
              aria-label="Reject all optional cookies"
            >
              Reject All
            </button>
            <button
              onClick={handleSavePreferences}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Save cookie preferences"
            >
              Save Preferences
            </button>
            <button
              onClick={handleAcceptAll}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              aria-label="Accept all cookies"
            >
              Accept All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CookieConsent;

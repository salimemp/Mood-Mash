// ============================================================================
// Accessibility Panel Component (WCAG AA Compliant)
// MoodMash - Accessibility Settings and Features
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import type { AccessibilityPreferences } from '../types/advanced';

interface AccessibilityPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const AccessibilityPanel: React.FC<AccessibilityPanelProps> = ({ isOpen, onClose }) => {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>({
    reduced_motion: false,
    high_contrast: false,
    font_size: 'medium',
    color_blind_mode: 'none',
    screen_reader_optimized: false,
    keyboard_navigation: true,
    focus_indicators: true,
    voice_control: false,
    captioning: false,
    caption_size: 'medium',
    audio_descriptions: false
  });

  useEffect(() => {
    // Load saved preferences
    const savedPrefs = localStorage.getItem('moodmash_accessibility');
    if (savedPrefs) {
      setPreferences(JSON.parse(savedPrefs));
    } else {
      // Detect system preferences
      detectSystemPreferences();
    }
  }, []);

  useEffect(() => {
    // Apply preferences to document
    applyAccessibilityPreferences();
  }, [preferences]);

  const detectSystemPreferences = () => {
    // Detect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setPreferences(prev => ({ ...prev, reduced_motion: prefersReducedMotion }));

    // Detect prefers-contrast
    const prefersContrast = window.matchMedia('(prefers-contrast: more)').matches;
    setPreferences(prev => ({ ...prev, high_contrast: prefersContrast }));
  };

  const applyAccessibilityPreferences = () => {
    const root = document.documentElement;

    // Reduced motion
    root.style.setProperty('--reduce-motion', preferences.reduced_motion ? 'reduce' : 'no-preference');

    // Font size
    const fontSizeMap: Record<string, string> = {
      small: '14px',
      medium: '16px',
      large: '18px',
      extra_large: '20px'
    };
    root.style.setProperty('--base-font-size', fontSizeMap[preferences.font_size]);

    // High contrast
    if (preferences.high_contrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Focus indicators
    if (preferences.focus_indicators) {
      root.classList.add('show-focus');
    } else {
      root.classList.remove('show-focus');
    }

    // Save to localStorage
    localStorage.setItem('moodmash_accessibility', JSON.stringify(preferences));
  };

  const handlePreferenceChange = useCallback((key: keyof AccessibilityPreferences, value: unknown) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleReset = () => {
    setPreferences({
      reduced_motion: false,
      high_contrast: false,
      font_size: 'medium',
      color_blind_mode: 'none',
      screen_reader_optimized: false,
      keyboard_navigation: true,
      focus_indicators: true,
      voice_control: false,
      captioning: false,
      caption_size: 'medium',
      audio_descriptions: false
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="accessibility-title"
    >
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl dark:bg-gray-900">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-4 border-b border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700">
          <h2 id="accessibility-title" className="text-xl font-semibold text-gray-900 dark:text-white">
            Accessibility Settings
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
            aria-label="Close accessibility settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Visual Settings */}
          <section aria-labelledby="visual-settings-heading">
            <h3 id="visual-settings-heading" className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
              Visual
            </h3>

            <div className="space-y-4">
              {/* Font Size */}
              <div className="flex items-center justify-between">
                <label htmlFor="font-size" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Font Size
                </label>
                <select
                  id="font-size"
                  value={preferences.font_size}
                  onChange={(e) => handlePreferenceChange('font_size', e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  aria-describedby="font-size-description"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium (Default)</option>
                  <option value="large">Large</option>
                  <option value="extra_large">Extra Large</option>
                </select>
              </div>

              {/* High Contrast */}
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="high-contrast" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    High Contrast
                  </label>
                  <p id="high-contrast-description" className="text-xs text-gray-500 dark:text-gray-400">
                    Increase color contrast for better visibility
                  </p>
                </div>
                <button
                  role="switch"
                  aria-checked={preferences.high_contrast}
                  aria-labelledby="high-contrast"
                  onClick={() => handlePreferenceChange('high_contrast', !preferences.high_contrast)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    preferences.high_contrast ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.high_contrast ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Color Blind Mode */}
              <div className="flex items-center justify-between">
                <label htmlFor="color-blind-mode" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Color Blind Mode
                </label>
                <select
                  id="color-blind-mode"
                  value={preferences.color_blind_mode}
                  onChange={(e) => handlePreferenceChange('color_blind_mode', e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="none">None</option>
                  <option value="protanopia">Protanopia (Red-Blind)</option>
                  <option value="deuteranopia">Deuteranopia (Green-Blind)</option>
                  <option value="tritanopia">Tritanopia (Blue-Blind)</option>
                </select>
              </div>
            </div>
          </section>

          {/* Motion Settings */}
          <section aria-labelledby="motion-settings-heading">
            <h3 id="motion-settings-heading" className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
              Motion
            </h3>

            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="reduced-motion" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Reduced Motion
                </label>
                <p id="reduced-motion-description" className="text-xs text-gray-500 dark:text-gray-400">
                  Minimize animations and transitions
                </p>
              </div>
              <button
                role="switch"
                aria-checked={preferences.reduced_motion}
                aria-labelledby="reduced-motion"
                onClick={() => handlePreferenceChange('reduced_motion', !preferences.reduced_motion)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  preferences.reduced_motion ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.reduced_motion ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </section>

          {/* Navigation Settings */}
          <section aria-labelledby="navigation-settings-heading">
            <h3 id="navigation-settings-heading" className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
              Navigation
            </h3>

            <div className="space-y-4">
              {/* Keyboard Navigation */}
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="keyboard-nav" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Enhanced Keyboard Navigation
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Improved keyboard shortcuts and navigation
                  </p>
                </div>
                <button
                  role="switch"
                  aria-checked={preferences.keyboard_navigation}
                  aria-labelledby="keyboard-nav"
                  onClick={() => handlePreferenceChange('keyboard_navigation', !preferences.keyboard_navigation)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    preferences.keyboard_navigation ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.keyboard_navigation ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Focus Indicators */}
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="focus-indicators" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Visible Focus Indicators
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Highlight focused elements clearly
                  </p>
                </div>
                <button
                  role="switch"
                  aria-checked={preferences.focus_indicators}
                  aria-labelledby="focus-indicators"
                  onClick={() => handlePreferenceChange('focus_indicators', !preferences.focus_indicators)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    preferences.focus_indicators ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.focus_indicators ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Audio & Voice Settings */}
          <section aria-labelledby="audio-settings-heading">
            <h3 id="audio-settings-heading" className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
              Audio & Voice
            </h3>

            <div className="space-y-4">
              {/* Captioning */}
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="captioning" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Closed Captions
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Show captions for audio content
                  </p>
                </div>
                <button
                  role="switch"
                  aria-checked={preferences.captioning}
                  aria-labelledby="captioning"
                  onClick={() => handlePreferenceChange('captioning', !preferences.captioning)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    preferences.captioning ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.captioning ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Caption Size */}
              {preferences.captioning && (
                <div className="flex items-center justify-between ml-4">
                  <label htmlFor="caption-size" className="text-sm text-gray-600 dark:text-gray-400">
                    Caption Size
                  </label>
                  <select
                    id="caption-size"
                    value={preferences.caption_size}
                    onChange={(e) => handlePreferenceChange('caption_size', e.target.value)}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
              )}

              {/* Audio Descriptions */}
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="audio-descriptions" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Audio Descriptions
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Narration for visual content
                  </p>
                </div>
                <button
                  role="switch"
                  aria-checked={preferences.audio_descriptions}
                  aria-labelledby="audio-descriptions"
                  onClick={() => handlePreferenceChange('audio_descriptions', !preferences.audio_descriptions)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    preferences.audio_descriptions ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.audio_descriptions ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Screen Reader */}
          <section aria-labelledby="screen-reader-heading">
            <h3 id="screen-reader-heading" className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
              Screen Reader
            </h3>

            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="screen-reader" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Screen Reader Optimization
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Enhanced support for screen readers
                </p>
              </div>
              <button
                role="switch"
                aria-checked={preferences.screen_reader_optimized}
                aria-labelledby="screen-reader"
                onClick={() => handlePreferenceChange('screen_reader_optimized', !preferences.screen_reader_optimized)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  preferences.screen_reader_optimized ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.screen_reader_optimized ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </section>

          {/* Keyboard Shortcuts Reference */}
          <section aria-labelledby="shortcuts-heading">
            <h3 id="shortcuts-heading" className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
              Keyboard Shortcuts
            </h3>
            <div className="p-3 bg-gray-50 rounded-lg dark:bg-gray-800">
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-600 dark:text-gray-400">Log mood quickly</dt>
                  <dd className="font-mono text-gray-900 dark:text-white">M</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600 dark:text-gray-400">Open settings</dt>
                  <dd className="font-mono text-gray-900 dark:text-white">S</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600 dark:text-gray-400">Search</dt>
                  <dd className="font-mono text-gray-900 dark:text-white">/</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600 dark:text-gray-400">Close dialog</dt>
                  <dd className="font-mono text-gray-900 dark:text-white">Esc</dd>
                </div>
              </dl>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
            aria-label="Reset accessibility settings to defaults"
          >
            Reset to Defaults
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Save and close accessibility settings"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityPanel;

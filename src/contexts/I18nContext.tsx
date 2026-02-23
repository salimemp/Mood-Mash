import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import en from '../locales/en.json';
import es from '../locales/es.json';
import fr from '../locales/fr.json';
import de from '../locales/de.json';
import it from '../locales/it.json';
import pt from '../locales/pt.json';
import ru from '../locales/ru.json';
import zh from '../locales/zh.json';
import ja from '../locales/ja.json';
import ko from '../locales/ko.json';
import hi from '../locales/hi.json';
import ta from '../locales/ta.json';
import bn from '../locales/bn.json';
import ar from '../locales/ar.json';
import he from '../locales/he.json';

type TranslationValue = string | { [key: string]: TranslationValue };
type Translations = { [key: string]: TranslationValue };

interface LocaleConfig {
  code: string;
  name: string;
  nativeName: string;
  dir: 'ltr' | 'rtl';
}

const locales: Record<string, Translations> = {
  en,
  es,
  fr,
  de,
  it,
  pt,
  ru,
  zh,
  ja,
  ko,
  hi,
  ta,
  bn,
  ar,
  he,
};

export const localeConfigs: LocaleConfig[] = [
  { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', dir: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', dir: 'ltr' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', dir: 'ltr' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', dir: 'ltr' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', dir: 'ltr' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', dir: 'ltr' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', dir: 'ltr' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', dir: 'ltr' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', dir: 'ltr' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', dir: 'ltr' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', dir: 'ltr' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', dir: 'rtl' },
];

interface I18nContextType {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  dir: 'ltr' | 'rtl';
  locales: LocaleConfig[];
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const getNestedValue = (obj: Translations, path: string): string => {
  const keys = path.split('.');
  let value: TranslationValue = obj;

  for (const key of keys) {
    if (typeof value === 'object' && value !== null && key in value) {
      value = value[key];
    } else {
      return path;
    }
  }

  return typeof value === 'string' ? value : path;
};

interface I18nProviderProps {
  children: ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [locale, setLocaleState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('moodmash-locale');
      if (stored && locales[stored]) {
        return stored;
      }
      const browserLang = navigator.language.split('-')[0];
      if (locales[browserLang]) {
        return browserLang;
      }
    }
    return 'en';
  });

  const setLocale = useCallback((newLocale: string) => {
    if (locales[newLocale]) {
      setLocaleState(newLocale);
      if (typeof window !== 'undefined') {
        localStorage.setItem('moodmash-locale', newLocale);
      }
    }
  }, []);

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const translations = locales[locale] || locales.en;
    let text = getNestedValue(translations, key);

    if (text === key && locale !== 'en') {
      text = getNestedValue(locales.en, key);
    }

    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        text = text.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramValue));
        text = text.replace(new RegExp(`{{${paramKey}_plural}}`, 'g'),
          typeof paramValue === 'number' && paramValue !== 1 ? 'plural' : '');
      });
    }

    return text;
  }, [locale]);

  const dir = localeConfigs.find(l => l.code === locale)?.dir || 'ltr';

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = dir;
      document.documentElement.lang = locale;
    }
  }, [dir, locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, dir, locales: localeConfigs }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

export default I18nContext;

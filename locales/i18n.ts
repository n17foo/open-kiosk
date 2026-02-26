import i18n, { type i18n as I18nInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

// Import translations
import en from './en.json';
import es from './es.json';
import fr from './fr.json';
import de from './de.json';

export const SUPPORTED_LANGUAGES = ['en', 'es', 'fr', 'de'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
};

// Get the current locale from device settings
const getCurrentLocale = (): SupportedLanguage => {
  const locale = Localization.getLocales()[0];
  const code = locale?.languageCode ?? 'en';
  return SUPPORTED_LANGUAGES.includes(code as SupportedLanguage) ? (code as SupportedLanguage) : 'en';
};

const resources = {
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
  de: { translation: de },
};

// Factory: returns a fresh i18n instance (useful for testing or multiple contexts)
export function createI18nInstance(lng?: SupportedLanguage): I18nInstance {
  const instance = i18n.createInstance();
  void instance.use(initReactI18next).init({
    resources,
    lng: lng ?? getCurrentLocale(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });
  return instance;
}

// Default shared instance
i18n.use(initReactI18next).init({
  resources,
  lng: getCurrentLocale(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;

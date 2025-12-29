import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

// Import translations
import en from './en.json';

// Get the current locale
const getCurrentLocale = () => {
  // Get the first locale from the device settings
  const locale = Localization.getLocales()[0];
  return locale?.languageCode || 'en';
};

// Create resources object
const resources = {
  en: {
    translation: en
  }
  // Add more languages as needed
};

// Configure i18next
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getCurrentLocale(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // not needed for react as it escapes by default
    }
  });

export default i18n;

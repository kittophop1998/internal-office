'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translations
import translationTH from './locales/th.json';
import translationEN from './locales/en.json';

const resources = {
  th: {
    translation: translationTH,
  },
  en: {
    translation: translationEN,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'th', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

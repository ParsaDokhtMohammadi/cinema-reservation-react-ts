import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import type { Locale } from '../types';
import { STORAGE_KEYS, readRaw, writeRaw } from '../lib/storage';
import { en } from './en';
import { fa } from './fa';

export const SUPPORTED_LOCALES: readonly Locale[] = ['en', 'fa'];
export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_DIRECTION: Record<Locale, 'ltr' | 'rtl'> = { en: 'ltr', fa: 'rtl' };

function isLocale(value: string | null): value is Locale {
  return value === 'en' || value === 'fa';
}

/** Stored preference first, then the browser's languages, then English. */
function detectLocale(): Locale {
  const stored = readRaw(STORAGE_KEYS.locale);
  if (isLocale(stored)) return stored;

  if (typeof navigator !== 'undefined') {
    for (const language of navigator.languages ?? [navigator.language]) {
      const base = language?.split('-')[0];
      if (isLocale(base)) return base;
    }
  }

  return DEFAULT_LOCALE;
}

void i18next.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fa: { translation: fa },
  },
  lng: detectLocale(),
  fallbackLng: DEFAULT_LOCALE,
  supportedLngs: SUPPORTED_LOCALES,
  interpolation: {
    // React escapes for us.
    escapeValue: false,
  },
  returnNull: false,
});

/** Applies the language to i18next, `<html>` and storage in one place. */
export function setLocale(locale: Locale): void {
  void i18next.changeLanguage(locale);
  writeRaw(STORAGE_KEYS.locale, locale);
  applyDocumentLocale(locale);
}

export function applyDocumentLocale(locale: Locale): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.lang = locale;
  root.dir = LOCALE_DIRECTION[locale];
}

export function currentLocale(): Locale {
  const resolved = i18next.resolvedLanguage ?? i18next.language;
  return isLocale(resolved) ? resolved : DEFAULT_LOCALE;
}

applyDocumentLocale(currentLocale());

export default i18next;

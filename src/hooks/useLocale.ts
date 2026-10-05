import { useTranslation } from 'react-i18next';

import type { Locale } from '../types';
import { LOCALE_DIRECTION, setLocale } from '../i18n';

export interface LocaleState {
  readonly locale: Locale;
  readonly dir: 'ltr' | 'rtl';
  readonly isRtl: boolean;
  readonly setLocale: (locale: Locale) => void;
}

/**
 * The active language plus its direction. Reads through useTranslation so the
 * component re-renders when the language changes.
 */
export function useLocale(): LocaleState {
  const { i18n } = useTranslation();
  const resolved = i18n.resolvedLanguage ?? i18n.language;
  const locale: Locale = resolved === 'fa' ? 'fa' : 'en';

  return {
    locale,
    dir: LOCALE_DIRECTION[locale],
    isRtl: locale === 'fa',
    setLocale,
  };
}

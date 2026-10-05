import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

import type { Locale } from '../../types';
import { useLocale } from '../../hooks/useLocale';
import { cn } from '../../lib/cn';

const OPTIONS: readonly { readonly locale: Locale; readonly short: string }[] = [
  { locale: 'en', short: 'EN' },
  { locale: 'fa', short: 'فا' },
];

/** Segmented EN / فا control — the active option slides between the two. */
export function LanguageSwitcher({ className }: { readonly className?: string }) {
  const { t } = useTranslation();
  const { locale, setLocale } = useLocale();

  return (
    <div
      role="group"
      aria-label={t('nav.language')}
      className={cn(
        'relative flex items-center gap-0.5 rounded-xl border border-ink-200 bg-white p-1 dark:border-ink-700 dark:bg-ink-900',
        className,
      )}
    >
      {OPTIONS.map((option) => {
        const isActive = option.locale === locale;
        return (
          <button
            key={option.locale}
            type="button"
            onClick={() => setLocale(option.locale)}
            aria-pressed={isActive}
            aria-label={option.locale === 'en' ? t('nav.languageEnglish') : t('nav.languagePersian')}
            className={cn(
              'relative z-10 h-8 min-w-10 rounded-lg px-2.5 text-xs font-bold transition-colors',
              isActive ? 'text-white' : 'text-ink-500 hover:text-ink-800 dark:text-ink-400 dark:hover:text-ink-100',
            )}
          >
            {isActive && (
              <motion.span
                layoutId="language-pill"
                className="absolute inset-0 -z-10 rounded-lg bg-brand-600 dark:bg-brand-500"
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              />
            )}
            {option.short}
          </button>
        );
      })}
    </div>
  );
}

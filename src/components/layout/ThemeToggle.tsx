import { AnimatePresence, motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

import { useTheme } from '../../context/themeContext';
import { MoonIcon, SunIcon } from '../ui/Icon';

export function ThemeToggle() {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? t('nav.switchToLight') : t('nav.switchToDark')}
      title={t('nav.toggleTheme')}
      className="relative flex size-10 items-center justify-center overflow-hidden rounded-xl border border-ink-200 bg-white text-ink-700 transition hover:border-ink-300 hover:bg-ink-50 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-200 dark:hover:border-ink-600 dark:hover:bg-ink-800"
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.span
          key={theme}
          initial={{ y: 14, opacity: 0, rotate: -25 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -14, opacity: 0, rotate: 25 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-center"
        >
          {isDark ? <MoonIcon className="size-5" /> : <SunIcon className="size-5" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { STORAGE_KEYS, readRaw, writeRaw } from '../lib/storage';
import { ThemeContext } from './themeContext';
import type { Theme, ThemeContextValue } from './themeContext';

function systemTheme(): Theme {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function storedTheme(): Theme | null {
  const value = readRaw(STORAGE_KEYS.theme);
  return value === 'light' || value === 'dark' ? value : null;
}

function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'dark' ? '#0b0b0d' : '#fafaf9');
}

export function ThemeProvider({ children }: { readonly children: ReactNode }) {
  // The inline script in index.html has already applied the right class before
  // first paint; this mirrors that decision into React state.
  const [theme, setThemeState] = useState<Theme>(() => storedTheme() ?? systemTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Follow the OS for as long as the visitor has not made an explicit choice.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const query = window.matchMedia('(prefers-color-scheme: dark)');

    const onChange = (event: MediaQueryListEvent) => {
      if (storedTheme() === null) setThemeState(event.matches ? 'dark' : 'light');
    };

    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  /**
   * A ticket always prints on white. Overriding the CSS tokens in the print
   * stylesheet is not enough on its own, because Tailwind's `dark:` utilities
   * carry literal colours — so the whole dark mode comes off for the duration
   * of the print and goes straight back afterwards.
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onBeforePrint = () => document.documentElement.classList.remove('dark');
    const onAfterPrint = () => document.documentElement.classList.toggle('dark', theme === 'dark');

    window.addEventListener('beforeprint', onBeforePrint);
    window.addEventListener('afterprint', onAfterPrint);
    return () => {
      window.removeEventListener('beforeprint', onBeforePrint);
      window.removeEventListener('afterprint', onAfterPrint);
    };
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    writeRaw(STORAGE_KEYS.theme, next);
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const next = current === 'dark' ? 'light' : 'dark';
      writeRaw(STORAGE_KEYS.theme, next);
      return next;
    });
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, toggleTheme, setTheme }),
    [theme, toggleTheme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

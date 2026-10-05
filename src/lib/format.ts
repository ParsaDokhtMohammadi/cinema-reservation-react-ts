import type { Locale } from '../types';

/**
 * Locale-aware formatting. `fa-IR` gives Persian digits and the Jalali
 * calendar for free, which is what a Persian speaker expects to see.
 */
const INTL_LOCALE: Record<Locale, string> = { en: 'en-US', fa: 'fa-IR' };

export function intlLocale(locale: Locale): string {
  return INTL_LOCALE[locale];
}

/** Formatters are cached — constructing them is the expensive part. */
const cache = new Map<string, Intl.DateTimeFormat | Intl.NumberFormat>();

function dateFormatter(locale: Locale, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = `d:${locale}:${JSON.stringify(options)}`;
  const existing = cache.get(key);
  if (existing instanceof Intl.DateTimeFormat) return existing;
  const created = new Intl.DateTimeFormat(intlLocale(locale), options);
  cache.set(key, created);
  return created;
}

function numberFormatter(locale: Locale, options: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = `n:${locale}:${JSON.stringify(options)}`;
  const existing = cache.get(key);
  if (existing instanceof Intl.NumberFormat) return existing;
  const created = new Intl.NumberFormat(intlLocale(locale), options);
  cache.set(key, created);
  return created;
}

function asDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

export function formatCurrency(amount: number, locale: Locale): string {
  return numberFormatter(locale, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(value: number, locale: Locale): string {
  return numberFormatter(locale, {}).format(value);
}

/** "19:45" — 24-hour in both languages, which is how cinemas list times. */
export function formatTime(value: Date | string, locale: Locale): string {
  return dateFormatter(locale, { hour: '2-digit', minute: '2-digit', hour12: false }).format(asDate(value));
}

/** "Sat, 12 Oct" */
export function formatDateShort(value: Date | string, locale: Locale): string {
  return dateFormatter(locale, { weekday: 'short', day: 'numeric', month: 'short' }).format(asDate(value));
}

/** "Saturday, 12 October 2025" */
export function formatDateLong(value: Date | string, locale: Locale): string {
  return dateFormatter(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(asDate(value));
}

/** "October 2025" — used for release dates. */
export function formatMonthYear(value: Date | string, locale: Locale): string {
  return dateFormatter(locale, { month: 'long', year: 'numeric' }).format(asDate(value));
}

export function formatYear(value: Date | string, locale: Locale): string {
  return dateFormatter(locale, { year: 'numeric' }).format(asDate(value));
}

/** Weekday only — the date rail's top line. */
export function formatWeekday(value: Date | string, locale: Locale): string {
  return dateFormatter(locale, { weekday: 'short' }).format(asDate(value));
}

/** Day of month only — the date rail's big number. */
export function formatDayOfMonth(value: Date | string, locale: Locale): string {
  return dateFormatter(locale, { day: 'numeric' }).format(asDate(value));
}

export function formatMonthShort(value: Date | string, locale: Locale): string {
  return dateFormatter(locale, { month: 'short' }).format(asDate(value));
}

export function durationParts(totalMinutes: number): { hours: number; minutes: number } {
  return { hours: Math.floor(totalMinutes / 60), minutes: totalMinutes % 60 };
}

/** 0 = today, 1 = tomorrow, …; negative for past days. */
export function daysFromToday(value: Date | string): number {
  const date = asDate(value);
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((startOfDate.getTime() - startOfToday.getTime()) / 86_400_000);
}

/** A 0–10 score shown as one decimal in the active locale. */
export function formatRating(rating: number, locale: Locale): string {
  return numberFormatter(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(rating);
}

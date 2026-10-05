import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { GenreId, Locale } from '../types';
import {
  daysFromToday,
  durationParts,
  formatCurrency,
  formatDateLong,
  formatDateShort,
  formatDayOfMonth,
  formatMonthShort,
  formatMonthYear,
  formatNumber,
  formatRating,
  formatTime,
  formatWeekday,
} from '../lib/format';

export interface Formatters {
  readonly locale: Locale;
  readonly currency: (amount: number) => string;
  readonly number: (value: number) => string;
  readonly rating: (value: number) => string;
  readonly time: (value: Date | string) => string;
  readonly dateShort: (value: Date | string) => string;
  readonly dateLong: (value: Date | string) => string;
  readonly monthYear: (value: Date | string) => string;
  readonly weekday: (value: Date | string) => string;
  readonly dayOfMonth: (value: Date | string) => string;
  readonly monthShort: (value: Date | string) => string;
  readonly duration: (totalMinutes: number) => string;
  readonly genre: (genre: GenreId) => string;
  readonly genreList: (genres: readonly GenreId[]) => string;
  /** "Today" / "Tomorrow", or null for any other day. */
  readonly relativeDay: (value: Date | string) => string | null;
}

/**
 * One hook for every piece of locale-aware formatting, so components never
 * reach for Intl directly and Persian digits/Jalali dates come for free.
 */
export function useFormat(): Formatters {
  const { t, i18n } = useTranslation();
  const resolved = i18n.resolvedLanguage ?? i18n.language;
  const locale: Locale = resolved === 'fa' ? 'fa' : 'en';

  return useMemo<Formatters>(
    () => ({
      locale,
      currency: (amount) => formatCurrency(amount, locale),
      number: (value) => formatNumber(value, locale),
      rating: (value) => formatRating(value, locale),
      time: (value) => formatTime(value, locale),
      dateShort: (value) => formatDateShort(value, locale),
      dateLong: (value) => formatDateLong(value, locale),
      monthYear: (value) => formatMonthYear(value, locale),
      weekday: (value) => formatWeekday(value, locale),
      dayOfMonth: (value) => formatDayOfMonth(value, locale),
      monthShort: (value) => formatMonthShort(value, locale),
      duration: (totalMinutes) => {
        const { hours, minutes } = durationParts(totalMinutes);
        if (hours === 0) return t('common.durationMinutesOnly', { minutes: formatNumber(minutes, locale) });
        // Avoid the clumsy "3h 0m" for a film that runs to the hour.
        if (minutes === 0) return t('common.durationHoursOnly', { hours: formatNumber(hours, locale) });
        return t('common.durationValue', {
          hours: formatNumber(hours, locale),
          minutes: formatNumber(minutes, locale),
        });
      },
      genre: (genre) => t(`genres.${genre}`),
      genreList: (genres) => genres.map((genre) => t(`genres.${genre}`)).join(' · '),
      relativeDay: (value) => {
        const offset = daysFromToday(value);
        if (offset === 0) return t('dates.today');
        if (offset === 1) return t('dates.tomorrow');
        return null;
      },
    }),
    [locale, t],
  );
}

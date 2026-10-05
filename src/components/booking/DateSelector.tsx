import { useTranslation } from 'react-i18next';

import { useFormat } from '../../hooks/useFormat';
import { cn } from '../../lib/cn';
import { CalendarIcon } from '../ui/Icon';

export interface DateOption {
  readonly dateKey: string;
  readonly date: Date;
  readonly count: number;
}

interface DateSelectorProps {
  readonly options: readonly DateOption[];
  readonly selected: string;
  readonly onSelect: (dateKey: string) => void;
}

/**
 * The day rail. Horizontal scroll on narrow screens; the active day is the
 * only filled chip, so the choice is obvious at a glance.
 */
export function DateSelector({ options, selected, onSelect }: DateSelectorProps) {
  const { t } = useTranslation();
  const format = useFormat();

  return (
    <div className="space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-ink-500 dark:text-ink-400">
        <CalendarIcon className="size-4" />
        {t('movie.selectDate')}
      </h3>

      <div
        role="tablist"
        aria-label={t('movie.selectDate')}
        className="scrollbar-none -mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1"
      >
        {options.map((option) => {
          const isSelected = option.dateKey === selected;
          const relative = format.relativeDay(option.date);

          return (
            <button
              key={option.dateKey}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => onSelect(option.dateKey)}
              className={cn(
                'flex min-w-20 shrink-0 flex-col items-center gap-0.5 rounded-xl border px-3.5 py-2.5 transition-all duration-200',
                isSelected
                  ? 'border-brand-600 bg-brand-600 text-white shadow-sm dark:border-brand-500 dark:bg-brand-500'
                  : 'border-ink-200 bg-white text-ink-700 hover:border-ink-300 hover:bg-ink-50 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-200 dark:hover:border-ink-600 dark:hover:bg-ink-800',
              )}
            >
              <span
                className={cn(
                  'text-[0.65rem] font-bold uppercase tracking-wide',
                  isSelected ? 'text-white/80' : 'text-ink-400',
                )}
              >
                {relative ?? format.weekday(option.date)}
              </span>
              <span className="text-lg font-extrabold leading-none">
                {format.dayOfMonth(option.date)}
              </span>
              <span
                className={cn(
                  'text-[0.65rem] font-semibold',
                  isSelected ? 'text-white/80' : 'text-ink-400',
                )}
              >
                {format.monthShort(option.date)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

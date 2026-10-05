import { useTranslation } from 'react-i18next';

import { useFormat } from '../../hooks/useFormat';
import { TIER_MULTIPLIER } from '../../lib/seatmap';

interface SeatLegendProps {
  readonly basePrice: number;
  readonly hasOwnSeats: boolean;
}

export function SeatLegend({ basePrice, hasOwnSeats }: SeatLegendProps) {
  const { t } = useTranslation();
  const format = useFormat();

  const items = [
    {
      key: 'available',
      label: t('booking.legend.available'),
      swatch: 'bg-ink-300 dark:bg-ink-700',
      note: format.currency(basePrice * TIER_MULTIPLIER.standard),
    },
    {
      key: 'selected',
      label: t('booking.legend.selected'),
      swatch: 'bg-brand-600 ring-2 ring-brand-300 dark:bg-brand-500 dark:ring-brand-700',
    },
    {
      key: 'occupied',
      label: t('booking.legend.occupied'),
      swatch: 'bg-ink-200 dark:bg-ink-800',
    },
    {
      key: 'premium',
      label: t('booking.legend.premium'),
      swatch: 'bg-ink-300 ring-1 ring-gold-500/60 dark:bg-ink-700',
      note: format.currency(basePrice * TIER_MULTIPLIER.premium),
    },
    {
      key: 'vip',
      label: t('booking.legend.vip'),
      swatch: 'rounded-md bg-ink-300 ring-1 ring-gold-500 dark:bg-ink-700',
      note: format.currency(basePrice * TIER_MULTIPLIER.vip),
    },
    ...(hasOwnSeats
      ? [
          {
            key: 'yours',
            label: t('booking.legend.yours'),
            swatch: 'bg-gold-500/80',
            note: undefined,
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold uppercase tracking-wide text-ink-500 dark:text-ink-400">
        {t('booking.legendTitle')}
      </h3>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-3">
        {items.map((item) => (
          <li key={item.key} className="flex items-center gap-2 text-xs">
            <span
              className={`size-3.5 shrink-0 rounded-t-md rounded-b-sm ${item.swatch}`}
              aria-hidden="true"
            />
            <span className="min-w-0">
              <span className="block truncate font-semibold">{item.label}</span>
              {item.note && (
                <span className="block text-[0.68rem] tabular-nums text-ink-400">{item.note}</span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

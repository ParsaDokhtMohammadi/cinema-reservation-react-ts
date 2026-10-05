import { useTranslation } from 'react-i18next';

import type { SeatTier, ShowtimeDetails } from '../../types';
import { useFormat } from '../../hooks/useFormat';
import { cn } from '../../lib/cn';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { SmartImage } from '../ui/SmartImage';
import { SofaIcon, TicketIcon } from '../ui/Icon';

export interface SelectedSeatSummary {
  readonly seatId: string;
  readonly tier: SeatTier;
  readonly price: number;
}

interface BookingSummaryProps {
  readonly details: ShowtimeDetails;
  readonly seats: readonly SelectedSeatSummary[];
  readonly total: number;
  readonly submitting: boolean;
  readonly onConfirm: () => void;
  /** Hides the poster block in the compact mobile sheet. */
  readonly compact?: boolean;
}

function Row({
  label,
  value,
  emphasis = false,
}: {
  readonly label: string;
  readonly value: string;
  readonly emphasis?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-xs font-medium text-ink-500 dark:text-ink-400">{label}</dt>
      <dd
        className={cn(
          'text-end text-sm font-semibold',
          emphasis && 'text-lg font-extrabold tabular-nums',
        )}
      >
        {value}
      </dd>
    </div>
  );
}

export function BookingSummary({
  details,
  seats,
  total,
  submitting,
  onConfirm,
  compact = false,
}: BookingSummaryProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const { movie, cinema, hall, showtime } = details;
  const title = movie.title[format.locale];

  // Seats are listed per tier so the price breakdown is obvious.
  const tiers: readonly SeatTier[] = ['standard', 'premium', 'vip'];
  const groups = tiers
    .map((tier) => {
      const inTier = seats.filter((seat) => seat.tier === tier);
      return { tier, count: inTier.length, unitPrice: inTier[0]?.price ?? 0 };
    })
    .filter((group) => group.count > 0);

  const sortedSeatIds = seats
    .map((seat) => seat.seatId)
    .slice()
    .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));

  return (
    <div className="flex flex-col gap-5">
      {!compact && (
        <div className="flex gap-4">
          <SmartImage
            src={movie.posterUrl}
            alt={t('a11y.posterAlt', { title })}
            fallbackLabel={title}
            accentColor={movie.accentColor}
            className="aspect-2/3 w-20 shrink-0 rounded-lg"
            sizes="80px"
          />
          <div className="min-w-0 space-y-1.5">
            <h2 className="line-clamp-2 text-sm font-bold leading-snug">{title}</h2>
            <p className="text-xs text-ink-500 dark:text-ink-400">{cinema.name[format.locale]}</p>
            <div className="flex flex-wrap gap-1.5">
              <Badge tone="neutral">{showtime.format}</Badge>
              <Badge tone="muted">{t(`audio.${showtime.audio}`)}</Badge>
            </div>
          </div>
        </div>
      )}

      <dl className="space-y-2.5 border-t border-ink-200 pt-4 dark:border-ink-800">
        {compact && <Row label={t('booking.movieLabel')} value={title} />}
        <Row label={t('booking.hallLabel')} value={hall.name[format.locale]} />
        <Row label={t('booking.dateLabel')} value={format.dateShort(showtime.startsAt)} />
        <Row label={t('booking.timeLabel')} value={format.time(showtime.startsAt)} />
      </dl>

      <div className="space-y-3 border-t border-ink-200 pt-4 dark:border-ink-800">
        <div className="flex items-center justify-between gap-3">
          <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-500 dark:text-ink-400">
            <SofaIcon className="size-4" />
            {t('booking.seatsLabel')}
          </h3>
          <span className="text-xs font-semibold text-ink-500 dark:text-ink-400">
            {t('booking.ticketCount', { count: seats.length })}
          </span>
        </div>

        {seats.length === 0 ? (
          <p className="rounded-lg bg-ink-50 px-3 py-4 text-center text-xs leading-relaxed text-ink-500 dark:bg-ink-900/60 dark:text-ink-400">
            {t('booking.noSeatsSelectedBody')}
          </p>
        ) : (
          <>
            <ul className="flex flex-wrap gap-1.5" aria-label={t('booking.seatsLabel')}>
              {sortedSeatIds.map((seatId) => (
                <li
                  key={seatId}
                  className="rounded-md bg-brand-600 px-2 py-1 text-[0.7rem] font-bold text-white tabular-nums dark:bg-brand-500"
                >
                  {seatId}
                </li>
              ))}
            </ul>

            <dl className="space-y-1.5 pt-1">
              {groups.map((group) => (
                <Row
                  key={group.tier}
                  label={`${t(`booking.tiers.${group.tier}`)} × ${format.number(group.count)}`}
                  value={format.currency(group.unitPrice * group.count)}
                />
              ))}
            </dl>
          </>
        )}
      </div>

      <div className="space-y-4 border-t border-ink-200 pt-4 dark:border-ink-800">
        <Row label={t('booking.totalLabel')} value={format.currency(total)} emphasis />
        <Button
          fullWidth
          size="lg"
          disabled={seats.length === 0 || submitting}
          onClick={onConfirm}
        >
          <TicketIcon className="size-5" />
          {submitting ? t('booking.confirming') : t('booking.confirmButton')}
        </Button>
      </div>
    </div>
  );
}

import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import type { ReservationDetails } from '../../types';
import { useFormat } from '../../hooks/useFormat';
import { cn } from '../../lib/cn';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { CalendarIcon, ClockIcon, MapPinIcon, SofaIcon, TrashIcon } from '../ui/Icon';
import { SmartImage } from '../ui/SmartImage';

interface ReservationCardProps {
  readonly details: ReservationDetails;
  readonly onCancel: (details: ReservationDetails) => void;
}

export function ReservationCard({ details, onCancel }: ReservationCardProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const { reservation, movie, cinema, hall, showtime, displayStatus } = details;
  const title = movie.title[format.locale];

  const seatIds = reservation.seats
    .map((seat) => seat.seatId)
    .slice()
    .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));

  const statusTone =
    displayStatus === 'confirmed' ? 'success' : displayStatus === 'completed' ? 'muted' : 'brand';

  const statusLabel =
    displayStatus === 'confirmed'
      ? t('reservations.statusConfirmed')
      : displayStatus === 'completed'
        ? t('reservations.statusCompleted')
        : t('reservations.statusCancelled');

  const isCancelled = displayStatus === 'cancelled';

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'surface-card overflow-hidden rounded-card transition-opacity',
        isCancelled && 'opacity-70',
      )}
    >
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:gap-5 sm:p-5">
        <Link
          to={`/movies/${movie.id}`}
          className="shrink-0 self-start rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <SmartImage
            src={movie.posterUrl}
            alt={t('a11y.posterAlt', { title })}
            fallbackLabel={title}
            accentColor={movie.accentColor}
            className="aspect-2/3 w-24 rounded-lg sm:w-28"
            sizes="112px"
          />
        </Link>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0 space-y-1">
              <h3 className="truncate text-base font-bold">
                <Link
                  to={`/movies/${movie.id}`}
                  className="transition-colors hover:text-brand-600 dark:hover:text-brand-400"
                >
                  {title}
                </Link>
              </h3>
              <p className="flex items-center gap-1.5 text-xs text-ink-500 dark:text-ink-400">
                <MapPinIcon className="size-3.5 shrink-0" />
                <span className="truncate">
                  {cinema.name[format.locale]} · {hall.name[format.locale]}
                </span>
              </p>
            </div>
            <Badge tone={statusTone}>{statusLabel}</Badge>
          </div>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-4">
            <div>
              <dt className="flex items-center gap-1 text-ink-400">
                <CalendarIcon className="size-3.5" />
                {t('confirmation.date')}
              </dt>
              <dd className="mt-0.5 font-semibold">{format.dateShort(showtime.startsAt)}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1 text-ink-400">
                <ClockIcon className="size-3.5" />
                {t('confirmation.time')}
              </dt>
              <dd className="mt-0.5 font-semibold tabular-nums">
                {format.time(showtime.startsAt)}
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-1 text-ink-400">
                <SofaIcon className="size-3.5" />
                {t('confirmation.tickets')}
              </dt>
              <dd className="mt-0.5 font-semibold">
                {t('booking.ticketCount', { count: reservation.seats.length })}
              </dd>
            </div>
            <div>
              <dt className="text-ink-400">{t('confirmation.total')}</dt>
              <dd className="mt-0.5 font-extrabold tabular-nums">
                {format.currency(reservation.totalPrice)}
              </dd>
            </div>
          </dl>

          <div className="flex flex-wrap items-center gap-1.5">
            {seatIds.map((seatId) => (
              <span
                key={seatId}
                className={cn(
                  'rounded-md px-2 py-0.5 text-[0.7rem] font-bold tabular-nums',
                  isCancelled
                    ? 'bg-ink-100 text-ink-400 line-through dark:bg-ink-800'
                    : 'bg-ink-100 text-ink-700 dark:bg-ink-800 dark:text-ink-200',
                )}
              >
                {seatId}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-200 pt-3 dark:border-ink-800">
            <p className="text-xs text-ink-400">
              {t('reservations.reference')}:{' '}
              <span className="font-mono font-bold text-ink-600 dark:text-ink-300">
                {reservation.id}
              </span>
            </p>

            <div className="flex items-center gap-2">
              <Link
                to={`/reservation/${reservation.id}`}
                className="inline-flex h-9 items-center rounded-xl border border-ink-200 px-3.5 text-sm font-semibold transition hover:bg-ink-50 dark:border-ink-700 dark:hover:bg-ink-800"
              >
                {t('reservations.viewTicket')}
              </Link>
              {displayStatus === 'confirmed' && (
                <Button variant="danger" size="sm" onClick={() => onCancel(details)}>
                  <TrashIcon className="size-4" />
                  {t('reservations.cancelButton')}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

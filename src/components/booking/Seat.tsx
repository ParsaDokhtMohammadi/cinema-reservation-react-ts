import { useTranslation } from 'react-i18next';

import type { Seat as SeatModel, SeatState } from '../../types';
import { useFormat } from '../../hooks/useFormat';
import { cn } from '../../lib/cn';

interface SeatProps {
  readonly seat: SeatModel;
  readonly state: SeatState;
  /** Occupied by one of this browser's own reservations. */
  readonly isOwn: boolean;
  readonly onToggle: (seatId: string) => void;
}

/**
 * A single seat.
 *
 * State is never communicated by colour alone: selected seats carry a tick,
 * taken seats a cross, VIP seats a star, and every seat has a full
 * accessible label.
 */
export function Seat({ seat, state, isOwn, onToggle }: SeatProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const disabled = state === 'occupied';

  const stateLabel =
    state === 'selected'
      ? t('booking.seatStateSelected')
      : state === 'occupied'
        ? t('booking.seatStateOccupied')
        : t('booking.seatStateAvailable');

  return (
    <button
      type="button"
      data-seat-id={seat.id}
      disabled={disabled}
      aria-pressed={state === 'selected'}
      aria-label={t('booking.seatA11y', {
        row: seat.row,
        number: format.number(seat.number),
        tier: t(`booking.tiers.${seat.tier}`),
        state: isOwn ? t('booking.legend.yours') : stateLabel,
      })}
      onClick={() => onToggle(seat.id)}
      className={cn(
        'relative flex items-center justify-center rounded-t-md rounded-b-sm text-[0.5rem] font-bold leading-none',
        'size-(--seat) transition-[transform,background-color,box-shadow] duration-150',
        'focus-visible:outline-2 focus-visible:outline-offset-2',

        // Available
        state === 'available' &&
          'bg-ink-300 text-ink-600 hover:scale-110 hover:bg-brand-400 hover:text-white active:scale-95 dark:bg-ink-700 dark:text-ink-300 dark:hover:bg-brand-500 dark:hover:text-white',

        // Selected
        state === 'selected' &&
          'scale-105 bg-brand-600 text-white shadow-md shadow-brand-600/30 ring-2 ring-brand-300 dark:bg-brand-500 dark:ring-brand-700',

        // Taken
        state === 'occupied' &&
          'cursor-not-allowed bg-ink-200 text-ink-400 dark:bg-ink-800 dark:text-ink-600',

        // Tier accents, only while the seat is still free
        seat.tier === 'premium' && state === 'available' && 'ring-1 ring-gold-500/50',
        seat.tier === 'vip' && 'rounded-md',
        seat.tier === 'vip' && state === 'available' && 'ring-1 ring-gold-500/80',

        // One of the user's own seats from an earlier booking
        isOwn && 'bg-gold-500/80 text-ink-900 dark:bg-gold-500/70 dark:text-ink-950',
      )}
      title={`${seat.row}${seat.number} · ${t(`booking.tiers.${seat.tier}`)}`}
    >
      {state === 'selected' ? (
        <svg viewBox="0 0 24 24" className="size-2.5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.5 12.5l5 5 10-11" />
        </svg>
      ) : state === 'occupied' && !isOwn ? (
        <svg viewBox="0 0 24 24" className="size-2" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      ) : isOwn ? (
        <svg viewBox="0 0 24 24" className="size-2.5" aria-hidden="true" fill="currentColor">
          <path d="M12 3.5l2.6 5.3 5.9.85-4.25 4.15 1 5.85L12 16.9l-5.25 2.75 1-5.85L3.5 9.65l5.9-.85z" />
        </svg>
      ) : seat.tier === 'vip' ? (
        <svg viewBox="0 0 24 24" className="size-2 opacity-70" aria-hidden="true" fill="currentColor">
          <path d="M12 3.5l2.6 5.3 5.9.85-4.25 4.15 1 5.85L12 16.9l-5.25 2.75 1-5.85L3.5 9.65l5.9-.85z" />
        </svg>
      ) : (
        <span aria-hidden="true" className="opacity-60">
          {seat.number}
        </span>
      )}
    </button>
  );
}

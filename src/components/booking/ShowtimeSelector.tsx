import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import type { Reservation, Showtime } from '../../types';
import { CINEMAS, getHall } from '../../data/cinemas';
import { useFormat } from '../../hooks/useFormat';
import { buildSeatMap, seatPrice } from '../../lib/seatmap';
import { getOccupiedSeatIds } from '../../lib/reservations';
import { isPast } from '../../lib/catalog';
import { cn } from '../../lib/cn';
import { Badge } from '../ui/Badge';
import { MapPinIcon, SpeakerIcon } from '../ui/Icon';

interface ShowtimeSelectorProps {
  readonly showtimes: readonly Showtime[];
  readonly reservations: readonly Reservation[];
}

interface ShowtimeMeta {
  readonly showtime: Showtime;
  readonly seatsLeft: number;
  readonly soldOut: boolean;
  readonly past: boolean;
  readonly fromPrice: number;
}

function describe(showtime: Showtime, reservations: readonly Reservation[]): ShowtimeMeta {
  const hall = getHall(showtime.hallId);
  const total = hall ? buildSeatMap(hall).totalSeats : 0;
  const occupied = getOccupiedSeatIds(showtime.id, reservations).size;
  const seatsLeft = Math.max(0, total - occupied);

  return {
    showtime,
    seatsLeft,
    soldOut: seatsLeft === 0,
    past: isPast(showtime.startsAt),
    fromPrice: seatPrice(showtime.basePrice, 'standard'),
  };
}

/** Screenings for one day, grouped by venue. */
export function ShowtimeSelector({ showtimes, reservations }: ShowtimeSelectorProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const navigate = useNavigate();

  const byCinema = CINEMAS.map((cinema) => ({
    cinema,
    items: showtimes
      .filter((showtime) => showtime.cinemaId === cinema.id)
      .map((showtime) => describe(showtime, reservations)),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="space-y-7">
      {byCinema.map(({ cinema, items }) => (
        <div key={cinema.id} className="space-y-3">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <MapPinIcon className="size-4 shrink-0 text-ink-400" />
            <h3 className="text-sm font-bold">{cinema.name[format.locale]}</h3>
            <span className="text-xs text-ink-400">{cinema.address[format.locale]}</span>
          </div>

          <ul className="flex flex-wrap gap-2.5">
            {items.map((meta) => {
              const { showtime, soldOut, past, seatsLeft } = meta;
              const disabled = soldOut || past;
              const hall = getHall(showtime.hallId);

              return (
                <li key={showtime.id}>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => navigate(`/booking/${showtime.id}`)}
                    aria-label={`${format.time(showtime.startsAt)} — ${hall?.name[format.locale] ?? ''} — ${
                      disabled
                        ? past
                          ? t('movie.pastShowtime')
                          : t('movie.soldOut')
                        : t('movie.seatsLeft', { count: seatsLeft })
                    }`}
                    className={cn(
                      'group flex w-36 flex-col items-start gap-1.5 rounded-xl border p-3 text-start transition-all duration-200',
                      disabled
                        ? 'cursor-not-allowed border-ink-200 bg-ink-50 opacity-60 dark:border-ink-800 dark:bg-ink-900/50'
                        : 'border-ink-200 bg-white hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-md dark:border-ink-700 dark:bg-ink-900 dark:hover:border-brand-500',
                    )}
                  >
                    <span className="flex w-full items-center justify-between gap-1">
                      <span className="text-lg font-extrabold leading-none tabular-nums">
                        {format.time(showtime.startsAt)}
                      </span>
                      <span className="rounded border border-ink-200 px-1 py-0.5 text-[0.6rem] font-bold text-ink-500 dark:border-ink-700 dark:text-ink-400">
                        {showtime.format}
                      </span>
                    </span>

                    <span className="flex items-center gap-1 text-[0.7rem] text-ink-500 dark:text-ink-400">
                      <SpeakerIcon className="size-3" />
                      {t(`audio.${showtime.audio}`)}
                    </span>

                    <span className="truncate text-[0.7rem] font-medium text-ink-500 dark:text-ink-400">
                      {hall?.name[format.locale]}
                    </span>

                    {past ? (
                      <Badge tone="muted" className="mt-0.5">
                        {t('movie.pastShowtime')}
                      </Badge>
                    ) : soldOut ? (
                      <Badge tone="muted" className="mt-0.5">
                        {t('movie.soldOut')}
                      </Badge>
                    ) : (
                      <span className="mt-0.5 flex w-full items-center justify-between gap-1 text-[0.7rem]">
                        <span
                          className={cn(
                            'font-semibold',
                            seatsLeft <= 12 ? 'text-brand-600 dark:text-brand-400' : 'text-ink-400',
                          )}
                        >
                          {t('movie.seatsLeft', { count: seatsLeft })}
                        </span>
                        <span className="font-bold text-ink-600 dark:text-ink-300">
                          {format.currency(meta.fromPrice)}
                        </span>
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

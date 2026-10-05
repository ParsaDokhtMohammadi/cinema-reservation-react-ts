import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';

import type { SeatTier } from '../types';
import { getShowtimeDetails, isPast } from '../lib/catalog';
import {
  createReservation,
  getOccupiedSeatIds,
  getOwnSeatIds,
  getReservations,
  subscribe,
} from '../lib/reservations';
import { buildSeatMap, findSeat, seatPrice } from '../lib/seatmap';
import { alertProblem } from '../lib/alerts';
import { useFormat } from '../hooks/useFormat';
import { usePageTitle } from '../hooks/usePageTitle';
import { useReservations } from '../hooks/useReservations';
import { PageContainer } from '../components/layout/Layout';
import { SeatMap } from '../components/booking/SeatMap';
import { SeatLegend } from '../components/booking/SeatLegend';
import { BookingSummary } from '../components/booking/BookingSummary';
import type { SelectedSeatSummary } from '../components/booking/BookingSummary';
import { Badge } from '../components/ui/Badge';
import { Button, ButtonLink } from '../components/ui/Button';
import { ErrorState, Notice } from '../components/ui/States';
import { ChevronIcon, CloseIcon, MapPinIcon } from '../components/ui/Icon';

/** Seat feedback reuses one toast so quick selections do not stack. */
const SEAT_TOAST = { id: 'seat-selection', duration: 1400 } as const;

/** One reservation can hold at most this many seats. */
const MAX_SEATS = 8;

export default function BookingPage() {
  const { showtimeId } = useParams<{ showtimeId: string }>();
  const { t } = useTranslation();
  const format = useFormat();
  const navigate = useNavigate();
  const reservations = useReservations();

  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const details = getShowtimeDetails(showtimeId);

  usePageTitle(details ? `${details.movie.title[format.locale]} · ${t('booking.title')}` : t('booking.notFoundTitle'));

  const layout = useMemo(() => (details ? buildSeatMap(details.hall) : null), [details]);

  const occupied = useMemo(
    () => (showtimeId ? getOccupiedSeatIds(showtimeId, reservations) : new Set<string>()),
    [showtimeId, reservations],
  );

  const ownSeats = useMemo(
    () => (showtimeId ? getOwnSeatIds(showtimeId, reservations) : new Set<string>()),
    [showtimeId, reservations],
  );

  // The subscription callback below needs the live selection without being
  // re-registered on every click.
  const selectedRef = useRef<ReadonlySet<string>>(selected);
  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  // Set while we are writing our own reservation, so our own seats becoming
  // occupied does not get reported back to us as a conflict.
  const committingRef = useRef(false);

  /**
   * Keeps the selection honest when another tab books a seat we are holding:
   * the seat is dropped and the user is told straight away, rather than the
   * booking failing later at confirmation time.
   */
  useEffect(() => {
    if (!showtimeId) return;

    return subscribe(() => {
      if (committingRef.current) return;

      const fresh = getOccupiedSeatIds(showtimeId, getReservations());
      const lost = [...selectedRef.current].filter((seatId) => fresh.has(seatId));
      if (lost.length === 0) return;

      setSelected(new Set([...selectedRef.current].filter((seatId) => !fresh.has(seatId))));
      toast.error(t('booking.seatTakenToast', { seats: lost.join(', ') }), { id: 'seat-conflict' });
    });
  }, [showtimeId, t]);

  const toggleSeat = useCallback(
    (seatId: string) => {
      if (occupied.has(seatId)) return;

      // Decide and notify out here: a state updater has to stay pure, or the
      // toast fires twice under StrictMode's double invocation.
      if (selected.has(seatId)) {
        const next = new Set(selected);
        next.delete(seatId);
        setSelected(next);
        toast(t('booking.seatDeselected', { seat: seatId }), { ...SEAT_TOAST, icon: '○' });
        return;
      }

      if (selected.size >= MAX_SEATS) {
        toast.error(t('booking.maxSeatsReached', { count: MAX_SEATS }), { id: SEAT_TOAST.id });
        return;
      }

      setSelected(new Set(selected).add(seatId));
      toast.success(t('booking.seatSelected', { seat: seatId }), SEAT_TOAST);
    },
    [occupied, selected, t],
  );

  const selectedSummary = useMemo<readonly SelectedSeatSummary[]>(() => {
    if (!layout || !details) return [];
    return [...selected]
      .map((seatId) => {
        const seat = findSeat(layout, seatId);
        if (!seat) return null;
        return {
          seatId,
          tier: seat.tier as SeatTier,
          price: seatPrice(details.showtime.basePrice, seat.tier),
        };
      })
      .filter((seat): seat is SelectedSeatSummary => seat !== null);
  }, [selected, layout, details]);

  const total = useMemo(
    () => Math.round(selectedSummary.reduce((sum, seat) => sum + seat.price, 0) * 100) / 100,
    [selectedSummary],
  );

  const handleConfirm = useCallback(async () => {
    if (!showtimeId || selected.size === 0) return;
    setSubmitting(true);

    // The store re-reads storage and re-checks every seat before it writes.
    committingRef.current = true;
    const result = createReservation({ showtimeId, seatIds: [...selected] });
    committingRef.current = false;

    if (result.ok) {
      setSelected(new Set());
      setSheetOpen(false);
      setSubmitting(false);
      toast.success(t('confirmation.title'));
      navigate(`/reservation/${result.reservation.id}`);
      return;
    }

    setSubmitting(false);

    if (result.reason === 'conflict') {
      setSheetOpen(false);
      // Drop just the seats that went, so the rest of the choice survives.
      setSelected((current) => {
        const next = new Set(current);
        for (const seatId of result.conflictingSeatIds) next.delete(seatId);
        return next;
      });

      await alertProblem({
        title: t('booking.conflictTitle'),
        body: t('booking.conflictBody', { seats: result.conflictingSeatIds.join(', ') }),
        confirmText: t('booking.conflictConfirm'),
      });
      return;
    }

    toast.error(t('errors.genericTitle'));
  }, [showtimeId, selected, navigate, t]);

  /* ---------------------------------------------------------------- *
   * Guard states
   * ---------------------------------------------------------------- */

  if (!details || !layout) {
    return (
      <PageContainer className="py-20">
        <ErrorState
          title={t('booking.notFoundTitle')}
          body={t('booking.notFoundBody')}
          action={{ label: t('movie.backToMovies'), to: '/movies' }}
        />
      </PageContainer>
    );
  }

  const { movie, cinema, hall, showtime } = details;
  const title = movie.title[format.locale];

  if (isPast(showtime.startsAt)) {
    return (
      <PageContainer className="py-20">
        <ErrorState
          title={t('booking.pastTitle')}
          body={t('booking.pastBody')}
          action={{ label: t('booking.seeOtherShowtimes'), to: `/movies/${movie.id}` }}
        />
      </PageContainer>
    );
  }

  const seatsLeft = layout.totalSeats - occupied.size;
  if (seatsLeft <= 0) {
    return (
      <PageContainer className="py-20">
        <ErrorState
          title={t('booking.soldOutTitle')}
          body={t('booking.soldOutBody')}
          action={{ label: t('booking.seeOtherShowtimes'), to: `/movies/${movie.id}` }}
        />
      </PageContainer>
    );
  }

  /* ---------------------------------------------------------------- *
   * Booking view
   * ---------------------------------------------------------------- */

  return (
    <PageContainer className="pb-32 pt-8 sm:pt-12 lg:pb-16">
      <nav aria-label={t('common.back')} className="mb-6">
        <ButtonLink to={`/movies/${movie.id}`} variant="ghost" size="sm">
          <ChevronIcon className="size-4 rotate-180 rtl:rotate-0" />
          {t('booking.backToMovie')}
        </ButtonLink>
      </nav>

      <header className="space-y-3">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{t('booking.title')}</h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <span className="font-bold">{title}</span>
          <span className="inline-flex items-center gap-1.5 text-ink-500 dark:text-ink-400">
            <MapPinIcon className="size-4" />
            {cinema.name[format.locale]} · {hall.name[format.locale]}
          </span>
          <Badge tone="neutral">{showtime.format}</Badge>
          <Badge tone="muted">{t(`audio.${showtime.audio}`)}</Badge>
          <span className="font-semibold tabular-nums">
            {format.dateShort(showtime.startsAt)} · {format.time(showtime.startsAt)}
          </span>
        </div>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-10">
        {/* min-w-0: without it this grid item is sized to the seat map's
            max-content width and overflows the page on narrow screens. */}
        <div className="min-w-0 space-y-6">
          <div className="surface-card rounded-card py-6">
            <SeatMap
              layout={layout}
              occupied={occupied}
              ownSeats={ownSeats}
              selected={selected}
              onToggle={toggleSeat}
            />
          </div>

          <div className="surface-card rounded-card p-5">
            <SeatLegend basePrice={showtime.basePrice} hasOwnSeats={ownSeats.size > 0} />
          </div>

          {ownSeats.size > 0 && (
            <Notice>
              {t('booking.legend.yours')}:{' '}
              {[...ownSeats].sort((a, b) => a.localeCompare(b, 'en', { numeric: true })).join(', ')}
            </Notice>
          )}

          <p className="sr-only" aria-live="polite">
            {selected.size > 0
              ? t('booking.selectedSeatsA11y', {
                  count: selected.size,
                  seats: [...selected].join(', '),
                })
              : t('booking.noSeatsSelectedTitle')}
          </p>
        </div>

        {/* Desktop summary rail */}
        <aside className="hidden lg:block">
          <div className="surface-card sticky top-24 rounded-card p-5">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-ink-500 dark:text-ink-400">
              {t('booking.summaryTitle')}
            </h2>
            <BookingSummary
              details={details}
              seats={selectedSummary}
              total={total}
              submitting={submitting}
              onConfirm={handleConfirm}
            />
          </div>
        </aside>
      </div>

      {/* Mobile: compact bar that opens a full summary sheet. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-200 bg-white/95 px-4 py-3 backdrop-blur-xl lg:hidden dark:border-ink-800 dark:bg-ink-950/95">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-ink-500 dark:text-ink-400">
              {selected.size === 0
                ? t('booking.noSeatsSelectedTitle')
                : t('booking.ticketCount', { count: selected.size })}
            </p>
            <p className="text-lg font-extrabold leading-tight tabular-nums">
              {format.currency(total)}
            </p>
          </div>
          <Button
            size="md"
            disabled={selected.size === 0}
            onClick={() => setSheetOpen(true)}
            className="shrink-0"
          >
            {t('booking.openSummary')}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {sheetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSheetOpen(false)}
              className="fixed inset-0 z-50 bg-ink-950/60 backdrop-blur-sm lg:hidden"
              aria-hidden="true"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={t('booking.summaryTitle')}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 36 }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[88dvh] overflow-y-auto rounded-t-3xl border-t border-ink-200 bg-[var(--surface-raised)] p-5 pb-8 lg:hidden dark:border-ink-800"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-base font-bold">{t('booking.summaryTitle')}</h2>
                <button
                  type="button"
                  onClick={() => setSheetOpen(false)}
                  aria-label={t('booking.closeSummary')}
                  className="flex size-9 items-center justify-center rounded-lg border border-ink-200 text-ink-500 transition hover:bg-ink-50 dark:border-ink-700 dark:hover:bg-ink-800"
                >
                  <CloseIcon className="size-4" />
                </button>
              </div>

              <BookingSummary
                details={details}
                seats={selectedSummary}
                total={total}
                submitting={submitting}
                onConfirm={handleConfirm}
                compact
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </PageContainer>
  );
}

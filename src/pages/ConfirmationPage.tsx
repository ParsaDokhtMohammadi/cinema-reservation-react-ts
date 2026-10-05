import { motion, useReducedMotion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { getReservationDetails } from '../lib/catalog';
import { getReservation } from '../lib/reservations';
import { useFormat } from '../hooks/useFormat';
import { usePageTitle } from '../hooks/usePageTitle';
import { useReservations } from '../hooks/useReservations';
import { PageContainer } from '../components/layout/Layout';
import { Badge } from '../components/ui/Badge';
import { Button, ButtonLink } from '../components/ui/Button';
import { ErrorState, Notice } from '../components/ui/States';
import { SmartImage } from '../components/ui/SmartImage';
import { CheckIcon, DownloadIcon, MapPinIcon } from '../components/ui/Icon';

const EASE = [0.22, 1, 0.36, 1] as const;

function Field({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-ink-400">{label}</dt>
      <dd className="mt-1 truncate text-sm font-bold">{value}</dd>
    </div>
  );
}

export default function ConfirmationPage() {
  const { reservationId } = useParams<{ reservationId: string }>();
  const { t } = useTranslation();
  const format = useFormat();
  const reduceMotion = useReducedMotion();

  // Subscribing keeps this page correct if the reservation is cancelled in
  // another tab while it is open.
  useReservations();

  const reservation = reservationId ? getReservation(reservationId) : undefined;
  const details = reservation ? getReservationDetails(reservation) : undefined;

  usePageTitle(t('confirmation.title'));

  if (!reservation || !details) {
    return (
      <PageContainer className="py-20">
        <ErrorState
          title={t('confirmation.notFoundTitle')}
          body={t('confirmation.notFoundBody')}
          action={{ label: t('confirmation.goToReservations'), to: '/reservations' }}
        />
      </PageContainer>
    );
  }

  const { movie, cinema, hall, showtime, displayStatus } = details;
  const title = movie.title[format.locale];

  /**
   * Browsers name the saved PDF after the document title, so swap it for the
   * duration of the print and put it back once the dialog closes.
   */
  const handleDownload = () => {
    const previousTitle = document.title;
    document.title = `${t('common.appName')}-${reservation.id}`;

    const restore = () => {
      document.title = previousTitle;
      window.removeEventListener('afterprint', restore);
    };
    window.addEventListener('afterprint', restore);

    window.print();
  };
  const seatIds = reservation.seats
    .map((seat) => seat.seatId)
    .slice()
    .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));

  return (
    <PageContainer className="py-12 print-contents sm:py-16">
      <div className="print-contents mx-auto max-w-2xl space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="print-hide space-y-4 text-center"
        >
          <motion.span
            initial={reduceMotion ? { opacity: 0 } : { scale: 0.5, opacity: 0 }}
            animate={reduceMotion ? { opacity: 1 } : { scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18, delay: 0.1 }}
            className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
          >
            <CheckIcon className="size-8" />
          </motion.span>

          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              {t('confirmation.title')}
            </h1>
            <p className="text-sm leading-relaxed text-ink-500 dark:text-ink-400">
              {t('confirmation.subtitle')}
            </p>
          </div>
        </motion.div>

        {displayStatus === 'cancelled' && (
          <Notice tone="warning">{t('reservations.statusCancelled')}</Notice>
        )}

        {/* Ticket */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.12, ease: EASE }}
          className="print-ticket surface-card overflow-hidden rounded-card"
        >
          {/* Letterhead: paper only, so the PDF identifies itself. */}
          <div className="print-only hidden border-b border-[var(--surface-border)] px-6 py-4">
            <p className="text-sm font-extrabold tracking-tight">{t('common.appNameFull')}</p>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">{t('confirmation.subtitle')}</p>
          </div>

          <div className="flex gap-4 p-5 sm:gap-5 sm:p-6">
            <SmartImage
              src={movie.posterUrl}
              alt={t('a11y.posterAlt', { title })}
              fallbackLabel={title}
              accentColor={movie.accentColor}
              loading="eager"
              className="aspect-2/3 w-24 shrink-0 rounded-lg sm:w-28"
              sizes="112px"
            />
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={displayStatus === 'cancelled' ? 'brand' : 'success'}>
                  {displayStatus === 'cancelled'
                    ? t('reservations.statusCancelled')
                    : t('reservations.statusConfirmed')}
                </Badge>
                <Badge tone="neutral">{showtime.format}</Badge>
              </div>
              <h2 className="text-lg font-extrabold leading-snug">{title}</h2>
              <p className="flex items-start gap-1.5 text-xs text-[var(--text-muted)]">
                <MapPinIcon className="mt-0.5 size-3.5 shrink-0" />
                {cinema.name[format.locale]} · {cinema.address[format.locale]}
              </p>
            </div>
          </div>

          {/* Perforation */}
          <div className="relative" aria-hidden="true">
            <div className="absolute -start-2.5 top-1/2 size-5 -translate-y-1/2 rounded-full bg-[var(--surface-page)]" />
            <div className="absolute -end-2.5 top-1/2 size-5 -translate-y-1/2 rounded-full bg-[var(--surface-page)]" />
            <div className="mx-5 border-t border-dashed border-[var(--surface-border-strong)]" />
          </div>

          <dl className="grid grid-cols-2 gap-x-5 gap-y-5 p-5 sm:grid-cols-3 sm:p-6">
            <Field label={t('confirmation.date')} value={format.dateLong(showtime.startsAt)} />
            <Field label={t('confirmation.time')} value={format.time(showtime.startsAt)} />
            <Field label={t('confirmation.hall')} value={hall.name[format.locale]} />
            <Field
              label={t('confirmation.tickets')}
              value={t('booking.ticketCount', { count: reservation.seats.length })}
            />
            <Field label={t('confirmation.total')} value={format.currency(reservation.totalPrice)} />
            <Field label={t('audio.original')} value={t(`audio.${showtime.audio}`)} />

            <div className="col-span-2 sm:col-span-3">
              <dt className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-ink-400">
                {t('confirmation.seats')}
              </dt>
              <dd className="mt-2 flex flex-wrap gap-1.5">
                {seatIds.map((seatId) => (
                  <span
                    key={seatId}
                    className="rounded-md bg-brand-600 px-2.5 py-1 text-xs font-bold text-white tabular-nums dark:bg-brand-500"
                  >
                    {seatId}
                  </span>
                ))}
              </dd>
            </div>
          </dl>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--surface-border)] bg-[var(--surface-sunken)] px-5 py-4 sm:px-6">
            <div>
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-ink-400">
                {t('confirmation.reference')}
              </p>
              <p className="mt-1 font-mono text-lg font-extrabold tracking-wider">
                {reservation.id}
              </p>
            </div>
            <p className="max-w-xs text-xs leading-relaxed text-[var(--text-muted)]">
              {t('confirmation.arriveEarly')}
            </p>
          </div>
        </motion.div>

        <div className="print-hide space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" onClick={handleDownload}>
              <DownloadIcon className="size-5" />
              {t('confirmation.downloadPdf')}
            </Button>
            <ButtonLink to="/reservations" variant="secondary" size="lg">
              {t('confirmation.viewReservations')}
            </ButtonLink>
            <ButtonLink to="/" variant="secondary" size="lg">
              {t('confirmation.backHome')}
            </ButtonLink>
          </div>
          <p className="text-center text-xs leading-relaxed text-ink-500 dark:text-ink-400">
            {t('confirmation.downloadPdfHint')}
          </p>
        </div>
      </div>
    </PageContainer>
  );
}

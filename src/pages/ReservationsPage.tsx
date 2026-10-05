import { useMemo } from 'react';
import { AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import type { ReservationDetails } from '../types';
import { toReservationDetails } from '../lib/catalog';
import { cancelReservation, clearReservations } from '../lib/reservations';
import { confirmDestructive } from '../lib/alerts';
import { useFormat } from '../hooks/useFormat';
import { usePageTitle } from '../hooks/usePageTitle';
import { useReservations } from '../hooks/useReservations';
import { PageContainer, PageHeader } from '../components/layout/Layout';
import { ReservationCard } from '../components/reservations/ReservationCard';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/States';
import { TicketIcon, TrashIcon } from '../components/ui/Icon';

export default function ReservationsPage() {
  const { t } = useTranslation();
  const format = useFormat();
  const reservations = useReservations();
  usePageTitle(t('reservations.title'));

  const all = useMemo(() => toReservationDetails(reservations), [reservations]);

  const upcoming = all.filter((details) => details.displayStatus === 'confirmed');
  const archived = all.filter((details) => details.displayStatus !== 'confirmed');

  const handleCancel = async (details: ReservationDetails) => {
    const { reservation, movie } = details;

    const confirmed = await confirmDestructive({
      title: t('reservations.cancelConfirmTitle'),
      body: t('reservations.cancelConfirmBody', {
        reference: reservation.id,
        movie: movie.title[format.locale],
        count: reservation.seats.length,
      }),
      confirmText: t('reservations.cancelConfirmYes'),
      cancelText: t('reservations.cancelConfirmNo'),
    });

    if (!confirmed) return;

    // Releases the seats and broadcasts the change to any other open tab.
    const cancelled = cancelReservation(reservation.id);
    if (cancelled) {
      toast.success(t('reservations.cancelledToast', { reference: reservation.id }));
    } else {
      toast.error(t('reservations.cancelFailedToast'));
    }
  };

  const handleClearAll = async () => {
    const confirmed = await confirmDestructive({
      title: t('reservations.clearAllConfirmTitle'),
      body: t('reservations.clearAllConfirmBody', { count: reservations.length }),
      confirmText: t('reservations.clearAllConfirmYes'),
      cancelText: t('common.cancel'),
    });

    if (!confirmed) return;
    clearReservations();
    toast.success(t('reservations.clearedToast'));
  };

  return (
    <PageContainer className="py-10 sm:py-14">
      <PageHeader
        title={t('reservations.title')}
        subtitle={t('reservations.subtitle')}
        action={
          all.length > 0 ? (
            <Button variant="ghost" size="sm" onClick={handleClearAll}>
              <TrashIcon className="size-4" />
              {t('reservations.clearAll')}
            </Button>
          ) : undefined
        }
      />

      {all.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title={t('reservations.emptyTitle')}
            body={t('reservations.emptyBody')}
            icon={<TicketIcon className="size-6" />}
            action={{ label: t('reservations.emptyCta'), to: '/movies' }}
          />
        </div>
      ) : (
        <div className="mt-10 space-y-12">
          {upcoming.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-lg font-extrabold tracking-tight">
                  {t('reservations.upcomingTitle')}
                </h2>
                <span className="text-sm font-semibold text-ink-400">
                  {t('reservations.count', { count: upcoming.length })}
                </span>
              </div>
              <ul className="space-y-4">
                <AnimatePresence initial={false}>
                  {upcoming.map((details) => (
                    <li key={details.reservation.id}>
                      <ReservationCard details={details} onCancel={handleCancel} />
                    </li>
                  ))}
                </AnimatePresence>
              </ul>
            </section>
          )}

          {archived.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-lg font-extrabold tracking-tight text-ink-500 dark:text-ink-400">
                  {t('reservations.pastTitle')}
                </h2>
                <span className="text-sm font-semibold text-ink-400">
                  {t('reservations.count', { count: archived.length })}
                </span>
              </div>
              <ul className="space-y-4">
                <AnimatePresence initial={false}>
                  {archived.map((details) => (
                    <li key={details.reservation.id}>
                      <ReservationCard details={details} onCancel={handleCancel} />
                    </li>
                  ))}
                </AnimatePresence>
              </ul>
            </section>
          )}
        </div>
      )}
    </PageContainer>
  );
}

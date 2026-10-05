import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { CINEMAS } from '../../data/cinemas';
import { MOVIES } from '../../data/movies';
import { useLocale } from '../../hooks/useLocale';
import { ClockIcon, MapPinIcon, TicketIcon } from '../ui/Icon';

const EXPLORE_LINKS = [
  { to: '/movies', labelKey: 'nav.movies' },
  { to: '/reservations', labelKey: 'nav.reservations' },
  { to: '/about', labelKey: 'nav.about' },
] as const;

export function Footer() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-ink-200 bg-white dark:border-ink-800 dark:bg-ink-950">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-lg bg-brand-600 text-white dark:bg-brand-500">
                <TicketIcon className="size-5" />
              </span>
              <span className="text-base font-extrabold tracking-tight">{t('common.appNameFull')}</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-500 dark:text-ink-400">
              {t('footer.tagline', { movies: MOVIES.length })}
            </p>
          </div>

          <nav aria-labelledby="footer-explore">
            <h2
              id="footer-explore"
              className="text-xs font-bold uppercase tracking-[0.16em] text-ink-400"
            >
              {t('footer.exploreTitle')}
            </h2>
            <ul className="mt-4 space-y-2.5">
              {EXPLORE_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm font-medium text-ink-600 transition-colors hover:text-brand-600 dark:text-ink-300 dark:hover:text-brand-400"
                  >
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-ink-400">
              {t('footer.visitTitle')}
            </h2>
            <ul className="mt-4 space-y-3">
              {CINEMAS.map((cinema) => (
                <li key={cinema.id} className="flex items-start gap-2 text-sm">
                  <MapPinIcon className="mt-0.5 size-4 shrink-0 text-ink-400" />
                  <span>
                    <span className="font-semibold">{cinema.name[locale]}</span>
                    <span className="block text-ink-500 dark:text-ink-400">
                      {cinema.address[locale]}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-ink-400">
              {t('cinemas.openingHours')}
            </h2>
            <p className="mt-4 flex items-center gap-2 text-sm font-medium">
              <ClockIcon className="size-4 shrink-0 text-ink-400" />
              {t('cinemas.openingHoursValue')}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-ink-500 dark:text-ink-400">
              {t('footer.builtWith')}
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-ink-200 pt-6 text-xs leading-relaxed text-ink-400 dark:border-ink-800">
          <p>{t('footer.rights', { year })}</p>
          <p className="max-w-3xl">{t('footer.disclaimer')}</p>
        </div>
      </div>
    </footer>
  );
}

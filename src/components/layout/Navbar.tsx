import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router';

import { cn } from '../../lib/cn';
import { isPast } from '../../lib/catalog';
import { SHOWTIMES } from '../../data/showtimes';
import { useReservations } from '../../hooks/useReservations';
import { CloseIcon, MenuIcon, TicketIcon } from '../ui/Icon';
import { ButtonLink } from '../ui/Button';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';

const LINKS = [
  { to: '/', labelKey: 'nav.home' },
  { to: '/movies', labelKey: 'nav.movies' },
  { to: '/reservations', labelKey: 'nav.reservations' },
  { to: '/about', labelKey: 'nav.about' },
] as const;

/** Reservations that are still confirmed and whose screening is ahead of us. */
function useUpcomingCount(): number {
  const reservations = useReservations();
  return reservations.filter((reservation) => {
    if (reservation.status !== 'confirmed') return false;
    const showtime = SHOWTIMES.find((s) => s.id === reservation.showtimeId);
    return showtime ? !isPast(showtime.startsAt) : false;
  }).length;
}

function Wordmark() {
  const { t } = useTranslation();
  return (
    <NavLink
      to="/"
      className="group flex items-center gap-2.5 rounded-lg"
      aria-label={t('common.appNameFull')}
    >
      <span className="flex size-9 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm transition group-hover:bg-brand-500 dark:bg-brand-500 dark:group-hover:bg-brand-400">
        <TicketIcon className="size-5" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-base font-extrabold tracking-tight">{t('common.appName')}</span>
        <span className="mt-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-ink-400">
          Cinema
        </span>
      </span>
    </NavLink>
  );
}

export function Navbar() {
  const { t } = useTranslation();
  const upcoming = useUpcomingCount();
  const [menuOpen, setMenuOpen] = useState(false);
  // Seeded from the current offset so a reload mid-page keeps the right chrome.
  const [scrolled, setScrolled] = useState(() => typeof window !== 'undefined' && window.scrollY > 8);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock scrolling while the mobile panel is open.
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-colors duration-300',
        scrolled
          ? 'border-b border-ink-200/80 bg-white/85 backdrop-blur-xl dark:border-ink-800 dark:bg-ink-950/85'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Wordmark />

        <nav aria-label={t('nav.home')} className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                cn(
                  'relative rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
                  isActive
                    ? 'text-ink-900 dark:text-white'
                    : 'text-ink-500 hover:text-ink-900 dark:text-ink-400 dark:hover:text-white',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span className="inline-flex items-center gap-1.5">
                    {t(link.labelKey)}
                    {link.to === '/reservations' && upcoming > 0 && (
                      <span className="flex size-5 items-center justify-center rounded-full bg-brand-600 text-[0.65rem] font-bold text-white dark:bg-brand-500">
                        {upcoming}
                      </span>
                    )}
                  </span>
                  {isActive && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-brand-600 dark:bg-brand-500"
                      transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher className="hidden sm:flex" />
          <ThemeToggle />
          <ButtonLink to="/movies" size="sm" className="hidden lg:inline-flex">
            {t('nav.bookNow')}
          </ButtonLink>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
            className="flex size-10 items-center justify-center rounded-xl border border-ink-200 bg-white text-ink-700 transition hover:bg-ink-50 md:hidden dark:border-ink-700 dark:bg-ink-900 dark:text-ink-200 dark:hover:bg-ink-800"
          >
            {menuOpen ? <CloseIcon className="size-5" /> : <MenuIcon className="size-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 top-16 z-40 bg-ink-950/40 backdrop-blur-sm md:hidden"
              onClick={() => setMenuOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              id="mobile-menu"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-0 top-16 z-50 border-b border-ink-200 bg-white px-4 pb-6 pt-4 shadow-xl md:hidden dark:border-ink-800 dark:bg-ink-950"
            >
              <nav className="flex flex-col gap-1" aria-label={t('nav.openMenu')}>
                {LINKS.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === '/'}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center justify-between rounded-xl px-4 py-3 text-base font-semibold transition-colors',
                        isActive
                          ? 'bg-ink-100 text-ink-900 dark:bg-ink-800 dark:text-white'
                          : 'text-ink-600 hover:bg-ink-50 dark:text-ink-300 dark:hover:bg-ink-900',
                      )
                    }
                  >
                    <span>{t(link.labelKey)}</span>
                    {link.to === '/reservations' && upcoming > 0 && (
                      <span className="flex size-6 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white dark:bg-brand-500">
                        {upcoming}
                      </span>
                    )}
                  </NavLink>
                ))}
              </nav>
              <div className="mt-5 flex items-center justify-between gap-3 border-t border-ink-200 pt-5 dark:border-ink-800">
                <span className="text-sm font-semibold text-ink-500 dark:text-ink-400">
                  {t('nav.language')}
                </span>
                <LanguageSwitcher />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

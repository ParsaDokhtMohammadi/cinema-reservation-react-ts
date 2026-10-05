import { useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { isPersistenceAvailable } from '../../lib/storage';
import { AlertIcon } from '../ui/Icon';
import { Footer } from './Footer';
import { Navbar } from './Navbar';

/**
 * Shown once, at the top of the page, when the browser refuses local storage.
 * The app still works — reservations just will not survive a reload.
 */
function StorageBanner() {
  const { t } = useTranslation();
  // Probed once, lazily — no effect needed, and no flash of the banner.
  const [blocked] = useState(() => !isPersistenceAvailable());

  if (!blocked) return null;

  return (
    <div
      role="alert"
      className="border-b border-gold-400/40 bg-gold-400/10 px-4 py-2.5 text-center text-sm text-gold-700 dark:text-gold-300"
    >
      <span className="mx-auto flex max-w-4xl items-center justify-center gap-2">
        <AlertIcon className="size-4 shrink-0" />
        {t('errors.storageBody')}
      </span>
    </div>
  );
}

export function Layout({ children }: { readonly children: ReactNode }) {
  const { t } = useTranslation();

  return (
    <div className="app-shell flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        {t('nav.skipToContent')}
      </a>

      <StorageBanner />
      <Navbar />

      <main id="main" className="flex-1">
        {children}
      </main>

      <Footer />
    </div>
  );
}

/** Standard page container — keeps horizontal rhythm identical everywhere. */
export function PageContainer({
  children,
  className = '',
}: {
  readonly children: ReactNode;
  readonly className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>
  );
}

/** Title block used at the top of the list / detail pages. */
export function PageHeader({
  title,
  subtitle,
  action,
}: {
  readonly title: string;
  readonly subtitle?: string;
  readonly action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
        {subtitle && (
          <p className="max-w-2xl text-sm leading-relaxed text-ink-500 sm:text-base dark:text-ink-400">
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

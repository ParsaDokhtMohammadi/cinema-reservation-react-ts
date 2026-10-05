import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '../../lib/cn';
import { AlertIcon, FilmIcon, InfoIcon } from './Icon';
import { Button, ButtonLink } from './Button';

/* ------------------------------------------------------------------ *
 * Empty state
 * ------------------------------------------------------------------ */

interface EmptyStateProps {
  readonly title: string;
  readonly body: string;
  readonly icon?: ReactNode;
  readonly action?: { readonly label: string; readonly to: string };
  readonly secondaryAction?: { readonly label: string; readonly onClick: () => void };
  readonly className?: string;
}

export function EmptyState({
  title,
  body,
  icon,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'surface-card flex flex-col items-center gap-4 rounded-card px-6 py-14 text-center',
        className,
      )}
    >
      <span className="flex size-14 items-center justify-center rounded-full bg-ink-100 text-ink-400 dark:bg-ink-800 dark:text-ink-400">
        {icon ?? <FilmIcon className="size-6" />}
      </span>
      <div className="max-w-md space-y-2">
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="text-sm leading-relaxed text-ink-500 dark:text-ink-400">{body}</p>
      </div>
      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          {action && (
            <ButtonLink to={action.to} size="md">
              {action.label}
            </ButtonLink>
          )}
          {secondaryAction && (
            <Button variant="secondary" size="md" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Error state
 * ------------------------------------------------------------------ */

interface ErrorStateProps {
  readonly title: string;
  readonly body: string;
  readonly action?: { readonly label: string; readonly to: string };
  readonly onRetry?: () => void;
  readonly retryLabel?: string;
}

export function ErrorState({ title, body, action, onRetry, retryLabel }: ErrorStateProps) {
  return (
    <div className="surface-card mx-auto flex max-w-xl flex-col items-center gap-4 rounded-card px-6 py-14 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
        <AlertIcon className="size-6" />
      </span>
      <div className="space-y-2">
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="text-sm leading-relaxed text-ink-500 dark:text-ink-400">{body}</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
        {action && <ButtonLink to={action.to}>{action.label}</ButtonLink>}
        {onRetry && retryLabel && (
          <Button variant="secondary" onClick={onRetry}>
            {retryLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Notice — inline, non-blocking information
 * ------------------------------------------------------------------ */

export function Notice({ children, tone = 'info' }: { readonly children: ReactNode; readonly tone?: 'info' | 'warning' }) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl border px-4 py-3 text-sm leading-relaxed',
        tone === 'warning'
          ? 'border-gold-400/40 bg-gold-400/10 text-gold-700 dark:text-gold-300'
          : 'border-ink-200 bg-ink-50 text-ink-600 dark:border-ink-700 dark:bg-ink-900/60 dark:text-ink-300',
      )}
      role="status"
    >
      <InfoIcon className="mt-0.5 size-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Loading states
 * ------------------------------------------------------------------ */

export function Skeleton({ className }: { readonly className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded-lg bg-ink-200/70 dark:bg-ink-800', className)}
      aria-hidden="true"
    />
  );
}

/** Route-level fallback while a lazily loaded page arrives. */
export function PageLoading() {
  const { t } = useTranslation();

  return (
    <div
      className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
      role="status"
      aria-label={t('a11y.loading')}
    >
      <Skeleton className="h-9 w-56" />
      <Skeleton className="mt-3 h-4 w-80 max-w-full" />
      <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }, (_, index) => (
          <div key={index} className="space-y-3">
            <Skeleton className="aspect-2/3 w-full rounded-card" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-3 w-2/5" />
          </div>
        ))}
      </div>
    </div>
  );
}

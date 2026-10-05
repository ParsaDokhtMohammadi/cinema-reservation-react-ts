import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { withTranslation } from 'react-i18next';
import type { WithTranslation } from 'react-i18next';

interface Props extends WithTranslation {
  readonly children: ReactNode;
}

interface State {
  readonly error: Error | null;
}

/**
 * Last line of defence: an unexpected render error shows a translated,
 * themed recovery screen instead of a blank page. Error boundaries still have
 * to be class components.
 */
class ErrorBoundaryBase extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Nothing to report to — this is a front-end-only app — but keeping the
    // console trace makes the failure debuggable.
    console.error('Unhandled render error', error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    const { children, t } = this.props;

    if (!error) return children;

    return (
      <div className="flex min-h-dvh items-center justify-center px-4 py-20">
        <div className="surface-card w-full max-w-md space-y-4 rounded-card p-8 text-center">
          <h1 className="text-xl font-extrabold tracking-tight">{t('errors.genericTitle')}</h1>
          <p className="text-sm leading-relaxed text-ink-500 dark:text-ink-400">
            {t('errors.genericBody')}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white transition hover:bg-brand-500 dark:bg-brand-500 dark:hover:bg-brand-400"
          >
            {t('errors.reload')}
          </button>
        </div>
      </div>
    );
  }
}

export const ErrorBoundary = withTranslation()(ErrorBoundaryBase);

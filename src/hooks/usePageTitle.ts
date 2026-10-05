import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/** Keeps <title> in step with the page and the active language. */
export function usePageTitle(title?: string): void {
  const { t } = useTranslation();
  const suffix = t('common.appNameFull');

  useEffect(() => {
    document.title = title ? `${title} · ${suffix}` : suffix;
  }, [title, suffix]);
}

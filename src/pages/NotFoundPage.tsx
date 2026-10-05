import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

import { usePageTitle } from '../hooks/usePageTitle';
import { PageContainer } from '../components/layout/Layout';
import { ButtonLink } from '../components/ui/Button';
import { FilmIcon } from '../components/ui/Icon';

export default function NotFoundPage() {
  const { t } = useTranslation();
  usePageTitle(t('notFound.title'));

  return (
    <PageContainer className="py-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto flex max-w-lg flex-col items-center gap-5 text-center"
      >
        <span className="flex size-16 items-center justify-center rounded-2xl bg-brand-600/10 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
          <FilmIcon className="size-8" />
        </span>

        <p className="text-6xl font-extrabold tracking-tight text-ink-300 dark:text-ink-700">
          {t('notFound.code')}
        </p>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight">{t('notFound.title')}</h1>
          <p className="text-sm leading-relaxed text-ink-500 dark:text-ink-400">
            {t('notFound.body')}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <ButtonLink to="/">{t('notFound.cta')}</ButtonLink>
          <ButtonLink to="/movies" variant="secondary">
            {t('notFound.browse')}
          </ButtonLink>
        </div>
      </motion.div>
    </PageContainer>
  );
}

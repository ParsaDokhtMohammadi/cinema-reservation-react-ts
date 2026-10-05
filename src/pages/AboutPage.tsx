import { useTranslation } from 'react-i18next';

import { usePageTitle } from '../hooks/usePageTitle';
import { PageContainer, PageHeader } from '../components/layout/Layout';
import { ButtonLink } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { FilmIcon, InfoIcon, SofaIcon, SparkleIcon } from '../components/ui/Icon';

const STACK = [
  'React',
  'TypeScript',
  'Vite',
  'Tailwind CSS',
  'React Router',
  'Embla Carousel',
  'Motion',
  'i18next',
  'SweetAlert2',
  'react-hot-toast',
  'LocalStorage',
  'BroadcastChannel',
] as const;

const SECTIONS = [
  { key: 'story', Icon: FilmIcon },
  { key: 'noBackend', Icon: InfoIcon },
  { key: 'race', Icon: SofaIcon },
  { key: 'privacy', Icon: SparkleIcon },
] as const;

export default function AboutPage() {
  const { t } = useTranslation();
  usePageTitle(t('about.title'));

  return (
    <PageContainer className="py-10 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <PageHeader title={t('about.title')} subtitle={t('about.lead')} />

        <div className="mt-10 space-y-5">
          {SECTIONS.map((section) => (
            <section key={section.key} className="surface-card rounded-card p-6">
              <h2 className="flex items-center gap-2.5 text-base font-bold">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-600/10 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                  <section.Icon className="size-4.5" />
                </span>
                {t(`about.${section.key}Title`)}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
                {t(`about.${section.key}Body`)}
              </p>
            </section>
          ))}

          <section className="surface-card rounded-card p-6">
            <h2 className="text-base font-bold">{t('about.techTitle')}</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {STACK.map((item) => (
                <li key={item}>
                  <Badge tone="neutral">{item}</Badge>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink to="/movies" size="lg">
            {t('reservations.emptyCta')}
          </ButtonLink>
          <ButtonLink to="/" variant="secondary" size="lg">
            {t('about.backHome')}
          </ButtonLink>
        </div>
      </div>
    </PageContainer>
  );
}

import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

import { CINEMAS } from '../data/cinemas';
import { MOVIES } from '../data/movies';
import { HALLS } from '../data/cinemas';
import { getFeaturedMovies, getMoviesByStatus, getPopularMovies } from '../lib/catalog';
import { useFormat } from '../hooks/useFormat';
import { usePageTitle } from '../hooks/usePageTitle';
import { PageContainer } from '../components/layout/Layout';
import { MovieHero } from '../components/movies/MovieHero';
import { MovieRail } from '../components/movies/MovieRail';
import { ButtonLink } from '../components/ui/Button';
import { SmartImage } from '../components/ui/SmartImage';
import {
  ArrowIcon,
  MapPinIcon,
  SofaIcon,
  SparkleIcon,
  TicketIcon,
  SpeakerIcon,
} from '../components/ui/Icon';

const FEATURES = [
  { key: 'seats', Icon: SofaIcon },
  { key: 'instant', Icon: TicketIcon },
  { key: 'formats', Icon: SpeakerIcon },
  { key: 'flexible', Icon: SparkleIcon },
] as const;

function FeatureGrid() {
  const { t } = useTranslation();

  return (
    <section className="border-y border-ink-200 bg-white py-16 dark:border-ink-800 dark:bg-ink-950 sm:py-20">
      <PageContainer>
        <div className="max-w-2xl space-y-3">
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            {t('home.featuresTitle')}
          </h2>
          <p className="text-sm leading-relaxed text-ink-500 sm:text-base dark:text-ink-400">
            {t('home.featuresSubtitle')}
          </p>
        </div>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, index) => (
            <motion.li
              key={feature.key}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.35, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-card border border-ink-200 bg-[var(--surface-page)] p-5 dark:border-ink-800"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-brand-600/10 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                <feature.Icon className="size-5" />
              </span>
              <h3 className="mt-4 text-base font-bold">{t(`home.features.${feature.key}.title`)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500 dark:text-ink-400">
                {t(`home.features.${feature.key}.body`)}
              </p>
            </motion.li>
          ))}
        </ul>
      </PageContainer>
    </section>
  );
}

function CinemaShowcase() {
  const { t } = useTranslation();
  const format = useFormat();

  return (
    <section className="py-16 sm:py-20">
      <PageContainer>
        <div className="max-w-2xl space-y-3">
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            {t('home.cinemasTitle')}
          </h2>
          <p className="text-sm leading-relaxed text-ink-500 sm:text-base dark:text-ink-400">
            {t('home.cinemasSubtitle')}
          </p>
        </div>

        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {CINEMAS.map((cinema) => {
            const halls = HALLS.filter((hall) => hall.cinemaId === cinema.id);

            return (
              <motion.li
                key={cinema.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="surface-card group overflow-hidden rounded-card"
              >
                <SmartImage
                  src={cinema.imageUrl}
                  alt={t('a11y.cinemaPhotoAlt', { cinema: cinema.name[format.locale] })}
                  fallbackLabel={cinema.name[format.locale]}
                  accentColor="#b42318"
                  className="aspect-16/10 w-full"
                  imageClassName="transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 380px"
                />
                <div className="space-y-3 p-5">
                  <h3 className="text-base font-bold">{cinema.name[format.locale]}</h3>
                  <p className="flex items-start gap-2 text-sm text-ink-500 dark:text-ink-400">
                    <MapPinIcon className="mt-0.5 size-4 shrink-0" />
                    {cinema.address[format.locale]}
                  </p>
                  <p className="text-xs font-semibold text-ink-400">
                    {t('cinemas.screens')}:{' '}
                    {halls.map((hall) => hall.name[format.locale]).join(' · ')}
                  </p>
                </div>
              </motion.li>
            );
          })}
        </ul>
      </PageContainer>
    </section>
  );
}

function ClosingCta() {
  const { t } = useTranslation();

  return (
    <section className="pb-4">
      <PageContainer>
        <div className="film-grain relative overflow-hidden rounded-card border border-ink-200 bg-ink-900 px-6 py-14 text-center dark:border-ink-800 sm:px-12">
          <div
            className="absolute inset-0 bg-linear-to-br from-brand-700/40 via-ink-900 to-ink-950"
            aria-hidden="true"
          />
          <div className="relative space-y-4">
            <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              {t('home.ctaTitle')}
            </h2>
            <p className="mx-auto max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">
              {t('home.ctaBody', { movies: MOVIES.length })}
            </p>
            <div className="pt-2">
              <ButtonLink to="/movies" size="lg">
                {t('home.ctaButton')}
                <ArrowIcon className="size-5 rtl:rotate-180" />
              </ButtonLink>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}

export default function HomePage() {
  const { t } = useTranslation();
  usePageTitle();

  const featured = getFeaturedMovies();
  const nowShowing = getMoviesByStatus('nowShowing');
  const comingSoon = getMoviesByStatus('comingSoon');
  const popular = getPopularMovies(8);

  return (
    <>
      <MovieHero movies={featured} />

      <div className="space-y-16 py-16 sm:space-y-20 sm:py-20">
        <MovieRail
          title={t('home.nowShowingTitle')}
          subtitle={t('home.nowShowingSubtitle')}
          movies={nowShowing}
          viewAllTo="/movies"
        />
        <MovieRail
          title={t('home.popularTitle')}
          subtitle={t('home.popularSubtitle')}
          movies={popular}
          viewAllTo="/movies"
        />
        <MovieRail
          title={t('home.comingSoonTitle')}
          subtitle={t('home.comingSoonSubtitle')}
          movies={comingSoon}
          viewAllTo="/movies"
        />
      </div>

      <FeatureGrid />
      <CinemaShowcase />
      <ClosingCta />
    </>
  );
}

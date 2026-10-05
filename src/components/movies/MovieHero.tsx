import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useTranslation } from 'react-i18next';

import type { Movie } from '../../types';
import { useFormat } from '../../hooks/useFormat';
import { cn } from '../../lib/cn';
import { Badge } from '../ui/Badge';
import { ButtonLink } from '../ui/Button';
import { ClockIcon, SparkleIcon, StarIcon, TicketIcon } from '../ui/Icon';
import { SmartImage } from '../ui/SmartImage';

const ROTATE_MS = 7500;

const EASE = [0.22, 1, 0.36, 1] as const;

export function MovieHero({ movies }: { readonly movies: readonly Movie[] }) {
  const { t } = useTranslation();
  const format = useFormat();
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const movie = movies[index] ?? movies[0];

  // Gentle auto-advance between featured films; off for reduced motion.
  useEffect(() => {
    if (reduceMotion || paused || movies.length < 2) return;
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % movies.length),
      ROTATE_MS,
    );
    return () => window.clearInterval(timer);
  }, [reduceMotion, paused, movies.length]);

  if (!movie) return null;

  const title = movie.title[format.locale];

  return (
    <section
      className="film-grain relative isolate overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label={t('home.heroEyebrow')}
    >
      {/* Blurred poster backdrop — real artwork, treated so the text stays legible. */}
      <AnimatePresence mode="sync">
        <motion.div
          key={movie.id}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0.2 : 1.1, ease: EASE }}
          className="absolute inset-0 -z-10"
          aria-hidden="true"
        >
          <img
            src={movie.posterUrl}
            alt=""
            aria-hidden="true"
            className="size-full scale-125 object-cover blur-2xl"
            style={{ backgroundColor: movie.accentColor }}
          />
        </motion.div>
      </AnimatePresence>

      <div
        className="absolute inset-0 -z-10 bg-ink-950/70 dark:bg-ink-950/80"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 -z-10 bg-linear-to-t from-[var(--surface-page)] via-ink-950/35 to-ink-950/65"
        aria-hidden="true"
      />

      <div className="mx-auto w-full max-w-7xl px-4 pb-14 pt-14 sm:px-6 sm:pb-20 sm:pt-20 lg:px-8 lg:pb-28 lg:pt-28">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-14">
          <AnimatePresence mode="wait">
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduceMotion ? 0 : -12 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="max-w-2xl space-y-5 text-white"
            >
              <Badge tone="gold" icon={<SparkleIcon className="size-3.5" />} className="shadow-sm">
                {t('home.heroEyebrow')}
              </Badge>

              <div className="space-y-2">
                <h1 className="text-balance text-4xl font-extrabold leading-[1.05] tracking-tight drop-shadow-sm sm:text-5xl lg:text-6xl">
                  {title}
                </h1>
                {format.locale === 'fa' && (
                  <p dir="ltr" className="text-sm font-medium text-white/60">
                    {movie.originalTitle}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold text-white/85">
                <span
                  className="inline-flex items-center gap-1.5 text-gold-300"
                  aria-label={t('a11y.ratingLabel', { rating: format.rating(movie.rating) })}
                >
                  <StarIcon className="size-4" />
                  {format.rating(movie.rating)}
                  <span className="font-medium text-white/50">{t('common.outOfTen')}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ClockIcon className="size-4" />
                  {format.duration(movie.durationMinutes)}
                </span>
                <span className="rounded border border-white/30 px-1.5 py-0.5 text-xs">
                  {movie.ageRating}
                </span>
                <span>{format.genreList(movie.genres)}</span>
              </div>

              <p className="max-w-xl text-pretty text-sm leading-relaxed text-white/80 sm:text-base">
                {movie.synopsis[format.locale]}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <ButtonLink to={`/movies/${movie.id}`} size="lg">
                  <TicketIcon className="size-5" />
                  {t('home.heroBook')}
                </ButtonLink>
                <ButtonLink
                  to={`/movies/${movie.id}`}
                  variant="secondary"
                  size="lg"
                  className="border-white/25 bg-white/10 text-white backdrop-blur-sm hover:border-white/40 hover:bg-white/20 dark:border-white/25 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                >
                  {t('home.heroDetails')}
                </ButtonLink>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Sharp poster alongside the blurred version of itself. */}
          <AnimatePresence mode="wait">
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, scale: 0.94, y: reduceMotion ? 0 : 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="mx-auto w-44 sm:w-56 lg:mx-0 lg:w-72"
            >
              <SmartImage
                src={movie.posterUrl}
                alt={t('a11y.posterAlt', { title })}
                fallbackLabel={title}
                accentColor={movie.accentColor}
                loading="eager"
                className="aspect-2/3 w-full rounded-card border border-white/15 shadow-2xl ring-1 ring-ink-950/30"
                sizes="(max-width: 1024px) 220px, 288px"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {movies.length > 1 && (
          <div className="mt-10 flex items-center gap-2" role="tablist" aria-label={t('home.heroEyebrow')}>
            {movies.map((item, itemIndex) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={itemIndex === index}
                aria-label={item.title[format.locale]}
                onClick={() => setIndex(itemIndex)}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  itemIndex === index
                    ? 'w-10 bg-brand-500'
                    : 'w-5 bg-white/35 hover:bg-white/60',
                )}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

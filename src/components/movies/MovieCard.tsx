import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import type { Movie } from '../../types';
import { useFormat } from '../../hooks/useFormat';
import { cn } from '../../lib/cn';
import { Badge } from '../ui/Badge';
import { ClockIcon, StarIcon } from '../ui/Icon';
import { SmartImage } from '../ui/SmartImage';

interface MovieCardProps {
  readonly movie: Movie;
  /** Fixed-width variant used inside the horizontally scrolling rails. */
  readonly inRail?: boolean;
  readonly priority?: boolean;
}

export function MovieCard({ movie, inRail = false, priority = false }: MovieCardProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const title = movie.title[format.locale];

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn('group relative', inRail && 'w-40 shrink-0 sm:w-48')}
    >
      <Link
        to={`/movies/${movie.id}`}
        className="block rounded-card focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        <div className="relative overflow-hidden rounded-card border border-ink-200 bg-ink-100 shadow-sm transition-all duration-300 ease-[var(--ease-out-soft)] group-hover:-translate-y-1 group-hover:shadow-xl dark:border-ink-800 dark:bg-ink-900">
          <SmartImage
            src={movie.posterUrl}
            alt={t('a11y.posterAlt', { title })}
            fallbackLabel={title}
            accentColor={movie.accentColor}
            loading={priority ? 'eager' : 'lazy'}
            className="aspect-2/3 w-full"
            imageClassName="transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover:scale-105"
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 220px"
          />

          {/* Gradient scrim so the overlaid chips stay readable on any poster. */}
          <div
            className="pointer-events-none absolute inset-0 bg-linear-to-t from-ink-950/85 via-ink-950/5 to-ink-950/30 opacity-90"
            aria-hidden="true"
          />

          <div className="absolute inset-x-2.5 top-2.5 flex items-start justify-between gap-2">
            <Badge tone={movie.status === 'nowShowing' ? 'brand' : 'gold'}>
              {t(`status.${movie.status}`)}
            </Badge>
            <span
              className="inline-flex items-center gap-1 rounded-full bg-ink-950/70 px-2 py-1 text-xs font-bold text-gold-300 backdrop-blur-sm"
              aria-label={t('a11y.ratingLabel', { rating: format.rating(movie.rating) })}
            >
              <StarIcon className="size-3" />
              {format.rating(movie.rating)}
            </span>
          </div>

          <div className="absolute inset-x-0 bottom-0 p-3">
            <span className="inline-flex items-center gap-1.5 text-[0.7rem] font-semibold text-white/85">
              <ClockIcon className="size-3.5" />
              {format.duration(movie.durationMinutes)}
            </span>
          </div>
        </div>

        <div className="mt-3 space-y-1">
          <h3 className="line-clamp-2 text-sm font-bold leading-snug transition-colors group-hover:text-brand-600 dark:group-hover:text-brand-400">
            {title}
          </h3>
          {format.locale === 'fa' && (
            <p dir="ltr" className="truncate text-[0.7rem] text-ink-400">
              {movie.originalTitle}
            </p>
          )}
          <p className="truncate text-xs text-ink-500 dark:text-ink-400">
            {format.genreList(movie.genres.slice(0, 2))}
          </p>
        </div>
      </Link>
    </motion.article>
  );
}

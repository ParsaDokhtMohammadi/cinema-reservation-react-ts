import { useCallback, useEffect, useMemo, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { useReducedMotion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import type { Movie } from '../../types';
import { useLocale } from '../../hooks/useLocale';
import { cn } from '../../lib/cn';
import { ChevronIcon } from '../ui/Icon';
import { MovieCard } from './MovieCard';

interface MovieRailProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly movies: readonly Movie[];
  readonly viewAllTo?: string;
}

/**
 * A carousel of posters, driven by Embla.
 *
 * Embla handles the dragging, momentum, snapping and bounds; this component
 * supplies the layout and the arrow controls. Slide widths are pure CSS, which
 * is how Embla expects them — it measures the rendered slides.
 */
export function MovieRail({ title, subtitle, movies, viewAllTo }: MovieRailProps) {
  const { t } = useTranslation();
  const { isRtl } = useLocale();
  const reduceMotion = useReducedMotion();

  // A new options object makes the hook re-initialise, which is what we want
  // when the language (and therefore the direction) changes.
  const options = useMemo(
    () => ({
      direction: (isRtl ? 'rtl' : 'ltr') as 'rtl' | 'ltr',
      align: 'start' as const,
      containScroll: 'trimSnaps' as const,
      slidesToScroll: 'auto' as const,
      duration: reduceMotion ? 0 : 22,
    }),
    [isRtl, reduceMotion],
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(options);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setCanPrev(emblaApi.canScrollPrev());
      setCanNext(emblaApi.canScrollNext());
    };

    onSelect();
    emblaApi.on('select', onSelect);
    // Fired when slides or sizes change, e.g. on a resize or a locale switch.
    emblaApi.on('reInit', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi]);

  if (movies.length === 0) return null;

  // Nothing to page through when every poster already fits.
  const hasOverflow = canPrev || canNext;

  const arrowClass =
    'flex size-9 items-center justify-center rounded-full border border-ink-200 bg-white text-ink-700 transition ' +
    'hover:border-ink-300 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-white ' +
    'dark:border-ink-700 dark:bg-ink-900 dark:text-ink-200 dark:hover:border-ink-600 dark:hover:bg-ink-800 ' +
    'dark:disabled:hover:bg-ink-900';

  return (
    <section className="space-y-5" aria-roledescription="carousel" aria-label={title}>
      <div className="mx-auto flex w-full max-w-7xl items-end justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="space-y-1.5">
          <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">{title}</h2>
          {subtitle && (
            <p className="max-w-xl text-sm leading-relaxed text-ink-500 dark:text-ink-400">{subtitle}</p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {viewAllTo && (
            <Link
              to={viewAllTo}
              className="group inline-flex items-center gap-1 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
            >
              {t('common.viewAll')}
              <ChevronIcon className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
            </Link>
          )}

          {/* Buttons live outside the Embla viewport so they never start a drag. */}
          {hasOverflow && (
            <div className="hidden items-center gap-1.5 sm:flex">
              <button
                type="button"
                onClick={scrollPrev}
                disabled={!canPrev}
                aria-label={t('common.scrollBack')}
                className={arrowClass}
              >
                <ChevronIcon className="size-4 rotate-180 rtl:rotate-0" />
              </button>
              <button
                type="button"
                onClick={scrollNext}
                disabled={!canNext}
                aria-label={t('common.scrollForward')}
                className={arrowClass}
              >
                <ChevronIcon className="size-4 rtl:rotate-180" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Constrained to the heading's width so the two line up on wide screens. */}
      <div className="relative mx-auto w-full max-w-7xl">
        <div
          className={cn(
            'pointer-events-none absolute inset-y-0 start-0 z-10 w-10 bg-linear-to-r from-[var(--surface-page)] to-transparent transition-opacity duration-300 rtl:bg-linear-to-l',
            canPrev ? 'opacity-100' : 'opacity-0',
          )}
          aria-hidden="true"
        />
        <div
          className={cn(
            'pointer-events-none absolute inset-y-0 end-0 z-10 w-10 bg-linear-to-l from-[var(--surface-page)] to-transparent transition-opacity duration-300 rtl:bg-linear-to-r',
            canNext ? 'opacity-100' : 'opacity-0',
          )}
          aria-hidden="true"
        />

        <div className="overflow-hidden px-4 sm:px-6 lg:px-8" ref={emblaRef}>
          <ul className="flex touch-pan-y gap-4 pb-2 sm:gap-5">
            {movies.map((movie, index) => (
              <li key={movie.id} className="min-w-0 shrink-0 grow-0 basis-auto">
                <MovieCard movie={movie} inRail priority={index < 4} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

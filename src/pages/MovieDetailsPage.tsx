import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { getMovie, groupShowtimesByDay } from '../lib/catalog';
import { useFormat } from '../hooks/useFormat';
import { usePageTitle } from '../hooks/usePageTitle';
import { useReservations } from '../hooks/useReservations';
import { PageContainer } from '../components/layout/Layout';
import { DateSelector } from '../components/booking/DateSelector';
import { ShowtimeSelector } from '../components/booking/ShowtimeSelector';
import { Badge } from '../components/ui/Badge';
import { EmptyState, ErrorState, Notice } from '../components/ui/States';
import { SmartImage } from '../components/ui/SmartImage';
import { CalendarIcon, ClockIcon, FilmIcon, StarIcon } from '../components/ui/Icon';

const EASE = [0.22, 1, 0.36, 1] as const;

export default function MovieDetailsPage() {
  const { movieId } = useParams<{ movieId: string }>();
  const { t } = useTranslation();
  const format = useFormat();
  const reservations = useReservations();

  const movie = getMovie(movieId);
  const days = useMemo(() => (movie ? groupShowtimesByDay(movie.id) : []), [movie]);
  const [selectedDay, setSelectedDay] = useState<string>(() => days[0]?.dateKey ?? '');

  usePageTitle(movie ? movie.title[format.locale] : t('movie.notFoundTitle'));

  if (!movie) {
    return (
      <PageContainer className="py-20">
        <ErrorState
          title={t('movie.notFoundTitle')}
          body={t('movie.notFoundBody')}
          action={{ label: t('movie.backToMovies'), to: '/movies' }}
        />
      </PageContainer>
    );
  }

  const title = movie.title[format.locale];
  const activeDay = days.find((day) => day.dateKey === selectedDay) ?? days[0];

  const dateOptions = days.map((day) => ({
    dateKey: day.dateKey,
    date: day.date,
    count: day.showtimes.length,
  }));

  return (
    <article>
      {/* Backdrop built from the film's own artwork. */}
      <header className="film-grain relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          <img
            src={movie.posterUrl}
            alt=""
            aria-hidden="true"
            className="size-full scale-125 object-cover blur-3xl"
            style={{ backgroundColor: movie.accentColor }}
          />
        </div>
        <div className="absolute inset-0 -z-10 bg-ink-950/75 dark:bg-ink-950/85" aria-hidden="true" />
        <div
          className="absolute inset-0 -z-10 bg-linear-to-t from-[var(--surface-page)] via-ink-950/40 to-ink-950/60"
          aria-hidden="true"
        />

        <PageContainer className="py-12 sm:py-16 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-12">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="mx-auto w-40 sm:w-52 lg:mx-0 lg:w-64"
            >
              <SmartImage
                src={movie.posterUrl}
                alt={t('a11y.posterAlt', { title })}
                fallbackLabel={title}
                accentColor={movie.accentColor}
                loading="eager"
                className="aspect-2/3 w-full rounded-card border border-white/15 shadow-2xl"
                sizes="(max-width: 1024px) 208px, 256px"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.08, ease: EASE }}
              className="space-y-5 text-white"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={movie.status === 'nowShowing' ? 'brand' : 'gold'}>
                  {t(`status.${movie.status}`)}
                </Badge>
                <Badge tone="neutral" className="border-white/25 bg-white/10 text-white">
                  {movie.ageRating}
                </Badge>
              </div>

              <div className="space-y-2">
                <h1 className="text-balance text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                  {title}
                </h1>
                {format.locale === 'fa' && (
                  <p dir="ltr" className="text-sm font-medium text-white/60">
                    {movie.originalTitle}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold text-white/85">
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
                <span className="inline-flex items-center gap-1.5">
                  <CalendarIcon className="size-4" />
                  {format.monthYear(movie.releaseDate)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <FilmIcon className="size-4" />
                  {format.genreList(movie.genres)}
                </span>
              </div>

              <p className="max-w-2xl text-pretty text-sm leading-relaxed text-white/80 sm:text-base">
                {movie.synopsis[format.locale]}
              </p>

              <dl className="grid max-w-2xl gap-x-8 gap-y-3 pt-1 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-white/50">
                    {t('movie.director')}
                  </dt>
                  <dd className="mt-1 font-semibold text-white/90">
                    {movie.director[format.locale]}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-white/50">
                    {t('movie.cast')}
                  </dt>
                  <dd className="mt-1 font-semibold text-white/90">
                    {movie.cast[format.locale].join('، ')}
                  </dd>
                </div>
              </dl>

              {movie.status === 'nowShowing' && days.length > 0 && (
                <div className="pt-2">
                  {/* Native anchor so the browser handles the in-page scroll. */}
                  <a
                    href="#showtimes"
                    className="inline-flex h-13 items-center justify-center gap-2 rounded-xl bg-brand-600 px-7 text-base font-semibold text-white transition hover:bg-brand-500 dark:bg-brand-500 dark:hover:bg-brand-400"
                  >
                    {t('movie.showtimesTitle')}
                  </a>
                </div>
              )}
            </motion.div>
          </div>
        </PageContainer>
      </header>

      <PageContainer className="py-12 sm:py-16">
        <section id="showtimes" className="scroll-mt-24 space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold tracking-tight">{t('movie.showtimesTitle')}</h2>
            <p className="text-sm text-ink-500 dark:text-ink-400">{t('movie.showtimesSubtitle')}</p>
          </div>

          {days.length === 0 ? (
            <>
              {movie.status === 'comingSoon' && (
                <Notice tone="warning">{t('movie.comingSoonNote')}</Notice>
              )}
              <EmptyState
                title={t('movie.noShowtimesTitle')}
                body={t('movie.noShowtimesBody')}
                icon={<CalendarIcon className="size-6" />}
                action={{ label: t('movie.backToMovies'), to: '/movies' }}
              />
            </>
          ) : (
            <>
              <DateSelector
                options={dateOptions}
                selected={activeDay?.dateKey ?? ''}
                onSelect={setSelectedDay}
              />

              {activeDay && activeDay.showtimes.length > 0 ? (
                <ShowtimeSelector showtimes={activeDay.showtimes} reservations={reservations} />
              ) : (
                <EmptyState
                  title={t('movie.noShowtimesTodayTitle')}
                  body={t('movie.noShowtimesTodayBody')}
                  icon={<CalendarIcon className="size-6" />}
                />
              )}
            </>
          )}
        </section>
      </PageContainer>
    </article>
  );
}

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { GenreId, MovieStatus } from '../types';
import { AVAILABLE_GENRES, EMPTY_FILTERS, filterMovies } from '../lib/catalog';
import { cn } from '../lib/cn';
import { useFormat } from '../hooks/useFormat';
import { usePageTitle } from '../hooks/usePageTitle';
import { PageContainer, PageHeader } from '../components/layout/Layout';
import { MovieGrid } from '../components/movies/MovieGrid';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/States';
import { SearchIcon } from '../components/ui/Icon';

const STATUS_OPTIONS: readonly (MovieStatus | 'all')[] = ['all', 'nowShowing', 'comingSoon'];

export default function MoviesPage() {
  const { t } = useTranslation();
  const format = useFormat();
  usePageTitle(t('movies.title'));

  const [query, setQuery] = useState(EMPTY_FILTERS.query);
  const [genre, setGenre] = useState<GenreId | 'all'>(EMPTY_FILTERS.genre);
  const [status, setStatus] = useState<MovieStatus | 'all'>(EMPTY_FILTERS.status);

  const results = useMemo(() => filterMovies({ query, genre, status }), [query, genre, status]);
  const isFiltered = query !== '' || genre !== 'all' || status !== 'all';

  const clearFilters = () => {
    setQuery(EMPTY_FILTERS.query);
    setGenre(EMPTY_FILTERS.genre);
    setStatus(EMPTY_FILTERS.status);
  };

  return (
    <PageContainer className="py-10 sm:py-14">
      <PageHeader title={t('movies.title')} subtitle={t('movies.subtitle')} />

      <div className="mt-8 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <label htmlFor="movie-search" className="sr-only">
              {t('movies.searchLabel')}
            </label>
            <SearchIcon
              className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-400"
              aria-hidden="true"
            />
            <input
              id="movie-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('movies.searchPlaceholder')}
              className="h-11 w-full rounded-xl border border-ink-200 bg-white ps-10 pe-4 text-sm font-medium placeholder:text-ink-400 focus-visible:border-brand-500 dark:border-ink-700 dark:bg-ink-900"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1 sm:flex-none">
              <label htmlFor="genre-filter" className="sr-only">
                {t('movies.genreLabel')}
              </label>
              <select
                id="genre-filter"
                value={genre}
                onChange={(event) => setGenre(event.target.value as GenreId | 'all')}
                className="h-11 w-full rounded-xl border border-ink-200 bg-white px-3 text-sm font-semibold dark:border-ink-700 dark:bg-ink-900 sm:w-44"
              >
                <option value="all">{t('movies.allGenres')}</option>
                {AVAILABLE_GENRES.map((option) => (
                  <option key={option} value={option}>
                    {format.genre(option)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            role="group"
            aria-label={t('movies.statusLabel')}
            className="flex gap-1 rounded-xl border border-ink-200 bg-white p-1 dark:border-ink-700 dark:bg-ink-900"
          >
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setStatus(option)}
                aria-pressed={status === option}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-bold transition-colors',
                  status === option
                    ? 'bg-brand-600 text-white dark:bg-brand-500'
                    : 'text-ink-500 hover:text-ink-900 dark:text-ink-400 dark:hover:text-white',
                )}
              >
                {option === 'all' ? t('movies.allStatuses') : t(`status.${option}`)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <p className="text-sm font-semibold text-ink-500 dark:text-ink-400" aria-live="polite">
              {t('movies.resultsCount', { count: results.length })}
            </p>
            {isFiltered && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                {t('movies.clearFilters')}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8">
        {results.length === 0 ? (
          <EmptyState
            title={t('movies.emptyTitle')}
            body={t('movies.emptyBody')}
            secondaryAction={{ label: t('movies.clearFilters'), onClick: clearFilters }}
          />
        ) : (
          <MovieGrid movies={results} />
        )}
      </div>
    </PageContainer>
  );
}

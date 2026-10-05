import type { Movie } from '../../types';
import { MovieCard } from './MovieCard';

interface MovieGridProps {
  readonly movies: readonly Movie[];
  /** First row loads eagerly so the page has artwork immediately. */
  readonly priorityCount?: number;
}

export function MovieGrid({ movies, priorityCount = 5 }: MovieGridProps) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
      {movies.map((movie, index) => (
        <li key={movie.id}>
          <MovieCard movie={movie} priority={index < priorityCount} />
        </li>
      ))}
    </ul>
  );
}

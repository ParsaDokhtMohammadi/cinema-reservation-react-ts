import type {
  GenreId,
  Movie,
  MovieStatus,
  Reservation,
  ReservationDetails,
  Showtime,
  ShowtimeDetails,
} from '../types';
import { CINEMAS, HALLS, getCinema, getHall } from '../data/cinemas';
import { MOVIES, POPULAR_MOVIE_IDS } from '../data/movies';
import { SHOWTIMES, toDateKey } from '../data/showtimes';

export const ALL_GENRES: readonly GenreId[] = [
  'action',
  'adventure',
  'animation',
  'comedy',
  'crime',
  'drama',
  'horror',
  'musical',
  'sciFi',
  'thriller',
];

/** Genres that at least one film in the catalogue actually has. */
export const AVAILABLE_GENRES: readonly GenreId[] = ALL_GENRES.filter((genre) =>
  MOVIES.some((movie) => movie.genres.includes(genre)),
);

export function getMovie(id: string | undefined): Movie | undefined {
  if (!id) return undefined;
  return MOVIES.find((movie) => movie.id === id);
}

export function getMoviesByStatus(status: MovieStatus): readonly Movie[] {
  return MOVIES.filter((movie) => movie.status === status);
}

export function getFeaturedMovies(): readonly Movie[] {
  const featured = MOVIES.filter((movie) => movie.featured);
  return featured.length > 0 ? featured : MOVIES.slice(0, 2);
}

export function getPopularMovies(limit = 6): readonly Movie[] {
  return POPULAR_MOVIE_IDS.map((id) => getMovie(id))
    .filter((movie): movie is Movie => movie !== undefined)
    .slice(0, limit);
}

export interface MovieFilters {
  readonly query: string;
  readonly genre: GenreId | 'all';
  readonly status: MovieStatus | 'all';
}

export const EMPTY_FILTERS: MovieFilters = { query: '', genre: 'all', status: 'all' };

/**
 * Title search across both languages plus the original title, so searching
 * "Dune" works while the Persian UI is active and vice versa.
 */
export function filterMovies(filters: MovieFilters): readonly Movie[] {
  const needle = filters.query.trim().toLowerCase();

  return MOVIES.filter((movie) => {
    if (filters.status !== 'all' && movie.status !== filters.status) return false;
    if (filters.genre !== 'all' && !movie.genres.includes(filters.genre)) return false;
    if (needle.length === 0) return true;

    const haystack = [movie.title.en, movie.title.fa, movie.originalTitle, movie.director.en, movie.director.fa]
      .join(' ')
      .toLowerCase();
    return haystack.includes(needle);
  });
}

/* ------------------------------------------------------------------ *
 * Showtimes
 * ------------------------------------------------------------------ */

export function getShowtime(id: string | undefined): Showtime | undefined {
  if (!id) return undefined;
  return SHOWTIMES.find((showtime) => showtime.id === id);
}

export function getShowtimesForMovie(movieId: string): readonly Showtime[] {
  return SHOWTIMES.filter((showtime) => showtime.movieId === movieId);
}

export interface ShowtimeDay {
  readonly dateKey: string;
  readonly date: Date;
  readonly showtimes: readonly Showtime[];
}

/** Groups a film's programme by calendar day, in chronological order. */
export function groupShowtimesByDay(movieId: string): readonly ShowtimeDay[] {
  const byDay = new Map<string, Showtime[]>();

  for (const showtime of getShowtimesForMovie(movieId)) {
    const dateKey = toDateKey(new Date(showtime.startsAt));
    const bucket = byDay.get(dateKey);
    if (bucket) bucket.push(showtime);
    else byDay.set(dateKey, [showtime]);
  }

  return [...byDay.entries()]
    .map(([dateKey, showtimes]) => ({
      dateKey,
      date: new Date(`${dateKey}T00:00:00`),
      showtimes: showtimes.slice().sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
    }))
    .sort((a, b) => a.dateKey.localeCompare(b.dateKey));
}

export function isPast(startsAt: string, now: Date = new Date()): boolean {
  return new Date(startsAt).getTime() < now.getTime();
}

export function getShowtimeDetails(showtimeId: string | undefined): ShowtimeDetails | undefined {
  const showtime = getShowtime(showtimeId);
  if (!showtime) return undefined;

  const movie = getMovie(showtime.movieId);
  const cinema = getCinema(showtime.cinemaId);
  const hall = getHall(showtime.hallId);
  if (!movie || !cinema || !hall) return undefined;

  return { showtime, movie, cinema, hall };
}

/* ------------------------------------------------------------------ *
 * Reservations
 * ------------------------------------------------------------------ */

/**
 * Joins a stored reservation with the catalogue. Returns undefined when the
 * reservation points at data that no longer exists (e.g. storage written by an
 * older build, or a showtime that has rolled off the schedule).
 */
export function getReservationDetails(reservation: Reservation): ReservationDetails | undefined {
  const movie = getMovie(reservation.movieId);
  const cinema = getCinema(reservation.cinemaId) ?? CINEMAS[0];
  const hall = getHall(reservation.hallId) ?? HALLS[0];
  const showtime = getShowtime(reservation.showtimeId);
  if (!movie || !showtime) return undefined;

  const displayStatus =
    reservation.status === 'confirmed' && isPast(showtime.startsAt) ? 'completed' : reservation.status;

  return { reservation, movie, cinema, hall, showtime, displayStatus };
}

/** Newest first, dropping anything that can no longer be rendered. */
export function toReservationDetails(
  reservations: readonly Reservation[],
): readonly ReservationDetails[] {
  return reservations
    .map(getReservationDetails)
    .filter((details): details is ReservationDetails => details !== undefined)
    .sort((a, b) => b.reservation.createdAt.localeCompare(a.reservation.createdAt));
}

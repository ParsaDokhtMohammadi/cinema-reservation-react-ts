/** Domain types. Everything in the app is strongly typed off these. */

export type Locale = 'en' | 'fa';

/** A string that exists in both supported languages. */
export type Localized = Record<Locale, string>;

/** A list of strings in both languages (cast lists, bullet points). */
export type LocalizedList = Record<Locale, readonly string[]>;

export type GenreId =
  | 'action'
  | 'adventure'
  | 'animation'
  | 'comedy'
  | 'crime'
  | 'drama'
  | 'horror'
  | 'musical'
  | 'sciFi'
  | 'thriller';

export type MovieStatus = 'nowShowing' | 'comingSoon';

export type AgeRating = 'G' | 'PG' | 'PG-13' | 'R';

export interface Movie {
  readonly id: string;
  readonly title: Localized;
  /** Shown under translated titles so the original is always discoverable. */
  readonly originalTitle: string;
  readonly synopsis: Localized;
  readonly genres: readonly GenreId[];
  readonly durationMinutes: number;
  /** Out of 10. */
  readonly rating: number;
  readonly ageRating: AgeRating;
  /** ISO date (YYYY-MM-DD). */
  readonly releaseDate: string;
  readonly status: MovieStatus;
  readonly director: Localized;
  readonly cast: LocalizedList;
  readonly posterUrl: string;
  /** Dominant poster colour, used for gradient fallbacks and image placeholders. */
  readonly accentColor: string;
  readonly featured?: boolean;
}

export interface Cinema {
  readonly id: string;
  readonly name: Localized;
  readonly city: Localized;
  readonly address: Localized;
  readonly imageUrl: string;
}

export type ScreenFormat = '2D' | '3D' | 'IMAX';

/** How the soundtrack is presented — relevant for a bilingual audience. */
export type AudioTrack = 'original' | 'subtitled' | 'dubbed';

export type SeatTier = 'standard' | 'premium' | 'vip';

export interface Hall {
  readonly id: string;
  readonly cinemaId: string;
  readonly name: Localized;
  readonly format: ScreenFormat;
  /** Seats per row, front to back. Rows widen toward the back. */
  readonly rowSizes: readonly number[];
  /**
   * Aisle positions as a fraction of the row width, so a single spec produces
   * aligned aisles across rows of different lengths.
   */
  readonly aisleFractions: readonly number[];
  /** Rows (1-based, front to back) that are premium / VIP. */
  readonly premiumRows: readonly number[];
  readonly vipRows: readonly number[];
}

export interface Showtime {
  readonly id: string;
  readonly movieId: string;
  readonly cinemaId: string;
  readonly hallId: string;
  /** ISO timestamp. */
  readonly startsAt: string;
  readonly format: ScreenFormat;
  readonly audio: AudioTrack;
  /** Price of a standard seat; other tiers multiply this. */
  readonly basePrice: number;
}

export interface Seat {
  readonly id: string;
  /** Row letter, e.g. "C". */
  readonly row: string;
  /** 1-based seat number within the row. */
  readonly number: number;
  readonly tier: SeatTier;
}

/** A row is a sequence of seats and aisle gaps, so the map keeps its shape. */
export type SeatCell = { readonly kind: 'seat'; readonly seat: Seat } | { readonly kind: 'aisle' };

export interface SeatRowLayout {
  readonly row: string;
  readonly cells: readonly SeatCell[];
}

export interface SeatMapLayout {
  readonly rows: readonly SeatRowLayout[];
  readonly totalSeats: number;
}

export type SeatState = 'available' | 'selected' | 'occupied';

/** Price snapshot kept on the reservation so history stays accurate. */
export interface ReservedSeat {
  readonly seatId: string;
  readonly tier: SeatTier;
  readonly price: number;
}

export type ReservationStatus = 'confirmed' | 'cancelled' | 'completed';

export interface Reservation {
  readonly id: string;
  readonly showtimeId: string;
  readonly movieId: string;
  readonly cinemaId: string;
  readonly hallId: string;
  readonly seats: readonly ReservedSeat[];
  readonly totalPrice: number;
  /** ISO timestamp. */
  readonly createdAt: string;
  readonly cancelledAt?: string;
  readonly status: Exclude<ReservationStatus, 'completed'>;
}

export interface CreateReservationInput {
  readonly showtimeId: string;
  readonly seatIds: readonly string[];
}

/**
 * Result of a reservation attempt. Seats are re-checked against the freshest
 * stored state immediately before writing, so a conflict is a normal outcome
 * rather than an exception.
 */
export type ReservationResult =
  | { readonly ok: true; readonly reservation: Reservation }
  | { readonly ok: false; readonly reason: 'conflict'; readonly conflictingSeatIds: readonly string[] }
  | { readonly ok: false; readonly reason: 'empty' | 'unknownShowtime' | 'storage' };

/** A showtime joined with the entities it points at, for rendering. */
export interface ShowtimeDetails {
  readonly showtime: Showtime;
  readonly movie: Movie;
  readonly cinema: Cinema;
  readonly hall: Hall;
}

/** A reservation joined with the entities it points at, for rendering. */
export interface ReservationDetails {
  readonly reservation: Reservation;
  readonly movie: Movie;
  readonly cinema: Cinema;
  readonly hall: Hall;
  readonly showtime: Showtime;
  /** Derived: a confirmed reservation whose showtime has passed. */
  readonly displayStatus: ReservationStatus;
}

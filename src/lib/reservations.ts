import type {
  CreateReservationInput,
  Reservation,
  ReservationResult,
  ReservedSeat,
  Showtime,
} from '../types';
import { HALLS, getHall } from '../data/cinemas';
import { SHOWTIMES } from '../data/showtimes';
import { buildSeatMap, findSeat, seatPrice, seededOccupiedSeats } from './seatmap';
import { STORAGE_KEYS, readJson, writeJson } from './storage';

/* ------------------------------------------------------------------ *
 * Validation of stored data
 * ------------------------------------------------------------------ */

function isReservedSeat(value: unknown): value is ReservedSeat {
  if (typeof value !== 'object' || value === null) return false;
  const seat = value as Record<string, unknown>;
  return (
    typeof seat.seatId === 'string' &&
    typeof seat.price === 'number' &&
    Number.isFinite(seat.price) &&
    (seat.tier === 'standard' || seat.tier === 'premium' || seat.tier === 'vip')
  );
}

function isReservation(value: unknown): value is Reservation {
  if (typeof value !== 'object' || value === null) return false;
  const r = value as Record<string, unknown>;
  return (
    typeof r.id === 'string' &&
    typeof r.showtimeId === 'string' &&
    typeof r.movieId === 'string' &&
    typeof r.cinemaId === 'string' &&
    typeof r.hallId === 'string' &&
    Array.isArray(r.seats) &&
    r.seats.every(isReservedSeat) &&
    typeof r.totalPrice === 'number' &&
    Number.isFinite(r.totalPrice) &&
    typeof r.createdAt === 'string' &&
    (r.status === 'confirmed' || r.status === 'cancelled')
  );
}

function isReservationArray(value: unknown): value is Reservation[] {
  return Array.isArray(value) && value.every(isReservation);
}

/* ------------------------------------------------------------------ *
 * Store
 * ------------------------------------------------------------------ */

const CHANNEL_NAME = 'lumiere.reservations';

let cache: readonly Reservation[] | null = null;
const listeners = new Set<() => void>();

let channel: BroadcastChannel | null = null;
function getChannel(): BroadcastChannel | null {
  if (typeof BroadcastChannel === 'undefined') return null;
  if (channel === null) {
    channel = new BroadcastChannel(CHANNEL_NAME);
    channel.addEventListener('message', () => {
      // Another tab wrote — drop our cached copy and re-render.
      invalidate();
    });
  }
  return channel;
}

function invalidate(): void {
  cache = null;
  for (const listener of listeners) listener();
}

/** Reads straight from storage, bypassing the cache. */
function readFromStorage(): readonly Reservation[] {
  return readJson(STORAGE_KEYS.reservations, isReservationArray) ?? [];
}

function persist(next: readonly Reservation[]): boolean {
  const ok = writeJson(STORAGE_KEYS.reservations, next);
  cache = next;
  for (const listener of listeners) listener();
  getChannel()?.postMessage({ type: 'changed' });
  return ok;
}

/** Stable-reference snapshot, safe for useSyncExternalStore. */
export function getReservations(): readonly Reservation[] {
  if (cache === null) cache = readFromStorage();
  return cache;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  getChannel();
  return () => {
    listeners.delete(listener);
  };
}

/**
 * `storage` only fires in *other* tabs, which is exactly what we want as a
 * fallback for browsers without BroadcastChannel.
 */
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === null || event.key === STORAGE_KEYS.reservations) invalidate();
  });
}

/* ------------------------------------------------------------------ *
 * Queries
 * ------------------------------------------------------------------ */

export function getReservation(id: string): Reservation | undefined {
  return getReservations().find((r) => r.id === id);
}

function getShowtime(id: string): Showtime | undefined {
  return SHOWTIMES.find((s) => s.id === id);
}

/**
 * Seats that cannot be booked for a showtime: the seeded house plus every seat
 * held by a confirmed reservation. Cancelling a reservation removes its seats
 * from this set, which is how seats get released.
 */
export function getOccupiedSeatIds(
  showtimeId: string,
  reservations: readonly Reservation[] = getReservations(),
): ReadonlySet<string> {
  const showtime = getShowtime(showtimeId);
  if (!showtime) return new Set();

  const hall = getHall(showtime.hallId) ?? HALLS[0];
  const occupied = new Set(seededOccupiedSeats(showtimeId, hall));

  for (const reservation of reservations) {
    if (reservation.status !== 'confirmed') continue;
    if (reservation.showtimeId !== showtimeId) continue;
    for (const seat of reservation.seats) occupied.add(seat.seatId);
  }

  return occupied;
}

/** Seats held by *this* browser, so the user's own seats look different. */
export function getOwnSeatIds(
  showtimeId: string,
  reservations: readonly Reservation[] = getReservations(),
): ReadonlySet<string> {
  const own = new Set<string>();
  for (const reservation of reservations) {
    if (reservation.status !== 'confirmed' || reservation.showtimeId !== showtimeId) continue;
    for (const seat of reservation.seats) own.add(seat.seatId);
  }
  return own;
}

/* ------------------------------------------------------------------ *
 * Mutations
 * ------------------------------------------------------------------ */

const REFERENCE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no look-alikes

function randomReference(): string {
  const size = 6;
  const bytes = new Uint8Array(size);
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < size; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  }
  let out = '';
  for (const byte of bytes) out += REFERENCE_ALPHABET[byte % REFERENCE_ALPHABET.length];
  return `LM-${out}`;
}

function nextReservationId(existing: readonly Reservation[]): string {
  const taken = new Set(existing.map((r) => r.id));
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const candidate = randomReference();
    if (!taken.has(candidate)) return candidate;
  }
  return `LM-${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

/**
 * Creates a reservation.
 *
 * This is the one place where a conflict can happen, so the whole check runs
 * against a fresh read of storage rather than any cached React state: another
 * tab may have booked these seats since the seat map was rendered. It is not a
 * transaction — nothing in the browser can give us that — but it closes the
 * window to the few milliseconds between the re-check and the write.
 */
export function createReservation(input: CreateReservationInput): ReservationResult {
  if (input.seatIds.length === 0) return { ok: false, reason: 'empty' };

  const showtime = getShowtime(input.showtimeId);
  if (!showtime) return { ok: false, reason: 'unknownShowtime' };

  const hall = getHall(showtime.hallId);
  if (!hall) return { ok: false, reason: 'unknownShowtime' };

  // 1. Freshest possible state, straight from storage.
  const current = readFromStorage();

  // 2 & 3. Re-check every selected seat against it.
  const occupied = getOccupiedSeatIds(input.showtimeId, current);
  const conflictingSeatIds = input.seatIds.filter((seatId) => occupied.has(seatId));

  // 4. Reject the whole reservation if any seat slipped away.
  if (conflictingSeatIds.length > 0) {
    cache = current;
    for (const listener of listeners) listener();
    return { ok: false, reason: 'conflict', conflictingSeatIds };
  }

  const layout = buildSeatMap(hall);
  const seats: ReservedSeat[] = [];
  for (const seatId of input.seatIds) {
    const seat = findSeat(layout, seatId);
    if (!seat) return { ok: false, reason: 'conflict', conflictingSeatIds: [seatId] };
    seats.push({ seatId, tier: seat.tier, price: seatPrice(showtime.basePrice, seat.tier) });
  }

  const totalPrice = Math.round(seats.reduce((sum, seat) => sum + seat.price, 0) * 100) / 100;

  const reservation: Reservation = {
    id: nextReservationId(current),
    showtimeId: showtime.id,
    movieId: showtime.movieId,
    cinemaId: showtime.cinemaId,
    hallId: showtime.hallId,
    seats,
    totalPrice,
    createdAt: new Date().toISOString(),
    status: 'confirmed',
  };

  const written = persist([...current, reservation]);
  if (!written) return { ok: false, reason: 'storage' };

  return { ok: true, reservation };
}

/** Marks a reservation cancelled, which releases its seats. */
export function cancelReservation(id: string): boolean {
  const current = readFromStorage();
  const target = current.find((r) => r.id === id);
  if (!target || target.status === 'cancelled') return false;

  const next = current.map((reservation) =>
    reservation.id === id
      ? { ...reservation, status: 'cancelled' as const, cancelledAt: new Date().toISOString() }
      : reservation,
  );

  persist(next);
  return true;
}

/** Used by the "clear demo data" action on the reservations page. */
export function clearReservations(): void {
  persist([]);
}

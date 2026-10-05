import type { AudioTrack, ScreenFormat, Showtime } from '../types';
import { createRandom, pickOne } from '../lib/prng';
import { HALLS } from './cinemas';
import { MOVIES } from './movies';

/** How many days of programme the schedule covers, starting today. */
export const SCHEDULE_DAYS = 6;

const SLOTS = ['11:00', '14:30', '17:00', '19:45', '21:30', '22:45'] as const;

const BASE_PRICE: Record<ScreenFormat, number> = { '2D': 12.5, '3D': 15, IMAX: 18.5 };

const AUDIO_TRACKS: readonly AudioTrack[] = ['original', 'subtitled', 'dubbed'];

function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/** Local YYYY-MM-DD — deliberately not toISOString(), which shifts to UTC. */
export function toDateKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function scheduleDates(): readonly Date[] {
  const first = startOfToday();
  return Array.from({ length: SCHEDULE_DAYS }, (_, offset) => {
    const date = new Date(first);
    date.setDate(first.getDate() + offset);
    return date;
  });
}

function buildShowtimes(): readonly Showtime[] {
  const showtimes: Showtime[] = [];
  const dates = scheduleDates();

  for (const movie of MOVIES) {
    // Films still to be released have no programme yet — the UI shows an
    // explicit "coming soon" state for them.
    if (movie.status !== 'nowShowing') continue;

    const random = createRandom(`schedule:${movie.id}`);
    // Each film plays in two distinct auditoriums for the whole run.
    const firstHall = Math.floor(random() * HALLS.length);
    const secondHall = (firstHall + 1 + Math.floor(random() * (HALLS.length - 1))) % HALLS.length;
    const assignedHalls = [HALLS[firstHall], HALLS[secondHall]];

    for (const date of dates) {
      const dateKey = toDateKey(date);
      const dayRandom = createRandom(`day:${movie.id}:${dateKey}`);
      const slotCount = 3 + Math.floor(dayRandom() * 2); // 3 or 4 screenings
      const offset = Math.floor(dayRandom() * SLOTS.length);

      for (let i = 0; i < slotCount; i += 1) {
        const slot = SLOTS[(offset + i * 2) % SLOTS.length];
        const hall = assignedHalls[i % assignedHalls.length];
        const [hours, minutes] = slot.split(':').map(Number);
        const startsAt = new Date(date);
        startsAt.setHours(hours, minutes, 0, 0);

        const isEvening = hours >= 18;
        const basePrice = BASE_PRICE[hall.format] + (isEvening ? 2 : 0);

        showtimes.push({
          id: `st-${movie.id}-${dateKey}-${slot.replace(':', '')}`,
          movieId: movie.id,
          cinemaId: hall.cinemaId,
          hallId: hall.id,
          startsAt: startsAt.toISOString(),
          format: hall.format,
          audio: pickOne(AUDIO_TRACKS, dayRandom),
          basePrice,
        });
      }
    }
  }

  return showtimes.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

/**
 * The programme is generated once per page load from today's date, so the app
 * always shows a current schedule without any stored data.
 */
export const SHOWTIMES: readonly Showtime[] = buildShowtimes();

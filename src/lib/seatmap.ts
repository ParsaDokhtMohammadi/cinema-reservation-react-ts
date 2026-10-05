import type { Hall, Seat, SeatCell, SeatMapLayout, SeatRowLayout, SeatTier } from '../types';
import { createRandom } from './prng';

const ROW_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/** Price multiplier applied to a showtime's base price. */
export const TIER_MULTIPLIER: Record<SeatTier, number> = {
  standard: 1,
  premium: 1.35,
  vip: 1.8,
};

export function seatPrice(basePrice: number, tier: SeatTier): number {
  return Math.round(basePrice * TIER_MULTIPLIER[tier] * 100) / 100;
}

export function rowLetter(rowIndex: number): string {
  return ROW_LETTERS[rowIndex] ?? `R${rowIndex + 1}`;
}

function tierForRow(hall: Hall, rowNumber: number): SeatTier {
  if (hall.vipRows.includes(rowNumber)) return 'vip';
  if (hall.premiumRows.includes(rowNumber)) return 'premium';
  return 'standard';
}

/** Aisle gaps for a row, derived from the hall's fractional aisle spec. */
function aislePositions(hall: Hall, seatCount: number): ReadonlySet<number> {
  const positions = hall.aisleFractions
    .map((fraction) => Math.round(seatCount * fraction))
    .filter((position) => position > 0 && position < seatCount);
  return new Set(positions);
}

/**
 * Builds the seat layout for a hall. Pure and cheap, so it can be memoised per
 * hall rather than stored.
 */
export function buildSeatMap(hall: Hall): SeatMapLayout {
  let totalSeats = 0;

  const rows: SeatRowLayout[] = hall.rowSizes.map((seatCount, rowIndex) => {
    const row = rowLetter(rowIndex);
    const tier = tierForRow(hall, rowIndex + 1);
    const aisles = aislePositions(hall, seatCount);
    const cells: SeatCell[] = [];

    for (let n = 1; n <= seatCount; n += 1) {
      const seat: Seat = { id: `${row}${n}`, row, number: n, tier };
      cells.push({ kind: 'seat', seat });
      if (aisles.has(n)) cells.push({ kind: 'aisle' });
    }

    totalSeats += seatCount;
    return { row, cells };
  });

  return { rows, totalSeats };
}

export function allSeats(layout: SeatMapLayout): readonly Seat[] {
  return layout.rows.flatMap((row) =>
    row.cells.filter((cell): cell is { kind: 'seat'; seat: Seat } => cell.kind === 'seat').map((cell) => cell.seat),
  );
}

export function findSeat(layout: SeatMapLayout, seatId: string): Seat | undefined {
  return allSeats(layout).find((seat) => seat.id === seatId);
}

/**
 * Seats that are already taken "by other customers". Derived deterministically
 * from the showtime id so every visitor sees the same house, and so popular
 * showtimes look busier than quiet ones.
 */
export function seededOccupiedSeats(showtimeId: string, hall: Hall): ReadonlySet<string> {
  const random = createRandom(`occupancy:${showtimeId}`);
  const layout = buildSeatMap(hall);
  const seats = allSeats(layout);

  // Between 8% and 62% full, so the app shows near-empty and busy houses.
  const fillRatio = 0.08 + random() * 0.54;
  const occupied = new Set<string>();

  for (const seat of seats) {
    // Middle rows and centre seats go first, which is how a real house fills.
    const rowIndex = layout.rows.findIndex((row) => row.row === seat.row);
    const centreBias = 1 - Math.abs(rowIndex / Math.max(1, layout.rows.length - 1) - 0.55) * 1.1;
    const weight = fillRatio * (0.55 + centreBias * 0.9);
    if (random() < weight) occupied.add(seat.id);
  }

  return occupied;
}

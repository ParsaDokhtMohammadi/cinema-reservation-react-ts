import { useCallback, useMemo, useRef } from 'react';
import type { CSSProperties, KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';

import type { SeatMapLayout, SeatState } from '../../types';
import { cn } from '../../lib/cn';
import { Seat } from './Seat';

interface SeatMapProps {
  readonly layout: SeatMapLayout;
  readonly occupied: ReadonlySet<string>;
  readonly ownSeats: ReadonlySet<string>;
  readonly selected: ReadonlySet<string>;
  readonly onToggle: (seatId: string) => void;
}

/** The screen, drawn as a lit curve so the map reads as a real auditorium. */
function ScreenIndicator() {
  const { t } = useTranslation();

  return (
    <div className="relative mx-auto w-full max-w-xl select-none px-6">
      <svg viewBox="0 0 400 44" className="w-full" aria-hidden="true" preserveAspectRatio="none">
        <defs>
          <linearGradient id="screen-stroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.1" />
            <stop offset="50%" stopColor="currentColor" stopOpacity="0.95" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="screen-glow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Light spilling off the screen toward the audience. */}
        <path d="M8 14 Q200 -6 392 14 L392 44 L8 44 Z" fill="url(#screen-glow)" className="text-gold-400" />
        <path
          d="M8 14 Q200 -6 392 14"
          fill="none"
          stroke="url(#screen-stroke)"
          strokeWidth="3"
          strokeLinecap="round"
          className="text-gold-500 dark:text-gold-400"
        />
      </svg>
      <p className="mt-1 text-center text-[0.65rem] font-bold uppercase tracking-[0.35em] text-ink-400">
        {t('booking.screen')}
      </p>
    </div>
  );
}

export function SeatMap({ layout, occupied, ownSeats, selected, onToggle }: SeatMapProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  /** Seat ids per row, aisles excluded — the grid used for arrow-key moves. */
  const grid = useMemo(
    () =>
      layout.rows.map((row) =>
        row.cells.filter((cell) => cell.kind === 'seat').map((cell) => (cell.kind === 'seat' ? cell.seat.id : '')),
      ),
    [layout],
  );

  const focusSeat = useCallback((seatId: string) => {
    containerRef.current
      ?.querySelector<HTMLButtonElement>(`[data-seat-id="${seatId}"]`)
      ?.focus();
  }, []);

  /**
   * Arrow keys walk the map. Tabbing through 150 seats is technically
   * possible but miserable, so this gives the seat grid the navigation
   * behaviour a sighted keyboard user expects.
   */
  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement;
      const seatId = target.dataset?.seatId;
      if (!seatId) return;

      const rowIndex = grid.findIndex((row) => row.includes(seatId));
      if (rowIndex === -1) return;
      const columnIndex = grid[rowIndex].indexOf(seatId);

      // In RTL the visual left/right are swapped.
      const rtl = document.documentElement.dir === 'rtl';
      const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
      const backward = rtl ? 'ArrowRight' : 'ArrowLeft';

      let nextRow = rowIndex;
      let nextColumn = columnIndex;

      switch (event.key) {
        case forward:
          nextColumn = Math.min(columnIndex + 1, grid[rowIndex].length - 1);
          break;
        case backward:
          nextColumn = Math.max(columnIndex - 1, 0);
          break;
        case 'ArrowDown':
          nextRow = Math.min(rowIndex + 1, grid.length - 1);
          break;
        case 'ArrowUp':
          nextRow = Math.max(rowIndex - 1, 0);
          break;
        case 'Home':
          nextColumn = 0;
          break;
        case 'End':
          nextColumn = grid[rowIndex].length - 1;
          break;
        default:
          return;
      }

      event.preventDefault();
      // Rows differ in length — clamp when moving between them.
      const targetRow = grid[nextRow];
      const targetId = targetRow[Math.min(nextColumn, targetRow.length - 1)];
      if (targetId) focusSeat(targetId);
    },
    [grid, focusSeat],
  );

  const seatStyle = {
    '--seat': 'clamp(1.55rem, 4vw, 1.75rem)',
    '--seat-gap': 'clamp(0.2rem, 0.6vw, 0.3rem)',
  } as CSSProperties;

  return (
    <div className="space-y-5">
      <ScreenIndicator />

      <div className="relative">
        {/* Edge fades hint that the map scrolls sideways on narrow screens. */}
        <div
          className="pointer-events-none absolute inset-y-0 start-0 z-10 w-6 bg-linear-to-r from-[var(--surface-raised)] to-transparent rtl:bg-linear-to-l"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-y-0 end-0 z-10 w-6 bg-linear-to-l from-[var(--surface-raised)] to-transparent rtl:bg-linear-to-r"
          aria-hidden="true"
        />

        <div
          ref={containerRef}
          role="group"
          aria-label={t('booking.seatMapLabel')}
          onKeyDown={onKeyDown}
          style={seatStyle}
          className="scrollbar-slim overflow-x-auto overflow-y-hidden px-6 py-1"
        >
          <div className="mx-auto flex w-max flex-col items-center gap-[var(--seat-gap)]">
            {layout.rows.map((row) => (
              <div key={row.row} className="flex items-center gap-[var(--seat-gap)]">
                <span
                  aria-hidden="true"
                  className="w-5 shrink-0 text-center text-[0.6rem] font-bold text-ink-400"
                >
                  {row.row}
                </span>

                {row.cells.map((cell, cellIndex) => {
                  if (cell.kind === 'aisle') {
                    return (
                      <span
                        key={`aisle-${row.row}-${cellIndex}`}
                        className="w-[var(--seat)] shrink-0"
                        aria-hidden="true"
                      />
                    );
                  }

                  const { seat } = cell;
                  const isOwn = ownSeats.has(seat.id);
                  const state: SeatState = selected.has(seat.id)
                    ? 'selected'
                    : occupied.has(seat.id)
                      ? 'occupied'
                      : 'available';

                  return (
                    <Seat
                      key={seat.id}
                      seat={seat}
                      state={state}
                      isOwn={isOwn}
                      onToggle={onToggle}
                    />
                  );
                })}

                <span
                  aria-hidden="true"
                  className="w-5 shrink-0 text-center text-[0.6rem] font-bold text-ink-400"
                >
                  {row.row}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className={cn('px-6 text-center text-xs text-ink-400')}>{t('booking.selectSeatsHint')}</p>
    </div>
  );
}

# Lumière Cinema

A bilingual cinema reservation platform that runs entirely in the browser. Browse the
programme, open a film, pick a day and a screening, choose your seats on a true-to-life
auditorium map, review the total and confirm. Reservations persist across reloads, sync
between tabs, and can be cancelled — which releases the seats again.

**There is no backend.** No API, no database, no accounts, no serverless functions. The
catalogue is deterministic seed data generated at load time; your reservations live in
`localStorage` and are broadcast between tabs with `BroadcastChannel`.

## Getting started

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm build      # typecheck + production build into dist/
pnpm preview    # serve the production build
pnpm lint
```

## What it does

- **Browse** — landing page with a featured-film hero and Now Showing / Popular /
  Coming Soon carousels, plus a filterable catalogue (title or director search, genre,
  status).
- **Film detail** — synopsis, cast, crew, certificate, running time, and the week's
  programme grouped by day across three venues.
- **Seat selection** — a real auditorium layout with a curved screen, aisles, rows that
  widen toward the back, and standard / premium / VIP tiers. Live seat counts, per-tier
  pricing and a running total.
- **Reservations** — ticket-style confirmation with a reference number, a reservations
  page, and cancellation behind a confirmation dialog. The ticket downloads as a PDF
  through the browser’s print dialog, which is what keeps the Persian ticket
  correctly shaped and right-to-left (JS PDF libraries do not do Arabic shaping or bidi).
- **English and Persian** — full RTL layout for Persian, with Jalali dates and Persian
  digits via `Intl`.
- **Light and dark themes** — system preference on first visit, then remembered.

## Handling booking conflicts

Browser storage cannot give real transactional guarantees, and this app does not pretend
otherwise. What it does instead:

1. Every open tab subscribes to the reservation store. A booking in one tab immediately
   updates the seat map in the others; seats you were holding that have just gone are
   dropped from your selection and you are told which.
2. Immediately before a reservation is written, `createReservation` re-reads storage —
   not React state — and re-checks every selected seat against it.
3. If any seat has been taken in the meantime the whole reservation is rejected, nothing
   is written, and a dialog names the seats that went. Seats nobody else wanted stay
   selected so you only have to replace what you lost.

This closes the window to the few milliseconds between the re-check and the write, which
is as good as it gets without a server.

## Architecture

```
src/
  data/        Deterministic seed data (films, cinemas, halls, generated showtimes)
  lib/         Storage, reservation store, seat-map maths, formatting, dialogs
  i18n/        English (source of truth for the key shape) and Persian
  hooks/       useReservations, useFormat, useLocale, usePageTitle
  context/     Theme provider
  components/  layout · ui · movies · booking · reservations
  pages/       One file per route, lazily loaded
  types/       Domain model
```

A few deliberate choices:

- **One storage module.** Nothing else touches `localStorage`. It degrades to an
  in-memory map when storage is blocked, and drops entries that fail validation, so a
  corrupt value cannot permanently break the app.
- **The reservation store is an external store.** Components read it through
  `useSyncExternalStore`, which is what makes cross-tab updates re-render every open page
  without any global state library.
- **Persian is type-checked against English.** `Translation` is derived from the English
  resource, so a missing or misspelled Persian key fails the build.
- **The home page rails are Embla carousels.** Embla handles dragging, momentum,
  snapping and bounds, including RTL; the component supplies the layout, the arrow
  controls and the edge fades.
- **Showtimes are generated from today's date**, so the schedule is always current without
  storing anything.

## Deployment

Static site, deployable to Vercel as-is — no environment variables, no backend.
`vercel.json` rewrites unknown paths to `index.html` so React Router's client-side routes
survive a hard refresh.

```bash
pnpm build      # outputs dist/
```

## Notes

A demonstration build: no real tickets are sold and no payment is taken. Nothing is
tracked and nothing leaves the device — a reservation is only a reference number, a
showtime and a list of seats. Poster artwork is loaded from public Wikipedia URLs and
belongs to the respective rights holders; if an image fails to load, the UI falls back to
a generated card rather than a broken image.

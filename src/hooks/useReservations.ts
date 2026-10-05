import { useSyncExternalStore } from 'react';

import type { Reservation } from '../types';
import { getReservations, subscribe } from '../lib/reservations';

/**
 * Subscribes to the reservation store. The store hands back a stable array
 * reference until something actually changes, which is what
 * useSyncExternalStore needs — and it means a write in another tab re-renders
 * every open page automatically.
 */
export function useReservations(): readonly Reservation[] {
  return useSyncExternalStore(subscribe, getReservations, getReservations);
}

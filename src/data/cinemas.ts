import type { Cinema, Hall } from '../types';

export const CINEMAS: readonly Cinema[] = [
  {
    id: 'lumiere-downtown',
    name: { en: 'Lumière Downtown', fa: 'لومیر مرکز شهر' },
    city: { en: 'Downtown', fa: 'مرکز شهر' },
    address: { en: '12 Marquee Street, Downtown', fa: 'خیابان مارکی، شماره ۱۲، مرکز شهر' },
    imageUrl:
      'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1400&q=70',
  },
  {
    id: 'lumiere-riverside',
    name: { en: 'Lumière Riverside', fa: 'لومیر کنار رود' },
    city: { en: 'Riverside', fa: 'کنار رود' },
    address: { en: '4 Harbour Walk, Riverside', fa: 'گذر بندر، شماره ۴، کنار رود' },
    imageUrl:
      'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1400&q=70',
  },
  {
    id: 'lumiere-northgate',
    name: { en: 'Lumière Northgate', fa: 'لومیر دروازه شمالی' },
    city: { en: 'Northgate', fa: 'دروازه شمالی' },
    address: { en: '88 Reel Avenue, Northgate', fa: 'خیابان ریل، شماره ۸۸، دروازه شمالی' },
    imageUrl:
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1400&q=70',
  },
] as const;

/**
 * Four auditorium shapes. Rows widen toward the back and aisles are expressed
 * as fractions, which keeps the map looking like a real theatre rather than a
 * uniform grid.
 */
export const HALLS: readonly Hall[] = [
  {
    id: 'hall-grand',
    cinemaId: 'lumiere-downtown',
    name: { en: 'The Grand', fa: 'سالن بزرگ' },
    format: 'IMAX',
    rowSizes: [12, 14, 14, 16, 16, 18, 18, 20, 20, 16],
    aisleFractions: [0.22, 0.78],
    premiumRows: [5, 6, 7],
    vipRows: [10],
  },
  {
    id: 'hall-atrium',
    cinemaId: 'lumiere-downtown',
    name: { en: 'Atrium 2', fa: 'آتریوم ۲' },
    format: '3D',
    rowSizes: [10, 12, 12, 14, 14, 16, 16, 12],
    aisleFractions: [0.25, 0.75],
    premiumRows: [4, 5, 6],
    vipRows: [8],
  },
  {
    id: 'hall-harbour',
    cinemaId: 'lumiere-riverside',
    name: { en: 'Harbour Screen', fa: 'پرده بندر' },
    format: '2D',
    rowSizes: [10, 10, 12, 12, 14, 14, 14, 10],
    aisleFractions: [0.3, 0.7],
    premiumRows: [4, 5],
    vipRows: [8],
  },
  {
    id: 'hall-reel',
    cinemaId: 'lumiere-northgate',
    name: { en: 'Reel One', fa: 'ریل یک' },
    format: '2D',
    rowSizes: [8, 10, 10, 12, 12, 14, 14],
    aisleFractions: [0.28, 0.72],
    premiumRows: [4, 5],
    vipRows: [7],
  },
] as const;

export function getCinema(id: string): Cinema | undefined {
  return CINEMAS.find((c) => c.id === id);
}

export function getHall(id: string): Hall | undefined {
  return HALLS.find((h) => h.id === id);
}

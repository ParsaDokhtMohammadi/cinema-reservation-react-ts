/**
 * The single place that touches localStorage.
 *
 * Everything here is defensive: storage can be unavailable (private mode,
 * blocked cookies, quota), and the stored JSON can be stale from an older
 * build or corrupted by hand. In all of those cases we fall back to an
 * in-memory map so the app keeps working instead of crashing.
 */

export const STORAGE_KEYS = {
  reservations: 'lumiere.reservations.v1',
  theme: 'lumiere.theme',
  locale: 'lumiere.locale',
} as const;

type StorageStatus = 'available' | 'unavailable';

let status: StorageStatus | null = null;
const memoryFallback = new Map<string, string>();

function probe(): StorageStatus {
  try {
    const probeKey = '__lumiere_probe__';
    window.localStorage.setItem(probeKey, '1');
    window.localStorage.removeItem(probeKey);
    return 'available';
  } catch {
    return 'unavailable';
  }
}

/** True when the browser is actually letting us persist data. */
export function isPersistenceAvailable(): boolean {
  if (status === null) status = typeof window === 'undefined' ? 'unavailable' : probe();
  return status === 'available';
}

export function readRaw(key: string): string | null {
  if (!isPersistenceAvailable()) return memoryFallback.get(key) ?? null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return memoryFallback.get(key) ?? null;
  }
}

export function writeRaw(key: string, value: string): boolean {
  if (!isPersistenceAvailable()) {
    memoryFallback.set(key, value);
    return false;
  }
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    // Quota exceeded or storage revoked mid-session.
    memoryFallback.set(key, value);
    return false;
  }
}

export function removeRaw(key: string): void {
  memoryFallback.delete(key);
  if (!isPersistenceAvailable()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* nothing useful to do */
  }
}

/**
 * Reads and validates JSON. A parse failure or a value that fails `validate`
 * is treated as "no data" and the bad entry is dropped, so one corrupt write
 * can't permanently break the app.
 */
export function readJson<T>(key: string, validate: (value: unknown) => value is T): T | null {
  const raw = readRaw(key);
  if (raw === null) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    removeRaw(key);
    return null;
  }

  if (!validate(parsed)) {
    removeRaw(key);
    return null;
  }

  return parsed;
}

export function writeJson(key: string, value: unknown): boolean {
  try {
    return writeRaw(key, JSON.stringify(value));
  } catch {
    return false;
  }
}

type ClassValue = string | number | false | null | undefined;

/** Joins conditional class names. Small enough not to warrant a dependency. */
export function cn(...values: ClassValue[]): string {
  return values.filter((value): value is string | number => Boolean(value)).join(' ');
}

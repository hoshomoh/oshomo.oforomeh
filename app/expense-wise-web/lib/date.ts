import {
  format,
  parseISO,
  getTime,
  getYear,
  getMonth,
  compareAsc,
  compareDesc,
  toDate,
} from 'date-fns';

/**
 * Format a Date as an ISO date string (YYYY-MM-DD).
 */
export function toISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Format a Date as a month key (YYYY-MM).
 */
export function toMonthKey(date: Date): string {
  return format(date, 'yyyy-MM');
}

/**
 * Parse a month key (YYYY-MM) into a Date (first day of that month).
 */
export function parseMonthKey(monthKey: string): Date {
  return parseISO(monthKey + '-01');
}

/**
 * Compare two dates in descending order (newest first).
 * Use in .sort(): items.sort((a, b) => compareDatesDesc(a.date, b.date))
 */
export function compareDatesDesc(a: Date, b: Date): number {
  return compareDesc(a, b);
}

/**
 * Compare two dates in ascending order (oldest first).
 */
export function compareDatesAsc(a: Date, b: Date): number {
  return compareAsc(a, b);
}

/**
 * Get a numeric timestamp from a Date (equivalent to Date.getTime()).
 */
export { getTime };

/**
 * Get the full year from a Date (equivalent to Date.getFullYear()).
 */
export { getYear };

/**
 * Get the 0-indexed month from a Date (equivalent to Date.getMonth()).
 */
export { getMonth };

/**
 * Safely convert a Date, string, or number into a Date object.
 */
export function ensureDate(value: Date | string | number): Date {
  if (typeof value === 'string') {
    return parseISO(value);
  }
  return toDate(value);
}

/**
 * Format a Date for user-facing display (e.g., "Feb 2024", "Mar 15, 2025").
 */
export function formatDateDisplay(date: Date, pattern: string): string {
  return format(date, pattern);
}

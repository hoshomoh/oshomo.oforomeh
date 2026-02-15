import { CURRENCY_SYMBOLS } from './constants';
import { getCategoryMeta } from './constants';
import { format, formatDistanceToNow } from 'date-fns';

/**
 * Format a number as currency with the appropriate symbol.
 */
export function formatCurrency(amount: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency;
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));
  return `${amount < 0 ? '-' : ''}${symbol}${formatted}`;
}

/**
 * Format a number as compact currency (e.g., "€1.2K").
 */
export function formatCurrencyCompact(amount: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency;
  const abs = Math.abs(amount);
  let formatted: string;
  if (abs >= 1_000_000) {
    formatted = `${(abs / 1_000_000).toFixed(1)}M`;
  } else if (abs >= 1_000) {
    formatted = `${(abs / 1_000).toFixed(1)}K`;
  } else {
    formatted = abs.toFixed(2);
  }
  return `${amount < 0 ? '-' : ''}${symbol}${formatted}`;
}

/**
 * Format a date for display.
 */
export function formatDate(date: Date | string | number, pattern = 'MMM d, yyyy'): string {
  const d = date instanceof Date ? date : new Date(date);
  return format(d, pattern);
}

/**
 * Format a date as relative time (e.g., "2 days ago").
 */
export function formatRelativeDate(date: Date | string | number): string {
  const d = date instanceof Date ? date : new Date(date);
  return formatDistanceToNow(d, { addSuffix: true });
}

/**
 * Get a human-readable label for a category ID.
 */
export function getCategoryLabel(categoryId: string): string {
  return getCategoryMeta(categoryId).label;
}

/**
 * Format a percentage value.
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

/**
 * Format a monthly balance key (e.g., "2024_11" -> "Nov 2024").
 */
export function formatMonthKey(key: string): string {
  const [year, month] = key.split('_').map(Number);
  if (!year || !month) {
    return key;
  }
  const date = new Date(year, month - 1, 1);
  return format(date, 'MMM yyyy');
}

/**
 * Sort monthly balance keys chronologically.
 */
export function sortMonthKeys(keys: string[]): string[] {
  return [...keys].sort((a, b) => {
    const [ay, am] = a.split('_').map(Number);
    const [by, bm] = b.split('_').map(Number);
    return ay - by || am - bm;
  });
}

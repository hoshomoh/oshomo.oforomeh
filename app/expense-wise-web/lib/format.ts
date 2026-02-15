import { CURRENCY_SYMBOLS } from './constants';
import { getCategoryMeta } from './constants';
import { format, formatDistanceToNow } from 'date-fns';
import { ensureDate, parseMonthKey } from './date';
import { TransactionType } from './types';
import type { ParsedAccount } from './types';

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
 * Format a date for display.
 */
export function formatDate(date: Date | string | number, pattern = 'MMM d, yyyy'): string {
  return format(ensureDate(date), pattern);
}

/**
 * Format a date as relative time (e.g., "2 days ago").
 */
export function formatRelativeDate(date: Date | string | number): string {
  return formatDistanceToNow(ensureDate(date), { addSuffix: true });
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
  return format(parseMonthKey(`${year}-${String(month).padStart(2, '0')}`), 'MMM yyyy');
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

/**
 * Get the display name for an account, falling back to the raw ID.
 */
export function getAccountName(accountId: string, accounts?: ParsedAccount[]): string {
  if (!accounts) {
    return accountId;
  }
  const account = accounts.find((a) => a.id === accountId);
  return account?.name ?? accountId;
}

/**
 * Truncate a description string to a maximum length, appending "..." if truncated.
 */
export function truncateDescription(description: string, maxLength = 40): string {
  if (description.length <= maxLength) {
    return description;
  }
  return `${description.slice(0, maxLength)}...`;
}

/**
 * Format a byte size as a human-readable string (GB or MB).
 */
export function formatSize(bytes: number): string {
  const gb = bytes / (1024 * 1024 * 1024);
  return gb >= 1 ? `${gb.toFixed(1)} GB` : `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
}

/**
 * Calculate the percentage change between a current and previous value.
 * Returns null if there is no valid previous value to compare against.
 */
export function calculatePercentageChange(current: number, previous?: number): number | null {
  if (previous === undefined || previous === 0) {
    return null;
  }
  return ((current - previous) / previous) * 100;
}

/**
 * Get the Tailwind color class for a transaction amount based on its type.
 */
export function getAmountColorClass(type: TransactionType): string {
  switch (type) {
    case TransactionType.INCOME:
      return 'text-emerald-600 dark:text-emerald-400';
    case TransactionType.EXPENSE:
      return 'text-red-600 dark:text-red-400';
    case TransactionType.TRANSFER:
      return 'text-blue-600 dark:text-blue-400';
    default:
      return '';
  }
}

/**
 * Get the badge variant for a transaction type.
 */
export function getTypeBadgeVariant(
  type: TransactionType,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (type) {
    case TransactionType.INCOME:
      return 'default';
    case TransactionType.EXPENSE:
      return 'destructive';
    case TransactionType.TRANSFER:
      return 'secondary';
    default:
      return 'outline';
  }
}

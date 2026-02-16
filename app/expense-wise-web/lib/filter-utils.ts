import {
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  endOfYear,
  subYears,
  parseISO,
} from 'date-fns';
import type { DashboardFilters, DateRangePreset } from './types';

export function getDateRangeForPreset(preset: DateRangePreset): { from: Date; to: Date } {
  const now = new Date();

  switch (preset) {
    case 'this-month':
      return { from: startOfMonth(now), to: endOfMonth(now) };
    case 'last-month': {
      const lastMonth = subMonths(now, 1);
      return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
    }
    case 'last-3-months':
      return { from: startOfMonth(subMonths(now, 2)), to: endOfMonth(now) };
    case 'last-6-months':
      return { from: startOfMonth(subMonths(now, 5)), to: endOfMonth(now) };
    case 'this-year':
      return { from: startOfYear(now), to: endOfYear(now) };
    case 'last-year': {
      const lastYear = subYears(now, 1);
      return { from: startOfYear(lastYear), to: endOfYear(lastYear) };
    }
    case 'all-time':
      return { from: parseISO('2000-01-01'), to: endOfMonth(now) };
    case 'custom':
      return { from: startOfMonth(now), to: endOfMonth(now) };
    default:
      return { from: startOfMonth(now), to: endOfMonth(now) };
  }
}

export function createDefaultFilters(): DashboardFilters {
  return {
    dateRange: getDateRangeForPreset('this-month'),
    datePreset: 'this-month',
    currency: 'all',
    accountId: 'all',
    categoryId: 'all',
    groupId: 'all',
  };
}

export function applyDatePresetSync(
  next: DashboardFilters,
  partial: Partial<DashboardFilters>,
): DashboardFilters {
  // If both datePreset and dateRange are provided, dateRange wins (more specific)
  if (partial.datePreset && partial.datePreset !== 'custom' && !partial.dateRange) {
    next.dateRange = getDateRangeForPreset(partial.datePreset);
  }
  if (partial.dateRange) {
    next.datePreset = 'custom';
  }
  return next;
}

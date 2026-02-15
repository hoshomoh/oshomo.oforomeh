'use client';

import * as React from 'react';
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  endOfYear,
  subYears,
  isWithinInterval,
} from 'date-fns';
import type {
  DashboardFilters,
  DateRangePreset,
  ParsedTransaction,
  ParsedAccount,
  Currency,
} from '../lib/types';

function getDateRangeForPreset(preset: DateRangePreset): { from: Date; to: Date } {
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
      return { from: new Date(2000, 0, 1), to: endOfMonth(now) };
    case 'custom':
      // For custom, keep the current range (handled by caller)
      return { from: startOfMonth(now), to: endOfMonth(now) };
    default:
      return { from: startOfMonth(now), to: endOfMonth(now) };
  }
}

function createDefaultFilters(): DashboardFilters {
  return {
    dateRange: getDateRangeForPreset('this-month'),
    datePreset: 'this-month',
    currency: 'all',
    accountId: 'all',
    categoryId: 'all',
    groupId: 'all',
    compareEnabled: false,
    compareDateRange: getDateRangeForPreset('last-month'),
    compareDatePreset: 'last-month',
  };
}

export function useFilters(
  transactions: ParsedTransaction[],
  accounts: ParsedAccount[],
  initialOverrides?: Partial<DashboardFilters>,
) {
  const [filters, setFilters] = React.useState<DashboardFilters>(() => {
    const defaults = createDefaultFilters();
    if (!initialOverrides) {
      return defaults;
    }
    const merged = { ...defaults, ...initialOverrides };
    if (initialOverrides.datePreset && initialOverrides.datePreset !== 'custom') {
      merged.dateRange = getDateRangeForPreset(initialOverrides.datePreset);
    }
    if (initialOverrides.compareDatePreset && initialOverrides.compareDatePreset !== 'custom') {
      merged.compareDateRange = getDateRangeForPreset(initialOverrides.compareDatePreset);
    }
    return merged;
  });

  const updateFilter = React.useCallback(
    <K extends keyof DashboardFilters>(key: K, value: DashboardFilters[K]) => {
      setFilters((prev) => {
        const next = { ...prev, [key]: value };

        // When datePreset changes, auto-update the date range
        if (key === 'datePreset' && value !== 'custom') {
          next.dateRange = getDateRangeForPreset(value as DateRangePreset);
        }

        // When dateRange is manually set, switch to custom preset
        if (key === 'dateRange') {
          next.datePreset = 'custom';
        }

        // When compareDatePreset changes, auto-update comparison date range
        if (key === 'compareDatePreset' && value !== 'custom') {
          next.compareDateRange = getDateRangeForPreset(value as DateRangePreset);
        }

        // When compareDateRange is manually set, switch to custom preset
        if (key === 'compareDateRange') {
          next.compareDatePreset = 'custom';
        }

        return next;
      });
    },
    [],
  );

  const updateFilters = React.useCallback((partial: Partial<DashboardFilters>) => {
    setFilters((prev) => {
      const next = { ...prev, ...partial };

      // When datePreset changes, auto-update the date range
      if (partial.datePreset && partial.datePreset !== 'custom') {
        next.dateRange = getDateRangeForPreset(partial.datePreset);
      }

      // When dateRange is manually set, switch to custom preset
      if (partial.dateRange) {
        next.datePreset = 'custom';
      }

      // When compareDatePreset changes, auto-update comparison date range
      if (partial.compareDatePreset && partial.compareDatePreset !== 'custom') {
        next.compareDateRange = getDateRangeForPreset(partial.compareDatePreset);
      }

      // When compareDateRange is manually set, switch to custom preset
      if (partial.compareDateRange) {
        next.compareDatePreset = 'custom';
      }

      return next;
    });
  }, []);

  const resetFilters = React.useCallback(() => {
    setFilters(createDefaultFilters());
  }, []);

  // Build an account-to-currency lookup for currency filtering
  const accountCurrencyMap = React.useMemo(() => {
    const map = new Map<string, Currency>();
    for (const account of accounts) {
      map.set(account.id, account.currency);
    }
    return map;
  }, [accounts]);

  const applyNonDateFilters = React.useCallback(
    (tx: ParsedTransaction): boolean => {
      // Currency filter
      if (filters.currency !== 'all' && tx.currency !== filters.currency) {
        return false;
      }

      // Account filter
      if (filters.accountId !== 'all' && tx.accountId !== filters.accountId) {
        return false;
      }

      // Category filter
      if (filters.categoryId !== 'all' && tx.categoryId !== filters.categoryId) {
        return false;
      }

      // Group filter
      if (filters.groupId !== 'all' && tx.groupId !== filters.groupId) {
        return false;
      }

      return true;
    },
    [filters.currency, filters.accountId, filters.categoryId, filters.groupId],
  );

  const filteredTransactions = React.useMemo(() => {
    return transactions.filter((tx) => {
      // Date range filter
      if (
        !isWithinInterval(tx.date, {
          start: filters.dateRange.from,
          end: filters.dateRange.to,
        })
      ) {
        return false;
      }

      return applyNonDateFilters(tx);
    });
  }, [transactions, filters.dateRange, applyNonDateFilters]);

  const comparisonTransactions = React.useMemo(() => {
    if (!filters.compareEnabled) {
      return [];
    }

    return transactions.filter((tx) => {
      // Comparison date range filter
      if (
        !isWithinInterval(tx.date, {
          start: filters.compareDateRange.from,
          end: filters.compareDateRange.to,
        })
      ) {
        return false;
      }

      return applyNonDateFilters(tx);
    });
  }, [transactions, filters.compareEnabled, filters.compareDateRange, applyNonDateFilters]);

  return {
    filters,
    setFilters,
    updateFilter,
    updateFilters,
    resetFilters,
    filteredTransactions,
    comparisonTransactions,
    accountCurrencyMap,
  };
}

'use client';

import * as React from 'react';
import type { DashboardFilters, DateRangePreset, ParsedTransaction } from '../lib/types';
import {
  getDateRangeForPreset,
  createDefaultFilters,
  applyDatePresetSync,
} from '../lib/filter-utils';
import { filterTransactions } from '../lib/filter-transactions';

export function useFilters(
  transactions: ParsedTransaction[],
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

        return next;
      });
    },
    [],
  );

  const updateFilters = React.useCallback((partial: Partial<DashboardFilters>) => {
    setFilters((prev) => applyDatePresetSync({ ...prev, ...partial }, partial));
  }, []);

  const resetFilters = React.useCallback(() => {
    setFilters(createDefaultFilters());
  }, []);

  const filteredTransactions = React.useMemo(
    () => filterTransactions(transactions, filters),
    [transactions, filters],
  );

  return {
    filters,
    setFilters,
    updateFilter,
    updateFilters,
    resetFilters,
    filteredTransactions,
  };
}

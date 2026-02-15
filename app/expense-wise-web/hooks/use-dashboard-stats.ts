'use client';

import * as React from 'react';
import { computeDashboardStats } from '../lib/dashboard-calculations';
import type { ParsedTransaction, ParsedAccount, ParsedBudget } from '../lib/types';

export type { DashboardStats } from '../lib/dashboard-calculations';

export function useDashboardStats(
  filteredTransactions: ParsedTransaction[],
  accounts: ParsedAccount[],
  budget: ParsedBudget | undefined,
  dateRange?: { from: Date; to: Date },
) {
  return React.useMemo(
    () => computeDashboardStats(filteredTransactions, budget, dateRange),
    [filteredTransactions, budget, dateRange],
  );
}

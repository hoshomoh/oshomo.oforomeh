'use client';

import * as React from 'react';
import { computeDashboardStats } from '../lib/dashboard-calculations';
import type {
  ParsedTransaction,
  ParsedAccount,
  ParsedBudget,
  DashboardFilters,
  ExchangeRates,
} from '../lib/types';

export type { DashboardStats } from '../lib/dashboard-calculations';

export function useDashboardStats(
  allTransactions: ParsedTransaction[],
  accounts: ParsedAccount[],
  budget: ParsedBudget | undefined,
  filters: DashboardFilters,
  exchangeRates: ExchangeRates | null,
) {
  return React.useMemo(
    () => computeDashboardStats(allTransactions, accounts, budget, filters, exchangeRates),
    [allTransactions, accounts, budget, filters, exchangeRates],
  );
}

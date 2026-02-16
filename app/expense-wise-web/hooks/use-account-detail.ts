import * as React from 'react';
import { compareDesc } from 'date-fns';
import { useDashboardStats } from './use-dashboard-stats';
import { sortMonthKeys, formatMonthKey } from '../lib/format';
import { createDefaultFilters, getDateRangeForPreset } from '../lib/filter-utils';
import type { ParsedTransaction, ParsedAccount, ParsedBudget, ExchangeRates } from '../lib/types';
import type { DashboardStats } from './use-dashboard-stats';

type BalanceChartPoint = {
  month: string;
  balance: number;
};

type AccountDetailResult = {
  account: ParsedAccount | undefined;
  accountTransactions: ParsedTransaction[];
  stats: DashboardStats;
  balanceChartData: BalanceChartPoint[];
  recentTransactions: ParsedTransaction[];
};

export function useAccountDetail(
  accountId: string,
  transactions: ParsedTransaction[],
  accounts: ParsedAccount[],
  budgets: ParsedBudget[],
  exchangeRates: ExchangeRates | null,
): AccountDetailResult {
  const account = React.useMemo(
    () => accounts.find((a) => a.id === accountId),
    [accounts, accountId],
  );

  const accountTransactions = React.useMemo(
    () => transactions.filter((tx) => tx.accountId === accountId),
    [transactions, accountId],
  );

  const accountFilters = React.useMemo(() => {
    const filters = createDefaultFilters();
    // Use all-time so stats cover the complete account history
    filters.datePreset = 'all-time';
    filters.dateRange = getDateRangeForPreset('all-time');
    // Scope to this account
    filters.accountId = accountId;
    if (account) {
      filters.currency = account.currency;
    }
    return filters;
  }, [accountId, account]);
  const stats = useDashboardStats(
    accountTransactions,
    accounts,
    budgets[0],
    accountFilters,
    exchangeRates,
  );

  const balanceChartData = React.useMemo(() => {
    if (!account) {
      return [];
    }
    const keys = sortMonthKeys(Object.keys(account.monthlyBalance));
    return keys.map((key) => ({
      month: formatMonthKey(key),
      balance: account.monthlyBalance[key],
    }));
  }, [account]);

  const recentTransactions = React.useMemo(
    () => [...accountTransactions].sort((a, b) => compareDesc(a.date, b.date)).slice(0, 10),
    [accountTransactions],
  );

  return { account, accountTransactions, stats, balanceChartData, recentTransactions };
}

import * as React from 'react';
import { useDashboardStats } from './use-dashboard-stats';
import { sortMonthKeys, formatMonthKey } from '../lib/format';
import type { ParsedTransaction, ParsedAccount, ParsedBudget } from '../lib/types';
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
): AccountDetailResult {
  const account = React.useMemo(
    () => accounts.find((a) => a.id === accountId),
    [accounts, accountId],
  );

  const accountTransactions = React.useMemo(
    () => transactions.filter((tx) => tx.accountId === accountId),
    [transactions, accountId],
  );

  const stats = useDashboardStats(accountTransactions, accounts, budgets[0]);

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
    () => [...accountTransactions].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10),
    [accountTransactions],
  );

  return { account, accountTransactions, stats, balanceChartData, recentTransactions };
}

'use client';

import * as React from 'react';
import {
  format,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  isWithinInterval,
  addMonths,
  differenceInMonths,
} from 'date-fns';
import type {
  ParsedTransaction,
  ParsedAccount,
  ParsedBudget,
  TransactionType,
  Currency,
} from '../lib/types';

type CategoryBreakdown = {
  categoryId: string;
  amount: number;
  percentage: number;
};

type MonthlyDataPoint = {
  month: string;
  income: number;
  expenses: number;
};

type BudgetComparisonItem = {
  categoryId: string;
  budgeted: number;
  actual: number;
  percentage: number;
};

export type DashboardStats = {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  transactionCount: number;
  prevMonthTotalExpenses: number;
  prevMonthTotalIncome: number;
  expensesByCategory: Record<string, number>;
  monthlyData: MonthlyDataPoint[];
  topCategories: CategoryBreakdown[];
  budgetComparison: BudgetComparisonItem[];
  primaryCurrency: Currency;
};

/**
 * Determine the primary currency from a set of transactions.
 * Returns the currency that appears in the most transactions.
 */
function getPrimaryCurrency(transactions: ParsedTransaction[]): Currency {
  const counts = new Map<Currency, number>();
  for (const tx of transactions) {
    counts.set(tx.currency, (counts.get(tx.currency) ?? 0) + 1);
  }

  let primary: Currency = 'EUR';
  let maxCount = 0;
  for (const [currency, count] of counts) {
    if (count > maxCount) {
      maxCount = count;
      primary = currency;
    }
  }

  return primary;
}

/**
 * Compute a display range that always covers at least 12 months.
 * - If range >= 12 months: use as-is
 * - If range < 12 months within a single year: expand to full calendar year
 * - If range < 12 months spanning 2+ years: extend backwards from end to cover 12 months
 */
function getDisplayRange(from: Date, to: Date): { displayFrom: Date; displayTo: Date } {
  const monthCount = differenceInMonths(to, from) + 1;
  if (monthCount >= 12) {
    return { displayFrom: startOfMonth(from), displayTo: startOfMonth(to) };
  }
  // Single calendar year: expand to full year
  if (from.getFullYear() === to.getFullYear()) {
    return {
      displayFrom: startOfYear(from),
      displayTo: startOfMonth(endOfYear(from)),
    };
  }
  // Spans 2+ years but < 12 months: extend backwards from end
  return {
    displayFrom: startOfMonth(subMonths(to, 11)),
    displayTo: startOfMonth(to),
  };
}

export function useDashboardStats(
  filteredTransactions: ParsedTransaction[],
  accounts: ParsedAccount[],
  budget: ParsedBudget | undefined,
  dateRange?: { from: Date; to: Date },
): DashboardStats {
  return React.useMemo(() => {
    // Determine the primary currency
    const primaryCurrency = getPrimaryCurrency(filteredTransactions);

    // Filter to only primary-currency transactions for monetary calculations
    const currencyTx = filteredTransactions.filter((tx) => tx.currency === primaryCurrency);

    // Income & expense totals
    const totalIncome = currencyTx
      .filter((tx) => tx.type === ('INCOME' as TransactionType))
      .reduce((sum, tx) => sum + tx.amount, 0);

    const totalExpenses = currencyTx
      .filter((tx) => tx.type === ('EXPENSE' as TransactionType))
      .reduce((sum, tx) => sum + tx.amount, 0);

    const netBalance = totalIncome - totalExpenses;
    const transactionCount = filteredTransactions.length;

    // Previous month comparison
    const now = new Date();
    const prevMonth = subMonths(now, 1);
    const prevMonthStart = startOfMonth(prevMonth);
    const prevMonthEnd = endOfMonth(prevMonth);

    const prevMonthTx = currencyTx.filter((tx) =>
      isWithinInterval(tx.date, { start: prevMonthStart, end: prevMonthEnd }),
    );

    const prevMonthTotalExpenses = prevMonthTx
      .filter((tx) => tx.type === ('EXPENSE' as TransactionType))
      .reduce((sum, tx) => sum + tx.amount, 0);

    const prevMonthTotalIncome = prevMonthTx
      .filter((tx) => tx.type === ('INCOME' as TransactionType))
      .reduce((sum, tx) => sum + tx.amount, 0);

    // Expenses by category
    const expensesByCategory: Record<string, number> = {};
    for (const tx of currencyTx) {
      if (tx.type === ('EXPENSE' as TransactionType) && tx.categoryId) {
        expensesByCategory[tx.categoryId] = (expensesByCategory[tx.categoryId] ?? 0) + tx.amount;
      }
    }

    // Monthly data (income vs expenses by month, sorted chronologically)
    const monthlyMap = new Map<string, { income: number; expenses: number }>();
    for (const tx of currencyTx) {
      const monthKey = format(tx.date, 'yyyy-MM');
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { income: 0, expenses: 0 });
      }
      const entry = monthlyMap.get(monthKey)!;
      if (tx.type === ('INCOME' as TransactionType)) {
        entry.income += tx.amount;
      } else if (tx.type === ('EXPENSE' as TransactionType)) {
        entry.expenses += tx.amount;
      }
    }

    // Fill in missing months to ensure at least 12 months
    if (dateRange) {
      const { displayFrom, displayTo } = getDisplayRange(dateRange.from, dateRange.to);
      let cursor = displayFrom;
      while (cursor <= displayTo) {
        const key = format(cursor, 'yyyy-MM');
        if (!monthlyMap.has(key)) {
          monthlyMap.set(key, { income: 0, expenses: 0 });
        }
        cursor = addMonths(cursor, 1);
      }
    }

    const monthlyData: MonthlyDataPoint[] = Array.from(monthlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        income: data.income,
        expenses: data.expenses,
      }));

    // Top categories (top 15 by expense amount)
    const totalCategoryExpenses = Object.values(expensesByCategory).reduce(
      (sum, val) => sum + val,
      0,
    );

    const topCategories: CategoryBreakdown[] = Object.entries(expensesByCategory)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([categoryId, amount]) => ({
        categoryId,
        amount,
        percentage: totalCategoryExpenses > 0 ? (amount / totalCategoryExpenses) * 100 : 0,
      }));

    // Budget comparison
    const budgetComparison: BudgetComparisonItem[] = [];
    if (budget) {
      for (const [categoryId, budgeted] of Object.entries(budget.categories)) {
        if (budgeted > 0) {
          const actual = expensesByCategory[categoryId] ?? 0;
          budgetComparison.push({
            categoryId,
            budgeted,
            actual,
            percentage: budgeted > 0 ? (actual / budgeted) * 100 : 0,
          });
        }
      }
      // Sort by percentage descending (most over-budget first)
      budgetComparison.sort((a, b) => b.percentage - a.percentage);
    }

    return {
      totalIncome,
      totalExpenses,
      netBalance,
      transactionCount,
      prevMonthTotalExpenses,
      prevMonthTotalIncome,
      expensesByCategory,
      monthlyData,
      topCategories,
      budgetComparison,
      primaryCurrency,
    };
  }, [filteredTransactions, budget, dateRange]);
}

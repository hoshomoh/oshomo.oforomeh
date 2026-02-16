import {
  format,
  subMonths,
  startOfMonth,
  startOfYear,
  endOfYear,
  isWithinInterval,
  addMonths,
  differenceInMonths,
  differenceInDays,
  subDays,
  getYear,
} from 'date-fns';
import { parseMonthKey } from './date';
import { getPrimaryCurrency } from './budget-utils';
import { convertCurrency } from './currency-conversion';
import type {
  ParsedTransaction,
  ParsedAccount,
  ParsedBudget,
  TransactionType,
  Currency,
  DashboardFilters,
  ExchangeRates,
} from './types';

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
  totalBalance: number;
  transactionCount: number;
  prevMonthTotalExpenses: number;
  prevMonthTotalIncome: number;
  comparisonLabel: string; // e.g. "vs last month", "vs previous period", "vs last 3 months"
  expensesByCategory: Record<string, number>;
  monthlyData: MonthlyDataPoint[];
  topCategories: CategoryBreakdown[];
  budgetComparison: BudgetComparisonItem[];
  primaryCurrency: Currency;
};

/**
 * Compute a display range that always covers at least 12 months.
 */
function getDisplayRange(from: Date, to: Date): { displayFrom: Date; displayTo: Date } {
  const monthCount = differenceInMonths(to, from) + 1;
  if (monthCount >= 12) {
    return { displayFrom: startOfMonth(from), displayTo: startOfMonth(to) };
  }
  if (getYear(from) === getYear(to)) {
    return {
      displayFrom: startOfYear(from),
      displayTo: startOfMonth(endOfYear(from)),
    };
  }
  return {
    displayFrom: startOfMonth(subMonths(to, 11)),
    displayTo: startOfMonth(to),
  };
}

/**
 * Compute all dashboard statistics in a single pass over the transactions array.
 * Applies filters for both current and previous periods, excluding date filter for previous period comparison.
 * All transactions are converted to the display currency using the provided exchange rates.
 */
export function computeDashboardStats(
  allTransactions: ParsedTransaction[],
  accounts: ParsedAccount[],
  budget: ParsedBudget | undefined,
  filters: DashboardFilters,
  exchangeRates: ExchangeRates | null,
): DashboardStats {
  const dateRange = filters.dateRange;

  // Determine display currency based on filters
  const displayCurrency: Currency =
    filters.currency !== 'all' ? filters.currency : getPrimaryCurrency(allTransactions);

  // Helper to convert amount to display currency
  const convertAmount = (amount: number, fromCurrency: Currency): number => {
    if (!exchangeRates) {
      return fromCurrency === displayCurrency ? amount : 0;
    }
    return convertCurrency(amount, fromCurrency, displayCurrency, exchangeRates);
  };

  // Calculate total balance from accounts (respects account and currency filters)
  const filteredAccounts = accounts.filter((acc) => {
    // Apply account filter
    if (filters.accountId !== 'all' && acc.id !== filters.accountId) {
      return false;
    }
    // Apply currency filter - when filtering by currency, only show accounts in that currency
    if (filters.currency !== 'all' && acc.currency !== filters.currency) {
      return false;
    }
    return true;
  });

  const totalBalance = filteredAccounts.reduce((sum, account) => {
    return sum + convertAmount(account.balance, account.currency);
  }, 0);

  // Determine current and comparison periods
  const currentPeriodInterval = { start: dateRange.from, end: dateRange.to };

  // Calculate previous period with same duration as selected range
  const selectedDuration = differenceInDays(dateRange.to, dateRange.from) + 1; // +1 to include both dates
  const prevPeriodEnd = subDays(dateRange.from, 1);
  const prevPeriodStart = subDays(prevPeriodEnd, selectedDuration - 1);
  const prevPeriodInterval = { start: prevPeriodStart, end: prevPeriodEnd };

  // Generate appropriate comparison label
  const monthsDiff = differenceInMonths(dateRange.to, dateRange.from);
  let comparisonLabel: string;
  if (monthsDiff === 0) {
    comparisonLabel = 'vs previous month';
  } else if (monthsDiff === 2) {
    comparisonLabel = 'vs previous 3 months';
  } else if (monthsDiff === 5) {
    comparisonLabel = 'vs previous 6 months';
  } else if (monthsDiff === 11) {
    comparisonLabel = 'vs previous year';
  } else {
    comparisonLabel = 'vs previous period';
  }

  // Accumulators — filled in a single pass
  let totalIncome = 0;
  let totalExpenses = 0;
  let prevMonthTotalIncome = 0;
  let prevMonthTotalExpenses = 0;
  const expensesByCategory: Record<string, number> = {};
  const monthlyMap = new Map<string, { income: number; expenses: number }>();
  let transactionCount = 0;

  // Helper to check if transaction matches non-date, non-currency filters
  // Note: Currency filtering is now handled by conversion, not exclusion
  const matchesFilters = (tx: ParsedTransaction): boolean => {
    // If user selected a specific currency filter, only include that currency
    // (we'll still convert it, but this allows filtering by original currency)
    if (filters.currency !== 'all' && tx.currency !== filters.currency) {
      return false;
    }
    if (filters.accountId !== 'all' && tx.accountId !== filters.accountId) {
      return false;
    }
    if (filters.categoryId !== 'all' && tx.categoryId !== filters.categoryId) {
      return false;
    }
    if (filters.groupId !== 'all' && tx.groupId !== filters.groupId) {
      return false;
    }
    return true;
  };

  for (const tx of allTransactions) {
    if (!matchesFilters(tx)) {
      continue;
    }

    const isIncome = tx.type === ('INCOME' as TransactionType);
    const isExpense = tx.type === ('EXPENSE' as TransactionType);

    const isInCurrentPeriod = isWithinInterval(tx.date, currentPeriodInterval);
    const isInPrevPeriod = isWithinInterval(tx.date, prevPeriodInterval);

    // Convert amount to display currency
    const convertedAmount = convertAmount(tx.amount, tx.currency);

    // Totals for current period
    if (isInCurrentPeriod) {
      transactionCount++;

      if (isIncome) {
        totalIncome += convertedAmount;
      } else if (isExpense) {
        totalExpenses += convertedAmount;
      }

      // Expenses by category
      if (isExpense && tx.categoryId) {
        expensesByCategory[tx.categoryId] =
          (expensesByCategory[tx.categoryId] ?? 0) + convertedAmount;
      }

      // Monthly buckets
      const monthKey = format(tx.date, 'yyyy-MM');
      let entry = monthlyMap.get(monthKey);
      if (!entry) {
        entry = { income: 0, expenses: 0 };
        monthlyMap.set(monthKey, entry);
      }
      if (isIncome) {
        entry.income += convertedAmount;
      } else if (isExpense) {
        entry.expenses += convertedAmount;
      }
    }

    // Previous period comparison
    if (isInPrevPeriod) {
      if (isIncome) {
        prevMonthTotalIncome += convertedAmount;
      } else if (isExpense) {
        prevMonthTotalExpenses += convertedAmount;
      }
    }
  }

  // Fill in missing months to ensure a continuous range with at least 12 months
  if (dateRange) {
    const dataFrom =
      monthlyMap.size > 0 ? parseMonthKey(Array.from(monthlyMap.keys()).sort()[0]) : dateRange.from;
    const effectiveFrom = dataFrom > dateRange.from ? dataFrom : dateRange.from;
    const { displayFrom, displayTo } = getDisplayRange(effectiveFrom, dateRange.to);
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

  // Top categories
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
  // Budget amounts are assumed to be in the primary (most common) currency
  const budgetComparison: BudgetComparisonItem[] = [];
  if (budget) {
    const budgetCurrency = getPrimaryCurrency(allTransactions);
    for (const [categoryId, rawBudgeted] of Object.entries(budget.categories)) {
      if (rawBudgeted > 0) {
        const budgeted = convertAmount(rawBudgeted, budgetCurrency);
        const actual = expensesByCategory[categoryId] ?? 0;
        budgetComparison.push({
          categoryId,
          budgeted,
          actual,
          percentage: budgeted > 0 ? (actual / budgeted) * 100 : 0,
        });
      }
    }
    budgetComparison.sort((a, b) => b.percentage - a.percentage);
  }

  return {
    totalIncome,
    totalExpenses,
    netBalance: totalIncome - totalExpenses,
    totalBalance,
    transactionCount,
    prevMonthTotalExpenses,
    prevMonthTotalIncome,
    comparisonLabel,
    expensesByCategory,
    monthlyData,
    topCategories,
    budgetComparison,
    primaryCurrency: displayCurrency,
  };
}

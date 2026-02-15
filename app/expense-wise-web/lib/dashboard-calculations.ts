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
  getYear,
} from 'date-fns';
import { parseMonthKey } from './date';
import { getPrimaryCurrency } from './budget-utils';
import type { ParsedTransaction, ParsedBudget, TransactionType, Currency } from './types';

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
 * Previously this made 6+ separate passes (filter+reduce for income, expenses,
 * prev-month income, prev-month expenses, category loop, monthly loop).
 */
export function computeDashboardStats(
  filteredTransactions: ParsedTransaction[],
  budget: ParsedBudget | undefined,
  dateRange?: { from: Date; to: Date },
): DashboardStats {
  const primaryCurrency = getPrimaryCurrency(filteredTransactions);

  // Previous month boundaries (computed once)
  const now = new Date();
  const prevMonth = subMonths(now, 1);
  const prevMonthInterval = { start: startOfMonth(prevMonth), end: endOfMonth(prevMonth) };

  // Accumulators — filled in a single pass
  let totalIncome = 0;
  let totalExpenses = 0;
  let prevMonthTotalIncome = 0;
  let prevMonthTotalExpenses = 0;
  const expensesByCategory: Record<string, number> = {};
  const monthlyMap = new Map<string, { income: number; expenses: number }>();

  for (const tx of filteredTransactions) {
    if (tx.currency !== primaryCurrency) {
      continue;
    }

    const isIncome = tx.type === ('INCOME' as TransactionType);
    const isExpense = tx.type === ('EXPENSE' as TransactionType);

    // Totals
    if (isIncome) {
      totalIncome += tx.amount;
    } else if (isExpense) {
      totalExpenses += tx.amount;
    }

    // Previous month comparison
    if (isWithinInterval(tx.date, prevMonthInterval)) {
      if (isIncome) {
        prevMonthTotalIncome += tx.amount;
      } else if (isExpense) {
        prevMonthTotalExpenses += tx.amount;
      }
    }

    // Expenses by category
    if (isExpense && tx.categoryId) {
      expensesByCategory[tx.categoryId] = (expensesByCategory[tx.categoryId] ?? 0) + tx.amount;
    }

    // Monthly buckets
    const monthKey = format(tx.date, 'yyyy-MM');
    let entry = monthlyMap.get(monthKey);
    if (!entry) {
      entry = { income: 0, expenses: 0 };
      monthlyMap.set(monthKey, entry);
    }
    if (isIncome) {
      entry.income += tx.amount;
    } else if (isExpense) {
      entry.expenses += tx.amount;
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
  const budgetComparison: BudgetComparisonItem[] = [];
  if (budget) {
    for (const [categoryId, budgeted] of Object.entries(budget.categories)) {
      if (budgeted > 0) {
        const actual = expensesByCategory[categoryId] ?? 0;
        budgetComparison.push({
          categoryId,
          budgeted,
          actual,
          percentage: (actual / budgeted) * 100,
        });
      }
    }
    budgetComparison.sort((a, b) => b.percentage - a.percentage);
  }

  return {
    totalIncome,
    totalExpenses,
    netBalance: totalIncome - totalExpenses,
    transactionCount: filteredTransactions.length,
    prevMonthTotalExpenses,
    prevMonthTotalIncome,
    expensesByCategory,
    monthlyData,
    topCategories,
    budgetComparison,
    primaryCurrency,
  };
}

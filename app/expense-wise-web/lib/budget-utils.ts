import { startOfMonth, endOfMonth, subMonths, isWithinInterval, format, addMonths } from 'date-fns';
import { parseMonthKey } from './date';
import { convertCurrency } from './currency-conversion';
import type {
  DateRangePreset,
  ParsedBudget,
  ParsedTransaction,
  TransactionType,
  Currency,
  ExchangeRates,
} from './types';

export const BUDGET_PRESETS: Record<string, string> = {
  'this-month': 'This Month',
  'last-month': 'Last Month',
  custom: 'Custom Month',
};

export type MonthBudgetData = {
  monthKey: string;
  monthLabel: string;
  totalActual: number;
  overallPercentage: number;
  categories: {
    categoryId: string;
    budgeted: number;
    actual: number;
    percentage: number;
  }[];
};

export function getBudgetDateRange(preset: DateRangePreset): { from: Date; to: Date } {
  const now = new Date();
  switch (preset) {
    case 'this-month':
      return { from: startOfMonth(now), to: endOfMonth(now) };
    case 'last-month': {
      const prev = subMonths(now, 1);
      return { from: startOfMonth(prev), to: endOfMonth(prev) };
    }
    default:
      return { from: startOfMonth(now), to: endOfMonth(now) };
  }
}

export function getStatusColor(percentage: number) {
  if (percentage > 100) {
    return { ring: 'text-red-500', bg: 'bg-red-500', label: 'Over budget' };
  }
  if (percentage >= 80) {
    return { ring: 'text-amber-500', bg: 'bg-amber-500', label: 'Near limit' };
  }
  return { ring: 'text-emerald-500', bg: 'bg-emerald-500', label: 'On track' };
}

export function getPrimaryCurrency(transactions: ParsedTransaction[]): Currency {
  const counts = new Map<Currency, number>();
  for (const tx of transactions) {
    counts.set(tx.currency, (counts.get(tx.currency) ?? 0) + 1);
  }
  let primary: Currency = 'EUR';
  let max = 0;
  for (const [c, n] of counts) {
    if (n > max) {
      max = n;
      primary = c;
    }
  }
  return primary;
}

export function computeMonthlyBudgets(
  transactions: ParsedTransaction[],
  budget: ParsedBudget,
  dateRange: { from: Date; to: Date },
  primaryCurrency: Currency,
  exchangeRates: ExchangeRates | null,
): MonthBudgetData[] {
  const filtered = transactions.filter((tx) =>
    isWithinInterval(tx.date, { start: dateRange.from, end: dateRange.to }),
  );

  // Helper to convert amount to primary (budget) currency
  const toBudgetCurrency = (amount: number, fromCurrency: Currency): number => {
    if (fromCurrency === primaryCurrency) {
      return amount;
    }
    if (!exchangeRates) {
      return 0;
    }
    return convertCurrency(amount, fromCurrency, primaryCurrency, exchangeRates);
  };

  // Build list of months in range, up to current month
  const now = new Date();
  const currentMonthKey = format(now, 'yyyy-MM');
  const months: string[] = [];
  let cursor = startOfMonth(dateRange.from);
  while (cursor <= dateRange.to) {
    const key = format(cursor, 'yyyy-MM');
    if (key <= currentMonthKey) {
      months.push(key);
    }
    cursor = addMonths(cursor, 1);
  }

  // Group expenses by month and category
  const monthExpenses = new Map<string, Record<string, number>>();
  for (const m of months) {
    monthExpenses.set(m, {});
  }

  for (const tx of filtered) {
    if (tx.type !== ('EXPENSE' as TransactionType)) {
      continue;
    }
    const key = format(tx.date, 'yyyy-MM');
    const bucket = monthExpenses.get(key);
    if (bucket) {
      const converted = toBudgetCurrency(tx.amount, tx.currency);
      bucket[tx.categoryId] = (bucket[tx.categoryId] ?? 0) + converted;
    }
  }

  return months.map((monthKey) => {
    const expenses = monthExpenses.get(monthKey) || {};
    const categories = Object.entries(budget.categories)
      .filter(([, budgeted]) => budgeted > 0)
      .map(([categoryId, budgeted]) => {
        const actual = expenses[categoryId] ?? 0;
        return {
          categoryId,
          budgeted,
          actual,
          percentage: budgeted > 0 ? (actual / budgeted) * 100 : 0,
        };
      })
      .sort((a, b) => b.percentage - a.percentage);

    const totalActual = categories.reduce((sum, c) => sum + c.actual, 0);

    return {
      monthKey,
      monthLabel: format(parseMonthKey(monthKey), 'MMMM yyyy'),
      totalActual,
      overallPercentage: budget.totalAmount > 0 ? (totalActual / budget.totalAmount) * 100 : 0,
      categories,
    };
  });
}

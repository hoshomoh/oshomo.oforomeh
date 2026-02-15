import * as React from 'react';
import { startOfMonth, endOfMonth, addMonths, format } from 'date-fns';
import type {
  DateRangePreset,
  ParsedBudget,
  ParsedTransaction,
  Currency,
} from '../lib/types';

type AvailableMonth = {
  value: string;
  label: string;
};

type MonthBudgetData = {
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

type BudgetPageResult = {
  budget: ParsedBudget | undefined;
  datePreset: DateRangePreset;
  setDatePreset: React.Dispatch<React.SetStateAction<DateRangePreset>>;
  customMonth: string;
  setCustomMonth: React.Dispatch<React.SetStateAction<string>>;
  primaryCurrency: Currency;
  availableMonths: AvailableMonth[];
  monthlyStats: MonthBudgetData[];
};

export function useBudgetPage(
  transactions: ParsedTransaction[],
  budgets: ParsedBudget[],
  helpers: {
    getBudgetDateRange: (preset: DateRangePreset) => { from: Date; to: Date };
    getPrimaryCurrency: (transactions: ParsedTransaction[]) => Currency;
    computeMonthlyBudgets: (
      transactions: ParsedTransaction[],
      budget: ParsedBudget,
      dateRange: { from: Date; to: Date },
      primaryCurrency: Currency,
    ) => MonthBudgetData[];
  },
): BudgetPageResult {
  const [datePreset, setDatePreset] = React.useState<DateRangePreset>('this-month');
  const [customMonth, setCustomMonth] = React.useState(() => format(new Date(), 'yyyy-MM'));

  const budget = budgets[0];

  const primaryCurrency = React.useMemo(
    () => helpers.getPrimaryCurrency(transactions),
    [transactions, helpers],
  );

  const dateRange = React.useMemo(() => {
    if (datePreset === 'custom') {
      const [y, m] = customMonth.split('-').map(Number);
      const d = new Date(y, m - 1, 1);
      return { from: startOfMonth(d), to: endOfMonth(d) };
    }
    return helpers.getBudgetDateRange(datePreset);
  }, [datePreset, customMonth, helpers]);

  const availableMonths = React.useMemo(() => {
    if (transactions.length === 0) {
      return [];
    }
    const dates = transactions.map((t) => t.date.getTime());
    const earliest = new Date(Math.min(...dates));
    const now = new Date();
    const result: AvailableMonth[] = [];
    let c = startOfMonth(earliest);
    while (c <= startOfMonth(now)) {
      result.push({ value: format(c, 'yyyy-MM'), label: format(c, 'MMMM yyyy') });
      c = addMonths(c, 1);
    }
    return result.reverse();
  }, [transactions]);

  const monthlyStats = React.useMemo(() => {
    if (!budget) {
      return [];
    }
    return helpers.computeMonthlyBudgets(transactions, budget, dateRange, primaryCurrency);
  }, [transactions, budget, dateRange, primaryCurrency, helpers]);

  return {
    budget,
    datePreset,
    setDatePreset,
    customMonth,
    setCustomMonth,
    primaryCurrency,
    availableMonths,
    monthlyStats,
  };
}

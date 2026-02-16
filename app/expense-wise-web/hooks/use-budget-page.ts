import * as React from 'react';
import { startOfMonth, endOfMonth, addMonths, subMonths, format, min } from 'date-fns';
import { parseMonthKey } from '../lib/date';
import type { DateRangePreset, ParsedBudget, ParsedTransaction, Currency } from '../lib/types';
import { getBudgetDateRange, getPrimaryCurrency, computeMonthlyBudgets } from '../lib/budget-utils';
import type { MonthBudgetData } from '../lib/budget-utils';
import { useExchangeRates } from './use-exchange-rates';

type AvailableMonth = {
  value: string;
  label: string;
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
): BudgetPageResult {
  const { rates: exchangeRates } = useExchangeRates();
  const [datePreset, setDatePreset] = React.useState<DateRangePreset>('this-month');
  const [customMonth, setCustomMonth] = React.useState(() =>
    format(subMonths(new Date(), 2), 'yyyy-MM'),
  );

  const budget = budgets[0];

  const primaryCurrency = React.useMemo(() => getPrimaryCurrency(transactions), [transactions]);

  const dateRange = React.useMemo(() => {
    if (datePreset === 'custom') {
      const d = parseMonthKey(customMonth);
      return { from: startOfMonth(d), to: endOfMonth(d) };
    }
    return getBudgetDateRange(datePreset);
  }, [datePreset, customMonth]);

  const availableMonths = React.useMemo(() => {
    if (transactions.length === 0) {
      return [];
    }
    const earliest = min(transactions.map((t) => t.date));
    const now = new Date();
    // Exclude current and last month — they have dedicated presets
    const thisMonthKey = format(now, 'yyyy-MM');
    const lastMonthKey = format(subMonths(now, 1), 'yyyy-MM');
    const result: AvailableMonth[] = [];
    let c = startOfMonth(earliest);
    while (c <= startOfMonth(now)) {
      const key = format(c, 'yyyy-MM');
      if (key !== thisMonthKey && key !== lastMonthKey) {
        result.push({ value: key, label: format(c, 'MMMM yyyy') });
      }
      c = addMonths(c, 1);
    }
    return result.reverse();
  }, [transactions]);

  const monthlyStats = React.useMemo(() => {
    if (!budget) {
      return [];
    }
    return computeMonthlyBudgets(transactions, budget, dateRange, primaryCurrency, exchangeRates);
  }, [transactions, budget, dateRange, primaryCurrency, exchangeRates]);

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

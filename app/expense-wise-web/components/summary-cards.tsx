'use client';

import { TrendingUp, TrendingDown, Wallet, ArrowLeftRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatCurrency, formatPercentage } from '../lib/format';

type ComparisonData = {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  transactionCount: number;
};

type SummaryCardsProps = {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  transactionCount: number;
  prevMonthIncome?: number;
  prevMonthExpenses?: number;
  currency?: string;
  className?: string;
  comparison?: ComparisonData;
};

function calculatePercentageChange(current: number, previous?: number): number | null {
  if (previous === undefined || previous === 0) {
    return null;
  }
  return ((current - previous) / previous) * 100;
}

function PercentageChangeBadge({ change, label }: { change: number | null; label?: string }) {
  if (change === null) {
    return null;
  }

  const isPositive = change >= 0;

  return (
    <span className="inline-flex items-center gap-1.5">
      <Badge
        variant="secondary"
        className={cn(
          'text-[10px] px-1.5 py-0',
          isPositive
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
            : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
        )}
      >
        {formatPercentage(change)}
      </Badge>
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
    </span>
  );
}

function ComparisonValue({
  current,
  comparisonValue,
  currency,
  invertDirection = false,
}: {
  current: number;
  comparisonValue: number;
  currency: string;
  invertDirection?: boolean;
}) {
  const change = calculatePercentageChange(current, comparisonValue);
  // For expenses, a decrease is good (invert the color logic)
  const displayChange = invertDirection && change !== null ? -change : change;

  return (
    <div className="mt-1.5 pt-1.5 border-t border-dashed">
      <p className="text-xs text-muted-foreground mb-0.5">
        Comparison: {formatCurrency(comparisonValue, currency)}
      </p>
      <PercentageChangeBadge change={displayChange} label="vs comparison" />
    </div>
  );
}

export default function SummaryCards({
  totalIncome,
  totalExpenses,
  netBalance,
  transactionCount,
  prevMonthIncome,
  prevMonthExpenses,
  currency = 'EUR',
  className,
  comparison,
}: SummaryCardsProps) {
  const incomeChange = calculatePercentageChange(totalIncome, prevMonthIncome);
  const expenseChange = calculatePercentageChange(totalExpenses, prevMonthExpenses);

  // For expenses, a decrease is an improvement (invert the sign for display logic)
  const expenseImprovementChange = expenseChange !== null ? -expenseChange : null;

  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {/* Total Income */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Income
            </CardTitle>
            <div className="rounded-md bg-emerald-100 p-2 dark:bg-emerald-950">
              <TrendingUp className="size-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(totalIncome, currency)}
          </div>
          {!comparison && (
            <div className="mt-1 flex items-center gap-2">
              <PercentageChangeBadge
                change={incomeChange}
                label={incomeChange !== null ? 'vs last month' : undefined}
              />
            </div>
          )}
          {comparison && (
            <ComparisonValue
              current={totalIncome}
              comparisonValue={comparison.totalIncome}
              currency={currency}
            />
          )}
        </CardContent>
      </Card>

      {/* Total Expenses */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Expenses
            </CardTitle>
            <div className="rounded-md bg-red-100 p-2 dark:bg-red-950">
              <TrendingDown className="size-4 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {formatCurrency(totalExpenses, currency)}
          </div>
          {!comparison && (
            <div className="mt-1 flex items-center gap-2">
              <PercentageChangeBadge
                change={expenseImprovementChange}
                label={expenseChange !== null ? 'vs last month' : undefined}
              />
            </div>
          )}
          {comparison && (
            <ComparisonValue
              current={totalExpenses}
              comparisonValue={comparison.totalExpenses}
              currency={currency}
              invertDirection
            />
          )}
        </CardContent>
      </Card>

      {/* Net Balance */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Balance</CardTitle>
            <div
              className={cn(
                'rounded-md p-2',
                netBalance >= 0
                  ? 'bg-emerald-100 dark:bg-emerald-950'
                  : 'bg-red-100 dark:bg-red-950',
              )}
            >
              <Wallet
                className={cn(
                  'size-4',
                  netBalance >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-600 dark:text-red-400',
                )}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              'text-2xl font-bold',
              netBalance >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-red-600 dark:text-red-400',
            )}
          >
            {formatCurrency(netBalance, currency)}
          </div>
          {!comparison && (
            <div className="mt-1">
              <span className="text-xs text-muted-foreground">Income - Expenses</span>
            </div>
          )}
          {comparison && (
            <ComparisonValue
              current={netBalance}
              comparisonValue={comparison.netBalance}
              currency={currency}
            />
          )}
        </CardContent>
      </Card>

      {/* Transactions */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Transactions
            </CardTitle>
            <div className="rounded-md bg-secondary p-2">
              <ArrowLeftRight className="size-4 text-muted-foreground" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{transactionCount.toLocaleString()}</div>
          {!comparison && (
            <div className="mt-1">
              <span className="text-xs text-muted-foreground">Total transactions</span>
            </div>
          )}
          {comparison && (
            <div className="mt-1.5 pt-1.5 border-t border-dashed">
              <p className="text-xs text-muted-foreground">
                Comparison: {comparison.transactionCount.toLocaleString()}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

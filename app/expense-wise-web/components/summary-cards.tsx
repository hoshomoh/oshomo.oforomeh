'use client';

import * as React from 'react';
import { TrendingUp, TrendingDown, Wallet, ArrowLeftRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  formatCurrency,
  formatCompactCurrency,
  formatPercentage,
  calculatePercentageChange,
} from '../lib/format';

type SummaryCardsProps = {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  totalBalance: number;
  transactionCount: number;
  prevMonthIncome?: number;
  prevMonthExpenses?: number;
  comparisonLabel?: string;
  currency?: string;
  showBalance?: boolean;
  className?: string;
};

function PercentageChangeBadge({
  change,
  label,
  invertColors = false,
}: {
  change: number | null;
  label?: string;
  invertColors?: boolean;
}) {
  if (change === null) {
    return null;
  }

  // For expenses, an increase (positive change) is bad (red) and a decrease is good (green)
  const isGood = invertColors ? change <= 0 : change >= 0;

  return (
    <span className="inline-flex items-center gap-1.5">
      <Badge
        variant="secondary"
        className={cn(
          'text-[10px] px-1.5 py-0',
          isGood
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

function CompactCurrencyDisplay({
  amount,
  currency,
  className,
}: {
  amount: number;
  currency: string;
  className?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={className}>{formatCompactCurrency(amount, currency)}</div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{formatCurrency(amount, currency)}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export default React.memo(function SummaryCards({
  totalIncome,
  totalExpenses,
  netBalance,
  totalBalance,
  transactionCount,
  prevMonthIncome,
  prevMonthExpenses,
  comparisonLabel = 'vs last month',
  currency = 'EUR',
  showBalance = true,
  className,
}: SummaryCardsProps) {
  const incomeChange = calculatePercentageChange(totalIncome, prevMonthIncome);
  const expenseChange = calculatePercentageChange(totalExpenses, prevMonthExpenses);
  const gridCols = showBalance ? 'lg:grid-cols-5' : 'lg:grid-cols-4';

  return (
    <TooltipProvider>
      <div className={cn('grid grid-cols-1 sm:grid-cols-2 gap-4', gridCols, className)}>
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
            <CompactCurrencyDisplay
              amount={totalIncome}
              currency={currency}
              className="text-2xl font-bold text-emerald-600 dark:text-emerald-400"
            />
            <div className="mt-1 flex items-center gap-2">
              <PercentageChangeBadge
                change={incomeChange}
                label={incomeChange !== null ? comparisonLabel : undefined}
              />
            </div>
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
            <CompactCurrencyDisplay
              amount={totalExpenses}
              currency={currency}
              className="text-2xl font-bold text-red-600 dark:text-red-400"
            />
            <div className="mt-1 flex items-center gap-2">
              <PercentageChangeBadge
                change={expenseChange}
                invertColors
                label={expenseChange !== null ? comparisonLabel : undefined}
              />
            </div>
          </CardContent>
        </Card>

        {/* Net Cash Flow */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Net Cash Flow
              </CardTitle>
              <div
                className={cn(
                  'rounded-md p-2',
                  netBalance >= 0
                    ? 'bg-emerald-100 dark:bg-emerald-950'
                    : 'bg-red-100 dark:bg-red-950',
                )}
              >
                <ArrowLeftRight
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
            <CompactCurrencyDisplay
              amount={netBalance}
              currency={currency}
              className={cn(
                'text-2xl font-bold',
                netBalance >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400',
              )}
            />
            <div className="mt-1">
              <span className="text-xs text-muted-foreground">Income - Expenses</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Balance */}
        {showBalance && (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Balance
                </CardTitle>
                <div className="rounded-md bg-blue-100 p-2 dark:bg-blue-950">
                  <Wallet className="size-4 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CompactCurrencyDisplay
                amount={totalBalance}
                currency={currency}
                className="text-2xl font-bold text-blue-600 dark:text-blue-400"
              />
              <div className="mt-1">
                <span className="text-xs text-muted-foreground">Current account balances</span>
              </div>
            </CardContent>
          </Card>
        )}

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
            <div className="mt-1">
              <span className="text-xs text-muted-foreground">Total transactions</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
});

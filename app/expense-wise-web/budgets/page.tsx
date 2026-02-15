'use client';

import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useData } from '../context/data-context';
import { useBudgetPage } from '../hooks/use-budget-page';
import { PageHeader } from '../components/page-header';
import { EmptyState } from '../components/empty-state';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, getCategoryLabel } from '../lib/format';
import { getCategoryMeta } from '../lib/constants';
import { cn } from '@/lib/utils';
import { BUDGET_PRESETS, getStatusColor } from '../lib/budget-utils';
import type { MonthBudgetData } from '../lib/budget-utils';
import type { DateRangePreset, ParsedBudget, Currency } from '../lib/types';

function CircularProgress({ percentage, size = 56 }: { percentage: number; size?: number }) {
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const capped = Math.min(percentage, 100);
  const offset = circumference - (capped / 100) * circumference;
  const status = getStatusColor(percentage);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={4}
          className="text-muted/30"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={4}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={status.ring}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
        {percentage > 999 ? '999+' : `${Math.round(percentage)}%`}
      </span>
    </div>
  );
}

function SingleMonthHero({
  stats,
  budget,
  currency,
}: {
  stats: MonthBudgetData;
  budget: ParsedBudget;
  currency: Currency;
}) {
  const status = getStatusColor(stats.overallPercentage);
  const remaining = budget.totalAmount - stats.totalActual;
  const overBudgetCount = stats.categories.filter((c) => c.percentage > 100).length;
  const nearLimitCount = stats.categories.filter(
    (c) => c.percentage >= 80 && c.percentage <= 100,
  ).length;

  return (
    <div className="rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border p-6">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <CircularProgress percentage={stats.overallPercentage} size={100} />
        <div className="flex-1 text-center sm:text-left">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            {stats.monthLabel} Budget
          </p>
          <div className="flex flex-wrap items-baseline gap-2 justify-center sm:justify-start mt-1">
            <span className="text-2xl sm:text-3xl font-bold">
              {formatCurrency(stats.totalActual, currency)}
            </span>
            <span className="text-muted-foreground">
              of {formatCurrency(budget.totalAmount, currency)}
            </span>
          </div>
          <div className="flex flex-wrap gap-3 mt-3 justify-center sm:justify-start">
            <span
              className={cn('text-xs font-medium px-2 py-0.5 rounded-full text-white', status.bg)}
            >
              {status.label}
            </span>
            {overBudgetCount > 0 && (
              <span className="text-xs text-red-600 dark:text-red-400">
                {overBudgetCount} over budget
              </span>
            )}
            {nearLimitCount > 0 && (
              <span className="text-xs text-amber-600 dark:text-amber-400">
                {nearLimitCount} near limit
              </span>
            )}
          </div>
        </div>
        <div className="text-3xl sm:text-4xl font-bold tabular-nums">
          {formatCurrency(Math.abs(remaining), currency)}
          <p className="text-xs text-muted-foreground font-normal mt-1 text-center">
            {remaining >= 0 ? 'Remaining' : 'Over budget'}
          </p>
        </div>
      </div>
    </div>
  );
}

function MonthSummaryBar({
  stats,
  budget,
  currency,
}: {
  stats: MonthBudgetData;
  budget: ParsedBudget;
  currency: Currency;
}) {
  const remaining = budget.totalAmount - stats.totalActual;

  return (
    <div className="rounded-lg border p-4 flex flex-col sm:flex-row items-center gap-4">
      <CircularProgress percentage={stats.overallPercentage} size={64} />
      <div className="flex-1 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <div>
          <span className="text-sm text-muted-foreground">Spent </span>
          <span className="font-semibold">{formatCurrency(stats.totalActual, currency)}</span>
        </div>
        <div>
          <span className="text-sm text-muted-foreground">Budget </span>
          <span className="font-semibold">{formatCurrency(budget.totalAmount, currency)}</span>
        </div>
        <div>
          <span className="text-sm text-muted-foreground">
            {remaining >= 0 ? 'Remaining ' : 'Over by '}
          </span>
          <span
            className={cn(
              'font-semibold',
              remaining >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-red-600 dark:text-red-400',
            )}
          >
            {formatCurrency(Math.abs(remaining), currency)}
          </span>
        </div>
      </div>
    </div>
  );
}

function CategoryCards({
  categories,
  currency,
}: {
  categories: MonthBudgetData['categories'];
  currency: Currency;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.map((item) => {
        const meta = getCategoryMeta(item.categoryId);
        const status = getStatusColor(item.percentage);
        const remaining = item.budgeted - item.actual;

        return (
          <Card key={item.categoryId} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="h-1.5 w-full bg-muted/30">
                <div
                  className={cn('h-full transition-all rounded-r', status.bg)}
                  style={{ width: `${Math.min(item.percentage, 100)}%` }}
                />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
                      style={{ backgroundColor: `${meta.color}20` }}
                    >
                      <meta.icon className="size-4" style={{ color: meta.color }} />
                    </div>
                    <span className="text-sm font-medium truncate">
                      {getCategoryLabel(item.categoryId)}
                    </span>
                  </div>
                  <CircularProgress percentage={item.percentage} size={44} />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Spent</span>
                    <span className="font-medium tabular-nums">
                      {formatCurrency(item.actual, currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Budget</span>
                    <span className="font-medium tabular-nums">
                      {formatCurrency(item.budgeted, currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm pt-1.5 border-t">
                    <span className="text-muted-foreground">
                      {remaining >= 0 ? 'Remaining' : 'Over by'}
                    </span>
                    <span
                      className={cn(
                        'font-semibold tabular-nums',
                        remaining >= 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-red-600 dark:text-red-400',
                      )}
                    >
                      {formatCurrency(Math.abs(remaining), currency)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default function BudgetsPage() {
  const { transactions, budgets, hasData, isLoading } = useData();

  const {
    budget,
    datePreset,
    setDatePreset,
    customMonth,
    setCustomMonth,
    primaryCurrency,
    availableMonths,
    monthlyStats,
  } = useBudgetPage(transactions, budgets);

  if (isLoading) {
    return null;
  }
  if (!hasData) {
    return <EmptyState />;
  }

  if (budgets.length === 0 || !budget) {
    return (
      <div className="p-6 space-y-6">
        <PageHeader title="Budgets" description="No budgets configured in your ExpenseWise data." />
      </div>
    );
  }

  const isSingleMonth = monthlyStats.length === 1;

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Budgets" description="Track your spending against budget targets" />

      {/* Month filter */}
      <div className="flex flex-wrap items-center gap-2">
        <Select value={datePreset} onValueChange={(v) => setDatePreset(v as DateRangePreset)}>
          <SelectTrigger className="w-full sm:w-[160px]" size="sm">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(BUDGET_PRESETS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {datePreset === 'custom' && (
          <Select value={customMonth} onValueChange={setCustomMonth}>
            <SelectTrigger className="w-full sm:w-[200px]" size="sm">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {availableMonths.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Single month: full hero + category cards */}
      {isSingleMonth && monthlyStats[0] && (
        <>
          <SingleMonthHero stats={monthlyStats[0]} budget={budget} currency={primaryCurrency} />
          <CategoryCards categories={monthlyStats[0].categories} currency={primaryCurrency} />
        </>
      )}

      {/* Multi-month: per-month sections */}
      {!isSingleMonth &&
        monthlyStats.map((stats) => {
          const status = getStatusColor(stats.overallPercentage);
          return (
            <div key={stats.monthKey} className="space-y-4">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold">{stats.monthLabel}</h2>
                <span
                  className={cn(
                    'text-xs font-medium px-2 py-0.5 rounded-full text-white',
                    status.bg,
                  )}
                >
                  {status.label}
                </span>
              </div>
              <MonthSummaryBar stats={stats} budget={budget} currency={primaryCurrency} />
              <CategoryCards categories={stats.categories} currency={primaryCurrency} />
            </div>
          );
        })}

      {monthlyStats.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No data for the selected period.
        </div>
      )}
    </div>
  );
}

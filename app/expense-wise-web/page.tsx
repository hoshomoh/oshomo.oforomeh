'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { useData } from './context/data-context';
import { useFilters } from './hooks/use-filters';
import { useDashboardStats } from './hooks/use-dashboard-stats';
import { useExchangeRates } from './hooks/use-exchange-rates';
import { PageHeader } from './components/page-header';
import { FiltersPanel } from './components/filters-panel';
import SummaryCards from './components/summary-cards';
import TransactionsTable from './components/transactions-table';
import { EmptyState } from './components/empty-state';
import { UploadZone } from './components/upload-zone';
import { Skeleton } from '@/components/ui/skeleton';

function ChartSkeleton() {
  return <Skeleton className="h-72 w-full rounded-lg" />;
}

const CategoryPieChart = dynamic(
  () => import('./components/charts/category-pie-chart').then((mod) => mod.CategoryPieChart),
  { loading: ChartSkeleton, ssr: false },
);

const IncomeExpenseBarChart = dynamic(
  () =>
    import('./components/charts/income-expense-bar-chart').then((mod) => mod.IncomeExpenseBarChart),
  { loading: ChartSkeleton, ssr: false },
);

const MonthlyTrendChart = dynamic(
  () => import('./components/charts/monthly-trend-chart').then((mod) => mod.MonthlyTrendChart),
  { loading: ChartSkeleton, ssr: false },
);

const TopCategoriesChart = dynamic(
  () => import('./components/charts/top-categories-chart').then((mod) => mod.TopCategoriesChart),
  { loading: ChartSkeleton, ssr: false },
);

export default function ExpenseWiseWebPage() {
  const { transactions, accounts, budgets, groups, hasData, isLoading, refetch } = useData();
  const { rates: exchangeRates } = useExchangeRates();

  const currencies = React.useMemo(
    () => [...new Set(transactions.map((t) => t.currency))],
    [transactions],
  );
  const { filters, updateFilters, filteredTransactions } = useFilters(transactions, accounts);
  const handleImportComplete = React.useCallback(() => refetch(), [refetch]);

  const stats = useDashboardStats(transactions, accounts, budgets[0], filters, exchangeRates);

  const pieChartData = React.useMemo(
    () =>
      stats.topCategories.map((c) => ({
        categoryId: c.categoryId,
        amount: c.amount,
        percentage: c.percentage,
      })),
    [stats.topCategories],
  );

  const trendChartData = React.useMemo(
    () => stats.monthlyData.map((m) => ({ month: m.month, amount: m.expenses })),
    [stats.monthlyData],
  );

  if (isLoading) {
    return null;
  }

  if (!hasData) {
    return (
      <div className="p-6 flex flex-col items-center justify-center space-y-8">
        <EmptyState
          title="Welcome to Expense-Wise Web"
          description="Upload your ExpenseWise app export file to view your financial data in a rich, interactive dashboard."
          action={<></>}
          className="min-h-0"
        />
        <div className="w-full max-w-lg">
          <UploadZone onImportComplete={handleImportComplete} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Dashboard" description="Overview of your financial data" />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        <FiltersPanel
          filters={filters}
          onFilterChange={updateFilters}
          accounts={accounts}
          currencies={currencies}
          groups={groups}
          transactions={transactions}
        />

        <SummaryCards
          totalIncome={stats.totalIncome}
          totalExpenses={stats.totalExpenses}
          netBalance={stats.netBalance}
          totalBalance={stats.totalBalance}
          transactionCount={stats.transactionCount}
          prevMonthIncome={stats.prevMonthTotalIncome}
          prevMonthExpenses={stats.prevMonthTotalExpenses}
          comparisonLabel={stats.comparisonLabel}
          currency={stats.primaryCurrency}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CategoryPieChart data={pieChartData} />
          <MonthlyTrendChart data={trendChartData} currency={stats.primaryCurrency} />
        </div>

        <TopCategoriesChart data={stats.topCategories} currency={stats.primaryCurrency} />

        <IncomeExpenseBarChart data={stats.monthlyData} currency={stats.primaryCurrency} />

        <TransactionsTable
          transactions={filteredTransactions}
          accounts={accounts}
          pageSize={10}
          showViewAll
        />
      </div>
    </div>
  );
}

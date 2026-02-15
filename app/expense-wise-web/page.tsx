'use client';

import { useData } from './context/data-context';
import { useFilters } from './hooks/use-filters';
import { useDashboardStats } from './hooks/use-dashboard-stats';
import { PageHeader } from './components/page-header';
import { FiltersPanel } from './components/filters-panel';
import SummaryCards from './components/summary-cards';
import { CategoryPieChart } from './components/charts/category-pie-chart';
import { IncomeExpenseBarChart } from './components/charts/income-expense-bar-chart';
import { MonthlyTrendChart } from './components/charts/monthly-trend-chart';
import { TopCategoriesChart } from './components/charts/top-categories-chart';
import TransactionsTable from './components/transactions-table';
import { EmptyState } from './components/empty-state';
import { UploadZone } from './components/upload-zone';

export default function ExpenseWiseWebPage() {
  const { transactions, accounts, budgets, groups, hasData, isLoading, refetch } = useData();

  const currencies = [...new Set(transactions.map((t) => t.currency))];
  const { filters, updateFilters, filteredTransactions, comparisonTransactions } = useFilters(
    transactions,
    accounts,
  );

  const stats = useDashboardStats(filteredTransactions, accounts, budgets[0], filters.dateRange);
  const comparisonStats = useDashboardStats(comparisonTransactions, accounts, budgets[0]);

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
          <UploadZone onImportComplete={() => refetch()} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Dashboard" description="Overview of your financial data" />

      <FiltersPanel
        filters={filters}
        onFilterChange={updateFilters}
        accounts={accounts}
        currencies={currencies}
        groups={groups}
        transactions={transactions}
        showComparison
      />

      <SummaryCards
        totalIncome={stats.totalIncome}
        totalExpenses={stats.totalExpenses}
        netBalance={stats.netBalance}
        transactionCount={stats.transactionCount}
        prevMonthIncome={stats.prevMonthTotalIncome}
        prevMonthExpenses={stats.prevMonthTotalExpenses}
        currency={stats.primaryCurrency}
        comparison={
          filters.compareEnabled
            ? {
                totalIncome: comparisonStats.totalIncome,
                totalExpenses: comparisonStats.totalExpenses,
                netBalance: comparisonStats.netBalance,
                transactionCount: comparisonStats.transactionCount,
              }
            : undefined
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CategoryPieChart
          data={stats.topCategories.map((c) => ({
            categoryId: c.categoryId,
            amount: c.amount,
            percentage: c.percentage,
          }))}
        />
        <MonthlyTrendChart
          data={stats.monthlyData.map((m) => ({ month: m.month, amount: m.expenses }))}
          currency={stats.primaryCurrency}
        />
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
  );
}

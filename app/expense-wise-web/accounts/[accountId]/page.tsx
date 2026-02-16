'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useData } from '../../context/data-context';
import { useAccountDetail } from '../../hooks/use-account-detail';
import { useExchangeRates } from '../../hooks/use-exchange-rates';
import SummaryCards from '../../components/summary-cards';
import { CategoryPieChart } from '../../components/charts/category-pie-chart';
import { IncomeExpenseBarChart } from '../../components/charts/income-expense-bar-chart';
import { MonthlyTrendChart } from '../../components/charts/monthly-trend-chart';
import TransactionsTable from '../../components/transactions-table';
import { EmptyState } from '../../components/empty-state';
import { formatCurrency } from '../../lib/format';
import { cn } from '@/lib/utils';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function AccountDetailPage() {
  const params = useParams();
  const accountId = params.accountId as string;
  const { transactions, accounts, budgets, hasData, isLoading } = useData();
  const { rates: exchangeRates } = useExchangeRates();

  const { account, stats, balanceChartData, recentTransactions } = useAccountDetail(
    accountId,
    transactions,
    accounts,
    budgets,
    exchangeRates,
  );

  if (isLoading) {
    return null;
  }
  if (!hasData) {
    return <EmptyState />;
  }

  if (!account) {
    return (
      <div className="p-6 space-y-6">
        <Button variant="ghost" asChild>
          <Link href="/expense-wise-web/accounts">
            <ArrowLeft className="size-4 mr-2" />
            Back to Accounts
          </Link>
        </Button>
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          Account not found
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Back navigation */}
      <Button variant="ghost" size="sm" asChild>
        <Link href="/expense-wise-web/accounts">
          <ArrowLeft className="size-4 mr-2" />
          All Accounts
        </Link>
      </Button>

      {/* Hero header */}
      <div className="rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{account.name}</h1>
            <div className="flex items-center gap-2 mt-1 text-muted-foreground">
              <MapPin className="size-3.5" />
              <span className="text-sm">{account.country}</span>
              <span className="text-sm">&middot;</span>
              <span className="text-sm font-medium">{account.currency}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Current Balance</p>
            <p
              className={cn(
                'text-3xl font-bold',
                account.balance >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400',
              )}
            >
              {formatCurrency(account.balance, account.currency)}
            </p>
          </div>
        </div>
      </div>

      {/* Summary cards — all-time stats for this account, no comparison badges */}
      <SummaryCards
        totalIncome={stats.totalIncome}
        totalExpenses={stats.totalExpenses}
        netBalance={stats.netBalance}
        totalBalance={stats.totalBalance}
        transactionCount={stats.transactionCount}
        currency={account.currency}
        showBalance={false}
      />

      {/* Balance over time chart */}
      {balanceChartData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Balance Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={balanceChartData}>
                  <defs>
                    <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    className="fill-muted-foreground"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    className="fill-muted-foreground"
                    tickFormatter={(v: number) =>
                      formatCurrency(v, account.currency).replace(/\.00$/, '')
                    }
                    width={80}
                  />
                  <Tooltip
                    formatter={(value: number) => [
                      formatCurrency(value, account.currency),
                      'Balance',
                    ]}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="balance"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    fill="url(#balanceGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CategoryPieChart
          data={stats.topCategories.map((c) => ({
            categoryId: c.categoryId,
            amount: c.amount,
            percentage: c.percentage,
          }))}
        />
        <IncomeExpenseBarChart data={stats.monthlyData} currency={account.currency} />
      </div>

      {/* Expense trend */}
      <MonthlyTrendChart
        data={stats.monthlyData.map((m) => ({ month: m.month, amount: m.expenses }))}
        currency={account.currency}
      />

      {/* Recent transactions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Transactions</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/expense-wise-web/transactions?accountId=${account.id}`}>
              View all
              <ArrowRight className="size-4 ml-1" />
            </Link>
          </Button>
        </div>
        <TransactionsTable transactions={recentTransactions} accounts={accounts} pageSize={10} />
      </div>
    </div>
  );
}

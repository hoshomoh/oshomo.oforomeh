'use client';

import * as React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getCategoryMeta } from '@/app/expense-wise-web/lib/constants';
import { formatCurrency } from '@/app/expense-wise-web/lib/format';

type BudgetActualChartData = {
  categoryId: string;
  budgeted: number;
  actual: number;
  percentage: number;
};

type BudgetActualChartProps = {
  data: BudgetActualChartData[];
  currency?: string;
  className?: string;
};

const chartConfig: ChartConfig = {
  budgeted: {
    label: 'Budgeted',
    color: 'hsl(var(--muted-foreground))',
  },
  actual: {
    label: 'Actual',
    color: 'hsl(var(--primary))',
  },
};

export function BudgetActualChart({ data, currency = 'USD', className }: BudgetActualChartProps) {
  const chartData = React.useMemo(
    () =>
      data.map((item) => ({
        ...item,
        categoryLabel: getCategoryMeta(item.categoryId).label,
      })),
    [data],
  );

  if (!data.length) {
    return (
      <Card className={cn(className)}>
        <CardHeader>
          <CardTitle>Budget vs Actual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartHeight = Math.max(200, data.length * 60);

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>Budget vs Actual</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <ChartContainer
            config={chartConfig}
            className="w-full"
            style={{ height: `${chartHeight}px`, minWidth: '400px' }}
          >
            <BarChart
              data={chartData}
              layout="vertical"
              accessibilityLayer
              margin={{ left: 10, right: 40 }}
            >
              <CartesianGrid horizontal={false} />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value: number) => formatCurrency(value, currency)}
              />
              <YAxis
                type="category"
                dataKey="categoryLabel"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={80}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name, item) => {
                      const label = name === 'budgeted' ? 'Budgeted' : 'Actual';
                      return (
                        <div className="flex w-full items-center justify-between gap-2">
                          <span className="text-muted-foreground">{label}</span>
                          <span className="font-mono font-medium tabular-nums">
                            {formatCurrency(Number(value), currency)}
                            {name === 'actual' && (
                              <span className="ml-1 text-xs text-muted-foreground">
                                ({item.payload.percentage.toFixed(1)}%)
                              </span>
                            )}
                          </span>
                        </div>
                      );
                    }}
                  />
                }
              />
              <Bar
                dataKey="budgeted"
                fill="var(--color-budgeted)"
                radius={[0, 4, 4, 0]}
                barSize={16}
              />
              <Bar dataKey="actual" radius={[0, 4, 4, 0]} barSize={16}>
                {chartData.map((entry) => (
                  <Cell
                    key={entry.categoryId}
                    fill={
                      entry.actual > entry.budgeted
                        ? 'hsl(var(--destructive))'
                        : 'var(--color-actual)'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}

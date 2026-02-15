'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/app/expense-wise-web/lib/format';

type IncomeExpenseBarChartData = {
  month: string;
  income: number;
  expenses: number;
};

type IncomeExpenseBarChartProps = {
  data: IncomeExpenseBarChartData[];
  currency?: string;
  className?: string;
};

const chartConfig: ChartConfig = {
  income: {
    label: 'Income',
    color: 'var(--chart-2)',
  },
  expenses: {
    label: 'Expenses',
    color: 'var(--chart-1)',
  },
};

export function IncomeExpenseBarChart({
  data,
  currency = 'USD',
  className,
}: IncomeExpenseBarChartProps) {
  if (!data.length) {
    return (
      <Card className={cn(className)}>
        <CardHeader>
          <CardTitle>Income vs Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>Income vs Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="w-full" style={{ height: '350px' }}>
          <BarChart data={data} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value: number) => formatCurrency(value, currency)}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => formatCurrency(Number(value), currency)}
                />
              }
            />
            <Bar dataKey="income" fill="var(--color-income)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" fill="var(--color-expenses)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

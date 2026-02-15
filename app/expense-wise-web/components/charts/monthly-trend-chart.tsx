'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/app/expense-wise-web/lib/format';

type MonthlyTrendChartData = {
  month: string;
  amount: number;
};

type MonthlyTrendChartProps = {
  data: MonthlyTrendChartData[];
  currency?: string;
  className?: string;
};

const chartConfig: ChartConfig = {
  amount: {
    label: 'Spending',
    color: 'var(--chart-1)',
  },
};

export function MonthlyTrendChart({ data, currency = 'USD', className }: MonthlyTrendChartProps) {
  if (!data.length) {
    return (
      <Card className={cn(className)}>
        <CardHeader>
          <CardTitle>Monthly Spending Trend</CardTitle>
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
        <CardTitle>Monthly Spending Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="w-full" style={{ height: '300px' }}>
          <AreaChart data={data} accessibilityLayer>
            <defs>
              <linearGradient id="fillAmount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-amount)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-amount)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
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
            <Area
              type="monotone"
              dataKey="amount"
              stroke="var(--color-amount)"
              strokeWidth={2}
              fill="url(#fillAmount)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

'use client';

import * as React from 'react';
import { PieChart, Pie, Cell } from 'recharts';
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

type CategoryPieChartData = {
  categoryId: string;
  amount: number;
  percentage: number;
};

type CategoryPieChartProps = {
  data: CategoryPieChartData[];
  className?: string;
};

export function CategoryPieChart({ data, className }: CategoryPieChartProps) {
  const chartConfig = React.useMemo<ChartConfig>(() => {
    const config: ChartConfig = {};
    for (const item of data) {
      const meta = getCategoryMeta(item.categoryId);
      config[item.categoryId] = {
        label: meta.label,
        color: meta.color,
      };
    }
    return config;
  }, [data]);

  if (!data.length) {
    return (
      <Card className={cn(className)}>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((item) => ({
    ...item,
    fill: getCategoryMeta(item.categoryId).color,
  }));

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  nameKey="categoryId"
                  formatter={(value, name, item) => {
                    const meta = getCategoryMeta(item.payload.categoryId);
                    return (
                      <div className="flex w-full items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                            style={{ backgroundColor: meta.color }}
                          />
                          <span className="text-muted-foreground">{meta.label}</span>
                        </div>
                        <span className="font-mono font-medium tabular-nums">
                          {formatCurrency(Number(value), 'USD')}
                        </span>
                      </div>
                    );
                  }}
                />
              }
            />
            <Pie
              data={chartData}
              dataKey="amount"
              nameKey="categoryId"
              innerRadius={50}
              outerRadius={90}
              strokeWidth={2}
              stroke="hsl(var(--background))"
            >
              {chartData.map((entry) => (
                <Cell key={entry.categoryId} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 px-2 pt-2">
          {chartData.map((item) => {
            const meta = getCategoryMeta(item.categoryId);
            return (
              <div key={item.categoryId} className="flex items-center gap-1.5 text-xs">
                <div
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: meta.color }}
                />
                <span className="text-muted-foreground">{meta.label}</span>
                <span className="font-medium tabular-nums">{item.percentage.toFixed(0)}%</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

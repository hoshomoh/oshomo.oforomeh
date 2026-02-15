'use client';

import * as React from 'react';
import { BarChart, Bar, XAxis, YAxis, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getCategoryMeta } from '@/app/expense-wise-web/lib/constants';
import { formatCurrency } from '@/app/expense-wise-web/lib/format';
import { useCategoryChartConfig } from '@/app/expense-wise-web/hooks/use-category-chart-config';

type TopCategoriesChartData = {
  categoryId: string;
  amount: number;
  percentage: number;
};

type TopCategoriesChartProps = {
  data: TopCategoriesChartData[];
  currency?: string;
  className?: string;
};

export const TopCategoriesChart = React.memo(function TopCategoriesChart({
  data,
  currency = 'USD',
  className,
}: TopCategoriesChartProps) {
  const slicedData = React.useMemo(() => data.slice(0, 8), [data]);
  const { categoryMetaMap, chartConfig: baseChartConfig } = useCategoryChartConfig(slicedData);

  const chartConfig = React.useMemo(
    () => ({ ...baseChartConfig, amount: { label: 'Amount' } }),
    [baseChartConfig],
  );

  const chartData = React.useMemo(
    () =>
      slicedData.map((item) => {
        const meta = categoryMetaMap.get(item.categoryId)!;
        return {
          ...item,
          categoryLabel: meta.label,
          fill: meta.color,
        };
      }),
    [slicedData, categoryMetaMap],
  );

  if (!data.length) {
    return (
      <Card className={cn(className)}>
        <CardHeader>
          <CardTitle>Top Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartHeight = Math.max(200, chartData.length * 50);

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>Top Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <ChartContainer
            config={chartConfig}
            className="w-full"
            style={{ height: `${chartHeight}px`, minWidth: '350px' }}
          >
            <BarChart data={chartData} layout="vertical" accessibilityLayer margin={{ left: 10 }}>
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
                    formatter={(value, _name, item) => {
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
                            {formatCurrency(Number(value), currency)}{' '}
                            <span className="text-xs text-muted-foreground">
                              ({item.payload.percentage.toFixed(1)}%)
                            </span>
                          </span>
                        </div>
                      );
                    }}
                  />
                }
              />
              <Bar dataKey="amount" radius={[0, 4, 4, 0]} barSize={24}>
                {chartData.map((entry) => (
                  <Cell key={entry.categoryId} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
});

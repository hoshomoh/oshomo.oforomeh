import * as React from 'react';
import type { ChartConfig } from '@/components/ui/chart';
import { getCategoryMeta, type CategoryMeta } from '../lib/constants';

type CategoryDataItem = {
  categoryId: string;
  [key: string]: unknown;
};

/**
 * Shared hook for building category metadata map, chart config, and enriched
 * chart data from a list of items with `categoryId`.
 * Used by both CategoryPieChart and TopCategoriesChart.
 */
export function useCategoryChartConfig<T extends CategoryDataItem>(data: T[]) {
  const categoryMetaMap = React.useMemo(() => {
    const map = new Map<string, CategoryMeta>();
    for (const item of data) {
      if (!map.has(item.categoryId)) {
        map.set(item.categoryId, getCategoryMeta(item.categoryId));
      }
    }
    return map;
  }, [data]);

  const chartConfig = React.useMemo<ChartConfig>(() => {
    const config: ChartConfig = {};
    for (const item of data) {
      const meta = categoryMetaMap.get(item.categoryId)!;
      config[item.categoryId] = {
        label: meta.label,
        color: meta.color,
      };
    }
    return config;
  }, [data, categoryMetaMap]);

  return { categoryMetaMap, chartConfig };
}

'use client';

import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

type AccountBalanceSparklineData = {
  month: string;
  balance: number;
};

type AccountBalanceSparklineProps = {
  data: AccountBalanceSparklineData[];
  className?: string;
};

export function AccountBalanceSparkline({ data, className }: AccountBalanceSparklineProps) {
  if (!data.length) {
    return (
      <div
        className={cn(
          'flex h-[40px] w-full items-center justify-center text-xs text-muted-foreground',
          className,
        )}
      >
        --
      </div>
    );
  }

  return (
    <div className={cn('h-[40px] w-full', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="balance"
            stroke="var(--chart-1)"
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

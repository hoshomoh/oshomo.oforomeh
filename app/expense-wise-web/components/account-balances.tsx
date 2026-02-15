'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatCurrency, sortMonthKeys } from '../lib/format';
import type { ParsedAccount } from '../lib/types';
import { AccountBalanceSparkline } from './charts/account-balance-sparkline';

type AccountBalancesProps = {
  accounts: ParsedAccount[];
  className?: string;
};

export default function AccountBalances({ accounts, className }: AccountBalancesProps) {
  if (accounts.length === 0) {
    return (
      <div
        className={cn('flex items-center justify-center py-12 text-muted-foreground', className)}
      >
        No accounts found
      </div>
    );
  }

  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
      {accounts.map((account) => {
        const sortedKeys = sortMonthKeys(Object.keys(account.monthlyBalance));
        const sparklineData = sortedKeys.map((key) => ({
          month: key,
          balance: account.monthlyBalance[key],
        }));

        return (
          <Link
            key={account.id}
            href={`/expense-wise-web/accounts/${account.id}`}
            className="block group"
          >
            <Card className="h-full transition-shadow hover:shadow-lg cursor-pointer group-hover:border-primary/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold group-hover:text-primary transition-colors">
                  {account.name}
                </CardTitle>
                <p className="text-xs text-muted-foreground">{account.country}</p>
              </CardHeader>
              <CardContent>
                <div
                  className={cn(
                    'text-2xl font-bold',
                    account.balance >= 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-red-600 dark:text-red-400',
                  )}
                >
                  {formatCurrency(account.balance, account.currency)}
                </div>
                {sparklineData.length > 1 && (
                  <div className="mt-3">
                    <AccountBalanceSparkline data={sparklineData} />
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

'use client';

import * as React from 'react';
import { useData } from '../context/data-context';
import { PageHeader } from '../components/page-header';
import AccountBalances from '../components/account-balances';
import { EmptyState } from '../components/empty-state';
import { formatCurrency } from '../lib/format';
import type { Currency } from '../lib/types';

export default function AccountsPage() {
  const { accounts, hasData, isLoading } = useData();

  // Group balances by currency
  const currencyTotals = React.useMemo(() => {
    const totals = new Map<Currency, number>();
    for (const account of accounts) {
      const current = totals.get(account.currency) ?? 0;
      totals.set(account.currency, current + account.balance);
    }
    return Array.from(totals.entries()).sort(([, a], [, b]) => b - a);
  }, [accounts]);

  if (isLoading) {
    return null;
  }
  if (!hasData) {
    return <EmptyState />;
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Accounts"
        description={`${accounts.length} account${accounts.length !== 1 ? 's' : ''}`}
      />

      {/* Portfolio hero */}
      {currencyTotals.length > 0 && (
        <div className="rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border p-6">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
            Total Portfolio Value
          </p>
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            {currencyTotals.map(([currency, total], i) => (
              <span key={currency} className="flex items-baseline gap-1">
                {i > 0 && <span className="text-muted-foreground text-lg mr-1">+</span>}
                <span className="text-2xl sm:text-3xl font-bold">
                  {formatCurrency(total, currency)}
                </span>
              </span>
            ))}
          </div>

          {/* Currency mini-cards */}
          {currencyTotals.length > 1 && (
            <div className="flex flex-wrap gap-3 mt-4">
              {currencyTotals.map(([currency, total]) => {
                const count = accounts.filter((a) => a.currency === currency).length;
                return (
                  <div key={currency} className="rounded-lg bg-background/60 border px-4 py-2">
                    <p className="text-xs text-muted-foreground">{currency}</p>
                    <p className="text-sm font-semibold">{formatCurrency(total, currency)}</p>
                    <p className="text-xs text-muted-foreground">
                      {count} account{count !== 1 ? 's' : ''}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <AccountBalances accounts={accounts} />
    </div>
  );
}

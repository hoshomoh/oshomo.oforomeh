'use client';

import * as React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useData } from '../context/data-context';
import { useTransactionSearch } from '../hooks/use-transaction-search';
import { PageHeader } from '../components/page-header';
import { FiltersPanel } from '../components/filters-panel';
import TransactionsTable from '../components/transactions-table';
import { EmptyState } from '../components/empty-state';

export default function TransactionsPage() {
  const { transactions, accounts, groups, hasData, isLoading } = useData();

  const { currencies, filters, updateFilters, searchQuery, setSearchQuery, displayedTransactions } =
    useTransactionSearch(transactions, accounts);

  if (isLoading) {
    return null;
  }
  if (!hasData) {
    return <EmptyState />;
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Transactions"
        description={`${displayedTransactions.length} transactions found`}
      />

      {/* Text search input */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search transactions..."
          className="pl-9 pr-9"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 size-7"
            onClick={() => setSearchQuery('')}
          >
            <X className="size-3.5" />
          </Button>
        )}
      </div>

      <FiltersPanel
        filters={filters}
        onFilterChange={updateFilters}
        accounts={accounts}
        currencies={currencies}
        groups={groups}
        transactions={transactions}
      />

      <TransactionsTable transactions={displayedTransactions} accounts={accounts} pageSize={20} />
    </div>
  );
}

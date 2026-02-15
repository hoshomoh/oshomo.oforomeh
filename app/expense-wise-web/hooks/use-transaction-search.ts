'use client';

import * as React from 'react';
import { getCategoryMeta } from '../lib/constants';
import { useTransactionFilters } from '../context/transaction-filter-context';
import { filterTransactions } from '../lib/filter-transactions';
import type { ParsedTransaction, ParsedAccount } from '../lib/types';

export function useTransactionSearch(transactions: ParsedTransaction[], accounts: ParsedAccount[]) {
  const { filters, searchQuery, updateFilters, setSearchQuery } = useTransactionFilters();

  const currencies = React.useMemo(
    () => [...new Set(transactions.map((t) => t.currency))],
    [transactions],
  );

  // Apply all filters to transactions
  const filteredTransactions = React.useMemo(
    () => filterTransactions(transactions, filters),
    [transactions, filters],
  );

  // Build account name map for search matching
  const accountMap = React.useMemo(() => new Map(accounts.map((a) => [a.id, a.name])), [accounts]);

  // Client-side text search on filtered transactions
  const displayedTransactions = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return filteredTransactions;
    }
    return filteredTransactions.filter((tx) => {
      const description = tx.description.toLowerCase();
      const categoryLabel = getCategoryMeta(tx.categoryId).label.toLowerCase();
      const accountName = (accountMap.get(tx.accountId) ?? '').toLowerCase();
      return description.includes(q) || categoryLabel.includes(q) || accountName.includes(q);
    });
  }, [searchQuery, filteredTransactions, accountMap]);

  return {
    currencies,
    filters,
    updateFilters,
    searchQuery,
    setSearchQuery,
    displayedTransactions,
  };
}

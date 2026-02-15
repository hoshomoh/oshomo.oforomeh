'use client';

import * as React from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { useFilters } from './use-filters';
import { getCategoryMeta } from '../lib/constants';
import type { ParsedTransaction, ParsedAccount, ParsedGroup, DashboardFilters, DateRangePreset } from '../lib/types';

export function useTransactionSearch(
  transactions: ParsedTransaction[],
  accounts: ParsedAccount[],
  groups: ParsedGroup[],
) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const currencies = [...new Set(transactions.map((t) => t.currency))];

  // Compute initial filter overrides from URL params (consumed once by useFilters lazy init)
  const initialOverrides = React.useMemo(() => {
    const overrides: Partial<DashboardFilters> = {};
    const groupId = searchParams.get('groupId');
    const accountId = searchParams.get('accountId');
    const currency = searchParams.get('currency');
    const categoryId = searchParams.get('categoryId');
    const datePreset = searchParams.get('datePreset');
    const search = searchParams.get('search');
    if (groupId) {
      overrides.groupId = groupId;
    }
    if (accountId) {
      overrides.accountId = accountId;
    }
    if (currency) {
      overrides.currency = currency;
    }
    if (categoryId) {
      overrides.categoryId = categoryId;
    }
    if (datePreset) {
      overrides.datePreset = datePreset as DateRangePreset;
    }
    const hasOverrides = Object.keys(overrides).length > 0 || search;
    if (hasOverrides && !datePreset) {
      overrides.datePreset = 'all-time';
    }
    return hasOverrides ? overrides : undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally empty — only read URL params once on mount

  const { filters, updateFilters, filteredTransactions } = useFilters(
    transactions,
    accounts,
    initialOverrides,
  );

  // Text search from URL param or user input (initialized from URL once)
  const [searchQuery, setSearchQuery] = React.useState(() => searchParams.get('search') || '');

  // Sync filter state -> URL query params (the only useEffect in this hook)
  React.useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim());
    }
    if (filters.groupId !== 'all') {
      params.set('groupId', filters.groupId);
    }
    if (filters.accountId !== 'all') {
      params.set('accountId', filters.accountId);
    }
    if (filters.currency !== 'all') {
      params.set('currency', filters.currency);
    }
    if (filters.categoryId !== 'all') {
      params.set('categoryId', filters.categoryId);
    }
    if (filters.datePreset !== 'this-month') {
      params.set('datePreset', filters.datePreset);
    }
    const qs = params.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    window.history.replaceState(null, '', url);
  }, [
    pathname,
    searchQuery,
    filters.groupId,
    filters.accountId,
    filters.currency,
    filters.categoryId,
    filters.datePreset,
  ]);

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

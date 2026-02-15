'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import type { Results } from '@orama/orama';
import { useSearch } from '../context/search-context';
import { useData } from '../context/data-context';
import { searchTransactions } from '../lib/search-engine';
import type { TransactionSearchDoc } from '../lib/search-engine';
import type { ParsedAccount, ParsedGroup } from '../lib/types';

export function useGlobalSearch() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const { searchIndex, isIndexReady } = useSearch();
  const { accounts, groups, hasData } = useData();
  const router = useRouter();

  // Cmd+K / Ctrl+K shortcut
  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  // Transaction search via Orama (synchronous for in-memory indexes)
  const results = React.useMemo<Results<TransactionSearchDoc> | null>(() => {
    if (!query.trim() || !searchIndex || !isIndexReady) {
      return null;
    }
    return searchTransactions(searchIndex, query, undefined, 10);
  }, [query, searchIndex, isIndexReady]);

  // Filter accounts by query
  const matchingAccounts = React.useMemo<ParsedAccount[]>(() => {
    if (!query.trim()) {
      return [];
    }
    const q = query.toLowerCase();
    return accounts
      .filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.currency.toLowerCase().includes(q) ||
          a.country.toLowerCase().includes(q),
      )
      .slice(0, 5);
  }, [query, accounts]);

  // Filter groups by query
  const matchingGroups = React.useMemo<ParsedGroup[]>(() => {
    if (!query.trim()) {
      return [];
    }
    const q = query.toLowerCase();
    return groups.filter((g) => g.name.toLowerCase().includes(q)).slice(0, 5);
  }, [query, groups]);

  const hasAnyResults =
    (results?.hits.length ?? 0) > 0 || matchingAccounts.length > 0 || matchingGroups.length > 0;

  const handleSelect = React.useCallback(
    (value: string) => {
      setOpen(false);
      setQuery('');
      router.push(value);
    },
    [router],
  );

  const handleOpenChange = React.useCallback((value: boolean) => {
    setOpen(value);
    if (!value) {
      setQuery('');
    }
  }, []);

  return {
    open,
    query,
    setQuery,
    results,
    matchingAccounts,
    matchingGroups,
    hasAnyResults,
    hasData,
    handleSelect,
    handleOpenChange,
  };
}

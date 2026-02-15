import * as React from 'react';
import type { DashboardFilters, ParsedAccount, ParsedGroup, ParsedTransaction } from '../lib/types';

export function useFilteredOptions({
  filters,
  onFilterChange,
  accounts,
  transactions,
  groups,
}: {
  filters: DashboardFilters;
  onFilterChange: (filters: Partial<DashboardFilters>) => void;
  accounts: ParsedAccount[];
  transactions?: ParsedTransaction[];
  groups?: ParsedGroup[];
}) {
  // Filter accounts by selected currency
  const filteredAccounts = React.useMemo(() => {
    if (filters.currency === 'all') {
      return accounts;
    }
    return accounts.filter((a) => a.currency === filters.currency);
  }, [accounts, filters.currency]);

  // Filter groups to those that have transactions in the selected currency
  const filteredGroups = React.useMemo(() => {
    if (!groups || filters.currency === 'all' || !transactions) {
      return groups;
    }
    const groupIdsWithCurrency = new Set(
      transactions
        .filter((t) => t.currency === filters.currency && t.groupId)
        .map((t) => t.groupId),
    );
    return groups.filter((g) => groupIdsWithCurrency.has(g.id));
  }, [groups, filters.currency, transactions]);

  // When currency changes, reset account/group if they're no longer valid
  const handleCurrencyChange = React.useCallback(
    (value: string) => {
      const updates: Partial<DashboardFilters> = { currency: value };
      if (value !== 'all' && filters.accountId !== 'all') {
        const account = accounts.find((a) => a.id === filters.accountId);
        if (account && account.currency !== value) {
          updates.accountId = 'all';
        }
      }
      if (value !== 'all' && filters.groupId !== 'all' && transactions) {
        const hasGroupTx = transactions.some(
          (t) => t.groupId === filters.groupId && t.currency === value,
        );
        if (!hasGroupTx) {
          updates.groupId = 'all';
        }
      }
      onFilterChange(updates);
    },
    [accounts, filters.accountId, filters.groupId, onFilterChange, transactions],
  );

  // When account changes, auto-set currency to match
  const handleAccountChange = React.useCallback(
    (value: string) => {
      if (value === 'all') {
        onFilterChange({ accountId: value });
        return;
      }
      const account = accounts.find((a) => a.id === value);
      if (account && filters.currency !== 'all' && account.currency !== filters.currency) {
        onFilterChange({ accountId: value, currency: account.currency });
      } else if (account && filters.currency === 'all') {
        onFilterChange({ accountId: value, currency: account.currency });
      } else {
        onFilterChange({ accountId: value });
      }
    },
    [accounts, filters.currency, onFilterChange],
  );

  return {
    filteredAccounts,
    filteredGroups,
    handleCurrencyChange,
    handleAccountChange,
  };
}

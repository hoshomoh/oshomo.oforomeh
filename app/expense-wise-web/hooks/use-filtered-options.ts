import * as React from 'react';
import type { DashboardFilters, ParsedAccount, ParsedGroup, ParsedTransaction } from '../lib/types';

export function useFilteredOptions({
  filters,
  onFilterChange,
  accounts,
  currencies,
  transactions,
  groups,
}: {
  filters: DashboardFilters;
  onFilterChange: (filters: Partial<DashboardFilters>) => void;
  accounts: ParsedAccount[];
  currencies: string[];
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

  // Filter currencies by selected account
  const filteredCurrencies = React.useMemo(() => {
    if (filters.accountId === 'all') {
      return currencies;
    }
    const account = accounts.find((a) => a.id === filters.accountId);
    return account ? [account.currency] : currencies;
  }, [accounts, currencies, filters.accountId]);

  // Filter groups to those that have transactions matching selected filters
  const filteredGroups = React.useMemo(() => {
    if (!groups || !transactions) {
      return groups;
    }

    // If no filters are active, show all groups
    if (filters.currency === 'all' && filters.accountId === 'all') {
      return groups;
    }

    // Find groups that have transactions matching the active filters
    const relevantGroupIds = new Set(
      transactions
        .filter((t) => {
          if (!t.groupId) {
            return false;
          }
          if (filters.currency !== 'all' && t.currency !== filters.currency) {
            return false;
          }
          if (filters.accountId !== 'all' && t.accountId !== filters.accountId) {
            return false;
          }
          return true;
        })
        .map((t) => t.groupId),
    );

    return groups.filter((g) => relevantGroupIds.has(g.id));
  }, [groups, filters.currency, filters.accountId, transactions]);

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

  // When account changes, sync currency and reset group if no longer valid
  const handleAccountChange = React.useCallback(
    (value: string) => {
      const updates: Partial<DashboardFilters> = { accountId: value };

      if (value === 'all') {
        onFilterChange(updates);
        return;
      }

      // Always sync currency to the selected account's currency
      const selectedAccount = accounts.find((a) => a.id === value);
      if (selectedAccount) {
        updates.currency = selectedAccount.currency;
      }

      // Reset group if it has no transactions from this account
      if (filters.groupId !== 'all' && transactions) {
        const hasGroupTxFromAccount = transactions.some(
          (t) => t.groupId === filters.groupId && t.accountId === value,
        );
        if (!hasGroupTxFromAccount) {
          updates.groupId = 'all';
        }
      }

      onFilterChange(updates);
    },
    [accounts, filters.groupId, onFilterChange, transactions],
  );

  // When group changes, auto-set date to all-time to see all group transactions
  const handleGroupChange = React.useCallback(
    (value: string) => {
      const updates: Partial<DashboardFilters> = { groupId: value };

      // When selecting a specific group, set date to all-time
      if (value !== 'all') {
        updates.datePreset = 'all-time';
      }

      onFilterChange(updates);
    },
    [onFilterChange],
  );

  return {
    filteredAccounts,
    filteredCurrencies,
    filteredGroups,
    handleCurrencyChange,
    handleAccountChange,
    handleGroupChange,
  };
}

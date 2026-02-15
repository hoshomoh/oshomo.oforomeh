'use client';

import * as React from 'react';
import { useData } from '../context/data-context';
import { useTransactionFilters } from '../context/transaction-filter-context';
import { CATEGORY_META } from '../lib/constants';

export function useChatNavigation() {
  const { accounts, groups } = useData();
  const { navigateToTransactions } = useTransactionFilters();

  const navigateToAccount = React.useCallback(
    (accountName: string) => {
      const account = accounts.find((a) => a.name === accountName);
      if (account) {
        navigateToTransactions({ filters: { accountId: account.id } });
      }
    },
    [accounts, navigateToTransactions],
  );

  const navigateToCategory = React.useCallback(
    (categoryLabel: string) => {
      const entry = Object.entries(CATEGORY_META).find(([, meta]) => meta.label === categoryLabel);
      if (entry) {
        navigateToTransactions({ filters: { categoryId: entry[0] } });
      }
    },
    [navigateToTransactions],
  );

  const navigateToSearch = React.useCallback(
    (query: string) => {
      navigateToTransactions({ search: query });
    },
    [navigateToTransactions],
  );

  const navigateToGroup = React.useCallback(
    (groupName: string) => {
      const group = groups.find((g) => g.name === groupName);
      if (group) {
        navigateToTransactions({ filters: { groupId: group.id } });
      }
    },
    [groups, navigateToTransactions],
  );

  return { navigateToAccount, navigateToCategory, navigateToSearch, navigateToGroup };
}

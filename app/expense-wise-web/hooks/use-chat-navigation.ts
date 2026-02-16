'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useData } from '../context/data-context';
import { useTransactionFilters } from '../context/transaction-filter-context';
import { useChat } from '../context/chat-context';
import { CATEGORY_META } from '../lib/constants';

export function useChatNavigation() {
  const router = useRouter();
  const { accounts, groups } = useData();
  const { navigateToTransactions } = useTransactionFilters();
  const { close } = useChat();

  const navigateToAccount = React.useCallback(
    (accountName: string) => {
      const account = accounts.find((a) => a.name === accountName);
      if (account) {
        router.push(`/expense-wise-web/accounts/${account.id}`);
        close();
      }
    },
    [accounts, router, close],
  );

  const navigateToCategory = React.useCallback(
    (categoryLabel: string) => {
      const entry = Object.entries(CATEGORY_META).find(([, meta]) => meta.label === categoryLabel);
      if (entry) {
        navigateToTransactions({ filters: { categoryId: entry[0] } });
        close();
      }
    },
    [navigateToTransactions, close],
  );

  const navigateToSearch = React.useCallback(
    (query: string) => {
      navigateToTransactions({ search: query });
      close();
    },
    [navigateToTransactions, close],
  );

  const navigateToGroup = React.useCallback(
    (groupName: string) => {
      const group = groups.find((g) => g.name === groupName);
      if (group) {
        navigateToTransactions({ filters: { groupId: group.id } });
        close();
      }
    },
    [groups, navigateToTransactions, close],
  );

  return { navigateToAccount, navigateToCategory, navigateToSearch, navigateToGroup };
}

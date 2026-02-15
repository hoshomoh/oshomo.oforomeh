'use client';

import * as React from 'react';
import {
  getAllTransactions,
  getAllAccounts,
  getBudgets,
  getAllGroups,
  getMetadata,
  hasData as checkHasData,
} from '../lib/db';
import { parseTransaction, parseAccount, parseBudget, parseGroup } from '../lib/parsers';
import type {
  ParsedTransaction,
  ParsedAccount,
  ParsedBudget,
  ParsedGroup,
  AppMetadata,
} from '../lib/types';

type ExpenseDataState = {
  transactions: ParsedTransaction[];
  accounts: ParsedAccount[];
  budgets: ParsedBudget[];
  groups: ParsedGroup[];
  metadata: AppMetadata | undefined;
  isLoading: boolean;
  error: Error | null;
  hasData: boolean;
};

export function useExpenseData() {
  const [state, setState] = React.useState<ExpenseDataState>({
    transactions: [],
    accounts: [],
    budgets: [],
    groups: [],
    metadata: undefined,
    isLoading: true,
    error: null,
    hasData: false,
  });

  const loadData = React.useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const [rawTransactions, rawAccounts, rawBudgets, rawGroups, metadata, dataExists] =
        await Promise.all([
          getAllTransactions(),
          getAllAccounts(),
          getBudgets(),
          getAllGroups(),
          getMetadata(),
          checkHasData(),
        ]);

      const transactions = rawTransactions.map(parseTransaction);
      const accounts = rawAccounts.map(parseAccount);
      const budgets = rawBudgets.map(parseBudget);
      const groups = rawGroups.map(parseGroup);

      setState({
        transactions,
        accounts,
        budgets,
        groups,
        metadata,
        isLoading: false,
        error: null,
        hasData: dataExists,
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err : new Error('Failed to load data from IndexedDB'),
      }));
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    transactions: state.transactions,
    accounts: state.accounts,
    budgets: state.budgets,
    groups: state.groups,
    metadata: state.metadata,
    isLoading: state.isLoading,
    error: state.error,
    hasData: state.hasData,
    refetch: loadData,
  };
}

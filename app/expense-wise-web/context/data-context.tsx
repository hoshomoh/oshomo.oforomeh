'use client';

import * as React from 'react';
import { useExpenseData } from '../hooks/use-expense-data';
import type {
  ParsedTransaction,
  ParsedAccount,
  ParsedBudget,
  ParsedGroup,
  AppMetadata,
} from '../lib/types';

type DataContextValue = {
  transactions: ParsedTransaction[];
  accounts: ParsedAccount[];
  budgets: ParsedBudget[];
  groups: ParsedGroup[];
  metadata: AppMetadata | undefined;
  isLoading: boolean;
  error: Error | null;
  hasData: boolean;
  refetch: () => Promise<void>;
};

const DataContext = React.createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const data = useExpenseData();

  return <DataContext.Provider value={data}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const context = React.useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

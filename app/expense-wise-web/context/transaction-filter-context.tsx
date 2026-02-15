'use client';

import * as React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import type { DashboardFilters, DateRangePreset } from '../lib/types';
import {
  getDateRangeForPreset,
  createDefaultFilters,
  applyDatePresetSync,
} from '../lib/filter-utils';

type TransactionFilterState = {
  filters: DashboardFilters;
  searchQuery: string;
};

type TransactionFilterAction =
  | { type: 'UPDATE_FILTERS'; partial: Partial<DashboardFilters> }
  | { type: 'SET_SEARCH'; query: string }
  | { type: 'NAVIGATE'; filters?: Partial<DashboardFilters>; search?: string }
  | { type: 'INIT_FROM_URL'; filters?: Partial<DashboardFilters>; search?: string }
  | { type: 'RESET' };

function filterReducer(
  state: TransactionFilterState,
  action: TransactionFilterAction,
): TransactionFilterState {
  switch (action.type) {
    case 'UPDATE_FILTERS': {
      const merged = { ...state.filters, ...action.partial };
      return {
        ...state,
        filters: applyDatePresetSync(merged, action.partial),
      };
    }
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.query };
    case 'NAVIGATE':
    case 'INIT_FROM_URL': {
      const defaults = createDefaultFilters();
      const overrides = action.filters ?? {};
      const merged = { ...defaults, ...overrides };
      if (overrides.datePreset && overrides.datePreset !== 'custom') {
        merged.dateRange = getDateRangeForPreset(overrides.datePreset);
      }
      // NAVIGATE/INIT_FROM_URL always have overrides (search or filters) — show all time
      if (!overrides.datePreset) {
        merged.datePreset = 'all-time';
        merged.dateRange = getDateRangeForPreset('all-time');
      }
      return {
        filters: merged,
        searchQuery: action.search ?? '',
      };
    }
    case 'RESET':
      return { filters: createDefaultFilters(), searchQuery: '' };
    default:
      return state;
  }
}

function parseUrlParams(searchParams: URLSearchParams): {
  hasOverrides: boolean;
  filters: Partial<DashboardFilters>;
  search: string;
} {
  const filters: Partial<DashboardFilters> = {};
  const groupId = searchParams.get('groupId');
  const accountId = searchParams.get('accountId');
  const currency = searchParams.get('currency');
  const categoryId = searchParams.get('categoryId');
  const datePreset = searchParams.get('datePreset');
  const search = searchParams.get('search') || '';

  if (groupId) {
    filters.groupId = groupId;
  }
  if (accountId) {
    filters.accountId = accountId;
  }
  if (currency) {
    filters.currency = currency;
  }
  if (categoryId) {
    filters.categoryId = categoryId;
  }
  if (datePreset) {
    filters.datePreset = datePreset as DateRangePreset;
  }

  const hasOverrides = Object.keys(filters).length > 0 || search.length > 0;
  return { hasOverrides, filters, search };
}

function buildUrlParams(state: TransactionFilterState): string {
  const params = new URLSearchParams();
  if (state.searchQuery.trim()) {
    params.set('search', state.searchQuery.trim());
  }
  if (state.filters.groupId !== 'all') {
    params.set('groupId', state.filters.groupId);
  }
  if (state.filters.accountId !== 'all') {
    params.set('accountId', state.filters.accountId);
  }
  if (state.filters.currency !== 'all') {
    params.set('currency', state.filters.currency);
  }
  if (state.filters.categoryId !== 'all') {
    params.set('categoryId', state.filters.categoryId);
  }
  if (state.filters.datePreset !== 'this-year') {
    params.set('datePreset', state.filters.datePreset);
  }
  return params.toString();
}

const TRANSACTIONS_PATH = '/expense-wise-web/transactions';

function isTransactionsPage(pathname: string): boolean {
  return pathname === TRANSACTIONS_PATH;
}

type TransactionFilterContextValue = {
  filters: DashboardFilters;
  searchQuery: string;
  updateFilters: (partial: Partial<DashboardFilters>) => void;
  setSearchQuery: (query: string) => void;
  resetFilters: () => void;
  navigateToTransactions: (opts?: { filters?: Partial<DashboardFilters>; search?: string }) => void;
};

const TransactionFilterContext = React.createContext<TransactionFilterContextValue | null>(null);

export function TransactionFilterProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Ref to prevent circular URL ↔ state sync
  const skipUrlSyncRef = React.useRef(false);
  // Track the serialized URL params we last wrote to prevent re-reading our own writes
  const lastWrittenUrlRef = React.useRef<string>('');

  const [state, dispatch] = React.useReducer(filterReducer, undefined, () => {
    // Initialize from URL if on the transactions page
    if (isTransactionsPage(pathname)) {
      const { hasOverrides, filters, search } = parseUrlParams(searchParams);
      if (hasOverrides) {
        const defaults = createDefaultFilters();
        const merged = { ...defaults, ...filters };
        if (filters.datePreset && filters.datePreset !== 'custom') {
          merged.dateRange = getDateRangeForPreset(filters.datePreset);
        } else if (hasOverrides && !filters.datePreset) {
          merged.datePreset = 'all-time';
          merged.dateRange = getDateRangeForPreset('all-time');
        }
        return { filters: merged, searchQuery: search };
      }
      // No URL overrides on transactions page — default to current year
      const txDefaults = createDefaultFilters();
      txDefaults.datePreset = 'this-year';
      txDefaults.dateRange = getDateRangeForPreset('this-year');
      return { filters: txDefaults, searchQuery: '' };
    }
    return { filters: createDefaultFilters(), searchQuery: '' };
  });

  const updateFilters = React.useCallback((partial: Partial<DashboardFilters>) => {
    dispatch({ type: 'UPDATE_FILTERS', partial });
  }, []);

  const setSearchQuery = React.useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH', query });
  }, []);

  const resetFilters = React.useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const navigateToTransactions = React.useCallback(
    (opts?: { filters?: Partial<DashboardFilters>; search?: string }) => {
      dispatch({
        type: 'NAVIGATE',
        filters: opts?.filters,
        search: opts?.search,
      });
      if (!isTransactionsPage(pathname)) {
        // Build URL with params for the navigation
        const defaults = createDefaultFilters();
        const overrides = opts?.filters ?? {};
        const merged = { ...defaults, ...overrides };
        if (overrides.datePreset && overrides.datePreset !== 'custom') {
          merged.dateRange = getDateRangeForPreset(overrides.datePreset);
        } else if (!overrides.datePreset) {
          merged.datePreset = 'all-time';
          merged.dateRange = getDateRangeForPreset('all-time');
        }
        const tempState: TransactionFilterState = {
          filters: merged,
          searchQuery: opts?.search ?? '',
        };
        const qs = buildUrlParams(tempState);
        const url = qs ? `${TRANSACTIONS_PATH}?${qs}` : TRANSACTIONS_PATH;
        // Mark that we're navigating so URL→state sync doesn't overwrite
        skipUrlSyncRef.current = true;
        lastWrittenUrlRef.current = qs;
        router.push(url);
      }
    },
    [pathname, router],
  );

  // URL → state: when URL params change on the transactions page (e.g., <Link> navigation, browser back/forward)
  React.useEffect(() => {
    if (!isTransactionsPage(pathname)) {
      return;
    }
    // Skip if this change originated from our own state → URL write
    if (skipUrlSyncRef.current) {
      skipUrlSyncRef.current = false;
      return;
    }
    const currentQs = searchParams.toString();
    // Skip if the URL matches what we last wrote (prevents circular sync)
    if (currentQs === lastWrittenUrlRef.current) {
      return;
    }
    const { hasOverrides, filters, search } = parseUrlParams(searchParams);
    if (hasOverrides) {
      dispatch({ type: 'INIT_FROM_URL', filters, search });
    }
  }, [pathname, searchParams]);

  // State → URL: sync state to URL when on the transactions page
  React.useEffect(() => {
    if (!isTransactionsPage(pathname)) {
      return;
    }
    const qs = buildUrlParams(state);
    const currentQs = searchParams.toString();
    // Only update if the URL actually needs to change
    if (qs === currentQs) {
      return;
    }
    lastWrittenUrlRef.current = qs;
    const url = qs ? `${pathname}?${qs}` : pathname;
    window.history.replaceState(null, '', url);
  }, [pathname, searchParams, state]);

  const value = React.useMemo<TransactionFilterContextValue>(
    () => ({
      filters: state.filters,
      searchQuery: state.searchQuery,
      updateFilters,
      setSearchQuery,
      resetFilters,
      navigateToTransactions,
    }),
    [
      state.filters,
      state.searchQuery,
      updateFilters,
      setSearchQuery,
      resetFilters,
      navigateToTransactions,
    ],
  );

  return (
    <TransactionFilterContext.Provider value={value}>{children}</TransactionFilterContext.Provider>
  );
}

export function useTransactionFilters(): TransactionFilterContextValue {
  const context = React.useContext(TransactionFilterContext);
  if (!context) {
    throw new Error('useTransactionFilters must be used within a TransactionFilterProvider');
  }
  return context;
}

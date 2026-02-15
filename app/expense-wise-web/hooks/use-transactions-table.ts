'use client';

import * as React from 'react';
import type { ParsedTransaction, ParsedAccount } from '../lib/types';

export type SortColumn = 'date' | 'description' | 'category' | 'amount' | 'account' | 'type';
export type SortDirection = 'asc' | 'desc';

type TableState = {
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  currentPage: number;
  currentPageSize: number;
};

type TableAction =
  | { type: 'SORT'; column: SortColumn }
  | { type: 'SET_PAGE'; page: number }
  | { type: 'SET_PAGE_SIZE'; size: number }
  | { type: 'NEXT_PAGE' }
  | { type: 'PREV_PAGE' };

function getAccountName(accountId: string, accounts?: ParsedAccount[]): string {
  if (!accounts) {
    return accountId;
  }
  const account = accounts.find((a) => a.id === accountId);
  return account?.name ?? accountId;
}

function createTableReducer(totalPagesRef: { current: number }) {
  return function tableReducer(state: TableState, action: TableAction): TableState {
    switch (action.type) {
      case 'SORT': {
        if (state.sortColumn === action.column) {
          return {
            ...state,
            sortDirection: state.sortDirection === 'asc' ? 'desc' : 'asc',
            currentPage: 0,
          };
        }
        return {
          ...state,
          sortColumn: action.column,
          sortDirection: 'asc',
          currentPage: 0,
        };
      }
      case 'SET_PAGE':
        return { ...state, currentPage: action.page };
      case 'SET_PAGE_SIZE':
        return { ...state, currentPageSize: action.size, currentPage: 0 };
      case 'NEXT_PAGE':
        return {
          ...state,
          currentPage: Math.min(totalPagesRef.current - 1, state.currentPage + 1),
        };
      case 'PREV_PAGE':
        return {
          ...state,
          currentPage: Math.max(0, state.currentPage - 1),
        };
      default:
        return state;
    }
  };
}

type UseTransactionsTableParams = {
  transactions: ParsedTransaction[];
  accounts?: ParsedAccount[];
  pageSize?: number;
  showViewAll?: boolean;
};

export function useTransactionsTable({
  transactions,
  accounts,
  pageSize = 10,
  showViewAll = false,
}: UseTransactionsTableParams) {
  const totalPagesRef = React.useRef(1);

  const reducer = React.useMemo(() => createTableReducer(totalPagesRef), []);

  const [state, dispatch] = React.useReducer(reducer, {
    sortColumn: 'date' as SortColumn,
    sortDirection: 'desc' as SortDirection,
    currentPage: 0,
    currentPageSize: pageSize,
  });

  const handleSort = React.useCallback((column: SortColumn) => {
    dispatch({ type: 'SORT', column });
  }, []);

  const sortedTransactions = React.useMemo(() => {
    const sorted = [...transactions].sort((a, b) => {
      let comparison = 0;

      switch (state.sortColumn) {
        case 'date':
          comparison = a.date.getTime() - b.date.getTime();
          break;
        case 'description':
          comparison = a.description.localeCompare(b.description);
          break;
        case 'category':
          comparison = a.categoryId.localeCompare(b.categoryId);
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'account':
          comparison = getAccountName(a.accountId, accounts).localeCompare(
            getAccountName(b.accountId, accounts),
          );
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
      }

      return state.sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [transactions, state.sortColumn, state.sortDirection, accounts]);

  const effectivePageSize = showViewAll ? pageSize : state.currentPageSize;
  const totalPages = Math.max(1, Math.ceil(sortedTransactions.length / effectivePageSize));
  totalPagesRef.current = totalPages;

  const startIndex = state.currentPage * effectivePageSize;
  const endIndex = Math.min(startIndex + effectivePageSize, sortedTransactions.length);
  const paginatedTransactions = sortedTransactions.slice(startIndex, endIndex);

  const setPage = React.useCallback((page: number) => {
    dispatch({ type: 'SET_PAGE', page });
  }, []);

  const setPageSize = React.useCallback((size: number) => {
    dispatch({ type: 'SET_PAGE_SIZE', size });
  }, []);

  const nextPage = React.useCallback(() => {
    dispatch({ type: 'NEXT_PAGE' });
  }, []);

  const prevPage = React.useCallback(() => {
    dispatch({ type: 'PREV_PAGE' });
  }, []);

  return {
    sortColumn: state.sortColumn,
    sortDirection: state.sortDirection,
    currentPage: state.currentPage,
    currentPageSize: state.currentPageSize,
    handleSort,
    sortedTransactions,
    paginatedTransactions,
    effectivePageSize,
    totalPages,
    startIndex,
    endIndex,
    setPage,
    setPageSize,
    nextPage,
    prevPage,
  };
}

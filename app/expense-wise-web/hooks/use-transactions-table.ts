'use client';

import * as React from 'react';
import { compareAsc } from 'date-fns';
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
  | { type: 'SET_PAGE_SIZE'; size: number };

function tableReducer(state: TableState, action: TableAction): TableState {
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
    default:
      return state;
  }
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
  const [state, dispatch] = React.useReducer(tableReducer, {
    sortColumn: 'date' as SortColumn,
    sortDirection: 'desc' as SortDirection,
    currentPage: 0,
    currentPageSize: pageSize,
  });

  const handleSort = React.useCallback((column: SortColumn) => {
    dispatch({ type: 'SORT', column });
  }, []);

  // O(1) account name lookup map — built once, used in sorting and rendering
  const accountNameMap = React.useMemo(
    () => new Map(accounts?.map((a) => [a.id, a.name]) ?? []),
    [accounts],
  );

  const sortedTransactions = React.useMemo(() => {
    const sorted = [...transactions].sort((a, b) => {
      let comparison = 0;

      switch (state.sortColumn) {
        case 'date':
          comparison = compareAsc(a.date, b.date);
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
        case 'account': {
          const nameA = accountNameMap.get(a.accountId) ?? a.accountId;
          const nameB = accountNameMap.get(b.accountId) ?? b.accountId;
          comparison = nameA.localeCompare(nameB);
          break;
        }
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
      }

      return state.sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [transactions, state.sortColumn, state.sortDirection, accountNameMap]);

  const effectivePageSize = showViewAll ? pageSize : state.currentPageSize;
  const totalPages = Math.max(1, Math.ceil(sortedTransactions.length / effectivePageSize));

  // Clamp currentPage to valid range (may be out of bounds after data changes)
  const currentPage = Math.min(state.currentPage, totalPages - 1);

  const startIndex = currentPage * effectivePageSize;
  const endIndex = Math.min(startIndex + effectivePageSize, sortedTransactions.length);
  const paginatedTransactions = sortedTransactions.slice(startIndex, endIndex);

  const setPage = React.useCallback((page: number) => {
    dispatch({ type: 'SET_PAGE', page });
  }, []);

  const setPageSize = React.useCallback((size: number) => {
    dispatch({ type: 'SET_PAGE_SIZE', size });
  }, []);

  const nextPage = React.useCallback(() => {
    dispatch({ type: 'SET_PAGE', page: currentPage + 1 });
  }, [currentPage]);

  const prevPage = React.useCallback(() => {
    dispatch({ type: 'SET_PAGE', page: currentPage - 1 });
  }, [currentPage]);

  return {
    sortColumn: state.sortColumn,
    sortDirection: state.sortDirection,
    currentPage,
    currentPageSize: state.currentPageSize,
    handleSort,
    accountNameMap,
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

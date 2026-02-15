import { isWithinInterval } from 'date-fns';
import type { DashboardFilters, ParsedTransaction } from './types';

/**
 * Apply dashboard filters to a list of transactions.
 * Shared by both `useFilters` (dashboard) and `useTransactionSearch` (transactions page).
 */
export function filterTransactions(
  transactions: ParsedTransaction[],
  filters: DashboardFilters,
): ParsedTransaction[] {
  return transactions.filter((tx) => {
    // Date range filter
    if (
      !isWithinInterval(tx.date, {
        start: filters.dateRange.from,
        end: filters.dateRange.to,
      })
    ) {
      return false;
    }

    // Currency filter
    if (filters.currency !== 'all' && tx.currency !== filters.currency) {
      return false;
    }

    // Account filter
    if (filters.accountId !== 'all' && tx.accountId !== filters.accountId) {
      return false;
    }

    // Category filter
    if (filters.categoryId !== 'all' && tx.categoryId !== filters.categoryId) {
      return false;
    }

    // Group filter
    if (filters.groupId !== 'all' && tx.groupId !== filters.groupId) {
      return false;
    }

    return true;
  });
}

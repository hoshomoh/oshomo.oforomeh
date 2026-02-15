'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  formatCurrency,
  formatDate,
  truncateDescription,
  getAmountColorClass,
  getTypeBadgeVariant,
} from '../lib/format';
import { getCategoryMeta } from '../lib/constants';
import { TransactionType } from '../lib/types';
import type { ParsedTransaction, ParsedAccount } from '../lib/types';
import { useTransactionsTable } from '../hooks/use-transactions-table';
import type { SortColumn } from '../hooks/use-transactions-table';

type TransactionsTableProps = {
  transactions: ParsedTransaction[];
  accounts?: ParsedAccount[];
  pageSize?: number;
  showViewAll?: boolean;
  viewAllHref?: string;
  className?: string;
};

export default React.memo(function TransactionsTable({
  transactions,
  accounts,
  pageSize = 10,
  showViewAll = false,
  viewAllHref = '/expense-wise-web/transactions',
  className,
}: TransactionsTableProps) {
  const {
    sortColumn,
    sortDirection,
    currentPage,
    currentPageSize,
    handleSort,
    accountNameMap,
    sortedTransactions,
    paginatedTransactions,
    totalPages,
    startIndex,
    endIndex,
    setPageSize,
    nextPage,
    prevPage,
  } = useTransactionsTable({ transactions, accounts, pageSize, showViewAll });

  function getSortIcon(column: SortColumn) {
    if (sortColumn !== column) {
      return <ArrowUpDown className="ml-1 inline size-3 text-muted-foreground/50" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="ml-1 inline size-3" />
    ) : (
      <ArrowDown className="ml-1 inline size-3" />
    );
  }

  if (transactions.length === 0) {
    return (
      <div
        className={cn('flex items-center justify-center py-12 text-muted-foreground', className)}
      >
        No transactions found
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer select-none" onClick={() => handleSort('date')}>
                Date
                {getSortIcon('date')}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort('description')}
              >
                Description
                {getSortIcon('description')}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none hidden sm:table-cell"
                onClick={() => handleSort('category')}
              >
                Category
                {getSortIcon('category')}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none text-right"
                onClick={() => handleSort('amount')}
              >
                Amount
                {getSortIcon('amount')}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none hidden md:table-cell"
                onClick={() => handleSort('account')}
              >
                Account
                {getSortIcon('account')}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none hidden sm:table-cell"
                onClick={() => handleSort('type')}
              >
                Type
                {getSortIcon('type')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTransactions.map((tx) => {
              const categoryMeta = getCategoryMeta(tx.categoryId);
              const CategoryIcon = categoryMeta.icon;

              return (
                <TableRow key={tx.id}>
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {formatDate(tx.date)}
                  </TableCell>
                  <TableCell className="max-w-[250px]" title={tx.description}>
                    {truncateDescription(tx.description)}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className="inline-flex items-center gap-1.5">
                      <CategoryIcon
                        className="size-3.5 shrink-0"
                        style={{ color: categoryMeta.color }}
                      />
                      <span className="text-sm">{categoryMeta.label}</span>
                    </span>
                  </TableCell>
                  <TableCell
                    className={cn(
                      'text-right font-medium whitespace-nowrap',
                      getAmountColorClass(tx.type),
                    )}
                  >
                    {tx.type === TransactionType.EXPENSE ? '-' : ''}
                    {formatCurrency(tx.amount, tx.currency)}
                  </TableCell>
                  <TableCell className="text-muted-foreground hidden md:table-cell">
                    {accountNameMap.get(tx.accountId) ?? tx.accountId}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant={getTypeBadgeVariant(tx.type)} className="text-[10px]">
                      {tx.type}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* View All link (dashboard mode) */}
      {showViewAll ? (
        sortedTransactions.length > pageSize && (
          <div className="flex justify-center">
            <Button variant="outline" size="sm" asChild>
              <Link href={viewAllHref}>View all {sortedTransactions.length} transactions</Link>
            </Button>
          </div>
        )
      ) : (
        /* Pagination with page size selector */
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-2">
          <div className="flex items-center gap-3">
            <p className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{endIndex} of {sortedTransactions.length}
            </p>
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-muted-foreground">Rows:</span>
              <Select value={String(currentPageSize)} onValueChange={(v) => setPageSize(Number(v))}>
                <SelectTrigger className="w-[70px]" size="sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={prevPage} disabled={currentPage === 0}>
              <ChevronLeft className="size-4" />
              Prev
            </Button>
            <span className="text-sm text-muted-foreground">
              {currentPage + 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={nextPage}
              disabled={currentPage >= totalPages - 1}
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
});

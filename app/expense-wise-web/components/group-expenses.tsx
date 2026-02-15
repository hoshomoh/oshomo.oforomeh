'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDate } from '../lib/format';
import { getCategoryMeta } from '../lib/constants';
import { useGroupData } from '../hooks/use-group-data';
import { TransactionType, GroupType } from '../lib/types';
import type { ParsedGroup, ParsedTransaction, ParsedAccount } from '../lib/types';

type GroupExpensesProps = {
  groups: ParsedGroup[];
  transactions: ParsedTransaction[];
  accounts?: ParsedAccount[];
  className?: string;
};

const MAX_VISIBLE_TRANSACTIONS = 5;

const GROUP_TYPE_STYLES: Record<GroupType, { bg: string; text: string }> = {
  [GroupType.TRIP]: {
    bg: 'bg-blue-100 dark:bg-blue-950',
    text: 'text-blue-700 dark:text-blue-400',
  },
  [GroupType.HOME]: {
    bg: 'bg-emerald-100 dark:bg-emerald-950',
    text: 'text-emerald-700 dark:text-emerald-400',
  },
  [GroupType.COUPLE]: {
    bg: 'bg-pink-100 dark:bg-pink-950',
    text: 'text-pink-700 dark:text-pink-400',
  },
  [GroupType.OTHERS]: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-700 dark:text-gray-400',
  },
};

function getAccountName(accountId: string, accounts?: ParsedAccount[]): string {
  if (!accounts) {
    return accountId;
  }
  const account = accounts.find((a) => a.id === accountId);
  return account?.name ?? accountId;
}

export default function GroupExpenses({
  groups,
  transactions,
  accounts,
  className,
}: GroupExpensesProps) {
  const { groupData } = useGroupData(groups, transactions);

  if (groups.length === 0) {
    return (
      <div
        className={cn('flex items-center justify-center py-12 text-muted-foreground', className)}
      >
        No groups found
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {groupData.map(({ group, transactions: groupTxns, totalExpenses, currency }) => {
        const typeStyle = GROUP_TYPE_STYLES[group.type] ?? GROUP_TYPE_STYLES[GroupType.OTHERS];
        const visibleTxns = groupTxns.slice(0, MAX_VISIBLE_TRANSACTIONS);
        const hasMore = groupTxns.length > MAX_VISIBLE_TRANSACTIONS;

        return (
          <Card key={group.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-base font-bold">{group.name}</CardTitle>
                  <Badge
                    variant="secondary"
                    className={cn('text-[10px]', typeStyle.bg, typeStyle.text)}
                  >
                    {group.type}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6 mb-2">
                <div>
                  <p className="text-xs text-muted-foreground">Total Spent</p>
                  <p className="text-lg font-bold text-red-600 dark:text-red-400">
                    {formatCurrency(totalExpenses, currency)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Transactions</p>
                  <p className="text-lg font-bold">{groupTxns.length}</p>
                </div>
              </div>

              {groupTxns.length > 0 && (
                <Accordion type="single" collapsible>
                  <AccordionItem value={`group-${group.id}`} className="border-b-0">
                    <AccordionTrigger className="py-2 text-sm text-muted-foreground hover:no-underline">
                      View transactions
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {visibleTxns.map((tx) => {
                          const categoryMeta = getCategoryMeta(tx.categoryId);
                          const CategoryIcon = categoryMeta.icon;
                          const isExpense = tx.type === TransactionType.EXPENSE;

                          return (
                            <div
                              key={tx.id}
                              className="flex items-center justify-between py-2 px-2 rounded-md hover:bg-muted/50"
                            >
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <CategoryIcon
                                  className="size-4 shrink-0"
                                  style={{ color: categoryMeta.color }}
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium truncate">{tx.description}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatDate(tx.date)} &middot;{' '}
                                    {getAccountName(tx.accountId, accounts)}
                                  </p>
                                </div>
                              </div>
                              <span
                                className={cn(
                                  'text-sm font-medium shrink-0 ml-2',
                                  isExpense
                                    ? 'text-red-600 dark:text-red-400'
                                    : 'text-emerald-600 dark:text-emerald-400',
                                )}
                              >
                                {isExpense ? '-' : ''}
                                {formatCurrency(tx.amount, tx.currency)}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {hasMore && (
                        <Link
                          href={`/expense-wise-web/transactions?groupId=${group.id}`}
                          className="flex items-center gap-1 mt-3 text-sm text-primary hover:underline"
                        >
                          View all {groupTxns.length} transactions
                          <ArrowRight className="size-3.5" />
                        </Link>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

import * as React from 'react';
import { compareDesc } from 'date-fns';
import { TransactionType } from '../lib/types';
import type { ParsedGroup, ParsedTransaction, Currency } from '../lib/types';

type GroupDataItem = {
  group: ParsedGroup;
  transactions: ParsedTransaction[];
  totalExpenses: number;
  currency: Currency;
};

export function useGroupData(
  groups: ParsedGroup[],
  transactions: ParsedTransaction[],
): { groupData: GroupDataItem[] } {
  const sortedGroups = React.useMemo(
    () => [...groups].sort((a, b) => a.name.localeCompare(b.name)),
    [groups],
  );

  const groupData = React.useMemo(() => {
    return sortedGroups.map((group) => {
      const groupTransactions = transactions
        .filter((tx) => tx.groupId === group.id)
        .sort((a, b) => compareDesc(a.date, b.date));
      const totalExpenses = groupTransactions
        .filter((tx) => tx.type === TransactionType.EXPENSE)
        .reduce((sum, tx) => sum + tx.amount, 0);
      const primaryCurrency = groupTransactions.length > 0 ? groupTransactions[0].currency : 'EUR';

      return {
        group,
        transactions: groupTransactions,
        totalExpenses,
        currency: primaryCurrency,
      };
    });
  }, [sortedGroups, transactions]);

  return { groupData };
}

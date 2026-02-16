import * as React from 'react';
import { compareDesc } from 'date-fns';
import { TransactionType } from '../lib/types';
import { convertCurrency } from '../lib/currency-conversion';
import { getPrimaryCurrency } from '../lib/budget-utils';
import { useExchangeRates } from './use-exchange-rates';
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
  const { rates: exchangeRates } = useExchangeRates();
  const sortedGroups = React.useMemo(
    () => [...groups].sort((a, b) => a.name.localeCompare(b.name)),
    [groups],
  );

  const groupData = React.useMemo(() => {
    return sortedGroups.map((group) => {
      const groupTransactions = transactions
        .filter((tx) => tx.groupId === group.id)
        .sort((a, b) => compareDesc(a.date, b.date));
      const primaryCurrency = getPrimaryCurrency(groupTransactions);
      const totalExpenses = groupTransactions
        .filter((tx) => tx.type === TransactionType.EXPENSE)
        .reduce((sum, tx) => {
          if (tx.currency === primaryCurrency || !exchangeRates) {
            return sum + tx.amount;
          }
          return sum + convertCurrency(tx.amount, tx.currency, primaryCurrency, exchangeRates);
        }, 0);

      return {
        group,
        transactions: groupTransactions,
        totalExpenses,
        currency: primaryCurrency,
      };
    });
  }, [sortedGroups, transactions, exchangeRates]);

  return { groupData };
}

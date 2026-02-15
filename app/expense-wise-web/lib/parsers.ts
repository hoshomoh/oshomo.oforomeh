// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - parse-decimal-number has no type declarations
import parseDecimalNumber from 'parse-decimal-number';
import { parseISO } from 'date-fns';
import {
  type TransactionDocument,
  type AccountDocument,
  type BudgetDocument,
  type GroupDocument,
  type ParsedTransaction,
  type ParsedAccount,
  type ParsedBudget,
  type ParsedGroup,
  TransactionType,
} from './types';

/**
 * Convert a string amount to a number, matching the mobile app's
 * `convertStringToNumber` implementation exactly.
 * Uses `parse-decimal-number` for auto-detection of number formats.
 */
export function convertStringToNumber(value?: string | number): number {
  if (!value || Number.isNaN(value)) {
    return 0;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return 0;
    }

    let parsed = parseDecimalNumber(value);
    if (Number.isNaN(parsed)) {
      parsed = parseDecimalNumber(value, ['.', ',']);
    }
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return value;
}

/**
 * Parse a transaction document into a normalized form with numeric amounts.
 */
export function parseTransaction(doc: TransactionDocument): ParsedTransaction {
  const details = doc.details;
  const base: ParsedTransaction = {
    id: doc._id,
    type: doc.type,
    amount: convertStringToNumber(details.amount),
    currency: 'EUR',
    categoryId: '',
    accountId: details.account_id,
    description: '',
    date: parseISO(details.date),
    groupId: null,
    participants: {},
    createdAt: doc.created_at,
    updatedAt: doc.updated_at,
  };

  switch (doc.type) {
    case TransactionType.EXPENSE: {
      const d = doc.details;
      base.currency = d.currency;
      base.categoryId = d.category_id;
      base.description = d.description;
      base.groupId = d.group_id ?? null;
      base.splittingMethod = d.splitting_method;
      base.participants = Object.fromEntries(
        Object.entries(d.participants).map(([uid, p]) => [
          uid,
          { paid: convertStringToNumber(p.paid), share: convertStringToNumber(p.share) },
        ]),
      );
      break;
    }
    case TransactionType.INCOME: {
      const d = doc.details;
      base.currency = d.currency;
      base.description = d.description;
      break;
    }
    case TransactionType.TRANSFER: {
      const d = doc.details;
      base.currency = typeof d.currency === 'object' ? d.currency.account : (d.currency as string);
      base.toAccountId = d.to_account_id;
      base.description =
        typeof d.account_name === 'object'
          ? `${d.account_name.account} → ${d.account_name.to_account}`
          : '';
      break;
    }
  }

  return base;
}

/**
 * Parse an account document into a normalized form.
 */
export function parseAccount(doc: AccountDocument): ParsedAccount {
  const monthlyBalance: Record<string, number> = {};
  if (doc.monthlyBalance) {
    for (const [key, val] of Object.entries(doc.monthlyBalance)) {
      monthlyBalance[key] = convertStringToNumber(val);
    }
  }

  return {
    id: doc._id,
    balance: convertStringToNumber(doc.balance),
    name: doc.accountName,
    currency: doc.accountCurrency,
    country: doc.accountCountry,
    monthlyBalance,
    createdAt: doc.created_at,
    updatedAt: doc.updated_at,
  };
}

/**
 * Parse a budget document into a normalized form.
 */
export function parseBudget(doc: BudgetDocument): ParsedBudget {
  const categories: Record<string, number> = {};
  for (const [key, val] of Object.entries(doc.categories)) {
    categories[key] = convertStringToNumber(val);
  }

  return {
    id: doc._id,
    totalAmount: convertStringToNumber(doc.amount),
    categories,
    createdAt: doc.created_at,
    updatedAt: doc.updated_at,
  };
}

/**
 * Parse a group document into a normalized form.
 */
export function parseGroup(doc: GroupDocument): ParsedGroup {
  return {
    id: doc._id,
    name: doc.name,
    type: doc.type,
    createdAt: doc.created_at,
    updatedAt: doc.updated_at,
  };
}

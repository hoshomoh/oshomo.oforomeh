'use client';

import { create, insertMultiple, search, count } from '@orama/orama';
import type { AnyOrama, SearchParams, Results } from '@orama/orama';
import { getCategoryMeta } from './constants';
import { toISODate, toMonthKey } from './date';
import type { ParsedTransaction, ParsedAccount, ParsedGroup, ParsedBudget } from './types';

// ============================================================
// Schema
// ============================================================
const transactionSchema = {
  id: 'string',
  type: 'string',
  amount: 'number',
  currency: 'string',
  categoryId: 'string',
  categoryLabel: 'string',
  accountId: 'string',
  accountName: 'string',
  toAccountId: 'string',
  toAccountName: 'string',
  description: 'string',
  date: 'string',
  dateNum: 'number',
  month: 'string',
  groupId: 'string',
  groupName: 'string',
} as const;

export type TransactionSearchDoc = {
  id: string;
  type: string;
  amount: number;
  currency: string;
  categoryId: string;
  categoryLabel: string;
  accountId: string;
  accountName: string;
  toAccountId: string;
  toAccountName: string;
  description: string;
  date: string;
  dateNum: number;
  month: string;
  groupId: string;
  groupName: string;
};

// ============================================================
// Index lifecycle
// ============================================================
export function createSearchIndex(): AnyOrama {
  return create({
    schema: transactionSchema,
    language: 'english',
  });
}

export async function populateIndex(
  db: AnyOrama,
  transactions: ParsedTransaction[],
  accounts: ParsedAccount[],
  groups: ParsedGroup[],
): Promise<void> {
  const accountMap = new Map(accounts.map((a) => [a.id, a.name]));
  const groupMap = new Map(groups.map((g) => [g.id, g.name]));

  const docs: TransactionSearchDoc[] = transactions.map((tx) => {
    const dateStr = toISODate(tx.date);
    return {
      id: tx.id,
      type: tx.type.toLowerCase(),
      amount: tx.amount,
      currency: tx.currency,
      categoryId: tx.categoryId,
      categoryLabel: getCategoryMeta(tx.categoryId).label,
      accountId: tx.accountId,
      accountName: accountMap.get(tx.accountId) ?? '',
      toAccountId: tx.toAccountId ?? '',
      toAccountName: tx.toAccountId ? (accountMap.get(tx.toAccountId) ?? '') : '',
      description: tx.description,
      date: dateStr,
      dateNum: parseInt(dateStr.replace(/-/g, ''), 10),
      month: toMonthKey(tx.date),
      groupId: tx.groupId ?? '',
      groupName: tx.groupId ? (groupMap.get(tx.groupId) ?? '') : '',
    };
  });

  if (docs.length > 0) {
    await insertMultiple(db, docs);
  }
}

// ============================================================
// Search operations
// ============================================================
export type SearchFilters = {
  type?: string;
  dateFrom?: string;
  dateTo?: string;
  categoryId?: string;
  accountId?: string;
  currency?: string;
  groupId?: string;
};

function buildDateWhere(dateFrom?: string, dateTo?: string): Record<string, unknown> | undefined {
  if (dateFrom && dateTo) {
    return {
      between: [parseInt(dateFrom.replace(/-/g, ''), 10), parseInt(dateTo.replace(/-/g, ''), 10)],
    };
  }
  if (dateFrom) {
    return { gte: parseInt(dateFrom.replace(/-/g, ''), 10) };
  }
  if (dateTo) {
    return { lte: parseInt(dateTo.replace(/-/g, ''), 10) };
  }
  return undefined;
}

function buildWhereClause(filters?: SearchFilters): Record<string, unknown> | undefined {
  if (!filters) {
    return undefined;
  }
  const where: Record<string, unknown> = {};

  if (filters.type) {
    where.type = filters.type;
  }
  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }
  if (filters.accountId) {
    where.accountId = filters.accountId;
  }
  if (filters.currency) {
    where.currency = filters.currency;
  }
  if (filters.groupId) {
    where.groupId = filters.groupId;
  }

  const dateWhere = buildDateWhere(filters.dateFrom, filters.dateTo);
  if (dateWhere) {
    where.dateNum = dateWhere;
  }

  return Object.keys(where).length > 0 ? where : undefined;
}

export function searchTransactions(
  db: AnyOrama,
  query?: string,
  filters?: SearchFilters,
  limit = 20,
): Results<TransactionSearchDoc> {
  const params: SearchParams<AnyOrama, TransactionSearchDoc> = {
    term: query ?? '',
    limit,
    where: buildWhereClause(filters),
    boost: {
      description: 5,
      categoryLabel: 2,
      accountName: 1.5,
    },
  };
  return search(db, params) as Results<TransactionSearchDoc>;
}

// ============================================================
// Aggregation helpers (for LLM tools)
// ============================================================

/**
 * Get spending totals grouped by category.
 */
export function getSpendingByCategory(
  db: AnyOrama,
  filters?: SearchFilters,
  limit = 15,
): { categoryId: string; categoryLabel: string; total: number; currency: string }[] {
  const results = search(db, {
    term: '',
    limit: 10000,
    where: {
      ...buildWhereClause(filters),
      type: 'expense',
    },
  }) as Results<TransactionSearchDoc>;

  const map = new Map<string, { label: string; total: number; currency: string }>();
  for (const hit of results.hits) {
    const doc = hit.document;
    const existing = map.get(doc.categoryId);
    if (existing) {
      existing.total += doc.amount;
    } else {
      map.set(doc.categoryId, {
        label: doc.categoryLabel,
        total: doc.amount,
        currency: doc.currency,
      });
    }
  }

  return [...map.entries()]
    .map(([categoryId, { label, total, currency }]) => ({
      categoryId,
      categoryLabel: label,
      total,
      currency,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

/**
 * Get monthly income and expense totals.
 */
export function getMonthlyTrend(
  db: AnyOrama,
  months = 6,
): { month: string; income: number; expenses: number; currency: string }[] {
  const results = search(db, {
    term: '',
    limit: 10000,
  }) as Results<TransactionSearchDoc>;

  const map = new Map<string, { income: number; expenses: number; currency: string }>();
  for (const hit of results.hits) {
    const doc = hit.document;
    const existing = map.get(doc.month) ?? { income: 0, expenses: 0, currency: doc.currency };
    if (doc.type === 'income') {
      existing.income += doc.amount;
    } else if (doc.type === 'expense') {
      existing.expenses += doc.amount;
      existing.currency = doc.currency;
    }
    map.set(doc.month, existing);
  }

  return [...map.entries()]
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => b.month.localeCompare(a.month))
    .slice(0, months)
    .reverse();
}

/**
 * Get account summary (pass-through, no Orama needed).
 */
export function getAccountSummary(
  accounts: ParsedAccount[],
): { id: string; name: string; balance: number; currency: string; country: string }[] {
  return accounts.map((a) => ({
    id: a.id,
    name: a.name,
    balance: a.balance,
    currency: a.currency,
    country: a.country,
  }));
}

/**
 * Get budget vs actual spending.
 */
export function getBudgetStatus(
  db: AnyOrama,
  budget: ParsedBudget | undefined,
): {
  categoryId: string;
  categoryLabel: string;
  budgeted: number;
  actual: number;
  percentage: number;
  currency: string;
}[] {
  if (!budget) {
    return [];
  }

  const categoryTotals = getSpendingByCategory(db, undefined, 100);
  const actualMap = new Map(
    categoryTotals.map((c) => [c.categoryId, { total: c.total, currency: c.currency }]),
  );

  return Object.entries(budget.categories)
    .map(([categoryId, budgeted]) => {
      const data = actualMap.get(categoryId);
      const actual = data?.total ?? 0;
      const currency = data?.currency ?? 'EUR';
      return {
        categoryId,
        categoryLabel: getCategoryMeta(categoryId).label,
        budgeted,
        actual,
        percentage: budgeted > 0 ? (actual / budgeted) * 100 : 0,
        currency,
      };
    })
    .sort((a, b) => b.percentage - a.percentage);
}

/**
 * Get transactions for a specific group.
 */
export function getGroupExpenses(
  db: AnyOrama,
  groupId?: string,
  groups?: ParsedGroup[],
): {
  groupId: string;
  groupName: string;
  total: number;
  currency: string;
  transactionCount: number;
}[] {
  if (groupId) {
    const results = search(db, {
      term: '',
      limit: 10000,
      where: { groupId, type: 'expense' },
    }) as Results<TransactionSearchDoc>;

    const total = results.hits.reduce((s, h) => s + h.document.amount, 0);
    const groupName = results.hits[0]?.document.groupName ?? groupId;
    const currency = results.hits[0]?.document.currency ?? 'EUR';

    return [{ groupId, groupName, total, currency, transactionCount: results.count }];
  }

  if (!groups || groups.length === 0) {
    return [];
  }

  return groups.map((g) => {
    const results = search(db, {
      term: '',
      limit: 10000,
      where: { groupId: g.id, type: 'expense' },
    }) as Results<TransactionSearchDoc>;

    const total = results.hits.reduce((s, h) => s + h.document.amount, 0);
    const currency = results.hits[0]?.document.currency ?? 'EUR';
    return { groupId: g.id, groupName: g.name, total, currency, transactionCount: results.count };
  });
}

/**
 * Get all transfers involving a named account (as source OR destination).
 * Resolves account name to ID internally via fuzzy match.
 */
export function getTransfersByAccount(
  db: AnyOrama,
  accountName: string,
  accounts: ParsedAccount[],
  filters?: { dateFrom?: string; dateTo?: string },
): {
  date: string;
  direction: 'out' | 'in';
  amount: number;
  currency: string;
  counterpartyAccountName: string;
  description: string;
}[] {
  const normalizedName = accountName.toLowerCase();
  const matchedAccount = accounts.find((a) => a.name.toLowerCase().includes(normalizedName));

  if (!matchedAccount) {
    return [];
  }

  const accountId = matchedAccount.id;
  const where: Record<string, unknown> = { type: 'transfer' };
  const dateWhere = buildDateWhere(filters?.dateFrom, filters?.dateTo);
  if (dateWhere) {
    where.dateNum = dateWhere;
  }

  const results = search(db, {
    term: '',
    limit: 10000,
    where,
  }) as Results<TransactionSearchDoc>;

  return results.hits
    .filter((h) => h.document.accountId === accountId || h.document.toAccountId === accountId)
    .map((h) => {
      const doc = h.document;
      const isOutgoing = doc.accountId === accountId;
      return {
        date: doc.date,
        direction: (isOutgoing ? 'out' : 'in') as 'out' | 'in',
        amount: doc.amount,
        currency: doc.currency,
        counterpartyAccountName: isOutgoing ? doc.toAccountName : doc.accountName,
        description: doc.description,
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * Get most recent transactions, sorted by date descending.
 */
export function getRecentTransactions(
  db: AnyOrama,
  type?: string,
  limit = 10,
): TransactionSearchDoc[] {
  const where: Record<string, unknown> = {};
  if (type) {
    where.type = type;
  }

  const results = search(db, {
    term: '',
    limit: 10000,
    where: Object.keys(where).length > 0 ? where : undefined,
  }) as Results<TransactionSearchDoc>;

  return results.hits
    .map((h) => h.document)
    .sort((a, b) => b.dateNum - a.dateNum)
    .slice(0, limit);
}

/**
 * Get the largest expenses, sorted by amount descending.
 */
export function getTopExpenses(
  db: AnyOrama,
  filters?: { dateFrom?: string; dateTo?: string },
  limit = 10,
): TransactionSearchDoc[] {
  const where: Record<string, unknown> = { type: 'expense' };
  const dateWhere = buildDateWhere(filters?.dateFrom, filters?.dateTo);
  if (dateWhere) {
    where.dateNum = dateWhere;
  }

  const results = search(db, {
    term: '',
    limit: 10000,
    where,
  }) as Results<TransactionSearchDoc>;

  return results.hits
    .map((h) => h.document)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
}

/**
 * Get income grouped by description/source.
 */
export function getIncomeBySource(
  db: AnyOrama,
  filters?: { dateFrom?: string; dateTo?: string },
  limit = 15,
): { source: string; total: number; count: number; currency: string }[] {
  const where: Record<string, unknown> = { type: 'income' };
  const dateWhere = buildDateWhere(filters?.dateFrom, filters?.dateTo);
  if (dateWhere) {
    where.dateNum = dateWhere;
  }

  const results = search(db, {
    term: '',
    limit: 10000,
    where,
  }) as Results<TransactionSearchDoc>;

  const map = new Map<string, { total: number; count: number; currency: string }>();
  for (const hit of results.hits) {
    const doc = hit.document;
    const key = doc.description || 'Other Income';
    const existing = map.get(key);
    if (existing) {
      existing.total += doc.amount;
      existing.count += 1;
    } else {
      map.set(key, { total: doc.amount, count: 1, currency: doc.currency });
    }
  }

  return [...map.entries()]
    .map(([source, data]) => ({ source, ...data }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

/**
 * Get account balances grouped by currency with subtotals.
 */
export function getBalancesByCurrency(
  accounts: ParsedAccount[],
): { currency: string; total: number; accounts: { name: string; balance: number }[] }[] {
  const map = new Map<string, { total: number; accounts: { name: string; balance: number }[] }>();

  for (const a of accounts) {
    const existing = map.get(a.currency);
    if (existing) {
      existing.total += a.balance;
      existing.accounts.push({ name: a.name, balance: a.balance });
    } else {
      map.set(a.currency, {
        total: a.balance,
        accounts: [{ name: a.name, balance: a.balance }],
      });
    }
  }

  return [...map.entries()]
    .map(([currency, data]) => ({ currency, ...data }))
    .sort((a, b) => b.total - a.total);
}

/**
 * Get total spending, income, and net for a period.
 */
export function getTotalSpendingAndIncome(
  db: AnyOrama,
  filters?: { dateFrom?: string; dateTo?: string },
): {
  totalExpenses: number;
  totalIncome: number;
  net: number;
  expenseCount: number;
  incomeCount: number;
  currency: string;
} {
  const where: Record<string, unknown> = {};
  const dateWhere = buildDateWhere(filters?.dateFrom, filters?.dateTo);
  if (dateWhere) {
    where.dateNum = dateWhere;
  }

  const results = search(db, {
    term: '',
    limit: 10000,
    where: Object.keys(where).length > 0 ? where : undefined,
  }) as Results<TransactionSearchDoc>;

  let totalExpenses = 0;
  let totalIncome = 0;
  let expenseCount = 0;
  let incomeCount = 0;
  let primaryCurrency = 'EUR';

  for (const hit of results.hits) {
    const doc = hit.document;
    if (doc.type === 'expense') {
      totalExpenses += doc.amount;
      expenseCount += 1;
      primaryCurrency = doc.currency;
    } else if (doc.type === 'income') {
      totalIncome += doc.amount;
      incomeCount += 1;
    }
  }

  return {
    totalExpenses,
    totalIncome,
    net: totalIncome - totalExpenses,
    expenseCount,
    incomeCount,
    currency: primaryCurrency,
  };
}

/**
 * Get total document count in the index.
 */
export function getIndexCount(db: AnyOrama): number {
  return count(db);
}

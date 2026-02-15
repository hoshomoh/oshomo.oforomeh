'use client';

import { create, insertMultiple, search, count } from '@orama/orama';
import type { AnyOrama, SearchParams, Results } from '@orama/orama';
import { getCategoryMeta } from './constants';
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
  description: 'string',
  date: 'string',
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
  description: string;
  date: string;
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

  const docs: TransactionSearchDoc[] = transactions.map((tx) => ({
    id: tx.id,
    type: tx.type.toLowerCase(),
    amount: tx.amount,
    currency: tx.currency,
    categoryId: tx.categoryId,
    categoryLabel: getCategoryMeta(tx.categoryId).label,
    accountId: tx.accountId,
    accountName: accountMap.get(tx.accountId) ?? '',
    description: tx.description,
    date: tx.date.toISOString().split('T')[0],
    month: `${tx.date.getFullYear()}-${String(tx.date.getMonth() + 1).padStart(2, '0')}`,
    groupId: tx.groupId ?? '',
    groupName: tx.groupId ? (groupMap.get(tx.groupId) ?? '') : '',
  }));

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

  if (filters.dateFrom || filters.dateTo) {
    const dateFilter: Record<string, string> = {};
    if (filters.dateFrom) {
      dateFilter.gte = filters.dateFrom;
    }
    if (filters.dateTo) {
      dateFilter.lte = filters.dateTo;
    }
    where.date = dateFilter;
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
): { categoryId: string; categoryLabel: string; total: number }[] {
  const results = search(db, {
    term: '',
    limit: 10000,
    where: {
      ...buildWhereClause(filters),
      type: 'expense',
    },
  }) as Results<TransactionSearchDoc>;

  const map = new Map<string, { label: string; total: number }>();
  for (const hit of results.hits) {
    const doc = hit.document;
    const existing = map.get(doc.categoryId);
    if (existing) {
      existing.total += doc.amount;
    } else {
      map.set(doc.categoryId, { label: doc.categoryLabel, total: doc.amount });
    }
  }

  return [...map.entries()]
    .map(([categoryId, { label, total }]) => ({ categoryId, categoryLabel: label, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

/**
 * Get monthly income and expense totals.
 */
export function getMonthlyTrend(
  db: AnyOrama,
  months = 6,
): { month: string; income: number; expenses: number }[] {
  const results = search(db, {
    term: '',
    limit: 10000,
  }) as Results<TransactionSearchDoc>;

  const map = new Map<string, { income: number; expenses: number }>();
  for (const hit of results.hits) {
    const doc = hit.document;
    const existing = map.get(doc.month) ?? { income: 0, expenses: 0 };
    if (doc.type === 'income') {
      existing.income += doc.amount;
    } else if (doc.type === 'expense') {
      existing.expenses += doc.amount;
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
}[] {
  if (!budget) {
    return [];
  }

  const categoryTotals = getSpendingByCategory(db, undefined, 100);
  const actualMap = new Map(categoryTotals.map((c) => [c.categoryId, c.total]));

  return Object.entries(budget.categories)
    .map(([categoryId, budgeted]) => {
      const actual = actualMap.get(categoryId) ?? 0;
      return {
        categoryId,
        categoryLabel: getCategoryMeta(categoryId).label,
        budgeted,
        actual,
        percentage: budgeted > 0 ? (actual / budgeted) * 100 : 0,
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
): { groupId: string; groupName: string; total: number; transactionCount: number }[] {
  if (groupId) {
    const results = search(db, {
      term: '',
      limit: 10000,
      where: { groupId, type: 'expense' },
    }) as Results<TransactionSearchDoc>;

    const total = results.hits.reduce((s, h) => s + h.document.amount, 0);
    const groupName = results.hits[0]?.document.groupName ?? groupId;

    return [{ groupId, groupName, total, transactionCount: results.count }];
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
    return { groupId: g.id, groupName: g.name, total, transactionCount: results.count };
  });
}

/**
 * Get total document count in the index.
 */
export function getIndexCount(db: AnyOrama): number {
  return count(db);
}

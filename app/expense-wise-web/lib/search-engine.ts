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
  // Validate date formats
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (dateFrom && !dateRegex.test(dateFrom)) {
    throw new Error(`Invalid dateFrom format: ${dateFrom}. Expected YYYY-MM-DD`);
  }
  if (dateTo && !dateRegex.test(dateTo)) {
    throw new Error(`Invalid dateTo format: ${dateTo}. Expected YYYY-MM-DD`);
  }

  if (dateFrom && dateTo) {
    const fromInt = parseInt(dateFrom.replace(/-/g, ''), 10);
    const toInt = parseInt(dateTo.replace(/-/g, ''), 10);

    // Validate range
    if (fromInt > toInt) {
      throw new Error(`Invalid date range: dateFrom (${dateFrom}) is after dateTo (${dateTo})`);
    }

    return {
      between: [fromInt, toInt],
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

  const map = new Map<
    string,
    { categoryId: string; label: string; total: number; currency: string }
  >();
  for (const hit of results.hits) {
    const doc = hit.document;
    const key = `${doc.categoryId}\0${doc.currency}`;
    const existing = map.get(key);
    if (existing) {
      existing.total += doc.amount;
    } else {
      map.set(key, {
        categoryId: doc.categoryId,
        label: doc.categoryLabel,
        total: doc.amount,
        currency: doc.currency,
      });
    }
  }

  return [...map.values()]
    .map(({ categoryId, label, total, currency }) => ({
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

  const map = new Map<
    string,
    { month: string; income: number; expenses: number; currency: string }
  >();
  for (const hit of results.hits) {
    const doc = hit.document;
    if (doc.type !== 'income' && doc.type !== 'expense') {
      continue;
    }
    const key = `${doc.month}\0${doc.currency}`;
    const existing = map.get(key);
    if (existing) {
      if (doc.type === 'income') {
        existing.income += doc.amount;
      } else {
        existing.expenses += doc.amount;
      }
    } else {
      map.set(key, {
        month: doc.month,
        income: doc.type === 'income' ? doc.amount : 0,
        expenses: doc.type === 'expense' ? doc.amount : 0,
        currency: doc.currency,
      });
    }
  }

  // Get the N most recent months, then return all currency entries for those months
  const recentMonths = [...new Set([...map.values()].map((v) => v.month))]
    .sort()
    .reverse()
    .slice(0, months);
  const monthSet = new Set(recentMonths);

  return [...map.values()]
    .filter((v) => monthSet.has(v.month))
    .sort((a, b) => a.month.localeCompare(b.month) || a.currency.localeCompare(b.currency));
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

  // Get all expense spending by (category, currency)
  const categoryTotals = getSpendingByCategory(db, undefined, 100);

  // Determine the budget currency: the currency with the most total spending
  const currencyTotals = new Map<string, number>();
  for (const c of categoryTotals) {
    currencyTotals.set(c.currency, (currencyTotals.get(c.currency) ?? 0) + c.total);
  }
  const budgetCurrency = [...currencyTotals.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'EUR';

  // Only compare budget against spending in the budget currency
  const actualMap = new Map<string, number>();
  for (const c of categoryTotals) {
    if (c.currency === budgetCurrency) {
      actualMap.set(c.categoryId, (actualMap.get(c.categoryId) ?? 0) + c.total);
    }
  }

  return Object.entries(budget.categories)
    .map(([categoryId, budgeted]) => {
      const actual = actualMap.get(categoryId) ?? 0;
      return {
        categoryId,
        categoryLabel: getCategoryMeta(categoryId).label,
        budgeted,
        actual,
        percentage: budgeted > 0 ? (actual / budgeted) * 100 : 0,
        currency: budgetCurrency,
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
  const aggregateByGroupCurrency = (
    hits: Results<TransactionSearchDoc>['hits'],
    gId: string,
    gName: string,
  ) => {
    const byCurrency = new Map<string, { total: number; count: number }>();
    for (const h of hits) {
      const doc = h.document;
      const existing = byCurrency.get(doc.currency);
      if (existing) {
        existing.total += doc.amount;
        existing.count += 1;
      } else {
        byCurrency.set(doc.currency, { total: doc.amount, count: 1 });
      }
    }
    return [...byCurrency.entries()].map(([currency, data]) => ({
      groupId: gId,
      groupName: gName,
      total: data.total,
      currency,
      transactionCount: data.count,
    }));
  };

  if (groupId) {
    const results = search(db, {
      term: '',
      limit: 10000,
      where: { groupId, type: 'expense' },
    }) as Results<TransactionSearchDoc>;

    const groupName = results.hits[0]?.document.groupName ?? groupId;
    return aggregateByGroupCurrency(results.hits, groupId, groupName);
  }

  if (!groups || groups.length === 0) {
    return [];
  }

  return groups.flatMap((g) => {
    const results = search(db, {
      term: '',
      limit: 10000,
      where: { groupId: g.id, type: 'expense' },
    }) as Results<TransactionSearchDoc>;

    return aggregateByGroupCurrency(results.hits, g.id, g.name);
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

  const map = new Map<string, { source: string; total: number; count: number; currency: string }>();
  for (const hit of results.hits) {
    const doc = hit.document;
    const source = doc.description || 'Other Income';
    const key = `${source}\0${doc.currency}`;
    const existing = map.get(key);
    if (existing) {
      existing.total += doc.amount;
      existing.count += 1;
    } else {
      map.set(key, { source, total: doc.amount, count: 1, currency: doc.currency });
    }
  }

  return [...map.values()].sort((a, b) => b.total - a.total).slice(0, limit);
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
  currency: string;
  totalExpenses: number;
  totalIncome: number;
  net: number;
  expenseCount: number;
  incomeCount: number;
}[] {
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

  const map = new Map<
    string,
    { totalExpenses: number; totalIncome: number; expenseCount: number; incomeCount: number }
  >();
  for (const hit of results.hits) {
    const doc = hit.document;
    if (doc.type !== 'expense' && doc.type !== 'income') {
      continue;
    }
    const existing = map.get(doc.currency) ?? {
      totalExpenses: 0,
      totalIncome: 0,
      expenseCount: 0,
      incomeCount: 0,
    };
    if (doc.type === 'expense') {
      existing.totalExpenses += doc.amount;
      existing.expenseCount += 1;
    } else {
      existing.totalIncome += doc.amount;
      existing.incomeCount += 1;
    }
    map.set(doc.currency, existing);
  }

  return [...map.entries()].map(([currency, data]) => ({
    currency,
    ...data,
    net: data.totalIncome - data.totalExpenses,
  }));
}

/**
 * Get the total document count in the index.
 */
export function getIndexCount(db: AnyOrama): number {
  return count(db);
}

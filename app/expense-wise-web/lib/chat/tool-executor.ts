import type { AnyOrama } from '@orama/orama';
import {
  searchTransactions,
  getSpendingByCategory,
  getMonthlyTrend,
  getAccountSummary,
  getBudgetStatus,
  getGroupExpenses,
  type SearchFilters,
} from '../search-engine';
import type { ParsedAccount, ParsedBudget, ParsedGroup } from '../types';
import { formatCurrency } from '../format';

type ToolContext = {
  searchIndex: AnyOrama;
  accounts: ParsedAccount[];
  budgets: ParsedBudget[];
  groups: ParsedGroup[];
};

/**
 * Execute a tool call from the LLM against the local Orama index.
 * Returns a formatted string result for the LLM to process.
 */
export function executeToolCall(
  toolName: string,
  args: Record<string, unknown>,
  ctx: ToolContext,
): string {
  switch (toolName) {
    case 'searchTransactions': {
      const filters: SearchFilters = {};
      if (args.type) {
        filters.type = args.type as string;
      }
      if (args.dateFrom) {
        filters.dateFrom = args.dateFrom as string;
      }
      if (args.dateTo) {
        filters.dateTo = args.dateTo as string;
      }
      if (args.categoryId) {
        filters.categoryId = args.categoryId as string;
      }
      if (args.accountId) {
        filters.accountId = args.accountId as string;
      }

      const results = searchTransactions(
        ctx.searchIndex,
        (args.query as string) || undefined,
        Object.keys(filters).length > 0 ? filters : undefined,
        (args.limit as number) || 20,
      );

      if (results.count === 0) {
        return 'No transactions found matching your search.';
      }

      const lines = results.hits.map((hit) => {
        const d = hit.document;
        return `- ${d.date} | ${d.type.toUpperCase()} | ${d.categoryLabel} | ${d.description || 'No description'} | ${formatCurrency(d.amount, d.currency)} | Account: ${d.accountName}${d.groupName ? ` | Group: ${d.groupName}` : ''}`;
      });

      return `Found ${results.count} transaction(s)${results.count > results.hits.length ? ` (showing first ${results.hits.length})` : ''}:\n${lines.join('\n')}`;
    }

    case 'getSpendingByCategory': {
      const filters: SearchFilters = {};
      if (args.dateFrom) {
        filters.dateFrom = args.dateFrom as string;
      }
      if (args.dateTo) {
        filters.dateTo = args.dateTo as string;
      }

      const categories = getSpendingByCategory(
        ctx.searchIndex,
        Object.keys(filters).length > 0 ? filters : undefined,
        (args.limit as number) || 10,
      );

      if (categories.length === 0) {
        return 'No expense data found for the specified period.';
      }

      const total = categories.reduce((s, c) => s + c.total, 0);
      const lines = categories.map(
        (c) =>
          `- ${c.categoryLabel}: ${formatCurrency(c.total, 'EUR')} (${((c.total / total) * 100).toFixed(1)}%)`,
      );

      return `Spending by category (total: ${formatCurrency(total, 'EUR')}):\n${lines.join('\n')}`;
    }

    case 'getMonthlyTrend': {
      const trend = getMonthlyTrend(ctx.searchIndex, (args.months as number) || 6);

      if (trend.length === 0) {
        return 'No monthly data available.';
      }

      const lines = trend.map(
        (m) =>
          `- ${m.month}: Income ${formatCurrency(m.income, 'EUR')}, Expenses ${formatCurrency(m.expenses, 'EUR')}, Net ${formatCurrency(m.income - m.expenses, 'EUR')}`,
      );

      return `Monthly income/expense trend:\n${lines.join('\n')}`;
    }

    case 'getAccountSummary': {
      const accounts = getAccountSummary(ctx.accounts);

      if (accounts.length === 0) {
        return 'No accounts found.';
      }

      const lines = accounts.map(
        (a) =>
          `- ${a.name} (${a.currency}, ${a.country}): Balance ${formatCurrency(a.balance, a.currency)}`,
      );

      return `Accounts:\n${lines.join('\n')}`;
    }

    case 'getBudgetStatus': {
      const budget = ctx.budgets[0];
      const status = getBudgetStatus(ctx.searchIndex, budget);

      if (status.length === 0) {
        return 'No budget data available.';
      }

      const lines = status.map(
        (s) =>
          `- ${s.categoryLabel}: Budgeted ${formatCurrency(s.budgeted, 'EUR')}, Spent ${formatCurrency(s.actual, 'EUR')} (${s.percentage.toFixed(1)}%)${s.percentage > 100 ? ' ⚠️ OVER BUDGET' : ''}`,
      );

      return `Budget status:\n${lines.join('\n')}`;
    }

    case 'getGroupExpenses': {
      const groupExpenses = getGroupExpenses(
        ctx.searchIndex,
        (args.groupId as string) || undefined,
        ctx.groups,
      );

      if (groupExpenses.length === 0) {
        return 'No group expense data found.';
      }

      const lines = groupExpenses.map(
        (g) =>
          `- ${g.groupName}: ${g.transactionCount} transactions, Total ${formatCurrency(g.total, 'EUR')}`,
      );

      return `Group expenses:\n${lines.join('\n')}`;
    }

    default:
      return `Unknown tool: ${toolName}`;
  }
}

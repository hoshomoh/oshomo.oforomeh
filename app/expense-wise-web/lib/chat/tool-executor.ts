import type { AnyOrama } from '@orama/orama';
import {
  searchTransactions,
  getSpendingByCategory,
  getMonthlyTrend,
  getAccountSummary,
  getBudgetStatus,
  getGroupExpenses,
  getTransfersByAccount,
  getRecentTransactions,
  getTopExpenses,
  getIncomeBySource,
  getBalancesByCurrency,
  getTotalSpendingAndIncome,
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

      return `Found ${results.count} transaction(s)${results.count > results.hits.length ? ` (showing first ${results.hits.length})` : ''}:\n${lines.join('\n')}\n\nDisplay these using the TransactionsTable component with transactions: [{date, description, category, amount, type, currency}]. IMPORTANT: Use the EXACT description text from each transaction above — do not paraphrase or modify descriptions.`;
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
      const primaryCurrency = categories[0].currency;
      const lines = categories.map(
        (c) =>
          `- ${c.categoryLabel}: ${formatCurrency(c.total, c.currency)} (${((c.total / total) * 100).toFixed(1)}%)`,
      );

      return `Spending by category (total: ${formatCurrency(total, primaryCurrency)}):\n${lines.join('\n')}`;
    }

    case 'getMonthlyTrend': {
      const trend = getMonthlyTrend(ctx.searchIndex, (args.months as number) || 6);

      if (trend.length === 0) {
        return 'No monthly data available.';
      }

      const lines = trend.map(
        (m) =>
          `- ${m.month}: Income ${formatCurrency(m.income, m.currency)}, Expenses ${formatCurrency(m.expenses, m.currency)}, Net ${formatCurrency(m.income - m.expenses, m.currency)}`,
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
          `- [id: ${a.id}] ${a.name} (${a.currency}, ${a.country}): Balance ${formatCurrency(a.balance, a.currency)}`,
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
          `- ${s.categoryLabel}: Budgeted ${formatCurrency(s.budgeted, s.currency)}, Spent ${formatCurrency(s.actual, s.currency)} (${s.percentage.toFixed(1)}%)${s.percentage > 100 ? ' ⚠️ OVER BUDGET' : ''}`,
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
          `- [id: ${g.groupId}] ${g.groupName}: ${g.transactionCount} transactions, Total ${formatCurrency(g.total, g.currency)}`,
      );

      return `Group expenses:\n${lines.join('\n')}`;
    }

    case 'getTransfersByAccount': {
      const transfers = getTransfersByAccount(
        ctx.searchIndex,
        args.accountName as string,
        ctx.accounts,
        {
          dateFrom: args.dateFrom as string | undefined,
          dateTo: args.dateTo as string | undefined,
        },
      );

      if (transfers.length === 0) {
        return `No transfers found involving "${args.accountName}".`;
      }

      const lines = transfers.map(
        (t) =>
          `- ${t.date} | ${t.direction === 'out' ? 'OUT →' : 'IN ←'} ${t.counterpartyAccountName} | ${formatCurrency(t.amount, t.currency)}`,
      );

      return `Found ${transfers.length} transfer(s) involving "${args.accountName}":\n${lines.join('\n')}\n\nDisplay these using the TransactionsTable component with transactions: [{date, description, category, amount, type, currency}]. Use "TRANSFER" as the type. IMPORTANT: Use the EXACT description text from each transaction above — do not paraphrase or modify descriptions.`;
    }

    case 'getRecentTransactions': {
      const recent = getRecentTransactions(
        ctx.searchIndex,
        (args.type as string) || undefined,
        (args.limit as number) || 10,
      );

      if (recent.length === 0) {
        return 'No recent transactions found.';
      }

      const lines = recent.map(
        (d) =>
          `- ${d.date} | ${d.type.toUpperCase()} | ${d.categoryLabel || 'N/A'} | ${d.description || 'No description'} | ${formatCurrency(d.amount, d.currency)} | Account: ${d.accountName}`,
      );

      return `${recent.length} most recent transaction(s):\n${lines.join('\n')}\n\nDisplay these using the TransactionsTable component with transactions: [{date, description, category, amount, type, currency}]. IMPORTANT: Use the EXACT description text from each transaction above — do not paraphrase or modify descriptions.`;
    }

    case 'getTopExpenses': {
      const top = getTopExpenses(
        ctx.searchIndex,
        {
          dateFrom: args.dateFrom as string | undefined,
          dateTo: args.dateTo as string | undefined,
        },
        (args.limit as number) || 10,
      );

      if (top.length === 0) {
        return 'No expenses found for the specified period.';
      }

      const total = top.reduce((s, d) => s + d.amount, 0);
      const lines = top.map(
        (d, i) =>
          `${i + 1}. ${d.date} | ${d.categoryLabel} | ${d.description || 'No description'} | ${formatCurrency(d.amount, d.currency)} | Account: ${d.accountName}`,
      );

      return `Top ${top.length} expense(s) (total: ${formatCurrency(total, top[0].currency)}):\n${lines.join('\n')}\n\nDisplay these using the TransactionsTable component with transactions: [{date, description, category, amount, type, currency}]. IMPORTANT: Use the EXACT description text from each transaction above — do not paraphrase or modify descriptions.`;
    }

    case 'getIncomeBySource': {
      const sources = getIncomeBySource(
        ctx.searchIndex,
        {
          dateFrom: args.dateFrom as string | undefined,
          dateTo: args.dateTo as string | undefined,
        },
        (args.limit as number) || 10,
      );

      if (sources.length === 0) {
        return 'No income data found for the specified period.';
      }

      const total = sources.reduce((s, src) => s + src.total, 0);
      const lines = sources.map(
        (src) =>
          `- ${src.source}: ${formatCurrency(src.total, src.currency)} (${src.count} transaction${src.count > 1 ? 's' : ''}, ${((src.total / total) * 100).toFixed(1)}%)`,
      );

      return `Income by source (total: ${formatCurrency(total, sources[0].currency)}):\n${lines.join('\n')}`;
    }

    case 'getBalancesByCurrency': {
      const currencyGroups = getBalancesByCurrency(ctx.accounts);

      if (currencyGroups.length === 0) {
        return 'No accounts found.';
      }

      const lines = currencyGroups.map((g) => {
        const accountLines = g.accounts
          .map((a) => `  - ${a.name}: ${formatCurrency(a.balance, g.currency)}`)
          .join('\n');
        return `${g.currency} — Total: ${formatCurrency(g.total, g.currency)}\n${accountLines}`;
      });

      return `Balances by currency:\n${lines.join('\n\n')}`;
    }

    case 'getTotalSpendingAndIncome': {
      const totals = getTotalSpendingAndIncome(ctx.searchIndex, {
        dateFrom: args.dateFrom as string | undefined,
        dateTo: args.dateTo as string | undefined,
      });

      const periodLabel =
        args.dateFrom && args.dateTo
          ? `from ${args.dateFrom} to ${args.dateTo}`
          : args.dateFrom
            ? `from ${args.dateFrom}`
            : args.dateTo
              ? `up to ${args.dateTo}`
              : 'all time';

      return `Financial summary (${periodLabel}):
- Total Income: ${formatCurrency(totals.totalIncome, totals.currency)} (${totals.incomeCount} transaction${totals.incomeCount !== 1 ? 's' : ''})
- Total Expenses: ${formatCurrency(totals.totalExpenses, totals.currency)} (${totals.expenseCount} transaction${totals.expenseCount !== 1 ? 's' : ''})
- Net: ${formatCurrency(totals.net, totals.currency)} ${totals.net >= 0 ? '(savings)' : '(deficit)'}`;
    }

    default:
      return `Unknown tool: ${toolName}`;
  }
}

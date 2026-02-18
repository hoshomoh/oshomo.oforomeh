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
import type { ParsedAccount, ParsedBudget, ParsedGroup, ExchangeRates } from '../types';
import { formatCurrency } from '../format';
import { sanitizeForPrompt } from './sanitize';
import { convertCurrency } from '../currency-conversion';

type ToolContext = {
  searchIndex: AnyOrama;
  accounts: ParsedAccount[];
  budgets: ParsedBudget[];
  groups: ParsedGroup[];
  exchangeRates: ExchangeRates | null;
};

/**
 * Execute a tool call from the LLM against the local Orama index.
 * Returns a formatted string result for the LLM to process.
 */
export function executeToolCall(
  toolName: string,
  rawArgs: Record<string, unknown>,
  ctx: ToolContext,
): string {
  // Note: Tool input validation is handled by AI SDK before this point
  // We'll use the args directly as they've already been validated
  const args = rawArgs;

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
      if (args.groupId) {
        filters.groupId = args.groupId as string;
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
        const description = sanitizeForPrompt(d.description || 'No description');
        const accountName = sanitizeForPrompt(d.accountName);
        const groupName = d.groupName ? sanitizeForPrompt(d.groupName) : '';
        return `- ${d.date} | ${d.type.toUpperCase()} | ${d.categoryLabel} | ${description} | ${formatCurrency(d.amount, d.currency)} | Account: ${accountName}${groupName ? ` | Group: ${groupName}` : ''}`;
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

      // Check for currency mixing
      const currencies = new Set(categories.map((c) => c.currency));
      if (currencies.size > 1) {
        // Group by currency and show separate totals
        const byCurrency = new Map<string, { total: number; categories: typeof categories }>();
        for (const cat of categories) {
          const existing = byCurrency.get(cat.currency);
          if (existing) {
            existing.total += cat.total;
            existing.categories.push(cat);
          } else {
            byCurrency.set(cat.currency, { total: cat.total, categories: [cat] });
          }
        }

        const currencyLines = Array.from(byCurrency.entries()).map(([currency, data]) => {
          const catLines = data.categories.map(
            (c) =>
              `  - ${c.categoryLabel}: ${formatCurrency(c.total, c.currency)} (${((c.total / data.total) * 100).toFixed(1)}%)`,
          );
          return `${currency} (total: ${formatCurrency(data.total, currency)}):\n${catLines.join('\n')}`;
        });

        return `Spending by category across multiple currencies (${Array.from(currencies).join(', ')}):\n\n${currencyLines.join('\n\n')}`;
      }

      // Single currency - show total
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

      const currencies = [...new Set(trend.map((m) => m.currency))];

      if (currencies.length === 1) {
        const lines = trend.map(
          (m) =>
            `- ${m.month}: Income ${formatCurrency(m.income, m.currency)}, Expenses ${formatCurrency(m.expenses, m.currency)}, Net ${formatCurrency(m.income - m.expenses, m.currency)}`,
        );
        return `Monthly income/expense trend (${currencies[0]}):\n${lines.join('\n')}`;
      }

      // Multi-currency: group by currency for clarity
      const byCurrency = new Map<string, typeof trend>();
      for (const m of trend) {
        const existing = byCurrency.get(m.currency) ?? [];
        existing.push(m);
        byCurrency.set(m.currency, existing);
      }

      const sections = [...byCurrency.entries()].map(([currency, months]) => {
        const lines = months.map(
          (m) =>
            `- ${m.month}: Income ${formatCurrency(m.income, currency)}, Expenses ${formatCurrency(m.expenses, currency)}, Net ${formatCurrency(m.income - m.expenses, currency)}`,
        );
        return `${currency}:\n${lines.join('\n')}`;
      });

      return `Monthly income/expense trend across ${currencies.length} currencies:\n\n${sections.join('\n\n')}`;
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

      // Group entries by groupId since a group can have expenses in multiple currencies
      const byGroup = new Map<string, typeof groupExpenses>();
      for (const g of groupExpenses) {
        const existing = byGroup.get(g.groupId) ?? [];
        existing.push(g);
        byGroup.set(g.groupId, existing);
      }

      const lines = [...byGroup.entries()].map(([, entries]) => {
        const name = entries[0].groupName;
        const id = entries[0].groupId;
        const totalCount = entries.reduce((s, e) => s + e.transactionCount, 0);
        if (entries.length === 1) {
          return `- [id: ${id}] ${name}: ${totalCount} transactions, Total ${formatCurrency(entries[0].total, entries[0].currency)}`;
        }
        const currencyParts = entries.map((e) => formatCurrency(e.total, e.currency)).join(' + ');
        return `- [id: ${id}] ${name}: ${totalCount} transactions, Total ${currencyParts}`;
      });

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

      // Calculate totals per currency to avoid mixing
      const totalsByCurrency = new Map<string, number>();
      for (const d of top) {
        totalsByCurrency.set(d.currency, (totalsByCurrency.get(d.currency) ?? 0) + d.amount);
      }
      const totalLabel = [...totalsByCurrency.entries()]
        .map(([currency, total]) => formatCurrency(total, currency))
        .join(' + ');

      const lines = top.map(
        (d, i) =>
          `${i + 1}. ${d.date} | ${d.categoryLabel} | ${d.description || 'No description'} | ${formatCurrency(d.amount, d.currency)} | Account: ${d.accountName}`,
      );

      return `Top ${top.length} expense(s) (total: ${totalLabel}):\n${lines.join('\n')}\n\nDisplay these using the TransactionsTable component with transactions: [{date, description, category, amount, type, currency}]. IMPORTANT: Use the EXACT description text from each transaction above — do not paraphrase or modify descriptions.`;
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

      const currencies = [...new Set(sources.map((s) => s.currency))];

      if (currencies.length === 1) {
        const total = sources.reduce((s, src) => s + src.total, 0);
        const lines = sources.map(
          (src) =>
            `- ${src.source}: ${formatCurrency(src.total, src.currency)} (${src.count} transaction${src.count > 1 ? 's' : ''}, ${((src.total / total) * 100).toFixed(1)}%)`,
        );
        return `Income by source (total: ${formatCurrency(total, currencies[0])}):\n${lines.join('\n')}`;
      }

      // Multi-currency: group by currency
      const byCurrency = new Map<string, typeof sources>();
      for (const src of sources) {
        const existing = byCurrency.get(src.currency) ?? [];
        existing.push(src);
        byCurrency.set(src.currency, existing);
      }

      const sections = [...byCurrency.entries()].map(([currency, currSources]) => {
        const total = currSources.reduce((s, src) => s + src.total, 0);
        const lines = currSources.map(
          (src) =>
            `- ${src.source}: ${formatCurrency(src.total, currency)} (${src.count} transaction${src.count > 1 ? 's' : ''}, ${((src.total / total) * 100).toFixed(1)}%)`,
        );
        return `${currency} (total: ${formatCurrency(total, currency)}):\n${lines.join('\n')}`;
      });

      return `Income by source across ${currencies.length} currencies:\n\n${sections.join('\n\n')}`;
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

      if (totals.length === 0) {
        return 'No transaction data found for the specified period.';
      }

      const periodLabel =
        args.dateFrom && args.dateTo
          ? `from ${args.dateFrom} to ${args.dateTo}`
          : args.dateFrom
            ? `from ${args.dateFrom}`
            : args.dateTo
              ? `up to ${args.dateTo}`
              : 'all time';

      if (totals.length === 1) {
        const t = totals[0];
        return `Financial summary (${periodLabel}):
- Total Income: ${formatCurrency(t.totalIncome, t.currency)} (${t.incomeCount} transaction${t.incomeCount !== 1 ? 's' : ''})
- Total Expenses: ${formatCurrency(t.totalExpenses, t.currency)} (${t.expenseCount} transaction${t.expenseCount !== 1 ? 's' : ''})
- Net: ${formatCurrency(t.net, t.currency)} ${t.net >= 0 ? '(savings)' : '(deficit)'}`;
      }

      const sections = totals.map(
        (t) =>
          `${t.currency}:
- Income: ${formatCurrency(t.totalIncome, t.currency)} (${t.incomeCount} transaction${t.incomeCount !== 1 ? 's' : ''})
- Expenses: ${formatCurrency(t.totalExpenses, t.currency)} (${t.expenseCount} transaction${t.expenseCount !== 1 ? 's' : ''})
- Net: ${formatCurrency(t.net, t.currency)} ${t.net >= 0 ? '(savings)' : '(deficit)'}`,
      );

      return `Financial summary (${periodLabel}) across ${totals.length} currencies:\n\n${sections.join('\n\n')}`;
    }

    case 'convertCurrency': {
      const amount = args.amount as number;
      const fromCurrency = (args.fromCurrency as string).toUpperCase();
      const toCurrency = (args.toCurrency as string).toUpperCase();

      if (!ctx.exchangeRates) {
        return 'Exchange rates are not available at the moment. Please try again later.';
      }

      if (fromCurrency === toCurrency) {
        return `No conversion needed: ${formatCurrency(amount, fromCurrency)}`;
      }

      const convertedAmount = convertCurrency(amount, fromCurrency, toCurrency, ctx.exchangeRates);

      // Get the exchange rate for display
      const base = ctx.exchangeRates.base.toUpperCase();
      const fromRate = fromCurrency === base ? 1 : ctx.exchangeRates.rates[fromCurrency];
      const toRate = toCurrency === base ? 1 : ctx.exchangeRates.rates[toCurrency];

      if (!fromRate || !toRate) {
        return `Unable to convert: Exchange rate not available for ${fromCurrency} or ${toCurrency}. Available currencies: ${Object.keys(ctx.exchangeRates.rates).join(', ')}`;
      }

      const rate = toRate / fromRate;
      const rateDate = ctx.exchangeRates.date;

      return `Converted ${formatCurrency(amount, fromCurrency)} to ${formatCurrency(convertedAmount, toCurrency)}

Exchange rate: 1 ${fromCurrency} = ${rate.toFixed(4)} ${toCurrency}
Rate date: ${rateDate}

Note: Exchange rates are updated daily and may not reflect real-time market rates.`;
    }

    default:
      return `Unknown tool: ${toolName}`;
  }
}

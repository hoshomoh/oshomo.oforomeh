import { tool } from 'ai';
import { z } from 'zod';

/**
 * Financial data tools for the LLM to query via client-side Orama index.
 * None of these have `execute` — they are executed client-side in ChatInterface.
 */
export const financialTools = {
  searchTransactions: tool({
    description:
      'Search for transactions by keyword (description, category, account name) and/or filter by type, date range, category, account, or group. Returns matching transactions with amounts, dates, and categories. Use specific filters rather than broad queries when the user asks about a particular time period, category, or account.',
    inputSchema: z.object({
      query: z
        .string()
        .optional()
        .describe('Search text to match against description, category label, or account name'),
      type: z
        .enum(['expense', 'income', 'transfer'])
        .optional()
        .describe('Filter by transaction type'),
      dateFrom: z.string().optional().describe('Filter from this date (YYYY-MM-DD)'),
      dateTo: z.string().optional().describe('Filter up to this date (YYYY-MM-DD)'),
      categoryId: z.string().optional().describe('Filter by category ID'),
      accountId: z.string().optional().describe('Filter by account ID'),
      groupId: z.string().optional().describe('Filter by group ID'),
      limit: z
        .number()
        .optional()
        .default(20)
        .describe('Maximum number of results to return (default 20)'),
    }),
  }),

  getSpendingByCategory: tool({
    description:
      'Get total spending grouped by category. Returns categories sorted by total amount descending.',
    inputSchema: z.object({
      dateFrom: z.string().optional().describe('Filter from this date (YYYY-MM-DD)'),
      dateTo: z.string().optional().describe('Filter up to this date (YYYY-MM-DD)'),
      limit: z.number().optional().default(10).describe('Maximum number of categories to return'),
    }),
  }),

  getMonthlyTrend: tool({
    description: 'Get monthly income and expense totals over recent months.',
    inputSchema: z.object({
      months: z.number().optional().default(6).describe('Number of recent months to include'),
    }),
  }),

  getAccountSummary: tool({
    description:
      'Get all accounts with their IDs, current balances, currencies, and countries. Use the returned account IDs to filter transactions by account via searchTransactions.',
    inputSchema: z.object({}),
  }),

  getBudgetStatus: tool({
    description:
      'Get budget vs actual spending for each budget category. Returns budgeted amount, actual spending, and percentage used.',
    inputSchema: z.object({}),
  }),

  getGroupExpenses: tool({
    description:
      'Get expense totals for groups (shared expenses) with their IDs and names. Call without groupId to get all groups (e.g., to find a group by name like "Winter Ski Trip"), then use the returned group ID with searchTransactions to get detailed transactions for that specific group.',
    inputSchema: z.object({
      groupId: z.string().optional().describe('Specific group ID, or omit for all groups'),
    }),
  }),

  getTransfersByAccount: tool({
    description:
      'Get all transfers involving a specific account (as source OR destination). Resolves the account name internally — no need to look up the account ID first. Use this when the user asks about transfers to/from a specific account.',
    inputSchema: z.object({
      accountName: z
        .string()
        .describe('Account name to search for (e.g., "Wise", "Revolut", "Access Bank")'),
      dateFrom: z.string().optional().describe('Filter from this date (YYYY-MM-DD)'),
      dateTo: z.string().optional().describe('Filter up to this date (YYYY-MM-DD)'),
    }),
  }),

  getRecentTransactions: tool({
    description:
      'Get the most recent transactions sorted by date (newest first). Prefer this over searchTransactions when the user says "recently", "latest", or "last few". Returns: [{date, type, categoryLabel, description, amount, currency, accountName}].',
    inputSchema: z.object({
      type: z
        .enum(['expense', 'income', 'transfer'])
        .optional()
        .describe('Optionally filter by transaction type'),
      limit: z
        .number()
        .optional()
        .default(10)
        .describe('Maximum number of transactions to return (default 10)'),
    }),
  }),

  getTopExpenses: tool({
    description:
      'Get the largest expenses sorted by amount (highest first). Prefer this over searchTransactions for "biggest", "largest", or "most expensive" queries. Returns: [{date, categoryLabel, description, amount, currency, accountName}].',
    inputSchema: z.object({
      limit: z
        .number()
        .optional()
        .default(10)
        .describe('Maximum number of expenses to return (default 10)'),
      dateFrom: z.string().optional().describe('Filter from this date (YYYY-MM-DD)'),
      dateTo: z.string().optional().describe('Filter up to this date (YYYY-MM-DD)'),
    }),
  }),

  getIncomeBySource: tool({
    description:
      'Get income grouped by source/description with totals and percentages. Prefer this over searchTransactions + manual grouping for income analysis. Returns: [{source, total, count, currency, percentage}].',
    inputSchema: z.object({
      dateFrom: z.string().optional().describe('Filter from this date (YYYY-MM-DD)'),
      dateTo: z.string().optional().describe('Filter up to this date (YYYY-MM-DD)'),
      limit: z.number().optional().default(10).describe('Maximum number of sources to return'),
    }),
  }),

  getBalancesByCurrency: tool({
    description:
      'Get account balances grouped by currency with subtotals per currency. Prefer this over getAccountSummary for "how much money do I have?" or total balance queries. Never sum across different currencies — use convertCurrency first if user wants a single-currency total.',
    inputSchema: z.object({}),
  }),

  getTotalSpendingAndIncome: tool({
    description:
      'Get total expenses, total income, net savings, and transaction counts for a date range in one call. Prefer this for "how much did I spend/earn?" or "what are my savings?" queries. Returns: [{totalIncome, totalExpenses, net, incomeCount, expenseCount, currency}].',
    inputSchema: z.object({
      dateFrom: z.string().optional().describe('Filter from this date (YYYY-MM-DD)'),
      dateTo: z.string().optional().describe('Filter up to this date (YYYY-MM-DD)'),
    }),
  }),

  convertCurrency: tool({
    description:
      'Convert an amount from one currency to another using current exchange rates. Use this when the user asks to convert amounts, compare across currencies, or get totals in a specific currency. Returns the converted amount with the exchange rate used.',
    inputSchema: z.object({
      amount: z.number().describe('Amount to convert'),
      fromCurrency: z.string().describe('Source currency code (EUR, USD, GBP, NGN, etc.)'),
      toCurrency: z.string().describe('Target currency code (EUR, USD, GBP, NGN, etc.)'),
    }),
  }),
};

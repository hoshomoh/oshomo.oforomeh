import { tool } from 'ai';
import { z } from 'zod';

/**
 * Financial data tools for the LLM to query via client-side Orama index.
 * None of these have `execute` — they are executed client-side in ChatInterface.
 */
export const financialTools = {
  searchTransactions: tool({
    description:
      'Search for transactions by keyword (description, category, account name). Returns matching transactions with amounts, dates, and categories.',
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
      'Get expense totals for groups (shared expenses) with their IDs. Can return all groups or a specific one. Use the returned group IDs to filter transactions by group.',
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
      'Get the most recent transactions sorted by date (newest first). Use this when the user asks "what did I buy recently?" or "show my latest transactions".',
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
      'Get the largest expenses sorted by amount (highest first). Use this when the user asks "what were my biggest expenses?" or "show my largest purchases".',
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
      'Get income grouped by source/description with totals. Use this when the user asks "where does my income come from?" or "show my income breakdown".',
    inputSchema: z.object({
      dateFrom: z.string().optional().describe('Filter from this date (YYYY-MM-DD)'),
      dateTo: z.string().optional().describe('Filter up to this date (YYYY-MM-DD)'),
      limit: z.number().optional().default(10).describe('Maximum number of sources to return'),
    }),
  }),

  getBalancesByCurrency: tool({
    description:
      'Get account balances grouped by currency with subtotals per currency. Use this when the user asks "how much money do I have?" or "what is my total balance?". Never sum across different currencies.',
    inputSchema: z.object({}),
  }),

  getTotalSpendingAndIncome: tool({
    description:
      'Get total expenses, total income, net savings, and transaction counts for a date range. Use this when the user asks "how much did I spend this month?" or "how much did I earn?" or "what are my savings?".',
    inputSchema: z.object({
      dateFrom: z.string().optional().describe('Filter from this date (YYYY-MM-DD)'),
      dateTo: z.string().optional().describe('Filter up to this date (YYYY-MM-DD)'),
    }),
  }),
};

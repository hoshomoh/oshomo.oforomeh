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
    description: 'Get all accounts with their current balances, currencies, and countries.',
    inputSchema: z.object({}),
  }),

  getBudgetStatus: tool({
    description:
      'Get budget vs actual spending for each budget category. Returns budgeted amount, actual spending, and percentage used.',
    inputSchema: z.object({}),
  }),

  getGroupExpenses: tool({
    description:
      'Get expense totals for groups (shared expenses). Can return all groups or a specific one.',
    inputSchema: z.object({
      groupId: z.string().optional().describe('Specific group ID, or omit for all groups'),
    }),
  }),
};

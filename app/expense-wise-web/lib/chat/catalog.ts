import { defineCatalog } from '@json-render/core';
import { schema } from '@json-render/react/schema';
import { z } from 'zod';

const dataItemSchema = z.object({
  label: z.string().describe('Display label for this data point'),
  value: z.number().describe('Numeric value'),
});

const monthlyDataItemSchema = z.object({
  month: z.string().describe('Month label, e.g. "Jan 2025"'),
  income: z.number().describe('Income amount for this month'),
  expenses: z.number().describe('Expenses amount for this month'),
});

const budgetItemSchema = z.object({
  label: z.string().describe('Category label'),
  budgeted: z.number().describe('Budgeted amount'),
  actual: z.number().describe('Actual spent amount'),
});

const transactionItemSchema = z.object({
  date: z.string().describe('Transaction date'),
  description: z.string().describe('Transaction description'),
  category: z.string().describe('Category label'),
  amount: z.number().describe('Transaction amount'),
  type: z.enum(['EXPENSE', 'INCOME', 'TRANSFER']).describe('Transaction type'),
  currency: z.string().describe('Currency code'),
});

const accountItemSchema = z.object({
  name: z.string().describe('Account name'),
  balance: z.number().describe('Current balance'),
  currency: z.string().describe('Currency code'),
});

export const catalog = defineCatalog(schema, {
  components: {
    Text: {
      description:
        'A text block for explanations, summaries, or answers. Use this for any textual content. Supports markdown formatting.',
      props: z.object({
        content: z.string().describe('Markdown text content'),
      }),
    },
    SummaryCard: {
      description:
        'A KPI summary card showing a single metric. Use this to highlight key numbers like totals, averages, or counts.',
      props: z.object({
        title: z.string().describe('Card title, e.g. "Total Expenses"'),
        value: z.string().describe('Formatted value to display, e.g. "€1,234.56"'),
        description: z.string().optional().describe('Optional subtitle or context'),
        trend: z.enum(['up', 'down', 'neutral']).optional().describe('Trend direction indicator'),
      }),
    },
    CategoryPieChart: {
      description:
        'A donut/pie chart showing spending breakdown by category. Use when the user asks about spending distribution or category breakdown.',
      props: z.object({
        title: z.string().optional().describe('Chart title'),
        data: z.array(dataItemSchema).describe('Category data with label and value'),
        currency: z.string().optional().describe('Currency code for formatting'),
      }),
    },
    BarChart: {
      description:
        'A bar chart for comparing values. Use for income vs expenses, monthly comparisons, or ranked data.',
      props: z.object({
        title: z.string().optional().describe('Chart title'),
        data: z.array(dataItemSchema).describe('Bar data with label and value'),
        currency: z.string().optional().describe('Currency code for formatting'),
        color: z.string().optional().describe('Bar color'),
      }),
    },
    IncomeExpenseChart: {
      description:
        'A grouped bar chart showing monthly income vs expenses side by side. Use when comparing income and expenses over time.',
      props: z.object({
        title: z.string().optional().describe('Chart title'),
        data: z.array(monthlyDataItemSchema).describe('Monthly income and expense data'),
        currency: z.string().optional().describe('Currency code'),
      }),
    },
    BudgetComparisonChart: {
      description:
        'A horizontal bar chart comparing budgeted amounts vs actual spending per category. Use when the user asks about budget performance.',
      props: z.object({
        title: z.string().optional().describe('Chart title'),
        data: z.array(budgetItemSchema).describe('Budget vs actual data per category'),
        currency: z.string().optional().describe('Currency code'),
      }),
    },
    TransactionsTable: {
      description:
        'A table showing a list of transactions. Use when the user asks to see specific transactions or a filtered list.',
      props: z.object({
        title: z.string().optional().describe('Table title'),
        transactions: z.array(transactionItemSchema).describe('List of transactions to display'),
      }),
    },
    AccountsList: {
      description:
        'A list of account balances. Use when the user asks about their accounts or balances.',
      props: z.object({
        title: z.string().optional().describe('List title'),
        accounts: z.array(accountItemSchema).describe('Account data'),
      }),
    },
  },
  actions: {},
});

/**
 * Get the system prompt that describes available UI components to the LLM.
 */
export function getCatalogPrompt(): string {
  return catalog.prompt();
}

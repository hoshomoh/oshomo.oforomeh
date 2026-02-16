import { format, min, max } from 'date-fns';
import type { ParsedTransaction, ParsedAccount, ParsedBudget, ParsedGroup } from '../types';
import { formatCurrency } from '../format';
import { getCategoryMeta } from '../constants';
import { getPrimaryCurrency } from '../budget-utils';
import { sanitizeForPrompt } from './sanitize';

/**
 * Build a lightweight summary of the user's financial data for the LLM system prompt.
 * This replaces the full context dump with a brief overview + instruction to use tools.
 */
export function buildDataSummary(
  transactions: ParsedTransaction[],
  accounts: ParsedAccount[],
  budgets: ParsedBudget[],
  groups: ParsedGroup[],
): string {
  if (transactions.length === 0) {
    return 'No financial data available.';
  }

  // Date range
  const txDates = transactions.map((t) => t.date);
  const minDate = min(txDates);
  const maxDate = max(txDates);
  const dateRange = `${format(minDate, 'MMM yyyy')} to ${format(maxDate, 'MMM yyyy')}`;

  // Transaction counts by type
  const expenses = transactions.filter((t) => t.type === 'EXPENSE').length;
  const incomes = transactions.filter((t) => t.type === 'INCOME').length;
  const transfers = transactions.filter((t) => t.type === 'TRANSFER').length;

  // Currencies
  const currencies = [...new Set(transactions.map((t) => t.currency))];

  // Accounts (sanitize names)
  const accountSummary = accounts
    .map((a) => `${sanitizeForPrompt(a.name)} (${a.currency})`)
    .join(', ');

  // Budget
  const budget = budgets[0];
  const budgetCurrency = getPrimaryCurrency(transactions);
  const budgetLine = budget
    ? `Budget: ${formatCurrency(budget.totalAmount, budgetCurrency)}/month across ${Object.keys(budget.categories).length} categories.`
    : 'No budget configured.';

  // Groups (sanitize names)
  const groupLine =
    groups.length > 0
      ? `Groups: ${groups.map((g) => sanitizeForPrompt(g.name)).join(', ')}.`
      : 'No groups.';

  // Categories present in the user's data (id → label mapping)
  const categoryIds = [...new Set(transactions.map((t) => t.categoryId).filter(Boolean))];
  const categoryLines = categoryIds
    .map((id) => `  - "${id}" → ${sanitizeForPrompt(getCategoryMeta(id).label)}`)
    .sort()
    .join('\n');

  return `Financial data overview:
- ${transactions.length} transactions (${expenses} expenses, ${incomes} income, ${transfers} transfers) from ${dateRange}
- Accounts: ${accountSummary || 'None'}
- ${budgetLine}
- ${groupLine}
- Currencies: ${currencies.join(', ')}
- Categories (use these IDs with the categoryId filter in searchTransactions and getSpendingByCategory):
${categoryLines}

Use the provided tools to search and analyze this data. Do NOT guess numbers — always use tools to get accurate figures.`;
}

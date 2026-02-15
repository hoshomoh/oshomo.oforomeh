import type { ParsedTransaction, ParsedAccount, ParsedBudget, ParsedGroup } from '../types';
import { formatCurrency } from '../format';

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
  const dates = transactions.map((t) => t.date.getTime());
  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));
  const dateRange = `${minDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} to ${maxDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;

  // Transaction counts by type
  const expenses = transactions.filter((t) => t.type === 'EXPENSE').length;
  const incomes = transactions.filter((t) => t.type === 'INCOME').length;
  const transfers = transactions.filter((t) => t.type === 'TRANSFER').length;

  // Currencies
  const currencies = [...new Set(transactions.map((t) => t.currency))];

  // Accounts
  const accountSummary = accounts.map((a) => `${a.name} (${a.currency})`).join(', ');

  // Budget
  const budget = budgets[0];
  const budgetLine = budget
    ? `Budget: ${formatCurrency(budget.totalAmount, 'EUR')}/month across ${Object.keys(budget.categories).length} categories.`
    : 'No budget configured.';

  // Groups
  const groupLine =
    groups.length > 0 ? `Groups: ${groups.map((g) => g.name).join(', ')}.` : 'No groups.';

  return `Financial data overview:
- ${transactions.length} transactions (${expenses} expenses, ${incomes} income, ${transfers} transfers) from ${dateRange}
- Accounts: ${accountSummary || 'None'}
- ${budgetLine}
- ${groupLine}
- Currencies: ${currencies.join(', ')}

Use the provided tools to search and analyze this data. Do NOT guess numbers — always use tools to get accurate figures.`;
}

/**
 * Verify the generated sample data passes validation and parsing.
 * Run with: npx tsx app/expense-wise-web/scripts/verify-sample-data.ts
 */

import { validateExportFile } from '../lib/validators';
import { parseTransaction, parseAccount, parseBudget, parseGroup } from '../lib/parsers';
import data from '../../../public/data/expense-wise-sample-data.json';

// 1. Validate structure
const result = validateExportFile(data);
if (!result.valid) {
  console.error('VALIDATION FAILED:', result.error);
  process.exit(1);
}
console.log('Validation: PASSED');
console.log(`  userId: ${result.data.userId}`);
console.log(`  docs: ${result.data.docs.length}`);
console.log(`  appVersion: ${result.data.appVersion}`);

// 2. Parse every document
const counts = { account: 0, group: 0, budget: 0, expense: 0, income: 0, transfer: 0 };
const errors: string[] = [];

for (const doc of result.data.docs) {
  try {
    if (doc.data_type === 'account') {
      const p = parseAccount(doc);
      if (typeof p.balance !== 'number' || Number.isNaN(p.balance)) {
        errors.push(`Account bad balance: ${doc._id}`);
      }
      counts.account++;
    } else if (doc.data_type === 'group') {
      parseGroup(doc);
      counts.group++;
    } else if (doc.data_type === 'budget') {
      const p = parseBudget(doc);
      if (typeof p.totalAmount !== 'number') {
        errors.push('Budget bad totalAmount');
      }
      counts.budget++;
    } else if (doc.data_type === 'transaction') {
      const p = parseTransaction(doc);
      if (typeof p.amount !== 'number' || Number.isNaN(p.amount)) {
        errors.push(`Tx bad amount: ${doc._id}`);
      }
      if (!(p.date instanceof Date)) {
        errors.push(`Tx bad date: ${doc._id}`);
      }
      if (doc.type === 'EXPENSE') {
        counts.expense++;
      } else if (doc.type === 'INCOME') {
        counts.income++;
      } else if (doc.type === 'TRANSFER') {
        counts.transfer++;
      }
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    errors.push(`${doc._id}: ${msg}`);
  }
}

console.log('\nParsing results:');
console.log(`  Accounts: ${counts.account}`);
console.log(`  Groups: ${counts.group}`);
console.log(`  Budgets: ${counts.budget}`);
console.log(`  Expenses: ${counts.expense}`);
console.log(`  Income: ${counts.income}`);
console.log(`  Transfers: ${counts.transfer}`);

if (errors.length > 0) {
  console.error(`\n${errors.length} ERRORS:`);
  for (const err of errors.slice(0, 20)) {
    console.error(`  - ${err}`);
  }
  process.exit(1);
} else {
  console.log('\nAll documents parsed successfully!');
}

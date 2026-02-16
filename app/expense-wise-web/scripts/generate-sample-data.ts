/**
 * Generate sample ExpenseWise export data for testing.
 *
 * Run with: npx tsx app/expense-wise-web/scripts/generate-sample-data.ts
 *
 * Produces a JSON file matching the exact structure exported by the
 * ExpenseWise mobile app so it can be imported directly.
 */

import { faker } from '@faker-js/faker';
import * as fs from 'node:fs';
import * as path from 'node:path';

// ── Seed for reproducible output ──────────────────────────────────
faker.seed(42);

// ── Constants ─────────────────────────────────────────────────────
const USER_ID = 'sample-user-001';
const APP_VERSION = '3.2.0';
const MIN_TX_PER_MONTH = 100;

// Dynamic date range: from exactly 2 years ago up to the current month
const NOW = new Date();
const CURRENT_YEAR = NOW.getFullYear();
const CURRENT_MONTH = NOW.getMonth(); // 0-indexed
const START_YEAR = CURRENT_YEAR - 2;
const START_MONTH = CURRENT_MONTH + 1; // start from the month after this month, 2 years ago

/** Returns an array of { year, month } from 2 years ago up to the current month (inclusive). */
function getMonthRange(): { year: number; month: number }[] {
  const months: { year: number; month: number }[] = [];
  let y = START_YEAR;
  let m = START_MONTH;
  while (y < CURRENT_YEAR || (y === CURRENT_YEAR && m <= CURRENT_MONTH)) {
    months.push({ year: y, month: m });
    m++;
    if (m > 11) {
      m = 0;
      y++;
    }
  }
  return months;
}

const MONTH_RANGE = getMonthRange();

type Currency = 'EUR' | 'NGN' | 'USD' | 'GBP';

// ── Accounts ──────────────────────────────────────────────────────
const accounts: {
  _id: string;
  name: string;
  currency: Currency;
  country: string;
  balance: number;
}[] = [
  {
    _id: `account_${faker.string.uuid()}`,
    name: 'Main Checking',
    currency: 'EUR',
    country: 'DE',
    balance: 4520.75,
  },
  {
    _id: `account_${faker.string.uuid()}`,
    name: 'Savings Account',
    currency: 'EUR',
    country: 'DE',
    balance: 12350.0,
  },
  {
    _id: `account_${faker.string.uuid()}`,
    name: 'US Dollar Account',
    currency: 'USD',
    country: 'US',
    balance: 3200.5,
  },
  {
    _id: `account_${faker.string.uuid()}`,
    name: 'Nigerian Naira Account',
    currency: 'NGN',
    country: 'NG',
    balance: 850000.0,
  },
  {
    _id: `account_${faker.string.uuid()}`,
    name: 'UK Pound Account',
    currency: 'GBP',
    country: 'GB',
    balance: 1875.3,
  },
];

// ── Groups ────────────────────────────────────────────────────────
const groups: { _id: string; name: string; type: string }[] = [
  { _id: `group_${faker.string.uuid()}`, name: 'Summer Holiday 2024', type: 'TRIP' },
  { _id: `group_${faker.string.uuid()}`, name: 'Apartment Expenses', type: 'HOME' },
  { _id: `group_${faker.string.uuid()}`, name: 'Couple Budget', type: 'COUPLE' },
  { _id: `group_${faker.string.uuid()}`, name: 'Winter Ski Trip', type: 'TRIP' },
  { _id: `group_${faker.string.uuid()}`, name: 'Office Supplies', type: 'OTHERS' },
  { _id: `group_${faker.string.uuid()}`, name: 'Family Reunion 2025', type: 'TRIP' },
];

// Weighted categories — more common categories appear more often
const WEIGHTED_CATEGORIES: string[] = [
  ...Array(15).fill('FOOD_GROCERIES'),
  ...Array(10).fill('FOOD_DINING_OUT'),
  ...Array(8).fill('TRANSPORTATION_BUS_TRAIN'),
  ...Array(6).fill('TRANSPORTATION_CAR'),
  ...Array(5).fill('TRANSPORTATION_GAS_FUEL'),
  ...Array(5).fill('UTILITIES_ELECTRICITY'),
  ...Array(5).fill('UTILITIES_TV_PHONE_INTERNET'),
  ...Array(4).fill('HOUSING_RENT'),
  ...Array(4).fill('UTILITIES_SOFTWARE'),
  ...Array(3).fill('FOOD_DRINKS'),
  ...Array(3).fill('LIFE_CLOTHING'),
  ...Array(3).fill('ENTERTAINMENT'),
  ...Array(3).fill('ENTERTAINMENT_MOVIES'),
  ...Array(2).fill('ENTERTAINMENT_SPORT'),
  ...Array(2).fill('MEDICAL'),
  ...Array(2).fill('INSURANCE'),
  ...Array(2).fill('LIFE_GIFT'),
  ...Array(2).fill('HOUSING_MAINTENANCE'),
  ...Array(2).fill('MISCELLANEOUS'),
  ...Array(1).fill('LIFE_EDUCATION'),
  ...Array(1).fill('LIFE_TAXES'),
  ...Array(1).fill('INVESTING'),
  ...Array(1).fill('HOUSING_FURNITURE'),
  ...Array(1).fill('HOUSING_ELECTRONICS'),
  ...Array(1).fill('TRANSPORTATION_TAXI'),
  ...Array(1).fill('TRANSPORTATION_PARKING'),
  ...Array(1).fill('HOME_OFFICE'),
  ...Array(1).fill('LIFE_FAMILY_SUPPORT'),
  ...Array(1).fill('UTILITIES_WATER'),
  ...Array(1).fill('UTILITIES_HEAT_GAS'),
];

// ── Description templates per category ────────────────────────────
const DESCRIPTIONS: Record<string, () => string> = {
  FOOD_GROCERIES: () =>
    faker.helpers.arrayElement([
      'Lidl',
      'Aldi',
      'REWE',
      'Edeka',
      'Penny',
      'Netto',
      'Kaufland',
      'dm Drogerie',
    ]),
  FOOD_DINING_OUT: () =>
    faker.helpers.arrayElement([
      'Pizza Hut',
      "McDonald's",
      'Burger King',
      'Thai restaurant',
      'Italian bistro',
      'Sushi bar',
      'Indian takeaway',
      'Kebab shop',
      'Vietnamese pho',
      'Chinese buffet',
      'Greek taverna',
    ]),
  FOOD_DRINKS: () =>
    faker.helpers.arrayElement([
      'Starbucks',
      'Coffee shop',
      'Smoothie bar',
      'Juice bar',
      'Wine store',
      'Beer garden',
      'Cocktail bar',
    ]),
  FOOD: () => faker.helpers.arrayElement(['Bakery', 'Snack bar', 'Deli counter', 'Food market']),
  TRANSPORTATION_BUS_TRAIN: () =>
    faker.helpers.arrayElement([
      'Monthly transit pass',
      'DB train ticket',
      'Bus fare',
      'U-Bahn ticket',
      'S-Bahn to airport',
      'Regional train',
    ]),
  TRANSPORTATION_CAR: () =>
    faker.helpers.arrayElement([
      'Car wash',
      'Oil change',
      'Tire replacement',
      'Car insurance',
      'Vehicle inspection (TÜV)',
      'Brake pads',
    ]),
  TRANSPORTATION_GAS_FUEL: () =>
    faker.helpers.arrayElement([
      'Shell gas station',
      'Aral fuel',
      'Total petrol',
      'BP filling station',
      'Esso fuel',
    ]),
  TRANSPORTATION_TAXI: () =>
    faker.helpers.arrayElement(['Uber ride', 'Bolt taxi', 'FreeNow taxi', 'Airport taxi']),
  TRANSPORTATION_PARKING: () =>
    faker.helpers.arrayElement([
      'Parking garage',
      'Street parking meter',
      'Airport parking',
      'Monthly parking spot',
    ]),
  TRANSPORTATION: () =>
    faker.helpers.arrayElement(['Scooter rental', 'Bike repair', 'Car sharing']),
  HOUSING_RENT: () => 'Monthly rent',
  HOUSING_MAINTENANCE: () =>
    faker.helpers.arrayElement([
      'Plumber',
      'Electrician',
      'Locksmith',
      'Handyman',
      'Paint supplies',
    ]),
  HOUSING_FURNITURE: () =>
    faker.helpers.arrayElement([
      'IKEA shelf',
      'New desk',
      'Bookcase',
      'Dining table',
      'Office chair',
    ]),
  HOUSING_ELECTRONICS: () =>
    faker.helpers.arrayElement([
      'Smart TV',
      'Router upgrade',
      'Bluetooth speaker',
      'New monitor',
      'Kitchen blender',
    ]),
  HOUSING_HOUSEHOLD_SUPPLIES: () =>
    faker.helpers.arrayElement([
      'Cleaning supplies',
      'Laundry detergent',
      'Paper towels',
      'Light bulbs',
      'Trash bags',
    ]),
  HOUSING_MORTGAGE: () => 'Mortgage payment',
  HOUSING_SERVICES: () =>
    faker.helpers.arrayElement(['Cleaning service', 'Lawn mowing', 'Window cleaning']),
  HOUSING: () => faker.helpers.arrayElement(['Home decor', 'Door mat', 'Curtains']),
  HOME_OFFICE: () =>
    faker.helpers.arrayElement([
      'Standing desk mat',
      'Webcam',
      'Desk lamp',
      'Headset',
      'Monitor arm',
    ]),
  UTILITIES_ELECTRICITY: () => 'Electricity bill',
  UTILITIES_TV_PHONE_INTERNET: () =>
    faker.helpers.arrayElement([
      'Internet bill',
      'Phone plan',
      'Netflix subscription',
      'Spotify subscription',
      'Disney+ subscription',
    ]),
  UTILITIES_SOFTWARE: () =>
    faker.helpers.arrayElement([
      'Adobe Creative Cloud',
      'Microsoft 365',
      'Notion subscription',
      'GitHub Pro',
      '1Password',
      'iCloud storage',
      'ChatGPT Plus',
    ]),
  UTILITIES_WATER: () => 'Water bill',
  UTILITIES_HEAT_GAS: () => 'Gas heating bill',
  UTILITIES: () => faker.helpers.arrayElement(['Waste collection', 'Building management fee']),
  LIFE_CLOTHING: () =>
    faker.helpers.arrayElement([
      'H&M',
      'Zara',
      'Uniqlo',
      'Nike store',
      'Adidas outlet',
      'Decathlon',
      'Zalando order',
    ]),
  LIFE_EDUCATION: () =>
    faker.helpers.arrayElement([
      'Udemy course',
      'Coursera subscription',
      'German language class',
      'Online bootcamp',
      'Books',
    ]),
  LIFE_FAMILY_SUPPORT: () =>
    faker.helpers.arrayElement(['Money transfer to family', 'Family support', 'Gift for parents']),
  LIFE_GIFT: () =>
    faker.helpers.arrayElement([
      'Birthday gift',
      'Christmas present',
      'Wedding gift',
      'Baby shower gift',
      'Thank you gift',
    ]),
  INSURANCE: () =>
    faker.helpers.arrayElement([
      'Health insurance',
      'Liability insurance',
      'Travel insurance',
      'Dental insurance',
    ]),
  MEDICAL: () =>
    faker.helpers.arrayElement([
      'Pharmacy',
      'Doctor visit co-pay',
      'Dentist',
      'Eye exam',
      'Physiotherapy',
    ]),
  LIFE_VACATION: () =>
    faker.helpers.arrayElement([
      'Hotel booking',
      'Airbnb stay',
      'Museum tickets',
      'City tour',
      'Souvenir shop',
    ]),
  MISCELLANEOUS: () =>
    faker.helpers.arrayElement([
      'Amazon order',
      'eBay purchase',
      'Post office',
      'Key copy',
      'Dry cleaning',
    ]),
  LIFE_TAXES: () =>
    faker.helpers.arrayElement(['Income tax prepayment', 'Church tax', 'Solidarity surcharge']),
  INVESTING: () =>
    faker.helpers.arrayElement([
      'ETF purchase',
      'Stock investment',
      'Crypto purchase',
      'Savings plan contribution',
    ]),
  ENTERTAINMENT: () =>
    faker.helpers.arrayElement([
      'Concert tickets',
      'Theme park',
      'Bowling',
      'Escape room',
      'Board game café',
    ]),
  ENTERTAINMENT_GAMES: () =>
    faker.helpers.arrayElement([
      'Steam game purchase',
      'PS5 game',
      'Nintendo eShop',
      'Mobile game IAP',
    ]),
  ENTERTAINMENT_MOVIES: () =>
    faker.helpers.arrayElement(['Cinema tickets', 'Film rental', 'IMAX showing']),
  ENTERTAINMENT_SPORT: () =>
    faker.helpers.arrayElement([
      'Gym membership',
      'Yoga class',
      'Swimming pool',
      'Tennis court',
      'Football gear',
    ]),
};

// ── Income descriptions ───────────────────────────────────────────
const INCOME_DESCRIPTIONS: (() => string)[] = [
  () => 'Monthly salary',
  () => 'Freelance project payment',
  () => faker.helpers.arrayElement(['Tax refund', 'Bonus payment', 'Consulting fee']),
  () => faker.helpers.arrayElement(['Dividend payment', 'Interest income', 'Cashback reward']),
  () => faker.helpers.arrayElement(['Side project income', 'Tutoring payment', 'Survey payout']),
];

// ── Amount ranges per category ────────────────────────────────────
const AMOUNT_RANGES: Record<string, [number, number]> = {
  FOOD_GROCERIES: [15, 120],
  FOOD_DINING_OUT: [12, 80],
  FOOD_DRINKS: [3, 15],
  FOOD: [5, 30],
  TRANSPORTATION_BUS_TRAIN: [2.5, 90],
  TRANSPORTATION_CAR: [50, 800],
  TRANSPORTATION_GAS_FUEL: [30, 90],
  TRANSPORTATION_TAXI: [8, 45],
  TRANSPORTATION_PARKING: [2, 25],
  TRANSPORTATION: [5, 30],
  HOUSING_RENT: [800, 1500],
  HOUSING_MAINTENANCE: [30, 300],
  HOUSING_FURNITURE: [40, 500],
  HOUSING_ELECTRONICS: [25, 600],
  HOUSING_HOUSEHOLD_SUPPLIES: [5, 40],
  HOUSING_MORTGAGE: [900, 1800],
  HOUSING_SERVICES: [40, 150],
  HOUSING: [10, 80],
  HOME_OFFICE: [15, 250],
  UTILITIES_ELECTRICITY: [40, 120],
  UTILITIES_TV_PHONE_INTERNET: [10, 60],
  UTILITIES_SOFTWARE: [5, 30],
  UTILITIES_WATER: [20, 60],
  UTILITIES_HEAT_GAS: [50, 180],
  UTILITIES: [20, 80],
  LIFE_CLOTHING: [15, 200],
  LIFE_EDUCATION: [10, 300],
  LIFE_FAMILY_SUPPORT: [50, 500],
  LIFE_GIFT: [15, 150],
  INSURANCE: [50, 400],
  MEDICAL: [10, 200],
  LIFE_VACATION: [30, 500],
  MISCELLANEOUS: [5, 100],
  LIFE_TAXES: [100, 2000],
  INVESTING: [50, 1000],
  ENTERTAINMENT: [10, 80],
  ENTERTAINMENT_GAMES: [5, 70],
  ENTERTAINMENT_MOVIES: [8, 25],
  ENTERTAINMENT_SPORT: [10, 60],
};

// ── Helpers ───────────────────────────────────────────────────────
function makeId(): string {
  return faker.string.uuid();
}

function makeRev(): string {
  return `1-${faker.string.hexadecimal({ length: 32, prefix: '' }).toLowerCase()}`;
}

function toAmountString(n: number): string {
  return n.toFixed(2);
}

function randomAmount(min: number, max: number): number {
  return Math.round((faker.number.float({ min, max }) + Number.EPSILON) * 100) / 100;
}

function randomDateInMonth(year: number, month: number): Date {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const day = faker.number.int({ min: 1, max: daysInMonth });
  const hour = faker.number.int({ min: 6, max: 23 });
  const minute = faker.number.int({ min: 0, max: 59 });
  return new Date(year, month, day, hour, minute, 0);
}

// ── Document builders ─────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const docs: any[] = [];

function buildAccountDocs() {
  for (const acc of accounts) {
    const ts = Date.now() - faker.number.int({ min: 100000, max: 90000000 });
    const monthlyBalance: Record<string, string> = {};

    // Generate monthly balances over the dynamic date range
    for (const { year, month } of MONTH_RANGE) {
      const key = `${year}-${String(month + 1).padStart(2, '0')}`;
      const variance = faker.number.float({ min: -2000, max: 3000 });
      monthlyBalance[key] = toAmountString(Math.max(0, acc.balance + variance));
    }

    docs.push({
      data_type: 'account',
      userId: USER_ID,
      balance: toAmountString(acc.balance),
      accountName: acc.name,
      accountCountry: acc.country,
      accountCurrency: acc.currency,
      accountHolderName: 'Sample User',
      metadata: {},
      monthlyBalance,
      _id: acc._id,
      _rev: makeRev(),
      created_at: ts,
      updated_at: ts + 1000,
    });
  }
}

function buildGroupDocs() {
  for (const grp of groups) {
    const ts = Date.now() - faker.number.int({ min: 100000, max: 90000000 });
    docs.push({
      data_type: 'group',
      userId: USER_ID,
      name: grp.name,
      type: grp.type,
      _id: grp._id,
      _rev: makeRev(),
      created_at: ts,
      updated_at: ts + 1000,
    });
  }
}

function buildBudgetDoc() {
  const categories: Record<string, string> = {};
  // Assign budget amounts to common expense categories
  const budgetedCategories: [string, number][] = [
    ['FOOD_GROCERIES', 400],
    ['FOOD_DINING_OUT', 150],
    ['TRANSPORTATION_BUS_TRAIN', 80],
    ['TRANSPORTATION_GAS_FUEL', 100],
    ['HOUSING_RENT', 1200],
    ['UTILITIES_ELECTRICITY', 80],
    ['UTILITIES_TV_PHONE_INTERNET', 50],
    ['UTILITIES_SOFTWARE', 30],
    ['LIFE_CLOTHING', 100],
    ['ENTERTAINMENT', 80],
    ['ENTERTAINMENT_MOVIES', 30],
    ['ENTERTAINMENT_SPORT', 50],
    ['MEDICAL', 60],
    ['INSURANCE', 200],
    ['MISCELLANEOUS', 100],
    ['INVESTING', 300],
  ];

  let totalBudget = 0;
  for (const [cat, amount] of budgetedCategories) {
    categories[cat] = toAmountString(amount);
    totalBudget += amount;
  }

  const ts = Date.now() - faker.number.int({ min: 100000, max: 90000000 });
  docs.push({
    data_type: 'budget',
    userId: USER_ID,
    amount: toAmountString(totalBudget),
    categories,
    _id: `budget_${makeId()}`,
    _rev: makeRev(),
    created_at: ts,
    updated_at: ts + 1000,
  });
}

function buildExpenseTransaction(date: Date, account: (typeof accounts)[number]) {
  const categoryId = faker.helpers.arrayElement(WEIGHTED_CATEGORIES);
  const [min, max] = AMOUNT_RANGES[categoryId] ?? [5, 100];

  // Scale amounts for NGN (roughly 1600x EUR)
  const currencyMultiplier =
    account.currency === 'NGN'
      ? 1600
      : account.currency === 'GBP'
        ? 0.85
        : account.currency === 'USD'
          ? 1.1
          : 1;
  const amount = randomAmount(min * currencyMultiplier, max * currencyMultiplier);

  const descFn = DESCRIPTIONS[categoryId];
  const description = descFn ? descFn() : faker.commerce.productName();

  // ~20% of expenses belong to a group
  const groupId =
    faker.number.float({ min: 0, max: 1 }) < 0.2 ? faker.helpers.arrayElement(groups)._id : null;

  const txId = makeId();
  const ts = date.getTime();

  // Build participants — always includes the user
  const participants: Record<string, { paid: string; share: string }> = {
    [USER_ID]: { paid: toAmountString(amount), share: toAmountString(amount) },
  };

  // If it's a group expense, add 1-3 other participants
  if (groupId) {
    const extraCount = faker.number.int({ min: 1, max: 3 });
    const totalParticipants = 1 + extraCount;
    const sharePerPerson = Math.round((amount / totalParticipants + Number.EPSILON) * 100) / 100;
    participants[USER_ID].share = toAmountString(sharePerPerson);

    for (let p = 0; p < extraCount; p++) {
      const participantId = `participant_${faker.string.uuid()}`;
      participants[participantId] = {
        paid: toAmountString(0),
        share: toAmountString(sharePerPerson),
      };
    }
  }

  docs.push({
    data_type: 'transaction',
    type: 'EXPENSE',
    details: {
      id: txId,
      date: date.toISOString(),
      amount: toAmountString(amount),
      account_id: account._id,
      currency: account.currency,
      description,
      participants,
      category_id: categoryId,
      ...(groupId ? { group_id: groupId } : {}),
      splitting_method: groupId ? faker.helpers.arrayElement(['EQUALLY', 'UNEQUALLY']) : 'EQUALLY',
    },
    users: [{ id: USER_ID }],
    _id: `tx_${txId}`,
    _rev: makeRev(),
    created_at: ts,
    updated_at: ts + 1000,
  });
}

function buildIncomeTransaction(date: Date, account: (typeof accounts)[number]) {
  const descFn = faker.helpers.arrayElement(INCOME_DESCRIPTIONS);
  const description = descFn();

  const currencyMultiplier =
    account.currency === 'NGN'
      ? 1600
      : account.currency === 'GBP'
        ? 0.85
        : account.currency === 'USD'
          ? 1.1
          : 1;

  let amount: number;
  if (description === 'Monthly salary') {
    amount = randomAmount(3000 * currencyMultiplier, 5000 * currencyMultiplier);
  } else if (description === 'Freelance project payment') {
    amount = randomAmount(500 * currencyMultiplier, 2500 * currencyMultiplier);
  } else {
    amount = randomAmount(50 * currencyMultiplier, 800 * currencyMultiplier);
  }

  const txId = makeId();
  const ts = date.getTime();

  docs.push({
    data_type: 'transaction',
    type: 'INCOME',
    details: {
      id: txId,
      date: date.toISOString(),
      amount: toAmountString(amount),
      account_id: account._id,
      userId: USER_ID,
      currency: account.currency,
      description,
    },
    users: [{ id: USER_ID }],
    _id: `tx_${txId}`,
    _rev: makeRev(),
    created_at: ts,
    updated_at: ts + 1000,
  });
}

function buildTransferTransaction(date: Date) {
  // Pick two different accounts
  const fromAccount = faker.helpers.arrayElement(accounts);
  let toAccount = faker.helpers.arrayElement(accounts);
  while (toAccount._id === fromAccount._id) {
    toAccount = faker.helpers.arrayElement(accounts);
  }

  const amount = randomAmount(100, 2000);
  // If cross-currency, compute a rough converted amount
  const rates: Record<Currency, number> = { EUR: 1, USD: 1.1, GBP: 0.85, NGN: 1600 };
  const toAmount =
    Math.round((amount / rates[fromAccount.currency]) * rates[toAccount.currency] * 100) / 100;

  const txId = makeId();
  const ts = date.getTime();

  docs.push({
    data_type: 'transaction',
    type: 'TRANSFER',
    details: {
      id: txId,
      date: date.toISOString(),
      amount: toAmountString(amount),
      account_id: fromAccount._id,
      userId: USER_ID,
      to_account_id: toAccount._id,
      to_account_amount: toAmountString(toAmount),
      currency: {
        account: fromAccount.currency,
        to_account: toAccount.currency,
      },
      account_name: {
        account: fromAccount.name,
        to_account: toAccount.name,
      },
    },
    users: [{ id: USER_ID }],
    _id: `tx_${txId}`,
    _rev: makeRev(),
    created_at: ts,
    updated_at: ts + 1000,
  });
}

// ── Main generation ───────────────────────────────────────────────
function generate() {
  console.log('Generating sample data...');

  // 1. Build non-transaction docs
  buildAccountDocs();
  buildGroupDocs();
  buildBudgetDoc();

  // 2. Build transactions month by month
  let totalTx = 0;

  for (const { year, month } of MONTH_RANGE) {
    // Determine how many transactions this month
    const txCount = faker.number.int({ min: MIN_TX_PER_MONTH, max: MIN_TX_PER_MONTH + 30 });

    // Distribution: ~70% expenses, ~20% income, ~10% transfers
    const expenseCount = Math.round(txCount * 0.7);
    const incomeCount = Math.round(txCount * 0.2);
    const transferCount = txCount - expenseCount - incomeCount;

    for (let i = 0; i < expenseCount; i++) {
      const date = randomDateInMonth(year, month);
      // Most expenses go to the main EUR account, but some to others
      const account =
        faker.number.float({ min: 0, max: 1 }) < 0.65
          ? accounts[0] // Main Checking (EUR)
          : faker.helpers.arrayElement(accounts);
      buildExpenseTransaction(date, account);
    }

    for (let i = 0; i < incomeCount; i++) {
      const date = randomDateInMonth(year, month);
      // Salary goes to main account, other income distributed
      const account = i === 0 ? accounts[0] : faker.helpers.arrayElement(accounts);
      buildIncomeTransaction(date, account);
    }

    for (let i = 0; i < transferCount; i++) {
      const date = randomDateInMonth(year, month);
      buildTransferTransaction(date);
    }

    totalTx += txCount;
    console.log(`  ${year}-${String(month + 1).padStart(2, '0')}: ${txCount} transactions`);
  }

  // 3. Assemble the export
  const exportData = {
    userId: USER_ID,
    docs,
    appVersion: APP_VERSION,
    backedUpAt: new Date().toISOString(),
  };

  // 4. Write to file
  const outPath = path.resolve(
    __dirname,
    '..',
    '..',
    '..',
    'public',
    'data',
    'expense-wise-sample-data.json',
  );
  fs.writeFileSync(outPath, JSON.stringify(exportData, null, 2), 'utf-8');

  console.log(
    `\nDone! Generated ${totalTx} transactions + ${accounts.length} accounts + ${groups.length} groups + 1 budget`,
  );
  console.log(`Total documents: ${docs.length}`);
  console.log(`Output: ${outPath}`);
}

generate();

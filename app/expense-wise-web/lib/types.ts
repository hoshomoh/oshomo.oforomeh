// ============================================================
// Currency
// ============================================================
export type Currency = 'EUR' | 'NGN' | 'USD' | 'GBP' | (string & {});

// ============================================================
// Category (from ExpenseWise mobile app)
// ============================================================
export enum Category {
  UN_CATEGORIZED = 'UN_CATEGORIZED',

  // Housing
  HOUSING_OTHERS = 'HOUSING',
  HOUSING_ELECTRONICS = 'HOUSING_ELECTRONICS',
  HOUSING_FURNITURE = 'HOUSING_FURNITURE',
  HOUSING_HOUSEHOLD_SUPPLIES = 'HOUSING_HOUSEHOLD_SUPPLIES',
  HOUSING_MAINTENANCE = 'HOUSING_MAINTENANCE',
  HOUSING_MORTGAGE = 'HOUSING_MORTGAGE',
  HOUSING_PETS = 'HOUSING_PETS',
  HOUSING_RENT = 'HOUSING_RENT',
  HOUSING_SERVICES = 'HOUSING_SERVICES',
  HOUSING_HOME_OFFICE = 'HOME_OFFICE',

  // Transportation
  TRANSPORTATION_OTHERS = 'TRANSPORTATION',
  TRANSPORTATION_BICYCLE = 'TRANSPORTATION_BICYCLE',
  TRANSPORTATION_BUS_TRAIN = 'TRANSPORTATION_BUS_TRAIN',
  TRANSPORTATION_CAR = 'TRANSPORTATION_CAR',
  TRANSPORTATION_GAS_FUEL = 'TRANSPORTATION_GAS_FUEL',
  TRANSPORTATION_HOTEL = 'TRANSPORTATION_HOTEL',
  TRANSPORTATION_PARKING = 'TRANSPORTATION_PARKING',
  TRANSPORTATION_PLANE = 'TRANSPORTATION_PLANE',
  TRANSPORTATION_TAXI = 'TRANSPORTATION_TAXI',

  // Food
  FOOD_OTHERS = 'FOOD',
  FOOD_DINING_OUT = 'FOOD_DINING_OUT',
  FOOD_GROCERIES = 'FOOD_GROCERIES',
  FOOD_DRINKS = 'FOOD_DRINKS',

  // Utilities
  UTILITIES_OTHERS = 'UTILITIES',
  UTILITIES_CLEANING = 'UTILITIES_CLEANING',
  UTILITIES_ELECTRICITY = 'UTILITIES_ELECTRICITY',
  UTILITIES_SOFTWARE = 'UTILITIES_SOFTWARE',
  UTILITIES_HEAT_GAS = 'UTILITIES_HEAT_GAS',
  UTILITIES_TRASH = 'UTILITIES_TRASH',
  UTILITIES_TV_PHONE_INTERNET = 'UTILITIES_TV_PHONE_INTERNET',
  UTILITIES_WATER = 'UTILITIES_WATER',

  // Life
  LIFE_CHILD_CARE = 'CHILD_CARE',
  LIFE_CLOTHING = 'LIFE_CLOTHING',
  LIFE_EDUCATION = 'LIFE_EDUCATION',
  LIFE_FAMILY_SUPPORT = 'LIFE_FAMILY_SUPPORT',
  LIFE_GIFT = 'LIFE_GIFT',
  LIFE_INSURANCE = 'INSURANCE',
  LIFE_MEDICAL = 'MEDICAL',
  LIFE_VACATION = 'LIFE_VACATION',
  LIFE_MISCELLANEOUS = 'MISCELLANEOUS',
  LIFE_TAXES = 'LIFE_TAXES',
  LIFE_INVESTING = 'INVESTING',
  LIFE_DEPT_PAYMENT = 'DEPT_PAYMENT',

  // Entertainment
  ENTERTAINMENT_OTHERS = 'ENTERTAINMENT',
  ENTERTAINMENT_GAMES = 'ENTERTAINMENT_GAMES',
  ENTERTAINMENT_MOVIES = 'ENTERTAINMENT_MOVIES',
  ENTERTAINMENT_MUSIC = 'ENTERTAINMENT_MUSIC',
  ENTERTAINMENT_SPORT = 'ENTERTAINMENT_SPORT',
}

export enum CategorySection {
  OTHERS = 'OTHERS',
  ENTERTAINMENT = 'ENTERTAINMENT',
  FOOD_DRINKS = 'FOOD_DRINKS',
  HOME = 'HOME',
  LIFE = 'LIFE',
  TRANSPORTATION = 'TRANSPORTATION',
  UTILITIES = 'UTILITIES',
}

// ============================================================
// Transaction types
// ============================================================
export enum TransactionType {
  EXPENSE = 'EXPENSE',
  INCOME = 'INCOME',
  TRANSFER = 'TRANSFER',
}

export enum SplittingMethodType {
  EQUALLY = 'EQUALLY',
  UNEQUALLY = 'UNEQUALLY',
  PERCENTAGE = 'PERCENTAGE',
  SHARES = 'SHARES',
}

export type ExpenseDetails = {
  id: string;
  date: string;
  amount: string;
  account_id: string;
  currency: Currency;
  description: string;
  participants: Record<string, { paid: string; share: string }>;
  category_id: string;
  group_id?: string | null;
  splitting_method: SplittingMethodType;
};

export type IncomeDetails = {
  id: string;
  date: string;
  amount: string;
  account_id: string;
  userId: string;
  currency: Currency;
  description: string;
};

export type TransferDetails = {
  id: string;
  date: string;
  amount: string;
  account_id: string;
  userId: string;
  to_account_id: string;
  to_account_amount: string;
  currency: {
    account: Currency;
    to_account: Currency;
  };
  account_name: {
    account: string;
    to_account: string;
  };
};

export type TransactionDocument =
  | {
      data_type: 'transaction';
      type: TransactionType.EXPENSE;
      details: ExpenseDetails;
      users?: { id: string }[];
      _id: string;
      _rev: string;
      created_at: number;
      updated_at: number;
    }
  | {
      data_type: 'transaction';
      type: TransactionType.INCOME;
      details: IncomeDetails;
      users?: { id: string }[];
      _id: string;
      _rev: string;
      created_at: number;
      updated_at: number;
    }
  | {
      data_type: 'transaction';
      type: TransactionType.TRANSFER;
      details: TransferDetails;
      users?: { id: string }[];
      _id: string;
      _rev: string;
      created_at: number;
      updated_at: number;
    };

// ============================================================
// Account types
// ============================================================
export type AccountDocument = {
  data_type: 'account';
  userId: string;
  balance: string;
  accountName: string;
  accountCountry: string;
  accountCurrency: Currency;
  accountHolderName?: string;
  metadata?: Record<string, unknown>;
  monthlyBalance?: Record<string, string>;
  _id: string;
  _rev: string;
  created_at: number;
  updated_at: number;
};

// ============================================================
// Budget types
// ============================================================
export type BudgetDocument = {
  data_type: 'budget';
  userId: string;
  amount: string;
  categories: Record<string, string>;
  _id: string;
  _rev: string;
  created_at: number;
  updated_at: number;
};

// ============================================================
// Group types
// ============================================================
export enum GroupType {
  TRIP = 'TRIP',
  HOME = 'HOME',
  COUPLE = 'COUPLE',
  OTHERS = 'OTHERS',
}

export type GroupDocument = {
  data_type: 'group';
  userId: string;
  name: string;
  type: GroupType;
  _id: string;
  _rev: string;
  created_at: number;
  updated_at: number;
};

// ============================================================
// Union document type
// ============================================================
export type ExpenseWiseDocument =
  | TransactionDocument
  | AccountDocument
  | BudgetDocument
  | GroupDocument;

// ============================================================
// Export file structure
// ============================================================
export type ExpenseWiseExport = {
  userId: string;
  docs: ExpenseWiseDocument[];
  appVersion: string;
  backedUpAt: string;
};

// ============================================================
// Parsed / normalized types (numeric amounts, Date objects)
// ============================================================
export type ParsedTransaction = {
  id: string;
  type: TransactionType;
  amount: number;
  currency: Currency;
  categoryId: string;
  accountId: string;
  toAccountId?: string;
  description: string;
  date: Date;
  groupId: string | null;
  participants: Record<string, { paid: number; share: number }>;
  splittingMethod?: SplittingMethodType;
  createdAt: number;
  updatedAt: number;
};

export type ParsedAccount = {
  id: string;
  balance: number;
  name: string;
  currency: Currency;
  country: string;
  monthlyBalance: Record<string, number>;
  createdAt: number;
  updatedAt: number;
};

export type ParsedBudget = {
  id: string;
  totalAmount: number;
  categories: Record<string, number>;
  createdAt: number;
  updatedAt: number;
};

export type ParsedGroup = {
  id: string;
  name: string;
  type: GroupType;
  createdAt: number;
  updatedAt: number;
};

// ============================================================
// LLM / Chat types
// ============================================================
export type LLMProvider = 'openai' | 'anthropic' | 'google' | 'mistral' | 'groq' | 'ollama';

export type LLMConfig = {
  provider: LLMProvider;
  apiKey: string;
  model: string;
  ollamaBaseUrl?: string;
};

// ============================================================
// Dashboard filter types
// ============================================================
export type DateRangePreset =
  | 'this-month'
  | 'last-month'
  | 'last-3-months'
  | 'last-6-months'
  | 'this-year'
  | 'last-year'
  | 'all-time'
  | 'custom';

export type DashboardFilters = {
  dateRange: { from: Date; to: Date };
  datePreset: DateRangePreset;
  currency: Currency | 'all';
  accountId: string | 'all';
  categoryId: string | 'all';
  groupId: string | 'all';
  compareEnabled: boolean;
  compareDateRange: { from: Date; to: Date };
  compareDatePreset: DateRangePreset;
};

// ============================================================
// App metadata (stored in IndexedDB)
// ============================================================
export type AppMetadata = {
  key: 'app-metadata';
  userId: string;
  appVersion: string;
  backedUpAt: string;
  lastImportedAt: string;
  documentCount: number;
};

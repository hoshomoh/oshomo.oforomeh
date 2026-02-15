import {
  Home,
  Car,
  Utensils,
  Zap,
  Gamepad2,
  HelpCircle,
  ShoppingCart,
  Coffee,
  Wrench,
  CreditCard,
  DollarSign,
  Sofa,
  PawPrint,
  Laptop,
  Monitor,
  Bus,
  Fuel,
  Hotel,
  ParkingCircle,
  Plane,
  CarTaxiFront,
  Bike,
  Droplets,
  Wifi,
  Trash2,
  Flame,
  SprayCan,
  Baby,
  Shirt,
  GraduationCap,
  Users,
  Gift,
  Shield,
  Stethoscope,
  Palmtree,
  Receipt,
  Landmark,
  TrendingUp,
  Banknote,
  Clapperboard,
  Music,
  Dumbbell,
  type LucideIcon,
} from 'lucide-react';
import { Category, CategorySection, type LLMProvider } from './types';

// ============================================================
// Category metadata
// ============================================================
export type CategoryMeta = {
  label: string;
  section: CategorySection;
  icon: LucideIcon;
  color: string;
};

export const CATEGORY_META: Record<string, CategoryMeta> = {
  [Category.UN_CATEGORIZED]: {
    label: 'Uncategorized',
    section: CategorySection.OTHERS,
    icon: HelpCircle,
    color: '#94a3b8',
  },

  // Housing
  [Category.HOUSING_OTHERS]: {
    label: 'Housing',
    section: CategorySection.HOME,
    icon: Home,
    color: '#8b5cf6',
  },
  [Category.HOUSING_ELECTRONICS]: {
    label: 'Electronics',
    section: CategorySection.HOME,
    icon: Monitor,
    color: '#7c3aed',
  },
  [Category.HOUSING_FURNITURE]: {
    label: 'Furniture',
    section: CategorySection.HOME,
    icon: Sofa,
    color: '#a78bfa',
  },
  [Category.HOUSING_HOUSEHOLD_SUPPLIES]: {
    label: 'Household Supplies',
    section: CategorySection.HOME,
    icon: ShoppingCart,
    color: '#6d28d9',
  },
  [Category.HOUSING_MAINTENANCE]: {
    label: 'Maintenance',
    section: CategorySection.HOME,
    icon: Wrench,
    color: '#5b21b6',
  },
  [Category.HOUSING_MORTGAGE]: {
    label: 'Mortgage',
    section: CategorySection.HOME,
    icon: CreditCard,
    color: '#4c1d95',
  },
  [Category.HOUSING_PETS]: {
    label: 'Pets',
    section: CategorySection.HOME,
    icon: PawPrint,
    color: '#c084fc',
  },
  [Category.HOUSING_RENT]: {
    label: 'Rent',
    section: CategorySection.HOME,
    icon: DollarSign,
    color: '#9333ea',
  },
  [Category.HOUSING_SERVICES]: {
    label: 'Services',
    section: CategorySection.HOME,
    icon: Wrench,
    color: '#7e22ce',
  },
  [Category.HOUSING_HOME_OFFICE]: {
    label: 'Home Office',
    section: CategorySection.HOME,
    icon: Laptop,
    color: '#6b21a8',
  },

  // Transportation
  [Category.TRANSPORTATION_OTHERS]: {
    label: 'Transportation',
    section: CategorySection.TRANSPORTATION,
    icon: Car,
    color: '#3b82f6',
  },
  [Category.TRANSPORTATION_BICYCLE]: {
    label: 'Bicycle',
    section: CategorySection.TRANSPORTATION,
    icon: Bike,
    color: '#2563eb',
  },
  [Category.TRANSPORTATION_BUS_TRAIN]: {
    label: 'Bus & Train',
    section: CategorySection.TRANSPORTATION,
    icon: Bus,
    color: '#1d4ed8',
  },
  [Category.TRANSPORTATION_CAR]: {
    label: 'Car',
    section: CategorySection.TRANSPORTATION,
    icon: Car,
    color: '#1e40af',
  },
  [Category.TRANSPORTATION_GAS_FUEL]: {
    label: 'Gas & Fuel',
    section: CategorySection.TRANSPORTATION,
    icon: Fuel,
    color: '#1e3a8a',
  },
  [Category.TRANSPORTATION_HOTEL]: {
    label: 'Hotel',
    section: CategorySection.TRANSPORTATION,
    icon: Hotel,
    color: '#60a5fa',
  },
  [Category.TRANSPORTATION_PARKING]: {
    label: 'Parking',
    section: CategorySection.TRANSPORTATION,
    icon: ParkingCircle,
    color: '#93c5fd',
  },
  [Category.TRANSPORTATION_PLANE]: {
    label: 'Plane',
    section: CategorySection.TRANSPORTATION,
    icon: Plane,
    color: '#3b82f6',
  },
  [Category.TRANSPORTATION_TAXI]: {
    label: 'Taxi',
    section: CategorySection.TRANSPORTATION,
    icon: CarTaxiFront,
    color: '#2563eb',
  },

  // Food
  [Category.FOOD_OTHERS]: {
    label: 'Food',
    section: CategorySection.FOOD_DRINKS,
    icon: Utensils,
    color: '#f97316',
  },
  [Category.FOOD_DINING_OUT]: {
    label: 'Dining Out',
    section: CategorySection.FOOD_DRINKS,
    icon: Utensils,
    color: '#ea580c',
  },
  [Category.FOOD_GROCERIES]: {
    label: 'Groceries',
    section: CategorySection.FOOD_DRINKS,
    icon: ShoppingCart,
    color: '#c2410c',
  },
  [Category.FOOD_DRINKS]: {
    label: 'Drinks',
    section: CategorySection.FOOD_DRINKS,
    icon: Coffee,
    color: '#9a3412',
  },

  // Utilities
  [Category.UTILITIES_OTHERS]: {
    label: 'Utilities',
    section: CategorySection.UTILITIES,
    icon: Zap,
    color: '#eab308',
  },
  [Category.UTILITIES_CLEANING]: {
    label: 'Cleaning',
    section: CategorySection.UTILITIES,
    icon: SprayCan,
    color: '#ca8a04',
  },
  [Category.UTILITIES_ELECTRICITY]: {
    label: 'Electricity',
    section: CategorySection.UTILITIES,
    icon: Zap,
    color: '#a16207',
  },
  [Category.UTILITIES_SOFTWARE]: {
    label: 'Software',
    section: CategorySection.UTILITIES,
    icon: Laptop,
    color: '#854d0e',
  },
  [Category.UTILITIES_HEAT_GAS]: {
    label: 'Heat & Gas',
    section: CategorySection.UTILITIES,
    icon: Flame,
    color: '#713f12',
  },
  [Category.UTILITIES_TRASH]: {
    label: 'Trash',
    section: CategorySection.UTILITIES,
    icon: Trash2,
    color: '#eab308',
  },
  [Category.UTILITIES_TV_PHONE_INTERNET]: {
    label: 'TV/Phone/Internet',
    section: CategorySection.UTILITIES,
    icon: Wifi,
    color: '#ca8a04',
  },
  [Category.UTILITIES_WATER]: {
    label: 'Water',
    section: CategorySection.UTILITIES,
    icon: Droplets,
    color: '#a16207',
  },

  // Life
  [Category.LIFE_CHILD_CARE]: {
    label: 'Child Care',
    section: CategorySection.LIFE,
    icon: Baby,
    color: '#ec4899',
  },
  [Category.LIFE_CLOTHING]: {
    label: 'Clothing',
    section: CategorySection.LIFE,
    icon: Shirt,
    color: '#db2777',
  },
  [Category.LIFE_EDUCATION]: {
    label: 'Education',
    section: CategorySection.LIFE,
    icon: GraduationCap,
    color: '#be185d',
  },
  [Category.LIFE_FAMILY_SUPPORT]: {
    label: 'Family Support',
    section: CategorySection.LIFE,
    icon: Users,
    color: '#9d174d',
  },
  [Category.LIFE_GIFT]: {
    label: 'Gift',
    section: CategorySection.LIFE,
    icon: Gift,
    color: '#831843',
  },
  [Category.LIFE_INSURANCE]: {
    label: 'Insurance',
    section: CategorySection.LIFE,
    icon: Shield,
    color: '#ec4899',
  },
  [Category.LIFE_MEDICAL]: {
    label: 'Medical',
    section: CategorySection.LIFE,
    icon: Stethoscope,
    color: '#f472b6',
  },
  [Category.LIFE_VACATION]: {
    label: 'Vacation',
    section: CategorySection.LIFE,
    icon: Palmtree,
    color: '#db2777',
  },
  [Category.LIFE_MISCELLANEOUS]: {
    label: 'Miscellaneous',
    section: CategorySection.LIFE,
    icon: Receipt,
    color: '#be185d',
  },
  [Category.LIFE_TAXES]: {
    label: 'Taxes',
    section: CategorySection.LIFE,
    icon: Landmark,
    color: '#9d174d',
  },
  [Category.LIFE_INVESTING]: {
    label: 'Investing',
    section: CategorySection.LIFE,
    icon: TrendingUp,
    color: '#10b981',
  },
  [Category.LIFE_DEPT_PAYMENT]: {
    label: 'Debt Payment',
    section: CategorySection.LIFE,
    icon: Banknote,
    color: '#ef4444',
  },

  // Entertainment
  [Category.ENTERTAINMENT_OTHERS]: {
    label: 'Entertainment',
    section: CategorySection.ENTERTAINMENT,
    icon: Gamepad2,
    color: '#06b6d4',
  },
  [Category.ENTERTAINMENT_GAMES]: {
    label: 'Games',
    section: CategorySection.ENTERTAINMENT,
    icon: Gamepad2,
    color: '#0891b2',
  },
  [Category.ENTERTAINMENT_MOVIES]: {
    label: 'Movies',
    section: CategorySection.ENTERTAINMENT,
    icon: Clapperboard,
    color: '#0e7490',
  },
  [Category.ENTERTAINMENT_MUSIC]: {
    label: 'Music',
    section: CategorySection.ENTERTAINMENT,
    icon: Music,
    color: '#155e75',
  },
  [Category.ENTERTAINMENT_SPORT]: {
    label: 'Sport',
    section: CategorySection.ENTERTAINMENT,
    icon: Dumbbell,
    color: '#164e63',
  },
};

export function getCategoryMeta(categoryId: string): CategoryMeta {
  return (
    CATEGORY_META[categoryId] ?? {
      label: categoryId.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      section: CategorySection.OTHERS,
      icon: HelpCircle,
      color: '#94a3b8',
    }
  );
}

// ============================================================
// LLM provider / model metadata
// ============================================================
export type ProviderMeta = {
  label: string;
  models: { id: string; label: string }[];
  requiresApiKey: boolean;
  requiresBaseUrl?: boolean;
};

export const PROVIDER_META: Record<LLMProvider, ProviderMeta> = {
  openai: {
    label: 'OpenAI',
    requiresApiKey: true,
    models: [
      { id: 'gpt-5.2', label: 'GPT-5.2' },
      { id: 'gpt-5-mini', label: 'GPT-5 Mini' },
      { id: 'gpt-5-nano', label: 'GPT-5 Nano' },
      { id: 'o3', label: 'o3' },
      { id: 'o4-mini', label: 'o4 Mini' },
      { id: 'gpt-4o', label: 'GPT-4o' },
      { id: 'gpt-4o-mini', label: 'GPT-4o Mini' },
    ],
  },
  anthropic: {
    label: 'Anthropic',
    requiresApiKey: true,
    models: [
      { id: 'claude-opus-4-6', label: 'Claude Opus 4.6' },
      { id: 'claude-sonnet-4-5', label: 'Claude Sonnet 4.5' },
      { id: 'claude-haiku-4-5', label: 'Claude Haiku 4.5' },
      { id: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4' },
      { id: 'claude-opus-4-20250514', label: 'Claude Opus 4' },
    ],
  },
  google: {
    label: 'Google',
    requiresApiKey: true,
    models: [
      { id: 'gemini-3-flash-preview', label: 'Gemini 3 Flash' },
      { id: 'gemini-3-pro-preview', label: 'Gemini 3 Pro' },
      { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
      { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
    ],
  },
  mistral: {
    label: 'Mistral',
    requiresApiKey: true,
    models: [
      { id: 'mistral-large-latest', label: 'Mistral Large' },
      { id: 'mistral-medium-latest', label: 'Mistral Medium' },
      { id: 'mistral-small-latest', label: 'Mistral Small' },
      { id: 'magistral-medium-2507', label: 'Magistral Medium' },
      { id: 'magistral-small-2507', label: 'Magistral Small' },
    ],
  },
  groq: {
    label: 'Groq',
    requiresApiKey: true,
    models: [
      { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B' },
      { id: 'meta-llama/llama-4-scout-17b-16e-instruct', label: 'Llama 4 Scout 17B' },
      { id: 'meta-llama/llama-4-maverick-17b-128e-instruct', label: 'Llama 4 Maverick 17B' },
      { id: 'qwen/qwen3-32b', label: 'Qwen3 32B' },
      { id: 'openai/gpt-oss-120b', label: 'GPT OSS 120B' },
    ],
  },
  ollama: {
    label: 'Ollama (Local)',
    requiresApiKey: false,
    requiresBaseUrl: true,
    models: [],
  },
};

// ============================================================
// Currency display metadata
// ============================================================
export const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: '\u20AC',
  NGN: '\u20A6',
  USD: '$',
  GBP: '\u00A3',
};

// ============================================================
// Date range preset labels
// ============================================================
export const DATE_PRESET_LABELS: Record<string, string> = {
  'this-month': 'This Month',
  'last-month': 'Last Month',
  'last-3-months': 'Last 3 Months',
  'last-6-months': 'Last 6 Months',
  'this-year': 'This Year',
  'last-year': 'Last Year',
  'all-time': 'All Time',
  custom: 'Custom',
};

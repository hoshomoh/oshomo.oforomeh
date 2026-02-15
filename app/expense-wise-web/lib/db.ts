import { openDB as idbOpen, type IDBPDatabase, type DBSchema } from 'idb';
import { formatISO } from 'date-fns';
import type {
  ExpenseWiseDocument,
  ExpenseWiseExport,
  TransactionDocument,
  AccountDocument,
  BudgetDocument,
  GroupDocument,
  AppMetadata,
  DataSource,
  LLMConfig,
} from './types';

// ============================================================
// Database schema
// ============================================================
interface ExpenseWiseDB extends DBSchema {
  documents: {
    key: string;
    value: ExpenseWiseDocument;
    indexes: { 'by-data-type': string };
  };
  metadata: {
    key: string;
    value: AppMetadata;
  };
  settings: {
    key: string;
    value: { key: string; value: unknown };
  };
}

const DB_NAME = 'expense-wise-web';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<ExpenseWiseDB>> | null = null;

function getDB(): Promise<IDBPDatabase<ExpenseWiseDB>> {
  if (!dbPromise) {
    dbPromise = idbOpen<ExpenseWiseDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Documents store
        if (!db.objectStoreNames.contains('documents')) {
          const docStore = db.createObjectStore('documents', { keyPath: '_id' });
          docStore.createIndex('by-data-type', 'data_type');
        }
        // Metadata store
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' });
        }
        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      },
    });
  }
  return dbPromise;
}

// ============================================================
// Import / Merge
// ============================================================
export type ImportResult = {
  total: number;
  transactions: number;
  accounts: number;
  budgets: number;
  groups: number;
};

/**
 * Import documents from an export file into IndexedDB.
 * Uses put() which upserts by _id — latest upload wins.
 * If the previous import was sample data, clears all documents first.
 */
export async function importDocuments(
  exportData: ExpenseWiseExport,
  dataSource: DataSource = 'user',
): Promise<ImportResult> {
  const db = await getDB();

  // Clear existing data if previous import was sample data
  const existingMeta = await db.get('metadata', 'app-metadata');
  if (existingMeta?.dataSource === 'sample') {
    const clearTx = db.transaction('documents', 'readwrite');
    await clearTx.objectStore('documents').clear();
    await clearTx.done;
  }

  const tx = db.transaction(['documents', 'metadata'], 'readwrite');
  const docStore = tx.objectStore('documents');
  const metaStore = tx.objectStore('metadata');

  const result: ImportResult = { total: 0, transactions: 0, accounts: 0, budgets: 0, groups: 0 };

  for (const doc of exportData.docs) {
    await docStore.put(doc);
    result.total++;
    switch (doc.data_type) {
      case 'transaction':
        result.transactions++;
        break;
      case 'account':
        result.accounts++;
        break;
      case 'budget':
        result.budgets++;
        break;
      case 'group':
        result.groups++;
        break;
    }
  }

  // Update metadata
  const metadata: AppMetadata = {
    key: 'app-metadata',
    userId: exportData.userId,
    appVersion: exportData.appVersion,
    backedUpAt: exportData.backedUpAt,
    lastImportedAt: formatISO(new Date()),
    documentCount: result.total,
    dataSource,
  };
  await metaStore.put(metadata);

  await tx.done;
  return result;
}

// ============================================================
// Query operations
// ============================================================
export async function getAllTransactions(): Promise<TransactionDocument[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex('documents', 'by-data-type', 'transaction');
  return all as TransactionDocument[];
}

export async function getAllAccounts(): Promise<AccountDocument[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex('documents', 'by-data-type', 'account');
  return all as AccountDocument[];
}

export async function getBudgets(): Promise<BudgetDocument[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex('documents', 'by-data-type', 'budget');
  return all as BudgetDocument[];
}

export async function getAllGroups(): Promise<GroupDocument[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex('documents', 'by-data-type', 'group');
  return all as GroupDocument[];
}

export async function getMetadata(): Promise<AppMetadata | undefined> {
  const db = await getDB();
  return db.get('metadata', 'app-metadata');
}

export async function hasData(): Promise<boolean> {
  const db = await getDB();
  const count = await db.count('documents');
  return count > 0;
}

// ============================================================
// Settings
// ============================================================
export async function saveSetting(key: string, value: unknown): Promise<void> {
  const db = await getDB();
  await db.put('settings', { key, value });
}

export async function getSetting<T>(key: string): Promise<T | undefined> {
  const db = await getDB();
  const result = await db.get('settings', key);
  return result?.value as T | undefined;
}

export async function getLLMConfig(): Promise<LLMConfig | undefined> {
  return getSetting<LLMConfig>('llm-config');
}

export async function saveLLMConfig(config: LLMConfig): Promise<void> {
  return saveSetting('llm-config', config);
}

// ============================================================
// Chat history (persisted via settings store)
// ============================================================
export async function saveChatMessages(messages: unknown[]): Promise<void> {
  return saveSetting('chat-messages', messages);
}

export async function getChatMessages(): Promise<unknown[]> {
  const messages = await getSetting<unknown[]>('chat-messages');
  return messages ?? [];
}

export async function clearChatMessages(): Promise<void> {
  return saveSetting('chat-messages', []);
}

// ============================================================
// Data management
// ============================================================
export async function clearAllData(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['documents', 'metadata'], 'readwrite');
  await tx.objectStore('documents').clear();
  await tx.objectStore('metadata').clear();
  await tx.done;
}

export async function getDocumentCounts(): Promise<Record<string, number>> {
  const db = await getDB();
  const all = await db.getAll('documents');
  const counts: Record<string, number> = { transaction: 0, account: 0, budget: 0, group: 0 };
  for (const doc of all) {
    counts[doc.data_type] = (counts[doc.data_type] ?? 0) + 1;
  }
  return counts;
}

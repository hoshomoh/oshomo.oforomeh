import type { ExpenseWiseExport, ExpenseWiseDocument } from './types';

export type ValidationResult =
  | { valid: true; data: ExpenseWiseExport }
  | { valid: false; error: string };

/**
 * Validate that a parsed JSON object conforms to the ExpenseWise export format.
 */
export function validateExportFile(data: unknown): ValidationResult {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'File does not contain a valid JSON object.' };
  }

  const obj = data as Record<string, unknown>;

  if (typeof obj.userId !== 'string' || !obj.userId) {
    return { valid: false, error: 'Missing or invalid "userId" field.' };
  }

  if (!Array.isArray(obj.docs)) {
    return { valid: false, error: 'Missing or invalid "docs" array.' };
  }

  if (typeof obj.appVersion !== 'string') {
    return { valid: false, error: 'Missing or invalid "appVersion" field.' };
  }

  if (typeof obj.backedUpAt !== 'string') {
    return { valid: false, error: 'Missing or invalid "backedUpAt" field.' };
  }

  // Validate each document has required fields
  const validDataTypes = new Set(['transaction', 'account', 'budget', 'group']);
  for (let i = 0; i < obj.docs.length; i++) {
    const doc = obj.docs[i] as Record<string, unknown>;
    if (!doc || typeof doc !== 'object') {
      return { valid: false, error: `Document at index ${i} is not a valid object.` };
    }
    if (typeof doc._id !== 'string') {
      return { valid: false, error: `Document at index ${i} is missing "_id" field.` };
    }
    if (typeof doc.data_type !== 'string' || !validDataTypes.has(doc.data_type)) {
      return {
        valid: false,
        error: `Document "${doc._id}" has invalid "data_type": "${doc.data_type}".`,
      };
    }
  }

  return {
    valid: true,
    data: {
      userId: obj.userId as string,
      docs: obj.docs as ExpenseWiseDocument[],
      appVersion: obj.appVersion as string,
      backedUpAt: obj.backedUpAt as string,
    },
  };
}

/**
 * Parse a JSON file and validate it as an ExpenseWise export.
 */
export async function parseAndValidateFile(file: File): Promise<ValidationResult> {
  if (!file.name.endsWith('.json')) {
    return { valid: false, error: 'Please upload a JSON file.' };
  }

  try {
    const text = await file.text();
    const data = JSON.parse(text);
    return validateExportFile(data);
  } catch {
    return { valid: false, error: 'Failed to parse JSON file. Please check the file format.' };
  }
}

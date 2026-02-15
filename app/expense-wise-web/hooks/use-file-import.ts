'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { parseAndValidateFile } from '../lib/validators';
import { importDocuments, type ImportResult } from '../lib/db';

export function useFileImport(onImportComplete?: (result: ImportResult) => void) {
  const [isImporting, setIsImporting] = React.useState(false);

  const onDrop = React.useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) {
        return;
      }

      setIsImporting(true);

      try {
        const validation = await parseAndValidateFile(file);

        if (!validation.valid) {
          toast.error('Invalid file', { description: validation.error });
          setIsImporting(false);
          return;
        }

        const result = await importDocuments(validation.data);

        toast.success('Import successful', {
          description: `Imported ${result.total} documents (${result.transactions} transactions, ${result.accounts} accounts, ${result.budgets} budgets, ${result.groups} groups).`,
        });

        onImportComplete?.(result);
      } catch (error) {
        toast.error('Import failed', {
          description: error instanceof Error ? error.message : 'An unexpected error occurred.',
        });
      } finally {
        setIsImporting(false);
      }
    },
    [onImportComplete],
  );

  return { isImporting, onDrop };
}

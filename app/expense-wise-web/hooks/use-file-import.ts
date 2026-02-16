'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { parseAndValidateFile, validateExportFile } from '../lib/validators';
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

  const loadSampleData = React.useCallback(async () => {
    setIsImporting(true);

    try {
      const response = await fetch('/data/expense-wise-sample-data.json');
      if (!response.ok) {
        throw new Error('Failed to fetch sample data.');
      }

      const data = await response.json();
      const validation = validateExportFile(data);

      if (!validation.valid) {
        toast.error('Invalid sample data', { description: validation.error });
        setIsImporting(false);
        return;
      }

      const result = await importDocuments(validation.data, 'sample');

      toast.success('Sample data loaded', {
        description: `Imported ${result.total} documents (${result.transactions} transactions, ${result.accounts} accounts, ${result.budgets} budgets, ${result.groups} groups).`,
      });

      onImportComplete?.(result);
    } catch (error) {
      toast.error('Failed to load sample data', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
      });
    } finally {
      setIsImporting(false);
    }
  }, [onImportComplete]);

  return { isImporting, onDrop, loadSampleData };
}

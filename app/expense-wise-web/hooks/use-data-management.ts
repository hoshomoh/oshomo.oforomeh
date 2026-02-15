'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { clearAllData, getDocumentCounts, getMetadata } from '../lib/db';
import type { AppMetadata } from '../lib/types';

export function useDataManagement(onDataCleared: () => void) {
  const [metadata, setMetadata] = React.useState<AppMetadata | undefined>();
  const [counts, setCounts] = React.useState<Record<string, number>>({});
  const [clearing, setClearing] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  React.useEffect(() => {
    async function load() {
      const [meta, docCounts] = await Promise.all([getMetadata(), getDocumentCounts()]);
      setMetadata(meta);
      setCounts(docCounts);
    }
    load();
  }, []);

  const handleClear = async () => {
    setClearing(true);
    try {
      await clearAllData();
      setMetadata(undefined);
      setCounts({});
      setDialogOpen(false);
      toast.success('All data has been cleared');
      onDataCleared();
    } catch {
      toast.error('Failed to clear data');
    } finally {
      setClearing(false);
    }
  };

  const totalDocs = Object.values(counts).reduce((sum, c) => sum + c, 0);

  return {
    metadata,
    counts,
    totalDocs,
    clearing,
    dialogOpen,
    setDialogOpen,
    handleClear,
  };
}

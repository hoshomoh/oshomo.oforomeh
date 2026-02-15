'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { clearAllData, getDocumentCounts, getMetadata } from '../lib/db';
import type { AppMetadata } from '../lib/types';

type DataManagementState = {
  metadata: AppMetadata | undefined;
  counts: Record<string, number>;
  clearing: boolean;
  dialogOpen: boolean;
};

type DataManagementAction =
  | { type: 'LOAD_SUCCESS'; metadata: AppMetadata | undefined; counts: Record<string, number> }
  | { type: 'SET_CLEARING'; clearing: boolean }
  | { type: 'SET_DIALOG_OPEN'; open: boolean }
  | { type: 'CLEAR_SUCCESS' };

function dataManagementReducer(
  state: DataManagementState,
  action: DataManagementAction,
): DataManagementState {
  switch (action.type) {
    case 'LOAD_SUCCESS':
      return { ...state, metadata: action.metadata, counts: action.counts };
    case 'SET_CLEARING':
      return { ...state, clearing: action.clearing };
    case 'SET_DIALOG_OPEN':
      return { ...state, dialogOpen: action.open };
    case 'CLEAR_SUCCESS':
      return { ...state, metadata: undefined, counts: {}, dialogOpen: false, clearing: false };
    default:
      return state;
  }
}

export function useDataManagement(onDataCleared: () => void) {
  const [state, dispatch] = React.useReducer(dataManagementReducer, {
    metadata: undefined,
    counts: {},
    clearing: false,
    dialogOpen: false,
  });

  React.useEffect(() => {
    async function load() {
      const [meta, docCounts] = await Promise.all([getMetadata(), getDocumentCounts()]);
      dispatch({ type: 'LOAD_SUCCESS', metadata: meta, counts: docCounts });
    }
    load();
  }, []);

  const handleClear = async () => {
    dispatch({ type: 'SET_CLEARING', clearing: true });
    try {
      await clearAllData();
      dispatch({ type: 'CLEAR_SUCCESS' });
      toast.success('All data has been cleared');
      onDataCleared();
    } catch {
      toast.error('Failed to clear data');
      dispatch({ type: 'SET_CLEARING', clearing: false });
    }
  };

  const totalDocs = Object.values(state.counts).reduce((sum, c) => sum + c, 0);

  return {
    metadata: state.metadata,
    counts: state.counts,
    totalDocs,
    clearing: state.clearing,
    dialogOpen: state.dialogOpen,
    setDialogOpen: (open: boolean) => dispatch({ type: 'SET_DIALOG_OPEN', open }),
    handleClear,
  };
}

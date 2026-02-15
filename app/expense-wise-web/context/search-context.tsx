'use client';

import * as React from 'react';
import type { AnyOrama } from '@orama/orama';
import { useData } from './data-context';
import { createSearchIndex, populateIndex } from '../lib/search-engine';

type SearchContextValue = {
  searchIndex: AnyOrama | null;
  isIndexReady: boolean;
  rebuildIndex: () => Promise<void>;
};

const SearchContext = React.createContext<SearchContextValue>({
  searchIndex: null,
  isIndexReady: false,
  rebuildIndex: async () => {},
});

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const { transactions, accounts, groups, hasData } = useData();
  const [searchIndex, setSearchIndex] = React.useState<AnyOrama | null>(null);
  const [isIndexReady, setIsIndexReady] = React.useState(false);
  const buildingRef = React.useRef(false);

  const buildIndex = React.useCallback(async () => {
    if (buildingRef.current) {
      return;
    }
    buildingRef.current = true;

    try {
      if (!hasData || transactions.length === 0) {
        setSearchIndex(null);
        setIsIndexReady(false);
        return;
      }

      // Always build a fresh in-memory index
      const db = createSearchIndex();
      await populateIndex(db, transactions, accounts, groups);

      setSearchIndex(db);
      setIsIndexReady(true);
    } catch (err) {
      console.error('Failed to build search index:', err);
      setIsIndexReady(false);
    } finally {
      buildingRef.current = false;
    }
  }, [transactions, accounts, groups, hasData]);

  const rebuildIndex = React.useCallback(async () => {
    buildingRef.current = false;
    await buildIndex();
  }, [buildIndex]);

  React.useEffect(() => {
    buildIndex();
  }, [buildIndex]);

  return (
    <SearchContext.Provider value={{ searchIndex, isIndexReady, rebuildIndex }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  return React.useContext(SearchContext);
}

'use client';

import * as React from 'react';
import { getExchangeRates } from '../lib/currency-conversion';
import type { ExchangeRates } from '../lib/types';

/**
 * Hook to load and cache exchange rates.
 * Fetches rates on mount and caches them for the session.
 */
export function useExchangeRates() {
  const [rates, setRates] = React.useState<ExchangeRates | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    let mounted = true;

    async function loadRates() {
      try {
        const fetchedRates = await getExchangeRates();
        if (mounted) {
          setRates(fetchedRates);
          setIsLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to load exchange rates'));
          setIsLoading(false);
        }
      }
    }

    loadRates();

    return () => {
      mounted = false;
    };
  }, []);

  return { rates, isLoading, error };
}

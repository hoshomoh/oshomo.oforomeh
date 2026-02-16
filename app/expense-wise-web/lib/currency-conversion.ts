import type { Currency, ExchangeRates } from './types';

// In-memory cache
let ratesCache: ExchangeRates | null = null;

/**
 * Load exchange rates from local fallback file (generated at build time).
 * This file is created by the build script using the private API key.
 * No API key is exposed to the client.
 */
async function loadFallbackRates(): Promise<ExchangeRates | null> {
  try {
    const response = await fetch('/data/exchange-rates.json', {
      cache: 'force-cache',
    });

    if (!response.ok) {
      console.warn('Failed to load fallback exchange rates');
      return null;
    }

    return await response.json();
  } catch (error) {
    console.warn('Error loading fallback exchange rates:', error);
    return null;
  }
}

/**
 * Get exchange rates from the cached fallback file.
 * Rates are fetched at build-time using a private API key.
 */
export async function getExchangeRates(): Promise<ExchangeRates> {
  // Return cached rates if already loaded
  if (ratesCache) {
    return ratesCache;
  }

  // Load from fallback file
  const rates = await loadFallbackRates();

  if (!rates) {
    throw new Error('Unable to load exchange rates from fallback file');
  }

  // Cache for future use
  ratesCache = rates;

  return rates;
}

/**
 * Convert amount from one currency to another using exchange rates.
 * @param amount Amount in source currency
 * @param fromCurrency Source currency code
 * @param toCurrency Target currency code
 * @param rates Exchange rates object
 * @returns Converted amount in target currency
 */
export function convertCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency,
  rates: ExchangeRates,
): number {
  // No conversion needed
  if (fromCurrency === toCurrency) {
    return amount;
  }

  const from = fromCurrency.toUpperCase();
  const to = toCurrency.toUpperCase();
  const base = rates.base.toUpperCase();

  // Get rate for source currency (relative to base)
  const fromRate = from === base ? 1 : rates.rates[from];

  // Get rate for target currency (relative to base)
  const toRate = to === base ? 1 : rates.rates[to];

  if (!fromRate || !toRate) {
    console.warn(
      `Missing exchange rate for ${from} or ${to}. Available currencies:`,
      Object.keys(rates.rates).length,
    );
    // Return original amount as fallback
    return amount;
  }

  // Convert: amount in fromCurrency -> base currency -> toCurrency
  // Example: 100 USD -> EUR (base)
  // If base is EUR and EUR/USD rate is 1.08
  // 100 USD / 1.08 = 92.59 EUR
  const amountInBase = amount / fromRate;

  return amountInBase * toRate;
}

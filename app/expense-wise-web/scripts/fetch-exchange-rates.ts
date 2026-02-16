#!/usr/bin/env tsx

/**
 * Build-time script to fetch current exchange rates from exchangerate-api.com
 * and save them as a fallback JSON file.
 *
 * Run with: npx tsx app/expense-wise-web/scripts/fetch-exchange-rates.ts
 *
 * Requires EXCHANGE_RATE_API_KEY environment variable.
 */

import { config } from 'dotenv';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// Load the.env file from the project root if it exists (local development)
// On platforms like Vercel, env vars are set directly and no .env file exists
const envPath = join(process.cwd(), '.env');
if (existsSync(envPath)) {
  config({ path: envPath });
}

type ExchangeRates = {
  base: string;
  date: string;
  rates: Record<string, number>;
};

async function fetchLatestRates(): Promise<ExchangeRates> {
  const apiKey = process.env.EXCHANGE_RATE_API_KEY;

  if (!apiKey) {
    throw new Error(
      'EXCHANGE_RATE_API_KEY environment variable is required. Get one free at https://www.exchangerate-api.com/',
    );
  }

  const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/EUR`;

  console.log('Fetching latest exchange rates from exchangerate-api.com...');

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch rates: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  if (data.result !== 'success') {
    throw new Error(`API error: ${data['error-type']}`);
  }

  const rates: ExchangeRates = {
    base: data.base_code,
    date: new Date(data.time_last_update_unix * 1000).toISOString().split('T')[0],
    rates: data.conversion_rates,
  };

  console.log(`✓ Fetched rates for ${Object.keys(rates.rates).length} currencies`);
  console.log(`  Base currency: ${rates.base}`);
  console.log(`  Date: ${rates.date}`);
  console.log(`  Sample rates: EUR→USD: ${rates.rates.USD}, EUR→NGN: ${rates.rates.NGN}`);

  return rates;
}

async function main() {
  try {
    const rates = await fetchLatestRates();

    // Ensure public/data directory exists
    const publicDir = join(process.cwd(), 'public');
    const dataDir = join(publicDir, 'data');

    mkdirSync(dataDir, { recursive: true });

    // Write rates to JSON file
    const outputPath = join(dataDir, 'exchange-rates.json');
    writeFileSync(outputPath, JSON.stringify(rates, null, 2), 'utf-8');

    console.log(`✓ Saved fallback exchange rates to ${outputPath}`);
    console.log('\nDone!');
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    console.error(
      '\nMake sure EXCHANGE_RATE_API_KEY is set. Get a free key at https://www.exchangerate-api.com/',
    );
    process.exit(1);
  }
}

main();

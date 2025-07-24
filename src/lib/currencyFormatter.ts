import { CurrencyType } from '@/types';

// Currency symbol mapping
const currencySymbols: Record<CurrencyType, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  BTC: '₿',
};

// Currency decimal places mapping
const currencyDecimals: Record<CurrencyType, number> = {
  USD: 2,
  EUR: 2,
  GBP: 2,
  JPY: 0,
  BTC: 8,
};

// Exchange rates (relative to USD)
const exchangeRates: Record<CurrencyType, number> = {
  USD: 1,
  EUR: 0.85,
  GBP: 0.75,
  JPY: 110,
  BTC: 0.000025,
};

/**
 * Format a price in USD to the target currency
 * 
 * @param price - Price in USD
 * @param currency - Target currency
 * @returns Formatted price string with currency symbol
 */
export function formatCurrency(price: number, currency: CurrencyType = 'USD'): string {
  // Convert USD price to target currency
  const convertedPrice = price * exchangeRates[currency];
  
  // Format the price with the appropriate number of decimal places
  const formattedValue = convertedPrice.toFixed(currencyDecimals[currency]);
  
  // Return with currency symbol
  return `${currencySymbols[currency]}${formattedValue}`;
}

/**
 * Get the currency symbol
 * 
 * @param currency - Target currency
 * @returns Currency symbol
 */
export function getCurrencySymbol(currency: CurrencyType): string {
  return currencySymbols[currency] || '$';
}
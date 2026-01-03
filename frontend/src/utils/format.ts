import type { Language } from '@/types';

/**
 * Currency formatting options for Indonesian Rupiah
 */
const IDR_FORMAT_OPTIONS: Intl.NumberFormatOptions = {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
};

/**
 * Formats a number as Indonesian Rupiah currency
 * @param amount - The amount to format
 * @param hideAmount - If true, returns masked value for privacy mode
 * @returns Formatted currency string (without "Rp" prefix)
 */
export function formatCurrency(amount: number, hideAmount = false): string {
  if (hideAmount) {
    return '••••••';
  }
  
  return new Intl.NumberFormat('id-ID', IDR_FORMAT_OPTIONS).format(Math.abs(amount));
}

/**
 * Formats a number as full currency with prefix
 * @param amount - The amount to format
 * @param hideAmount - If true, returns masked value for privacy mode
 * @returns Formatted currency string with "Rp" prefix
 */
export function formatCurrencyFull(amount: number, hideAmount = false): string {
  if (hideAmount) {
    return 'Rp ••••••';
  }
  
  return `Rp ${formatCurrency(amount)}`;
}

/**
 * Formats a transaction amount with sign
 * @param amount - The amount to format
 * @param type - Transaction type (income adds +, expense adds -)
 * @param hideAmount - If true, returns masked value
 */
export function formatTransactionAmount(
  amount: number, 
  type: 'income' | 'expense' | 'transfer',
  hideAmount = false
): string {
  if (hideAmount) {
    return 'Rp ••••••';
  }
  
  const sign = type === 'income' ? '+' : '-';
  return `${sign}Rp ${formatCurrency(amount)}`;
}

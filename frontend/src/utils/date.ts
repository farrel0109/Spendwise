import type { Language } from '@/types';

/**
 * Date format options for different display contexts
 */
const DATE_FORMATS = {
  short: { month: 'short', day: 'numeric' } as const,
  medium: { weekday: 'short', month: 'short', day: 'numeric' } as const,
  long: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' } as const,
  monthYear: { year: 'numeric', month: 'long' } as const,
};

/**
 * Get locale string from language code
 */
function getLocale(language: Language = 'en'): string {
  return language === 'id' ? 'id-ID' : 'en-US';
}

/**
 * Formats a date string for display
 * @param dateString - ISO date string or Date object
 * @param format - Format type: 'short', 'medium', 'long', 'monthYear'
 * @param language - Language for localization
 */
export function formatDate(
  dateString: string | Date,
  format: keyof typeof DATE_FORMATS = 'short',
  language: Language = 'en'
): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  const locale = getLocale(language);
  
  return date.toLocaleDateString(locale, DATE_FORMATS[format]);
}

/**
 * Formats a date for transaction display (e.g., "Mon, Jan 15")
 * @param dateString - ISO date string
 * @param language - Language for localization
 */
export function formatTransactionDate(dateString: string, language: Language = 'en'): string {
  return formatDate(dateString, 'medium', language);
}

/**
 * Gets the current month in YYYY-MM format
 */
export function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

/**
 * Gets today's date in YYYY-MM-DD format
 */
export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Checks if a date is in the past
 */
export function isPastDate(dateString: string): boolean {
  return new Date(dateString) < new Date();
}

/**
 * Checks if a date is today
 */
export function isToday(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

/**
 * Gets relative time description (e.g., "2 days ago", "in 3 weeks")
 * @param dateString - ISO date string
 * @param language - Language for localization
 */
export function getRelativeTime(dateString: string, language: Language = 'en'): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  
  const locale = getLocale(language);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  
  if (Math.abs(diffDays) < 1) {
    return rtf.format(0, 'day');
  } else if (Math.abs(diffDays) < 7) {
    return rtf.format(diffDays, 'day');
  } else if (Math.abs(diffDays) < 30) {
    return rtf.format(Math.round(diffDays / 7), 'week');
  } else if (Math.abs(diffDays) < 365) {
    return rtf.format(Math.round(diffDays / 30), 'month');
  } else {
    return rtf.format(Math.round(diffDays / 365), 'year');
  }
}

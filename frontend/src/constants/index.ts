// ============================================
// Design Tokens
// ============================================

export const COLORS = {
  // Primary
  primary: '#007bff',
  primaryDark: '#0056b3',
  primaryLight: '#007bff20',
  
  // Background
  background: '#0f1923',
  surface: '#18222d',
  surfaceHighlight: '#232e3b',
  
  // Status
  success: '#10B981',
  successLight: '#10B98120',
  danger: '#EF4444',
  dangerLight: '#EF444420',
  warning: '#F59E0B',
  warningLight: '#F59E0B20',
  
  // Text
  textPrimary: '#ffffff',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  
  // Borders
  border: 'rgba(255, 255, 255, 0.05)',
  borderLight: 'rgba(255, 255, 255, 0.10)',
  
  // Transaction Types
  income: '#10B981',
  expense: '#EF4444',
  transfer: '#3B82F6',
} as const;

// ============================================
// Typography
// ============================================

export const FONT_SIZES = {
  xs: '0.75rem',    // 12px
  sm: '0.875rem',   // 14px
  base: '1rem',     // 16px
  lg: '1.125rem',   // 18px
  xl: '1.25rem',    // 20px
  '2xl': '1.5rem',  // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem',  // 36px
  '5xl': '3rem',     // 48px
} as const;

// ============================================
// Spacing
// ============================================

export const SPACING = {
  xs: '0.25rem',  // 4px
  sm: '0.5rem',   // 8px
  md: '1rem',     // 16px
  lg: '1.5rem',   // 24px
  xl: '2rem',     // 32px
  '2xl': '3rem',  // 48px
} as const;

// ============================================
// Border Radius
// ============================================

export const BORDER_RADIUS = {
  sm: '0.375rem',  // 6px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  '2xl': '1.5rem', // 24px
  full: '9999px',
} as const;

// ============================================
// Animation Durations
// ============================================

export const ANIMATION = {
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
} as const;

// ============================================
// API Configuration
// ============================================

export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  timeout: 10000,
} as const;

// ============================================
// Pagination
// ============================================

export const PAGINATION = {
  defaultLimit: 20,
  dashboardTransactionLimit: 5,
  maxPageSize: 100,
} as const;

// ============================================
// Form Validation
// ============================================

export const VALIDATION = {
  maxDescriptionLength: 500,
  maxAmount: 999999999.99,
  minAmount: 0.01,
} as const;

// ============================================
// Emotions (for transaction mood tracking)
// ============================================

export const EMOTIONS = [
  'Happy',
  'Neutral', 
  'Sad',
  'Frustrated',
  'Confused',
] as const;

export type Emotion = typeof EMOTIONS[number];

// ============================================
// Account Types
// ============================================

export const ACCOUNT_TYPES = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank', label: 'Bank' },
  { value: 'e-wallet', label: 'E-Wallet' },
  { value: 'investment', label: 'Investment' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'loan', label: 'Loan' },
] as const;

// ============================================
// Transaction Types
// ============================================

export const TRANSACTION_TYPES = [
  { value: 'income', label: 'Income', color: COLORS.income },
  { value: 'expense', label: 'Expense', color: COLORS.expense },
  { value: 'transfer', label: 'Transfer', color: COLORS.transfer },
] as const;

// ============================================
// Time Periods
// ============================================

export const TIME_PERIODS = {
  day: '1D',
  week: '1W',
  month: '1M',
  year: '1Y',
} as const;

// ============================================
// Chart Colors
// ============================================

export const CHART_COLORS = [
  '#007bff',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#84CC16',
] as const;

// ============================================
// Local Storage Keys
// ============================================

export const STORAGE_KEYS = {
  language: 'spendwise-lang',
  theme: 'spendwise-theme',
  privacyMode: 'spendwise-privacy',
} as const;

// Re-export navigation config
export * from './navigation';

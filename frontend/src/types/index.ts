// ============================================
// API Response Types
// ============================================

export interface Profile {
  id: string;
  clerk_id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  currency: string;
  onboarding_completed: boolean;
  display_name?: string;
  bio?: string;
  theme?: ThemeMode;
  accent_color?: string;
  language?: Language;
  date_format?: string;
  notification_budget?: boolean;
  notification_goals?: boolean;
  notification_achievements?: boolean;
  privacy_hide_amounts?: boolean;
}

export interface UserSettings {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  currency: string;
  theme: ThemeMode;
  accentColor: string;
  language: Language;
  dateFormat: string;
  notificationBudget: boolean;
  notificationGoals: boolean;
  notificationAchievements: boolean;
  privacyHideAmounts: boolean;
}

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  icon: string;
  color: string;
  balance: number;
  initial_balance: number;
  is_asset: boolean;
  is_active: boolean;
  institution?: string;
  account_number?: string;
}

export interface Category {
  id: number;
  user_id: string;
  name: string;
  color: string;
  icon: string;
  type: TransactionType;
  parent_id?: number;
}

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  to_account_id?: string;
  category_id: number | null;
  amount: number;
  type: TransactionType;
  description: string;
  txn_date: string;
  emotion?: string;
  receipt_url?: string;
  tags?: string[];
  accounts?: Account;
  to_accounts?: Account;
  categories?: Category;
}

export interface Budget {
  id: string;
  category_id: number;
  amount: number;
  spent: number;
  period: string;
  alert_threshold: number;
  percentUsed: number;
  remaining: number;
  isOverBudget: boolean;
  isNearLimit: boolean;
  categories?: Category;
}

export interface SavingsGoal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date?: string;
  icon: string;
  color: string;
  priority: number;
  is_completed: boolean;
  progress: number;
  remaining: number;
}

export interface Debt {
  id: string;
  person_name: string;
  person_contact?: string;
  amount: number;
  original_amount: number;
  description?: string;
  due_date?: string;
  is_settled: boolean;
  isOverdue?: boolean;
  paidPercentage?: number;
}

export interface UserStats {
  level: number;
  title: string;
  xp: number;
  xpProgress: number;
  xpNeeded: number;
  progressPercent: number;
  streak: number;
  longestStreak: number;
  totalTransactions: number;
  financialScore: number;
}

export interface Achievement {
  id: string;
  name: string;
  icon: string;
  description: string;
  earned: boolean;
  earnedAt?: string;
}

export interface NetWorthSnapshot {
  snapshot_date: string;
  net_worth: number;
  total_assets: number;
  total_liabilities: number;
  cash_and_bank: number;
  investments: number;
  total_income: number;
  total_expense: number;
  savings_rate: number;
}

export interface HealthScore {
  score: number;
  grade: string;
  breakdown: {
    savings: { score: number; rate: number };
    debt: { score: number; ratio: number };
    budget: { score: number };
    diversification: { score: number };
  };
  summary: {
    netWorth: number;
    totalAssets: number;
    totalLiabilities: number;
    monthlyIncome: number;
    monthlyExpense: number;
  };
  tips: string[];
}

export interface NetWorthData {
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
}

// ============================================
// Common Types & Enums
// ============================================

export type TransactionType = 'income' | 'expense' | 'transfer';
export type AccountType = 'cash' | 'bank' | 'e-wallet' | 'investment' | 'credit_card' | 'loan';
export type ThemeMode = 'light' | 'dark' | 'system';
export type Language = 'id' | 'en';

// ============================================
// Request/Filter Types
// ============================================

export interface TransactionFilters {
  month?: string;
  accountId?: string;
  categoryId?: number;
  type?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CreateTransactionData {
  accountId: string;
  toAccountId?: string;
  categoryId?: number;
  amount: number;
  type: TransactionType;
  description?: string;
  txnDate: string;
  emotion?: string;
  tags?: string[];
}

export interface CreateAccountData {
  name: string;
  type: string;
  icon?: string;
  color?: string;
  initialBalance?: number;
  isAsset?: boolean;
  institution?: string;
}

export interface CreateBudgetData {
  categoryId: number;
  amount: number;
  period?: string;
  alertThreshold?: number;
}

export interface CreateGoalData {
  name: string;
  targetAmount: number;
  targetDate?: string;
  icon?: string;
  color?: string;
}

export interface CreateDebtData {
  personName: string;
  amount: number;
  description?: string;
  dueDate?: string;
}

export interface UpdateProfileData {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  currency?: string;
  theme?: ThemeMode;
  accentColor?: string;
  language?: Language;
  dateFormat?: string;
  notificationBudget?: boolean;
  notificationGoals?: boolean;
  notificationAchievements?: boolean;
  privacyHideAmounts?: boolean;
}

// ============================================
// Pagination Types
// ============================================

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

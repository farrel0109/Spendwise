import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================
// Types
// ============================================

export interface Profile {
  id: string;
  clerk_id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  currency: string;
  onboarding_completed: boolean;
}

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: 'cash' | 'bank' | 'e-wallet' | 'investment' | 'credit_card' | 'loan';
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
  type: 'income' | 'expense' | 'transfer';
  parent_id?: number;
}

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  to_account_id?: string;
  category_id: number | null;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
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

// ============================================
// Helper
// ============================================

const authHeader = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// ============================================
// User API
// ============================================

export async function syncUser(token: string, data: { email?: string; fullName?: string; avatarUrl?: string }) {
  const response = await api.post('/api/users/sync', data, authHeader(token));
  return response.data;
}

export async function getProfile(token: string): Promise<Profile> {
  const response = await api.get('/api/users/profile', authHeader(token));
  return response.data;
}

export async function completeOnboarding(token: string) {
  const response = await api.post('/api/users/complete-onboarding', {}, authHeader(token));
  return response.data;
}

// ============================================
// Accounts API
// ============================================

export async function getAccounts(token: string) {
  const response = await api.get('/api/accounts', authHeader(token));
  return response.data;
}

export async function createAccount(token: string, data: {
  name: string;
  type: string;
  icon?: string;
  color?: string;
  initialBalance?: number;
  isAsset?: boolean;
  institution?: string;
}) {
  const response = await api.post('/api/accounts', data, authHeader(token));
  return response.data;
}

export async function updateAccount(token: string, id: string, data: Partial<Account>) {
  const response = await api.patch(`/api/accounts/${id}`, data, authHeader(token));
  return response.data;
}

export async function deleteAccount(token: string, id: string) {
  await api.delete(`/api/accounts/${id}`, authHeader(token));
}

// ============================================
// Categories API
// ============================================

export async function getCategories(token: string): Promise<Category[]> {
  const response = await api.get('/api/categories', authHeader(token));
  return response.data;
}

export async function createCategory(token: string, data: { name: string; color?: string; icon?: string; type?: string }) {
  const response = await api.post('/api/categories', data, authHeader(token));
  return response.data;
}

export async function deleteCategory(token: string, id: number) {
  await api.delete(`/api/categories/${id}`, authHeader(token));
}

// ============================================
// Transactions API
// ============================================

export async function getTransactions(token: string, params?: {
  month?: string;
  accountId?: string;
  categoryId?: number;
  type?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const response = await api.get('/api/transactions', {
    ...authHeader(token),
    params,
  });
  return response.data;
}

export async function createTransaction(token: string, data: {
  accountId: string;
  toAccountId?: string;
  categoryId?: number;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  description?: string;
  txnDate: string;
  emotion?: string;
  tags?: string[];
}) {
  const response = await api.post('/api/transactions', data, authHeader(token));
  return response.data;
}

export async function updateTransaction(token: string, id: string, data: Partial<Transaction>) {
  const response = await api.patch(`/api/transactions/${id}`, data, authHeader(token));
  return response.data;
}

export async function deleteTransaction(token: string, id: string) {
  await api.delete(`/api/transactions/${id}`, authHeader(token));
}

// ============================================
// Budgets API
// ============================================

export async function getBudgets(token: string): Promise<Budget[]> {
  const response = await api.get('/api/budgets', authHeader(token));
  return response.data;
}

export async function createBudget(token: string, data: {
  categoryId: number;
  amount: number;
  period?: string;
  alertThreshold?: number;
}) {
  const response = await api.post('/api/budgets', data, authHeader(token));
  return response.data;
}

export async function updateBudget(token: string, id: string, data: { amount?: number; alertThreshold?: number }) {
  const response = await api.patch(`/api/budgets/${id}`, data, authHeader(token));
  return response.data;
}

export async function deleteBudget(token: string, id: string) {
  await api.delete(`/api/budgets/${id}`, authHeader(token));
}

// ============================================
// Goals API
// ============================================

export async function getGoals(token: string): Promise<SavingsGoal[]> {
  const response = await api.get('/api/goals', authHeader(token));
  return response.data;
}

export async function createGoal(token: string, data: {
  name: string;
  targetAmount: number;
  targetDate?: string;
  icon?: string;
  color?: string;
}) {
  const response = await api.post('/api/goals', data, authHeader(token));
  return response.data;
}

export async function contributeToGoal(token: string, id: string, amount: number, note?: string) {
  const response = await api.post(`/api/goals/${id}/contribute`, { amount, note }, authHeader(token));
  return response.data;
}

export async function deleteGoal(token: string, id: string) {
  await api.delete(`/api/goals/${id}`, authHeader(token));
}

// ============================================
// Debts API
// ============================================

export async function getDebts(token: string) {
  const response = await api.get('/api/debts', authHeader(token));
  return response.data;
}

export async function createDebt(token: string, data: {
  personName: string;
  amount: number;
  description?: string;
  dueDate?: string;
}) {
  const response = await api.post('/api/debts', data, authHeader(token));
  return response.data;
}

export async function payDebt(token: string, id: string, amount: number, note?: string) {
  const response = await api.post(`/api/debts/${id}/pay`, { amount, note }, authHeader(token));
  return response.data;
}

export async function settleDebt(token: string, id: string) {
  const response = await api.patch(`/api/debts/${id}/settle`, {}, authHeader(token));
  return response.data;
}

export async function deleteDebt(token: string, id: string) {
  await api.delete(`/api/debts/${id}`, authHeader(token));
}

// ============================================
// Analytics API
// ============================================

export async function getTrends(token: string, months?: number) {
  const response = await api.get('/api/analytics/trends', {
    ...authHeader(token),
    params: { months },
  });
  return response.data;
}

export async function getPatterns(token: string, month?: string) {
  const response = await api.get('/api/analytics/patterns', {
    ...authHeader(token),
    params: { month },
  });
  return response.data;
}

export async function getHealthScore(token: string): Promise<HealthScore> {
  const response = await api.get('/api/analytics/health-score', authHeader(token));
  return response.data;
}

// ============================================
// Gamification API
// ============================================

export async function getUserStats(token: string): Promise<UserStats> {
  const response = await api.get('/api/gamification/stats', authHeader(token));
  return response.data;
}

export async function getAchievements(token: string) {
  const response = await api.get('/api/gamification/achievements', authHeader(token));
  return response.data;
}

export async function checkIn(token: string) {
  const response = await api.post('/api/gamification/check-in', {}, authHeader(token));
  return response.data;
}

// ============================================
// Net Worth API
// ============================================

export async function getNetWorthHistory(token: string, months?: number) {
  const response = await api.get('/api/networth', {
    ...authHeader(token),
    params: { months },
  });
  return response.data;
}

export async function getCurrentNetWorth(token: string) {
  const response = await api.get('/api/networth/current', authHeader(token));
  return response.data;
}

export async function createNetWorthSnapshot(token: string) {
  const response = await api.post('/api/networth/snapshot', {}, authHeader(token));
  return response.data;
}

// ============================================
// Legacy API (backward compatibility)
// ============================================

export async function getSummary(token: string, month: string) {
  const response = await api.get('/api/summary', {
    ...authHeader(token),
    params: { month },
  });
  return response.data;
}

export default api;

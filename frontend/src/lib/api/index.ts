// API Client
export { apiClient, authHeader, ApiError, apiCall } from './client';

// User API
export { 
  syncUser, 
  getProfile, 
  completeOnboarding, 
  getUserSettings, 
  updateProfile, 
  exportUserData 
} from './users';

// Account API
export { 
  getAccounts, 
  createAccount, 
  updateAccount, 
  deleteAccount 
} from './accounts';

// Transaction API
export { 
  getTransactions, 
  createTransaction, 
  updateTransaction, 
  deleteTransaction 
} from './transactions';

// Category API
export { 
  getCategories, 
  createCategory, 
  deleteCategory 
} from './categories';

// Budget API
export { 
  getBudgets, 
  createBudget, 
  updateBudget, 
  deleteBudget 
} from './budgets';

// Goal API
export { 
  getGoals, 
  createGoal, 
  contributeToGoal, 
  deleteGoal 
} from './goals';

// Debt API
export { 
  getDebts, 
  createDebt, 
  payDebt, 
  settleDebt, 
  deleteDebt 
} from './debts';

// Analytics API
export { 
  getTrends, 
  getPatterns, 
  getHealthScore 
} from './analytics';

// Gamification API
export { 
  getUserStats, 
  getAchievements, 
  checkIn 
} from './gamification';

// Net Worth API
export { 
  getNetWorthHistory, 
  getCurrentNetWorth, 
  createNetWorthSnapshot, 
  getSummary 
} from './networth';

// Re-export types for convenience
export type * from '@/types';

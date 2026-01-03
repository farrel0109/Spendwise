'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import toast from 'react-hot-toast';
import {
  syncUser,
  getAccounts,
  getTransactions,
  getGoals,
  getBudgets,
  getCurrentNetWorth,
  getUserStats,
} from '@/lib/api';
import { useAuthToken } from './useAuthToken';
import { useLanguage } from '@/context/LanguageContext';
import { PAGINATION } from '@/constants';
import type {
  Account,
  Transaction,
  SavingsGoal,
  Budget,
  UserStats,
  NetWorthData,
} from '@/types';

interface DashboardData {
  accounts: Account[];
  transactions: Transaction[];
  goals: SavingsGoal[];
  budgets: Budget[];
  stats: UserStats | null;
  netWorth: NetWorthData | null;
}

interface UseDashboardDataReturn extends DashboardData {
  loading: boolean;
  refresh: () => Promise<void>;
  topGoal: SavingsGoal | undefined;
  budgetSummary: {
    totalBudget: number;
    totalSpent: number;
    budgetLeft: number;
    budgetProgress: number;
  };
}

/**
 * Custom hook for fetching and managing dashboard data
 * Handles user sync, parallel data fetching, and provides computed values
 */
export function useDashboardData(): UseDashboardDataReturn {
  const { getAuthToken } = useAuthToken();
  const { user, isLoaded } = useUser();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData>({
    accounts: [],
    transactions: [],
    goals: [],
    budgets: [],
    stats: null,
    netWorth: null,
  });

  // Prevent duplicate user sync
  const hasSyncedUser = useRef(false);
  const hasFetchedData = useRef(false);

  const fetchData = useCallback(async () => {
    // Prevent duplicate fetches from React Strict Mode
    if (hasFetchedData.current) return;
    
    try {
      const token = await getAuthToken();
      if (!token) return;

      hasFetchedData.current = true;

      // Only sync user once per session/mount
      if (!hasSyncedUser.current && user) {
        await syncUser(token, {
          email: user.primaryEmailAddress?.emailAddress,
          fullName: user.fullName || undefined,
          avatarUrl: user.imageUrl,
        });
        hasSyncedUser.current = true;
      }

      // Fetch all data in parallel with error handling per request
      const [
        accountsData,
        txnData,
        goalsData,
        budgetsData,
        statsData,
        netWorthData,
      ] = await Promise.all([
        getAccounts(token).catch(() => ({ accounts: [] })),
        getTransactions(token, { limit: PAGINATION.dashboardTransactionLimit }).catch(() => ({ transactions: [] })),
        getGoals(token).catch(() => []),
        getBudgets(token).catch(() => []),
        getUserStats(token).catch(() => null),
        getCurrentNetWorth(token).catch(() => null),
      ]);

      setData({
        accounts: accountsData?.accounts || [],
        transactions: txnData?.transactions || [],
        goals: goalsData || [],
        budgets: budgetsData || [],
        stats: statsData,
        netWorth: netWorthData,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [getAuthToken, user, t]);

  useEffect(() => {
    if (isLoaded && user) {
      fetchData();
    }
  }, [isLoaded, user, fetchData]);

  // Computed: Top goal by progress
  const topGoal = [...data.goals].sort((a, b) => b.progress - a.progress)[0];

  // Computed: Budget summary
  const budgetSummary = {
    totalBudget: data.budgets.reduce((sum, b) => sum + b.amount, 0),
    totalSpent: data.budgets.reduce((sum, b) => sum + b.spent, 0),
    budgetLeft: 0,
    budgetProgress: 0,
  };
  budgetSummary.budgetLeft = budgetSummary.totalBudget - budgetSummary.totalSpent;
  budgetSummary.budgetProgress = budgetSummary.totalBudget > 0
    ? (budgetSummary.totalSpent / budgetSummary.totalBudget) * 100
    : 0;

  return {
    ...data,
    loading,
    refresh: fetchData,
    topGoal,
    budgetSummary,
  };
}

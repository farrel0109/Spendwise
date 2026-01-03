'use client';

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  getBudgets,
  createBudget as apiCreateBudget,
  updateBudget as apiUpdateBudget,
  deleteBudget as apiDeleteBudget,
} from '@/lib/api';
import { useAuthToken } from './useAuthToken';
import type { Budget, CreateBudgetData } from '@/types';

interface UseBudgetsReturn {
  budgets: Budget[];
  loading: boolean;
  fetchBudgets: () => Promise<void>;
  createBudget: (data: CreateBudgetData) => Promise<Budget | null>;
  updateBudget: (id: string, data: { amount?: number; alertThreshold?: number }) => Promise<Budget | null>;
  deleteBudget: (id: string) => Promise<boolean>;
  refresh: () => Promise<void>;
  // Computed values
  totalBudget: number;
  totalSpent: number;
  budgetLeft: number;
  budgetProgress: number;
}

/**
 * Custom hook for managing budgets
 */
export function useBudgets(): UseBudgetsReturn {
  const { getAuthToken } = useAuthToken();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBudgets = useCallback(async () => {
    try {
      const token = await getAuthToken();
      if (!token) return;

      setLoading(true);
      const response = await getBudgets(token);
      setBudgets(response || []);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      toast.error('Failed to load budgets');
    } finally {
      setLoading(false);
    }
  }, [getAuthToken]);

  const createBudget = useCallback(async (data: CreateBudgetData): Promise<Budget | null> => {
    try {
      const token = await getAuthToken();
      if (!token) return null;

      const newBudget = await apiCreateBudget(token, data);
      setBudgets(prev => [...prev, newBudget]);
      toast.success('Budget created');
      return newBudget;
    } catch (error) {
      console.error('Error creating budget:', error);
      toast.error('Failed to create budget');
      return null;
    }
  }, [getAuthToken]);

  const updateBudget = useCallback(async (
    id: string, 
    data: { amount?: number; alertThreshold?: number }
  ): Promise<Budget | null> => {
    try {
      const token = await getAuthToken();
      if (!token) return null;

      const updated = await apiUpdateBudget(token, id, data);
      setBudgets(prev => prev.map(b => b.id === id ? updated : b));
      toast.success('Budget updated');
      return updated;
    } catch (error) {
      console.error('Error updating budget:', error);
      toast.error('Failed to update budget');
      return null;
    }
  }, [getAuthToken]);

  const deleteBudget = useCallback(async (id: string): Promise<boolean> => {
    try {
      const token = await getAuthToken();
      if (!token) return false;

      await apiDeleteBudget(token, id);
      setBudgets(prev => prev.filter(b => b.id !== id));
      toast.success('Budget deleted');
      return true;
    } catch (error) {
      console.error('Error deleting budget:', error);
      toast.error('Failed to delete budget');
      return false;
    }
  }, [getAuthToken]);

  // Computed values
  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const budgetLeft = totalBudget - totalSpent;
  const budgetProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return {
    budgets,
    loading,
    fetchBudgets,
    createBudget,
    updateBudget,
    deleteBudget,
    refresh: fetchBudgets,
    totalBudget,
    totalSpent,
    budgetLeft,
    budgetProgress,
  };
}

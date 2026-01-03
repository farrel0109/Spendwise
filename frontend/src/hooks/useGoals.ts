'use client';

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  getGoals,
  createGoal as apiCreateGoal,
  contributeToGoal as apiContributeToGoal,
  deleteGoal as apiDeleteGoal,
} from '@/lib/api';
import { useAuthToken } from './useAuthToken';
import type { SavingsGoal, CreateGoalData } from '@/types';

interface UseGoalsReturn {
  goals: SavingsGoal[];
  loading: boolean;
  fetchGoals: () => Promise<void>;
  createGoal: (data: CreateGoalData) => Promise<SavingsGoal | null>;
  contributeToGoal: (id: string, amount: number, note?: string) => Promise<SavingsGoal | null>;
  deleteGoal: (id: string) => Promise<boolean>;
  refresh: () => Promise<void>;
  // Computed values
  topGoal: SavingsGoal | undefined;
  completedGoals: SavingsGoal[];
  activeGoals: SavingsGoal[];
}

/**
 * Custom hook for managing savings goals
 */
export function useGoals(): UseGoalsReturn {
  const { getAuthToken } = useAuthToken();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchGoals = useCallback(async () => {
    try {
      const token = await getAuthToken();
      if (!token) return;

      setLoading(true);
      const response = await getGoals(token);
      setGoals(response || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast.error('Failed to load goals');
    } finally {
      setLoading(false);
    }
  }, [getAuthToken]);

  const createGoal = useCallback(async (data: CreateGoalData): Promise<SavingsGoal | null> => {
    try {
      const token = await getAuthToken();
      if (!token) return null;

      const newGoal = await apiCreateGoal(token, data);
      setGoals(prev => [...prev, newGoal]);
      toast.success('Goal created');
      return newGoal;
    } catch (error) {
      console.error('Error creating goal:', error);
      toast.error('Failed to create goal');
      return null;
    }
  }, [getAuthToken]);

  const contributeToGoal = useCallback(async (
    id: string,
    amount: number,
    note?: string
  ): Promise<SavingsGoal | null> => {
    try {
      const token = await getAuthToken();
      if (!token) return null;

      const updated = await apiContributeToGoal(token, id, amount, note);
      setGoals(prev => prev.map(g => g.id === id ? updated : g));
      toast.success('Contribution added');
      return updated;
    } catch (error) {
      console.error('Error contributing to goal:', error);
      toast.error('Failed to add contribution');
      return null;
    }
  }, [getAuthToken]);

  const deleteGoal = useCallback(async (id: string): Promise<boolean> => {
    try {
      const token = await getAuthToken();
      if (!token) return false;

      await apiDeleteGoal(token, id);
      setGoals(prev => prev.filter(g => g.id !== id));
      toast.success('Goal deleted');
      return true;
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('Failed to delete goal');
      return false;
    }
  }, [getAuthToken]);

  // Computed values
  const topGoal = [...goals].sort((a, b) => b.progress - a.progress)[0];
  const completedGoals = goals.filter(g => g.is_completed);
  const activeGoals = goals.filter(g => !g.is_completed);

  return {
    goals,
    loading,
    fetchGoals,
    createGoal,
    contributeToGoal,
    deleteGoal,
    refresh: fetchGoals,
    topGoal,
    completedGoals,
    activeGoals,
  };
}

import { apiClient, authHeader } from './client';
import type { Budget, CreateBudgetData } from '@/types';

/**
 * Get all budgets
 */
export async function getBudgets(token: string): Promise<Budget[]> {
  const response = await apiClient.get('/api/budgets', authHeader(token));
  return response.data;
}

/**
 * Create a new budget
 */
export async function createBudget(token: string, data: CreateBudgetData) {
  const response = await apiClient.post('/api/budgets', data, authHeader(token));
  return response.data;
}

/**
 * Update a budget
 */
export async function updateBudget(
  token: string, 
  id: string, 
  data: { amount?: number; alertThreshold?: number }
) {
  const response = await apiClient.patch(`/api/budgets/${id}`, data, authHeader(token));
  return response.data;
}

/**
 * Delete a budget
 */
export async function deleteBudget(token: string, id: string) {
  await apiClient.delete(`/api/budgets/${id}`, authHeader(token));
}

import { apiClient, authHeader } from './client';
import type { SavingsGoal, CreateGoalData } from '@/types';

/**
 * Get all savings goals
 */
export async function getGoals(token: string): Promise<SavingsGoal[]> {
  const response = await apiClient.get('/api/goals', authHeader(token));
  return response.data;
}

/**
 * Create a new savings goal
 */
export async function createGoal(token: string, data: CreateGoalData) {
  const response = await apiClient.post('/api/goals', data, authHeader(token));
  return response.data;
}

/**
 * Add contribution to a goal
 */
export async function contributeToGoal(
  token: string, 
  id: string, 
  amount: number, 
  note?: string
) {
  const response = await apiClient.post(
    `/api/goals/${id}/contribute`, 
    { amount, note }, 
    authHeader(token)
  );
  return response.data;
}

/**
 * Delete a goal
 */
export async function deleteGoal(token: string, id: string) {
  await apiClient.delete(`/api/goals/${id}`, authHeader(token));
}

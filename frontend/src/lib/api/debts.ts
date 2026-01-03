import { apiClient, authHeader } from './client';
import type { CreateDebtData } from '@/types';

/**
 * Get all debts
 */
export async function getDebts(token: string) {
  const response = await apiClient.get('/api/debts', authHeader(token));
  return response.data;
}

/**
 * Create a new debt entry
 */
export async function createDebt(token: string, data: CreateDebtData) {
  const response = await apiClient.post('/api/debts', data, authHeader(token));
  return response.data;
}

/**
 * Make a payment on a debt
 */
export async function payDebt(
  token: string, 
  id: string, 
  amount: number, 
  note?: string
) {
  const response = await apiClient.post(
    `/api/debts/${id}/pay`, 
    { amount, note }, 
    authHeader(token)
  );
  return response.data;
}

/**
 * Mark a debt as settled
 */
export async function settleDebt(token: string, id: string) {
  const response = await apiClient.patch(
    `/api/debts/${id}/settle`, 
    {}, 
    authHeader(token)
  );
  return response.data;
}

/**
 * Delete a debt entry
 */
export async function deleteDebt(token: string, id: string) {
  await apiClient.delete(`/api/debts/${id}`, authHeader(token));
}

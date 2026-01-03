import { apiClient, authHeader } from './client';
import type { Transaction, TransactionFilters, CreateTransactionData } from '@/types';

/**
 * Get transactions with optional filters
 */
export async function getTransactions(token: string, params?: TransactionFilters) {
  const response = await apiClient.get('/api/transactions', {
    ...authHeader(token),
    params,
  });
  return response.data;
}

/**
 * Create a new transaction
 */
export async function createTransaction(token: string, data: CreateTransactionData) {
  const response = await apiClient.post('/api/transactions', data, authHeader(token));
  return response.data;
}

/**
 * Update an existing transaction
 */
export async function updateTransaction(
  token: string, 
  id: string, 
  data: Partial<Transaction>
) {
  const response = await apiClient.patch(`/api/transactions/${id}`, data, authHeader(token));
  return response.data;
}

/**
 * Delete a transaction
 */
export async function deleteTransaction(token: string, id: string) {
  await apiClient.delete(`/api/transactions/${id}`, authHeader(token));
}

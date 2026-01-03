import { apiClient, authHeader } from './client';
import type { Account, CreateAccountData } from '@/types';

/**
 * Get all user accounts
 */
export async function getAccounts(token: string) {
  const response = await apiClient.get('/api/accounts', authHeader(token));
  return response.data;
}

/**
 * Create a new account
 */
export async function createAccount(token: string, data: CreateAccountData) {
  const response = await apiClient.post('/api/accounts', data, authHeader(token));
  return response.data;
}

/**
 * Update an existing account
 */
export async function updateAccount(
  token: string, 
  id: string, 
  data: Partial<Account>
) {
  const response = await apiClient.patch(`/api/accounts/${id}`, data, authHeader(token));
  return response.data;
}

/**
 * Delete an account
 */
export async function deleteAccount(token: string, id: string) {
  await apiClient.delete(`/api/accounts/${id}`, authHeader(token));
}

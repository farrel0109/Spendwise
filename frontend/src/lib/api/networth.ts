import { apiClient, authHeader } from './client';

/**
 * Get net worth history over time
 */
export async function getNetWorthHistory(token: string, months?: number) {
  const response = await apiClient.get('/api/networth', {
    ...authHeader(token),
    params: { months },
  });
  return response.data;
}

/**
 * Get current net worth snapshot
 */
export async function getCurrentNetWorth(token: string) {
  const response = await apiClient.get('/api/networth/current', authHeader(token));
  return response.data;
}

/**
 * Create a new net worth snapshot
 */
export async function createNetWorthSnapshot(token: string) {
  const response = await apiClient.post('/api/networth/snapshot', {}, authHeader(token));
  return response.data;
}

/**
 * Get monthly summary (legacy endpoint)
 */
export async function getSummary(token: string, month: string) {
  const response = await apiClient.get('/api/summary', {
    ...authHeader(token),
    params: { month },
  });
  return response.data;
}

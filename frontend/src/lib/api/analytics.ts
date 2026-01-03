import { apiClient, authHeader } from './client';
import type { HealthScore } from '@/types';

/**
 * Get spending trends over time
 */
export async function getTrends(token: string, months?: number) {
  const response = await apiClient.get('/api/analytics/trends', {
    ...authHeader(token),
    params: { months },
  });
  return response.data;
}

/**
 * Get spending patterns analysis
 */
export async function getPatterns(token: string, month?: string) {
  const response = await apiClient.get('/api/analytics/patterns', {
    ...authHeader(token),
    params: { month },
  });
  return response.data;
}

/**
 * Get financial health score
 */
export async function getHealthScore(token: string): Promise<HealthScore> {
  const response = await apiClient.get('/api/analytics/health-score', authHeader(token));
  return response.data;
}

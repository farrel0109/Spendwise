import { apiClient, authHeader } from './client';
import type { UserStats } from '@/types';

/**
 * Get user gamification stats (level, XP, streak)
 */
export async function getUserStats(token: string): Promise<UserStats> {
  const response = await apiClient.get('/api/gamification/stats', authHeader(token));
  return response.data;
}

/**
 * Get user achievements
 */
export async function getAchievements(token: string) {
  const response = await apiClient.get('/api/gamification/achievements', authHeader(token));
  return response.data;
}

/**
 * Perform daily check-in for streak
 */
export async function checkIn(token: string) {
  const response = await apiClient.post('/api/gamification/check-in', {}, authHeader(token));
  return response.data;
}

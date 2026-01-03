import { apiClient, authHeader } from './client';
import type { Profile, UserSettings, UpdateProfileData } from '@/types';

/**
 * Sync user data with backend after authentication
 */
export async function syncUser(
  token: string, 
  data: { email?: string; fullName?: string; avatarUrl?: string }
) {
  const response = await apiClient.post('/api/users/sync', data, authHeader(token));
  return response.data;
}

/**
 * Get current user profile
 */
export async function getProfile(token: string): Promise<Profile> {
  const response = await apiClient.get('/api/users/profile', authHeader(token));
  return response.data;
}

/**
 * Complete user onboarding
 */
export async function completeOnboarding(token: string) {
  const response = await apiClient.post('/api/users/complete-onboarding', {}, authHeader(token));
  return response.data;
}

/**
 * Get user settings
 */
export async function getUserSettings(token: string): Promise<UserSettings> {
  const response = await apiClient.get('/api/users/settings', authHeader(token));
  return response.data;
}

/**
 * Update user profile
 */
export async function updateProfile(
  token: string, 
  data: UpdateProfileData
): Promise<Profile> {
  const response = await apiClient.patch('/api/users/profile', data, authHeader(token));
  return response.data;
}

/**
 * Export all user data
 */
export async function exportUserData(token: string) {
  const response = await apiClient.post('/api/users/export', {}, authHeader(token));
  return response.data;
}

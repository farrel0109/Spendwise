import { apiClient, authHeader } from './client';
import type { Category } from '@/types';

/**
 * Get all categories
 */
export async function getCategories(token: string): Promise<Category[]> {
  const response = await apiClient.get('/api/categories', authHeader(token));
  return response.data;
}

/**
 * Create a new category
 */
export async function createCategory(
  token: string, 
  data: { name: string; color?: string; icon?: string; type?: string }
) {
  const response = await apiClient.post('/api/categories', data, authHeader(token));
  return response.data;
}

/**
 * Delete a category
 */
export async function deleteCategory(token: string, id: number) {
  await apiClient.delete(`/api/categories/${id}`, authHeader(token));
}

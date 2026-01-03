import axios from 'axios';
import { API_CONFIG } from '@/constants';

/**
 * Axios instance configured for the SpendWise API
 */
export const apiClient = axios.create({
  baseURL: API_CONFIG.baseUrl,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Creates authorization header for authenticated requests
 */
export const authHeader = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

/**
 * API Error class for typed error handling
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Wraps API calls with consistent error handling
 */
export async function apiCall<T>(
  request: () => Promise<{ data: T }>
): Promise<T> {
  try {
    const response = await request();
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(
        error.response?.data?.message || error.message,
        error.response?.status,
        error.code
      );
    }
    throw error;
  }
}

export default apiClient;

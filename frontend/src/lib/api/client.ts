import axios from 'axios';
import { API_CONFIG } from '@/constants';

/**
 * Simple in-memory request cache to prevent duplicate requests
 * Caches responses for 2 seconds to handle React Strict Mode double-mounting
 */
const requestCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL_MS = 2000; // 2 seconds

function getCacheKey(config: { method?: string; url?: string; data?: unknown }): string {
  return `${config.method || 'GET'}:${config.url}:${JSON.stringify(config.data || {})}`;
}

function getCachedResponse(key: string): unknown | null {
  const cached = requestCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }
  requestCache.delete(key);
  return null;
}

function setCachedResponse(key: string, data: unknown): void {
  requestCache.set(key, { data, timestamp: Date.now() });
  // Clean up old entries periodically
  if (requestCache.size > 50) {
    const now = Date.now();
    for (const [k, v] of requestCache.entries()) {
      if (now - v.timestamp > CACHE_TTL_MS) {
        requestCache.delete(k);
      }
    }
  }
}

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

// Add response interceptor for caching GET requests
apiClient.interceptors.request.use((config) => {
  // Only cache GET requests
  if (config.method?.toUpperCase() === 'GET') {
    const cacheKey = getCacheKey(config);
    const cached = getCachedResponse(cacheKey);
    if (cached) {
      // Return cached data by throwing a special error that we catch
      return Promise.reject({ __cached: true, data: cached, config });
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    // Cache successful GET responses
    if (response.config.method?.toUpperCase() === 'GET') {
      const cacheKey = getCacheKey(response.config);
      setCachedResponse(cacheKey, response.data);
    }
    return response;
  },
  (error) => {
    // Handle cached response return
    if (error.__cached) {
      return Promise.resolve({ data: error.data, config: error.config, status: 200, statusText: 'OK (cached)', headers: {} });
    }
    return Promise.reject(error);
  }
);

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
  } catch (error: unknown) {
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

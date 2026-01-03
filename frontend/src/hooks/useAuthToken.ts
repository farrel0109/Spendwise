'use client';

import { useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';

/**
 * Custom hook for managing authentication tokens
 * Wraps Clerk's useAuth for cleaner token access
 */
export function useAuthToken() {
  const { getToken, isLoaded, isSignedIn, userId } = useAuth();

  /**
   * Gets the current auth token
   * @returns Promise resolving to token string or null
   */
  const getAuthToken = useCallback(async (): Promise<string | null> => {
    try {
      return await getToken();
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }, [getToken]);

  /**
   * Executes an async function with auth token
   * @param fn - Function that receives the token
   * @returns Promise resolving to function result or null if no token
   */
  const withToken = useCallback(async <T>(
    fn: (token: string) => Promise<T>
  ): Promise<T | null> => {
    const token = await getAuthToken();
    if (!token) return null;
    return fn(token);
  }, [getAuthToken]);

  return {
    getAuthToken,
    withToken,
    isLoaded,
    isSignedIn,
    userId,
  };
}

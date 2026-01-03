'use client';

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  getAccounts,
  createAccount as apiCreateAccount,
  updateAccount as apiUpdateAccount,
  deleteAccount as apiDeleteAccount,
} from '@/lib/api';
import { useAuthToken } from './useAuthToken';
import type { Account, CreateAccountData } from '@/types';

interface UseAccountsReturn {
  accounts: Account[];
  loading: boolean;
  fetchAccounts: () => Promise<void>;
  createAccount: (data: CreateAccountData) => Promise<Account | null>;
  updateAccount: (id: string, data: Partial<Account>) => Promise<Account | null>;
  deleteAccount: (id: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

/**
 * Custom hook for managing user accounts
 */
export function useAccounts(): UseAccountsReturn {
  const { getAuthToken } = useAuthToken();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAccounts = useCallback(async () => {
    try {
      const token = await getAuthToken();
      if (!token) return;

      setLoading(true);
      const response = await getAccounts(token);
      setAccounts(response.accounts || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast.error('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  }, [getAuthToken]);

  const createAccount = useCallback(async (data: CreateAccountData): Promise<Account | null> => {
    try {
      const token = await getAuthToken();
      if (!token) return null;

      const newAccount = await apiCreateAccount(token, data);
      setAccounts(prev => [...prev, newAccount]);
      toast.success('Account created');
      return newAccount;
    } catch (error) {
      console.error('Error creating account:', error);
      toast.error('Failed to create account');
      return null;
    }
  }, [getAuthToken]);

  const updateAccount = useCallback(async (
    id: string, 
    data: Partial<Account>
  ): Promise<Account | null> => {
    try {
      const token = await getAuthToken();
      if (!token) return null;

      const updated = await apiUpdateAccount(token, id, data);
      setAccounts(prev => prev.map(a => a.id === id ? updated : a));
      toast.success('Account updated');
      return updated;
    } catch (error) {
      console.error('Error updating account:', error);
      toast.error('Failed to update account');
      return null;
    }
  }, [getAuthToken]);

  const deleteAccount = useCallback(async (id: string): Promise<boolean> => {
    try {
      const token = await getAuthToken();
      if (!token) return false;

      await apiDeleteAccount(token, id);
      setAccounts(prev => prev.filter(a => a.id !== id));
      toast.success('Account deleted');
      return true;
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
      return false;
    }
  }, [getAuthToken]);

  return {
    accounts,
    loading,
    fetchAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
    refresh: fetchAccounts,
  };
}

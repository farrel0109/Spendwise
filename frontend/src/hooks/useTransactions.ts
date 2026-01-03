'use client';

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  getTransactions,
  deleteTransaction as apiDeleteTransaction,
} from '@/lib/api';
import { useAuthToken } from './useAuthToken';
import { PAGINATION } from '@/constants';
import type { Transaction, TransactionFilters } from '@/types';

interface UseTransactionsOptions {
  initialFilters?: TransactionFilters;
  autoFetch?: boolean;
}

interface UseTransactionsReturn {
  transactions: Transaction[];
  loading: boolean;
  hasMore: boolean;
  page: number;
  filters: TransactionFilters;
  setFilters: (filters: TransactionFilters) => void;
  fetchTransactions: (isLoadMore?: boolean) => Promise<void>;
  loadMore: () => void;
  deleteTransaction: (id: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

/**
 * Custom hook for managing transactions with pagination and filtering
 */
export function useTransactions(options: UseTransactionsOptions = {}): UseTransactionsReturn {
  const { getAuthToken } = useAuthToken();
  
  const defaultFilters: TransactionFilters = {
    month: new Date().toISOString().slice(0, 7),
    limit: PAGINATION.defaultLimit,
    ...options.initialFilters,
  };

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFiltersState] = useState<TransactionFilters>(defaultFilters);

  const fetchTransactions = useCallback(async (isLoadMore = false) => {
    try {
      const token = await getAuthToken();
      if (!token) return;

      setLoading(true);
      
      const currentPage = isLoadMore ? page : 1;
      const limit = filters.limit || PAGINATION.defaultLimit;
      const offset = (currentPage - 1) * limit;

      const response = await getTransactions(token, {
        ...filters,
        limit,
        offset,
      });

      if (isLoadMore) {
        setTransactions(prev => [...prev, ...(response.transactions || [])]);
      } else {
        setTransactions(response.transactions || []);
      }

      setHasMore(currentPage < response.pagination?.totalPages);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [getAuthToken, page, filters]);

  const setFilters = useCallback((newFilters: TransactionFilters) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
    setPage(1);
    setTransactions([]);
  }, []);

  const loadMore = useCallback(() => {
    setPage(prev => prev + 1);
  }, []);

  const deleteTransaction = useCallback(async (id: string): Promise<boolean> => {
    try {
      const token = await getAuthToken();
      if (!token) return false;

      await apiDeleteTransaction(token, id);
      setTransactions(prev => prev.filter(t => t.id !== id));
      toast.success('Transaction deleted');
      return true;
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Failed to delete transaction');
      return false;
    }
  }, [getAuthToken]);

  const refresh = useCallback(async () => {
    setPage(1);
    await fetchTransactions(false);
  }, [fetchTransactions]);

  return {
    transactions,
    loading,
    hasMore,
    page,
    filters,
    setFilters,
    fetchTransactions,
    loadMore,
    deleteTransaction,
    refresh,
  };
}

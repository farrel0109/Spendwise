"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import toast from "react-hot-toast";
import { getTransactions, getAccounts, deleteTransaction } from "@/lib/api";
import { formatCurrency, formatDate } from "@/utils";
import { PAGINATION } from "@/constants";
import type { Transaction, Account } from "@/types";
import { 
  Filter, 
  Calendar, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw, 
  Trash2, 
  Search,
  ChevronDown,
} from "lucide-react";

// ============================================
// Types
// ============================================

interface Filters {
  month: string;
  accountId: string;
  type: string;
}

// ============================================
// Main Component
// ============================================

export default function TransactionsPage() {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    month: new Date().toISOString().slice(0, 7),
    accountId: "",
    type: "",
  });

  // Fetch accounts only once on mount
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const accData = await getAccounts(token);
        setAccounts(accData.accounts || []);
      } catch (error) {
        console.error("Error fetching accounts:", error);
      }
    };
    fetchAccounts();
  }, [getToken]);

  const fetchData = useCallback(async (currentPage: number, isLoadMore: boolean) => {
    try {
      const token = await getToken();
      if (!token) return;

      if (!isLoadMore) {
        setLoading(true);
      }

      const limit = PAGINATION.defaultLimit;
      const offset = (currentPage - 1) * limit;

      const txnData = await getTransactions(token, {
        limit,
        offset,
        month: filters.month,
        accountId: filters.accountId || undefined,
        type: filters.type || undefined,
      });

      if (isLoadMore) {
        setTransactions((prev) => [...prev, ...(txnData.transactions || [])]);
      } else {
        setTransactions(txnData.transactions || []);
      }

      setHasMore(currentPage < txnData.pagination.totalPages);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, [getToken, filters]);

  // Initial fetch and filter changes
  useEffect(() => {
    setPage(1);
    fetchData(1, false);
  }, [filters, fetchData]);

  // Load more (Page changes)
  useEffect(() => {
    if (page > 1) {
      fetchData(page, true);
    }
  }, [page, fetchData]);


  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;
    try {
      const token = await getToken();
      if (!token) return;
      await deleteTransaction(token, id);
      toast.success("Deleted");
      setPage(1);
      fetchData(1, false);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="space-y-8 pb-32 md:pb-12 max-w-[1600px] mx-auto px-6 md:px-10">
      <PageHeader />
      <FilterBar 
        filters={filters} 
        setFilters={setFilters} 
        accounts={accounts} 
      />
      <TransactionsList
        loading={loading}
        transactions={transactions}
        onDelete={handleDelete}
      />
      {hasMore && transactions.length > 0 && (
        <LoadMoreButton onClick={() => setPage((p) => p + 1)} />
      )}
    </div>
  );
}

// ============================================
// Sub-components
// ============================================

function PageHeader() {
  return (
    <div className="pt-4">
      <h1 className="text-3xl font-bold text-primary flex items-center gap-3 mb-2">
        <div className="p-2 bg-[var(--accent-color)]/10 rounded-xl">
          <RefreshCw className="w-8 h-8 text-[var(--accent-color)]" />
        </div>
        Transactions
      </h1>
      <p className="text-secondary ml-14 mb-8">Track your income and expenses</p>
    </div>
  );
}

interface FilterBarProps {
  filters: Filters;
  setFilters: (filters: Filters) => void;
  accounts: Account[];
}

function FilterBar({ filters, setFilters, accounts }: FilterBarProps) {
  const TYPES = ["", "expense", "income", "transfer"] as const;
  
  return (
    <div className="flex flex-col xl:flex-row gap-6 mb-8 bg-[var(--color-surface-elevated)] p-6 rounded-3xl border border-white/5 shadow-xl">
      <div className="flex items-center gap-3 text-secondary text-sm font-bold uppercase tracking-wider xl:border-r border-white/5 xl:pr-6 min-w-fit">
        <Filter className="w-5 h-5" />
        Filter By
      </div>

      <div className="flex flex-wrap gap-4 flex-1">
        {/* Month Filter */}
        <div className="relative group">
          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-hover:text-[var(--accent-color)] transition-colors" />
          <input
            type="month"
            value={filters.month}
            onChange={(e) => setFilters({ ...filters, month: e.target.value })}
            className="bg-[var(--color-surface)] text-primary text-sm rounded-2xl pl-12 pr-6 py-3 border border-white/5 focus:border-[var(--accent-color)] focus:ring-4 focus:ring-blue-500/10 appearance-none cursor-pointer hover:bg-white/5 transition-all min-w-[180px]"
          />
        </div>
        
        {/* Account Filter */}
        <div className="relative group">
          <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-hover:text-[var(--accent-color)] transition-colors" />
          <select
            value={filters.accountId}
            onChange={(e) => setFilters({ ...filters, accountId: e.target.value })}
            className="bg-[var(--color-surface)] text-primary text-sm rounded-2xl pl-12 pr-10 py-3 border border-white/5 focus:border-[var(--accent-color)] focus:ring-4 focus:ring-blue-500/10 appearance-none cursor-pointer hover:bg-white/5 transition-all min-w-[200px]"
          >
            <option value="">All Accounts</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>{acc.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
        </div>

        {/* Type Filter */}
        <div className="flex bg-[var(--color-surface)] p-1.5 rounded-2xl border border-white/5 ml-auto">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setFilters({ ...filters, type: t })}
              className={`px-5 py-2 text-xs font-bold rounded-xl transition-all capitalize ${
                filters.type === t 
                  ? "bg-[var(--accent-color)] text-primary shadow-lg shadow-[var(--accent-glow)]/20" 
                  : "text-secondary hover:text-primary hover:bg-white/5"
              }`}
            >
              {t || "All"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

import { motion, AnimatePresence } from "framer-motion";

interface TransactionsListProps {
  loading: boolean;
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

// Skeleton component for transaction rows
function TransactionRowSkeleton() {
  return (
    <div className="flex items-center justify-between p-6 animate-pulse">
      <div className="flex items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-white/10" />
        <div>
          <div className="h-5 w-48 bg-white/10 rounded mb-2" />
          <div className="flex items-center gap-3">
            <div className="h-4 w-24 bg-white/5 rounded" />
            <div className="h-4 w-20 bg-white/5 rounded" />
          </div>
        </div>
      </div>
      <div className="h-6 w-32 bg-white/10 rounded" />
    </div>
  );
}

function TransactionsList({ loading, transactions, onDelete }: TransactionsListProps) {
  // Skeleton loading state
  if (loading && transactions.length === 0) {
    return (
      <div className="premium-card rounded-3xl overflow-hidden divide-y divide-white/5">
        {[1, 2, 3, 4, 5].map((i) => (
          <TransactionRowSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Empty state
  if (transactions.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="premium-card rounded-3xl p-20 text-center"
      >
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
          <Search className="w-10 h-10 text-muted" />
        </div>
        <h3 className="text-xl font-bold text-primary mb-2">No transactions found</h3>
        <p className="text-muted max-w-sm mx-auto mb-4">
          Try adjusting your filters or add a new transaction.
        </p>
        <button className="text-[var(--accent-color)] text-sm font-medium hover:opacity-80 transition-opacity">
          + Add Transaction
        </button>
      </motion.div>
    );
  }

  // Loaded state with animations
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="premium-card rounded-3xl overflow-hidden divide-y divide-white/5"
    >
      <AnimatePresence>
        {transactions.map((txn, index) => (
          <motion.div
            key={txn.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
          >
            <TransactionRow transaction={txn} onDelete={onDelete} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

interface TransactionRowProps {
  transaction: Transaction;
  onDelete: (id: string) => void;
}

function TransactionRow({ transaction: txn, onDelete }: TransactionRowProps) {
  const typeColors = {
    income: "bg-emerald-500/10 text-emerald-500 shadow-emerald-500/10",
    expense: "bg-red-500/10 text-red-500 shadow-red-500/10",
    transfer: "bg-[var(--accent-color)]/10 text-[var(--accent-color)] shadow-[var(--accent-glow)]/10",
  };
  
  const TypeIcon = txn.type === "income" ? ArrowUpRight : txn.type === "expense" ? ArrowDownLeft : RefreshCw;

  return (
    <div className="flex items-center justify-between p-6 hover:bg-[var(--color-surface)]/50 transition-all group cursor-pointer">
      <div className="flex items-center gap-5">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${typeColors[txn.type]}`}>
          <TypeIcon className="w-7 h-7" />
        </div>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <p className="font-bold text-primary text-lg">
              {txn.description || txn.categories?.name || "Transaction"}
            </p>
            {txn.emotion && (
              <span className="text-[10px] px-2.5 py-1 rounded-lg bg-[var(--color-surface)] text-secondary border border-white/5 font-medium uppercase tracking-wider">
                {txn.emotion}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm text-muted font-medium">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {formatDate(txn.txn_date, 'medium')}
            </span>
            {txn.accounts?.name && (
              <>
                <span className="w-1 h-1 rounded-full bg-slate-600" />
                <span className="flex items-center gap-1.5 text-secondary">
                  <Wallet className="w-4 h-4" />
                  {txn.accounts.name}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <p className={`font-bold text-xl ${txn.type === "income" ? "text-emerald-500" : "text-primary"}`}>
          {txn.type === "income" ? "+" : "-"} Rp {formatCurrency(txn.amount)}
        </p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(txn.id);
          }}
          className="p-3 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
          title="Delete Transaction"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function LoadMoreButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="flex justify-center pt-8">
      <button
        onClick={onClick}
        className="px-8 py-3 bg-[var(--color-surface-elevated)] text-[var(--accent-color)] text-sm font-bold rounded-2xl hover:bg-white/5 hover:text-blue-400 transition-all shadow-lg border border-white/5"
      >
        Load More Transactions
      </button>
    </div>
  );
}

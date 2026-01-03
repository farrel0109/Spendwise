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

  const fetchData = useCallback(async (isLoadMore = false) => {
    try {
      const token = await getToken();
      if (!token) return;

      if (!isLoadMore) {
        setLoading(true);
        const accData = await getAccounts(token);
        setAccounts(accData.accounts || []);
      }

      const currentPage = isLoadMore ? page : 1;
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
  }, [getToken, page, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;
    try {
      const token = await getToken();
      if (!token) return;
      await deleteTransaction(token, id);
      toast.success("Deleted");
      fetchData();
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
      <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
        <div className="p-2 bg-blue-500/10 rounded-xl">
          <RefreshCw className="w-8 h-8 text-blue-500" />
        </div>
        Transactions
      </h1>
      <p className="text-slate-400 ml-14 mb-8">Track your income and expenses</p>
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
    <div className="flex flex-col xl:flex-row gap-6 mb-8 bg-[#1E293B] p-6 rounded-3xl border border-[#334155]/30 shadow-xl">
      <div className="flex items-center gap-3 text-slate-400 text-sm font-bold uppercase tracking-wider xl:border-r border-[#334155]/50 xl:pr-6 min-w-fit">
        <Filter className="w-5 h-5" />
        Filter By
      </div>

      <div className="flex flex-wrap gap-4 flex-1">
        {/* Month Filter */}
        <div className="relative group">
          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-hover:text-blue-500 transition-colors" />
          <input
            type="month"
            value={filters.month}
            onChange={(e) => setFilters({ ...filters, month: e.target.value })}
            className="bg-[#0F172A] text-white text-sm rounded-2xl pl-12 pr-6 py-3 border border-[#334155]/50 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 appearance-none cursor-pointer hover:bg-[#334155]/30 transition-all min-w-[180px]"
          />
        </div>
        
        {/* Account Filter */}
        <div className="relative group">
          <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-hover:text-blue-500 transition-colors" />
          <select
            value={filters.accountId}
            onChange={(e) => setFilters({ ...filters, accountId: e.target.value })}
            className="bg-[#0F172A] text-white text-sm rounded-2xl pl-12 pr-10 py-3 border border-[#334155]/50 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 appearance-none cursor-pointer hover:bg-[#334155]/30 transition-all min-w-[200px]"
          >
            <option value="">All Accounts</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>{acc.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        </div>

        {/* Type Filter */}
        <div className="flex bg-[#0F172A] p-1.5 rounded-2xl border border-[#334155]/50 ml-auto">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setFilters({ ...filters, type: t })}
              className={`px-5 py-2 text-xs font-bold rounded-xl transition-all capitalize ${
                filters.type === t 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                  : "text-slate-400 hover:text-white hover:bg-[#334155]/50"
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

interface TransactionsListProps {
  loading: boolean;
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

function TransactionsList({ loading, transactions, onDelete }: TransactionsListProps) {
  if (loading && transactions.length === 0) {
    return (
      <div className="bg-[#1E293B] rounded-3xl p-20 flex justify-center border border-[#334155]/30 shadow-xl">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent shadow-lg shadow-blue-500/20" />
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-[#1E293B] rounded-3xl p-20 text-center border border-[#334155]/30 shadow-xl">
        <div className="w-20 h-20 bg-[#0F172A] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#334155]">
          <Search className="w-10 h-10 text-slate-600" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No transactions found</h3>
        <p className="text-slate-500 max-w-sm mx-auto">
          Try adjusting your filters or add a new transaction.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#1E293B] rounded-3xl overflow-hidden border border-[#334155]/30 shadow-xl divide-y divide-[#334155]/30">
      {transactions.map((txn) => (
        <TransactionRow key={txn.id} transaction={txn} onDelete={onDelete} />
      ))}
    </div>
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
    transfer: "bg-blue-500/10 text-blue-500 shadow-blue-500/10",
  };
  
  const TypeIcon = txn.type === "income" ? ArrowUpRight : txn.type === "expense" ? ArrowDownLeft : RefreshCw;

  return (
    <div className="flex items-center justify-between p-6 hover:bg-[#0F172A]/50 transition-all group cursor-pointer">
      <div className="flex items-center gap-5">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${typeColors[txn.type]}`}>
          <TypeIcon className="w-7 h-7" />
        </div>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <p className="font-bold text-white text-lg">
              {txn.description || txn.categories?.name || "Transaction"}
            </p>
            {txn.emotion && (
              <span className="text-[10px] px-2.5 py-1 rounded-lg bg-[#0F172A] text-slate-400 border border-[#334155] font-medium uppercase tracking-wider">
                {txn.emotion}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {formatDate(txn.txn_date, 'medium')}
            </span>
            {txn.accounts?.name && (
              <>
                <span className="w-1 h-1 rounded-full bg-slate-600" />
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Wallet className="w-4 h-4" />
                  {txn.accounts.name}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <p className={`font-bold text-xl ${txn.type === "income" ? "text-emerald-500" : "text-white"}`}>
          {txn.type === "income" ? "+" : "-"} Rp {formatCurrency(txn.amount)}
        </p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(txn.id);
          }}
          className="p-3 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
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
        className="px-8 py-3 bg-[#1E293B] text-blue-500 text-sm font-bold rounded-2xl hover:bg-[#334155]/50 hover:text-blue-400 transition-all shadow-lg border border-[#334155]/30"
      >
        Load More Transactions
      </button>
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { getAccounts, createAccount, deleteAccount } from "@/lib/api";
import { formatCurrency } from "@/utils";
import { CHART_COLORS } from "@/constants";
import type { Account, CreateAccountData } from "@/types";
import { 
  Plus, 
  Trash2, 
  Wallet, 
  CreditCard, 
  Banknote, 
  Landmark, 
  Smartphone, 
  TrendingUp,
  X,
  Check,
  type LucideIcon
} from "lucide-react";

// ============================================
// Constants
// ============================================

interface AccountTypeConfig {
  value: string;
  label: string;
  isAsset: boolean;
  icon: LucideIcon;
}

const ACCOUNT_TYPES: AccountTypeConfig[] = [
  { value: "cash", label: "Cash", isAsset: true, icon: Banknote },
  { value: "bank", label: "Bank", isAsset: true, icon: Landmark },
  { value: "e-wallet", label: "E-Wallet", isAsset: true, icon: Smartphone },
  { value: "investment", label: "Investment", isAsset: true, icon: TrendingUp },
  { value: "credit_card", label: "Credit Card", isAsset: false, icon: CreditCard },
  { value: "loan", label: "Loan", isAsset: false, icon: Wallet },
];

// ============================================
// Types
// ============================================

interface AccountsSummary {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
}

interface AccountFormData {
  name: string;
  type: string;
  color: string;
  initialBalance: string;
  institution: string;
}

// ============================================
// Skeleton Components
// ============================================

function SummaryCardSkeleton() {
  return (
    <div className="premium-card rounded-3xl p-6 animate-pulse">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-4 h-4 bg-zinc-200 dark:bg-white/10 rounded" />
        <div className="h-3 w-24 bg-zinc-200 dark:bg-white/10 rounded" />
      </div>
      <div className="h-9 w-40 bg-zinc-100 dark:bg-white/10 rounded" />
    </div>
  );
}

function AccountCardSkeleton() {
  return (
    <div className="premium-card rounded-3xl p-6 animate-pulse">
      <div className="flex justify-between mb-6">
        <div className="w-14 h-14 bg-zinc-200 dark:bg-white/10 rounded-2xl" />
        <div className="w-10 h-10 bg-zinc-100 dark:bg-white/5 rounded-xl" />
      </div>
      <div className="h-3 w-16 bg-zinc-100 dark:bg-white/5 rounded mb-2" />
      <div className="h-6 w-32 bg-zinc-200 dark:bg-white/10 rounded mb-4" />
      <div className="pt-4 border-t border-zinc-200 dark:border-white/5">
        <div className="h-3 w-20 bg-zinc-100 dark:bg-white/5 rounded mb-1" />
        <div className="h-8 w-36 bg-zinc-200 dark:bg-white/10 rounded" />
      </div>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export default function AccountsPage() {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [summary, setSummary] = useState<AccountsSummary>({ 
    totalAssets: 0, 
    totalLiabilities: 0, 
    netWorth: 0 
  });
  const [showForm, setShowForm] = useState(false);

  const fetchAccounts = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const data = await getAccounts(token);
      setAccounts(data.accounts || []);
      setSummary(data.summary || { totalAssets: 0, totalLiabilities: 0, netWorth: 0 });
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to load accounts");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this account?")) return;
    try {
      const token = await getToken();
      if (!token) return;
      await deleteAccount(token, id);
      toast.success("Deleted");
      fetchAccounts();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to delete");
    }
  };

  const handleCreate = async (data: CreateAccountData) => {
    try {
      const token = await getToken();
      if (!token) return false;

      await createAccount(token, data);
      toast.success("Account created");
      fetchAccounts();
      return true;
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to create account");
      return false;
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader onAddClick={() => setShowForm(true)} />
      
      {/* Summary Cards with Progressive Loading */}
      <AnimatePresence mode="wait">
        {loading ? (
          <div key="summary-skeleton" className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
          </div>
        ) : (
          <motion.div
            key="summary-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <SummaryCards summary={summary} />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Accounts Grid with Progressive Loading */}
      <AnimatePresence mode="wait">
        {loading ? (
          <div key="accounts-skeleton" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <AccountCardSkeleton />
            <AccountCardSkeleton />
            <AccountCardSkeleton />
          </div>
        ) : (
          <motion.div
            key="accounts-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <AccountsGrid accounts={accounts} onDelete={handleDelete} />
          </motion.div>
        )}
      </AnimatePresence>
      
      {showForm && (
        <AddAccountModal 
          onClose={() => setShowForm(false)} 
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}

// ============================================
// Sub-components
// ============================================

function PageHeader({ onAddClick }: { onAddClick: () => void }) {
  return (
    <div className="flex items-center justify-between pt-4">
      <div>
        <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
          <div className="p-2 bg-[var(--accent-color)]/10 rounded-xl">
            <Wallet className="w-8 h-8 text-[var(--accent-color)]" />
          </div>
          Accounts
        </h1>
        <p className="text-muted mt-1 ml-14">Manage your financial sources</p>
      </div>
      <button
        onClick={onAddClick}
        className="flex items-center gap-2 px-6 py-3 bg-[var(--accent-color)] hover:bg-[var(--accent-color)] text-white rounded-2xl font-semibold shadow-lg shadow-[var(--accent-glow)]/20 hover:shadow-[var(--accent-glow)]/40 hover:-translate-y-0.5 transition-all"
      >
        <Plus className="w-5 h-5" />
        <span>Add Account</span>
      </button>
    </div>
  );
}

function SummaryCards({ summary }: { summary: AccountsSummary }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <SummaryCard 
        label="Total Assets" 
        value={summary.totalAssets} 
        color="emerald" 
        icon={TrendingUp}
      />
      <SummaryCard 
        label="Total Liabilities" 
        value={summary.totalLiabilities} 
        color="red" 
        icon={CreditCard}
      />
      <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-6 shadow-xl shadow-[var(--accent-glow)]/20 relative overflow-hidden group text-white">
        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
          <Wallet className="w-24 h-24 text-white" />
        </div>
        <p className="text-sm text-blue-100 mb-2 uppercase tracking-wider font-bold flex items-center gap-2">
          <Wallet className="w-4 h-4" />
          Net Worth
        </p>
        <p className="text-3xl font-bold">Rp {formatCurrency(summary.netWorth)}</p>
      </div>
    </div>
  );
}

function SummaryCard({ 
  label, 
  value, 
  color, 
  icon: Icon 
}: { 
  label: string; 
  value: number; 
  color: 'emerald' | 'red'; 
  icon: LucideIcon 
}) {
  const colorClasses = {
    emerald: 'text-emerald-500',
    red: 'text-red-500',
  };
  
  return (
    <div className="bg-[var(--color-surface-elevated)] rounded-3xl p-6 border border-zinc-200 dark:border-white/5 shadow-xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon className={`w-24 h-24 ${colorClasses[color]}`} />
      </div>
      <p className="text-sm text-muted mb-2 uppercase tracking-wider font-bold flex items-center gap-2">
        <Icon className={`w-4 h-4 ${colorClasses[color]}`} />
        {label}
      </p>
      <p className={`text-3xl font-bold ${colorClasses[color]}`}>
        Rp {formatCurrency(value)}
      </p>
    </div>
  );
}

function AccountsGrid({ 
  accounts, 
  onDelete 
}: { 
  accounts: Account[]; 
  onDelete: (id: string) => void;
}) {
  if (accounts.length === 0) {
    return (
      <div className="bg-[var(--color-surface-elevated)] rounded-3xl p-16 text-center border border-dashed border-zinc-300 dark:border-white/5">
        <div className="w-20 h-20 bg-[var(--color-surface)] rounded-full flex items-center justify-center mx-auto mb-6 border border-zinc-200 dark:border-white/5">
          <Wallet className="w-10 h-10 text-muted" />
        </div>
        <h3 className="text-xl font-bold text-primary mb-2">No accounts yet</h3>
        <p className="text-muted max-w-sm mx-auto">
          Add your first account to start tracking your income, expenses, and net worth.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {accounts.map((account) => (
        <AccountCard key={account.id} account={account} onDelete={onDelete} />
      ))}
    </div>
  );
}

function AccountCard({ 
  account, 
  onDelete 
}: { 
  account: Account; 
  onDelete: (id: string) => void;
}) {
  const TypeIcon = ACCOUNT_TYPES.find(t => t.value === account.type)?.icon || Wallet;
  
  return (
    <div className="bg-[var(--color-surface-elevated)] p-6 rounded-3xl border border-zinc-200 dark:border-white/5 hover:border-[var(--accent-color)]/50 transition-all group hover:shadow-xl hover:shadow-[var(--accent-glow)]/5 hover:-translate-y-1">
      <div className="flex justify-between items-start mb-6">
        <div 
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg" 
          style={{ backgroundColor: account.color }}
        >
          <TypeIcon className="w-7 h-7" />
        </div>
        <button
          onClick={() => onDelete(account.id)}
          className="p-2 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
          title="Delete Account"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
      
      <div>
        <div className="flex items-center gap-2 mb-1">
          <p className="text-secondary text-xs font-bold uppercase tracking-wider">
            {account.type.replace("_", " ")}
          </p>
          {account.institution && (
            <span className="px-2 py-0.5 rounded-md bg-[var(--color-surface)] text-[10px] text-muted border border-zinc-200 dark:border-white/5">
              {account.institution}
            </span>
          )}
        </div>
        <h3 className="font-bold text-primary text-xl mb-4 truncate">{account.name}</h3>
        
        <div className="pt-4 border-t border-zinc-200 dark:border-white/5 flex items-end justify-between">
          <div>
            <p className="text-xs text-muted mb-1">Current Balance</p>
            <p className={`font-bold text-2xl ${account.balance >= 0 ? 'text-primary' : 'text-red-500'}`}>
              Rp {formatCurrency(account.balance)}
            </p>
          </div>
          {!account.is_asset && (
            <span className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-500 text-xs font-bold border border-amber-500/20">
              DEBT
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

interface AddAccountModalProps {
  onClose: () => void;
  onCreate: (data: CreateAccountData) => Promise<boolean>;
}

function AddAccountModal({ onClose, onCreate }: AddAccountModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AccountFormData>({
    name: "",
    type: "bank",
    color: CHART_COLORS[0],
    initialBalance: "",
    institution: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("Name is required");
      return;
    }

    setLoading(true);
    const accountType = ACCOUNT_TYPES.find((t) => t.value === formData.type);
    
    const success = await onCreate({
      name: formData.name,
      type: formData.type,
      color: formData.color,
      initialBalance: parseFloat(formData.initialBalance) || 0,
      isAsset: accountType?.isAsset ?? true,
      institution: formData.institution || undefined,
    });

    setLoading(false);
    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4">
      <div className="absolute inset-0 bg-[var(--color-surface)]/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-[var(--color-surface-elevated)] rounded-3xl overflow-hidden animate-slideUp shadow-2xl ring-1 ring-white/10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200 dark:border-white/5 bg-[var(--color-surface-elevated)]/50 backdrop-blur-md">
          <button 
            onClick={onClose} 
            className="p-2 -ml-2 text-muted hover:text-primary transition-colors rounded-xl hover:bg-zinc-100 dark:hover:bg-white/5"
          >
            <X className="w-6 h-6" />
          </button>
          <span className="text-lg font-bold text-primary">New Account</span>
          <div className="w-10" />
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-xs text-secondary mb-2 uppercase tracking-wider font-bold">
              Account Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Main Savings"
              className="w-full bg-[var(--color-surface)] rounded-xl px-4 py-3.5 text-sm text-primary border border-zinc-200 dark:border-white/5 focus:border-[var(--accent-color)] focus:ring-4 focus:ring-blue-500/10 placeholder:text-muted transition-all"
              required
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs text-secondary mb-2 uppercase tracking-wider font-bold">
              Account Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              {ACCOUNT_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: type.value })}
                  className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                    formData.type === type.value 
                      ? "bg-[var(--accent-color)]/10 border-[var(--accent-color)] text-[var(--accent-color)] shadow-lg shadow-[var(--accent-glow)]/10" 
                      : "bg-[var(--color-surface)] border-transparent text-muted hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-primary"
                  }`}
                >
                  <type.icon className="w-5 h-5" />
                  <span className="text-[10px] font-bold">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Balance & Institution */}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-xs text-secondary mb-2 uppercase tracking-wider font-bold">
                Initial Balance
              </label>
              <div className="flex items-center bg-[var(--color-surface)] rounded-xl px-4 border border-zinc-200 dark:border-white/5 focus-within:border-[var(--accent-color)] focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
                <span className="text-muted mr-2 font-medium">Rp</span>
                <input
                  type="number"
                  value={formData.initialBalance}
                  onChange={(e) => setFormData({ ...formData, initialBalance: e.target.value })}
                  placeholder="0"
                  className="w-full bg-transparent py-3.5 text-sm text-primary border-none focus:outline-none placeholder:text-muted"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-secondary mb-2 uppercase tracking-wider font-bold">
                Institution
              </label>
              <input
                type="text"
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                placeholder="e.g., BCA"
                className="w-full bg-[var(--color-surface)] rounded-xl px-4 py-3.5 text-sm text-primary border border-zinc-200 dark:border-white/5 focus:border-[var(--accent-color)] focus:ring-4 focus:ring-blue-500/10 placeholder:text-muted transition-all"
              />
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-xs text-secondary mb-3 uppercase tracking-wider font-bold">
              Color Tag
            </label>
            <div className="flex flex-wrap gap-3">
              {CHART_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-10 h-10 rounded-full transition-transform shadow-lg ${
                    formData.color === color 
                      ? "scale-110 ring-2 ring-white ring-offset-2 ring-offset-[var(--color-surface-elevated)]" 
                      : "hover:scale-105 opacity-80 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Submit */}
          <button 
            type="submit"
            disabled={loading} 
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-2xl font-bold text-lg shadow-lg shadow-[var(--accent-glow)]/20 hover:shadow-[var(--accent-glow)]/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Check className="w-5 h-5" />
                Create Account
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

"use client";

import { Smile, ArrowRight, Banknote, ShoppingCart, RefreshCw, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { formatDate } from "@/utils";
import type { Transaction } from "@/types";
import type { Language } from "@/types";

interface TransactionsTableProps {
  transactions: Transaction[];
  formatAmount: (amount: number) => string;
  onViewAll: () => void;
  t: (key: string) => string;
}

// Transaction type icons
const TYPE_ICONS: Record<string, any> = {
  income: Banknote,
  expense: ShoppingCart,
  transfer: RefreshCw,
};

/**
 * Recent transactions table component
 * Premium design with subtle animations
 */
export function TransactionsTable({ transactions, formatAmount, onViewAll, t }: TransactionsTableProps) {
  // Determine language from t function
  const isIndonesian = t('common.loading') === 'Memuat...';
  const language: Language = isIndonesian ? 'id' : 'en';
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="col-span-1 md:col-span-12 premium-card rounded-2xl p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-primary font-bold text-lg">
          {t('dashboard.recentTransactions')}
        </h3>
        <div className="flex gap-1 p-1 bg-zinc-100 dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/5">
          <FilterButton active>{isIndonesian ? 'Semua' : 'All'}</FilterButton>
          <FilterButton>{t('common.expense')}</FilterButton>
          <FilterButton>{t('common.income')}</FilterButton>
        </div>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-xs text-muted border-b border-zinc-200 dark:border-white/5">
              <th className="font-medium py-3 pl-2">Merchant</th>
              <th className="font-medium py-3">Category</th>
              <th className="font-medium py-3">Date</th>
              <th className="font-medium py-3 text-center">Mood</th>
              <th className="font-medium py-3 pr-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {transactions.map((txn, idx) => (
              <TransactionRow 
                key={txn.id} 
                transaction={txn} 
                formatAmount={formatAmount}
                language={language}
                index={idx}
              />
            ))}
            
            {/* Empty state */}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-muted">
                  {t('dashboard.noTransactions')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* View All Link */}
      <div className="mt-6 flex justify-center">
        <button 
          onClick={onViewAll}
          className="text-sm text-[var(--accent-color)] font-medium hover:opacity-80 transition-opacity flex items-center gap-1 group"
        >
          {t('dashboard.viewAll')} 
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}

interface FilterButtonProps {
  children: React.ReactNode;
  active?: boolean;
}

/**
 * Filter button for transaction types
 */
function FilterButton({ children, active }: FilterButtonProps) {
  return (
    <button 
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
        active 
          ? 'bg-[var(--accent-color)] text-white shadow-sm' 
          : 'text-secondary hover:text-primary hover:bg-zinc-100 dark:hover:bg-white/5'
      }`}
    >
      {children}
    </button>
  );
}

interface TransactionRowProps {
  transaction: Transaction;
  formatAmount: (amount: number) => string;
  language: Language;
  index: number;
}

/**
 * Individual transaction table row
 */
function TransactionRow({ transaction, formatAmount, language, index }: TransactionRowProps) {
  const Icon = TYPE_ICONS[transaction.type] || FileText;
  const isIncome = transaction.type === 'income';
  
  return (
    <motion.tr 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
      className="group hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors border-b border-zinc-100 dark:border-white/5 last:border-0"
    >
      {/* Merchant/Description */}
      <td className="py-4 pl-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-white/5 flex items-center justify-center text-lg shrink-0 border border-zinc-200 dark:border-white/5 text-muted">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-primary font-medium">
              {transaction.description || "Transaction"}
            </p>
            <p className="text-muted text-xs">
              {transaction.accounts?.name}
            </p>
          </div>
        </div>
      </td>
      
      {/* Category */}
      <td className="py-4 text-secondary">
        {transaction.categories?.name || "Uncategorized"}
      </td>
      
      {/* Date */}
      <td className="py-4 text-muted">
        {formatDate(transaction.txn_date, 'short', language)}
      </td>
      
      {/* Mood */}
      <td className="py-4 text-center">
        {transaction.emotion && (
          <div 
            className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-zinc-100 dark:bg-white/5 text-muted border border-zinc-200 dark:border-white/5" 
            title={transaction.emotion}
          >
            <Smile className="w-4 h-4" />
          </div>
        )}
      </td>
      
      {/* Amount */}
      <td className={`py-4 pr-2 text-right font-bold ${isIncome ? 'text-emerald-500' : 'text-primary'}`}>
        {isIncome ? '+' : '-'}Rp {formatAmount(transaction.amount)}
      </td>
    </motion.tr>
  );
}

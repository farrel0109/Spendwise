"use client";

import { Smile, ArrowRight } from "lucide-react";
import { formatDate } from "@/utils";
import type { Transaction } from "@/types";
import type { Language } from "@/types";

interface TransactionsTableProps {
  transactions: Transaction[];
  formatAmount: (amount: number) => string;
  onViewAll: () => void;
  t: (key: string) => string;
}

// Transaction type emojis
const TYPE_EMOJIS: Record<string, string> = {
  income: '💰',
  expense: '🛒',
  transfer: '🔄',
};

/**
 * Recent transactions table component
 * Displays last transactions with filtering options
 */
export function TransactionsTable({ transactions, formatAmount, onViewAll, t }: TransactionsTableProps) {
  // Determine language from t function (simple detection)
  const isIndonesian = t('common.loading') === 'Memuat...';
  const language: Language = isIndonesian ? 'id' : 'en';
  
  return (
    <div className="col-span-1 md:col-span-12 apple-card rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-bold text-lg">
          {t('dashboard.recentTransactions')}
        </h3>
        <div className="flex gap-2">
          <FilterButton active>{t('common.loading') === 'Memuat...' ? 'Semua' : 'All'}</FilterButton>
          <FilterButton>{t('common.expense')}</FilterButton>
          <FilterButton>{t('common.income')}</FilterButton>
        </div>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-xs text-slate-500 border-b border-white/5">
              <th className="font-medium py-3 pl-2">Merchant</th>
              <th className="font-medium py-3">Category</th>
              <th className="font-medium py-3">Date</th>
              <th className="font-medium py-3 text-center">Mood</th>
              <th className="font-medium py-3 pr-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {transactions.map((txn) => (
              <TransactionRow 
                key={txn.id} 
                transaction={txn} 
                formatAmount={formatAmount}
                language={language}
              />
            ))}
            
            {/* Empty state */}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  {t('dashboard.noTransactions')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* View All Link */}
      <div className="mt-4 flex justify-center">
        <button 
          onClick={onViewAll}
          className="text-sm text-[#007bff] font-medium hover:text-[#0056b3] transition-colors flex items-center gap-1"
        >
          {t('dashboard.viewAll')} 
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
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
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
        active 
          ? 'bg-[#232e3b] text-white border border-white/5' 
          : 'text-slate-400 hover:text-white hover:bg-white/5'
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
}

/**
 * Individual transaction table row
 */
function TransactionRow({ transaction, formatAmount, language }: TransactionRowProps) {
  const emoji = TYPE_EMOJIS[transaction.type] || '📝';
  const isIncome = transaction.type === 'income';
  
  return (
    <tr className="group hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
      {/* Merchant/Description */}
      <td className="py-4 pl-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg shrink-0">
            {emoji}
          </div>
          <div>
            <p className="text-white font-medium">
              {transaction.description || "Transaction"}
            </p>
            <p className="text-slate-500 text-xs">
              {transaction.accounts?.name}
            </p>
          </div>
        </div>
      </td>
      
      {/* Category */}
      <td className="py-4 text-slate-400">
        {transaction.categories?.name || "Uncategorized"}
      </td>
      
      {/* Date */}
      <td className="py-4 text-slate-400">
        {formatDate(transaction.txn_date, 'short', language)}
      </td>
      
      {/* Mood */}
      <td className="py-4 text-center">
        {transaction.emotion && (
          <div 
            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/5 text-slate-400 border border-white/10" 
            title={transaction.emotion}
          >
            <Smile className="w-[18px] h-[18px]" />
          </div>
        )}
      </td>
      
      {/* Amount */}
      <td className={`py-4 pr-2 text-right font-bold ${isIncome ? 'text-green-400' : 'text-white'}`}>
        {isIncome ? '+' : '-'}Rp {formatAmount(transaction.amount)}
      </td>
    </tr>
  );
}

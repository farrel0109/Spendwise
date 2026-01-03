"use client";

import { CreditCard, ArrowRight } from "lucide-react";
import type { Account } from "@/types";

interface AccountsSectionProps {
  accounts: Account[];
  formatAmount: (amount: number) => string;
  onAddNew: () => void;
  t: (key: string) => string;
}

// Card gradient backgrounds
const CARD_GRADIENTS = [
  'linear-gradient(135deg, #2b303b 0%, #1e2329 100%)',
  'linear-gradient(135deg, #101418 0%, #000000 100%)',
];

/**
 * Accounts section showing account cards grid
 * Displays up to 2 accounts with balance information
 */
export function AccountsSection({ accounts, formatAmount, onAddNew, t }: AccountsSectionProps) {
  const displayAccounts = accounts.slice(0, 2);
  
  return (
    <div className="col-span-1 md:col-span-2 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-white font-bold text-lg">
          {t('dashboard.myAccounts')}
        </h3>
        <button 
          onClick={onAddNew}
          className="text-[#007bff] text-sm font-medium hover:text-[#0056b3] transition-colors"
        >
          {t('dashboard.addNew')}
        </button>
      </div>
      
      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {displayAccounts.map((account, idx) => (
          <AccountCard
            key={account.id}
            account={account}
            formatAmount={formatAmount}
            gradientIndex={idx}
            t={t}
          />
        ))}
        
        {/* Empty state if no accounts */}
        {displayAccounts.length === 0 && (
          <div className="col-span-2 h-48 rounded-2xl border border-dashed border-white/10 flex items-center justify-center">
            <button
              onClick={onAddNew}
              className="text-slate-400 hover:text-white transition-colors text-sm"
            >
              + Add your first account
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface AccountCardProps {
  account: Account;
  formatAmount: (amount: number) => string;
  gradientIndex: number;
  t: (key: string) => string;
}

/**
 * Individual account card component
 */
function AccountCard({ account, formatAmount, gradientIndex, t }: AccountCardProps) {
  return (
    <div 
      className="group relative h-48 rounded-2xl p-6 flex flex-col justify-between border border-white/10 transition-transform hover:-translate-y-1 overflow-hidden cursor-pointer"
      style={{ backgroundImage: CARD_GRADIENTS[gradientIndex % CARD_GRADIENTS.length] }}
    >
      {/* Card Header */}
      <div className="flex justify-between items-start z-10">
        <div className="h-8 w-12 bg-white/10 rounded flex items-center justify-center backdrop-blur-sm border border-white/5">
          <div className="w-3 h-3 rounded-full bg-red-500 opacity-80 -mr-1" />
          <div className="w-3 h-3 rounded-full bg-yellow-500 opacity-80" />
        </div>
        <CreditCard className="text-white/50 w-6 h-6" />
      </div>
      
      {/* Account Info */}
      <div className="z-10">
        <p className="text-slate-400 text-sm font-medium mb-1 capitalize">
          {account.type.replace('_', ' ')}
        </p>
        <p className="text-white text-2xl font-bold tracking-tight truncate">
          {account.name}
        </p>
      </div>
      
      {/* Balance */}
      <div className="flex justify-between items-end z-10">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">
            {t('dashboard.balance')}
          </p>
          <p className="text-white text-xl font-bold">
            Rp {formatAmount(account.balance)}
          </p>
        </div>
        <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center">
          <ArrowRight className="text-black w-4 h-4 font-bold" />
        </div>
      </div>
      
      {/* Decorative glow */}
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
    </div>
  );
}

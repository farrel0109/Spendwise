"use client";

import { CreditCard, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import type { Account } from "@/types";

interface AccountsSectionProps {
  accounts: Account[];
  formatAmount: (amount: number) => string;
  onAddNew: () => void;
  t: (key: string) => string;
}

// Card gradient backgrounds - darker, more subtle
const CARD_GRADIENTS = [
  'linear-gradient(145deg, rgba(17, 24, 39, 0.9) 0%, rgba(10, 15, 24, 0.95) 100%)',
  'linear-gradient(145deg, rgba(10, 15, 24, 0.95) 0%, rgba(3, 7, 18, 1) 100%)',
];

/**
 * Accounts section showing account cards grid
 * Premium design with hover animations
 */
export function AccountsSection({ accounts, formatAmount, onAddNew, t }: AccountsSectionProps) {
  const displayAccounts = accounts.slice(0, 2);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="col-span-1 md:col-span-2 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-white font-bold text-lg">
          {t('dashboard.myAccounts')}
        </h3>
        <button 
          onClick={onAddNew}
          className="text-[var(--accent-color)] text-sm font-medium hover:opacity-80 transition-opacity"
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
            delay={0.3 + idx * 0.1}
          />
        ))}
        
        {/* Empty state if no accounts */}
        {displayAccounts.length === 0 && (
          <div className="col-span-2 h-48 rounded-2xl border border-dashed border-white/10 flex items-center justify-center hover:border-white/20 transition-colors">
            <button
              onClick={onAddNew}
              className="text-zinc-500 hover:text-white transition-colors text-sm"
            >
              + Add your first account
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

interface AccountCardProps {
  account: Account;
  formatAmount: (amount: number) => string;
  gradientIndex: number;
  t: (key: string) => string;
  delay: number;
}

/**
 * Individual account card component with hover effects
 */
function AccountCard({ account, formatAmount, gradientIndex, t, delay }: AccountCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="group relative h-48 rounded-2xl p-6 flex flex-col justify-between border border-white/5 hover:border-white/10 overflow-hidden cursor-pointer transition-colors"
      style={{ backgroundImage: CARD_GRADIENTS[gradientIndex % CARD_GRADIENTS.length] }}
    >
      {/* Card Header */}
      <div className="flex justify-between items-start z-10">
        <div className="h-8 w-12 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/5">
          <div className="w-3 h-3 rounded-full bg-red-500/80 -mr-1" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
        </div>
        <CreditCard className="text-zinc-500 w-5 h-5 group-hover:text-zinc-400 transition-colors" />
      </div>
      
      {/* Account Info */}
      <div className="z-10">
        <p className="text-zinc-500 text-sm font-medium mb-1 capitalize">
          {account.type.replace('_', ' ')}
        </p>
        <p className="text-white text-xl font-bold tracking-tight truncate">
          {account.name}
        </p>
      </div>
      
      {/* Balance */}
      <div className="flex justify-between items-end z-10">
        <div>
          <p className="text-xs text-zinc-600 uppercase tracking-wider mb-0.5">
            {t('dashboard.balance')}
          </p>
          <p className="text-white text-lg font-bold">
            Rp {formatAmount(account.balance)}
          </p>
        </div>
        <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center group-hover:scale-110 transition-transform">
          <ArrowRight className="text-black w-4 h-4" />
        </div>
      </div>
      
      {/* Decorative glow */}
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[var(--accent-color)]/10 rounded-full blur-[40px] group-hover:bg-[var(--accent-color)]/20 transition-all pointer-events-none" />
    </motion.div>
  );
}

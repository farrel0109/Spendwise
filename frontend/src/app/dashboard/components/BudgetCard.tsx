"use client";

import { Wallet } from "lucide-react";
import { motion } from "framer-motion";

interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  budgetLeft: number;
  budgetProgress: number;
}

interface BudgetCardProps {
  budgetSummary: BudgetSummary;
  formatAmount: (amount: number) => string;
  t: (key: string) => string;
}

/**
 * Budget progress card with circular visualization
 * Premium design with accent color support
 */
export function BudgetCard({ budgetSummary, formatAmount, t }: BudgetCardProps) {
  const { totalBudget, budgetLeft, budgetProgress } = budgetSummary;
  
  // Calculate projected savings (estimate: 80% of remaining)
  const PROJECTED_SAVINGS_RATE = 0.8;
  const projectedSavings = budgetLeft * PROJECTED_SAVINGS_RATE;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="col-span-1 md:col-span-4 premium-card rounded-2xl p-8 flex flex-col justify-between relative overflow-hidden"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-secondary text-sm font-semibold uppercase tracking-wider mb-1">
            {t('dashboard.budget')}
          </h3>
          <p className="text-2xl font-bold text-primary tracking-tight">
            {t('dashboard.leftToSpend')}
          </p>
        </div>
        <div className="bg-zinc-100 dark:bg-white/5 p-3 rounded-xl border border-zinc-200 dark:border-white/5">
          <Wallet className="w-6 h-6 text-secondary" />
        </div>
      </div>
      
      {/* Circular Progress */}
      <div className="flex items-center justify-center py-8">
        <div className="relative h-44 w-44">
          {/* Background Circle */}
          <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
            <path 
              className="text-zinc-200 dark:text-white/5" 
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5"
            />
            {/* Progress Arc */}
            <path 
              className="transition-all duration-1000" 
              style={{ color: 'var(--accent-color)', filter: 'drop-shadow(0 0 8px var(--accent-glow))' }}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
              fill="none" 
              stroke="currentColor" 
              strokeDasharray={`${Math.min(budgetProgress, 100)}, 100`} 
              strokeLinecap="round" 
              strokeWidth="2.5"
            />
          </svg>
          
          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-primary">
              Rp {formatAmount(budgetLeft)}
            </span>
            <span className="text-sm text-muted font-medium mt-1">
              of Rp {formatAmount(totalBudget)}
            </span>
          </div>
        </div>
      </div>
      
      {/* Projected Savings */}
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-secondary">{t('dashboard.projectedSavings')}</span>
          <span className="text-primary font-semibold">
            Rp {formatAmount(projectedSavings)}
          </span>
        </div>
        <div className="w-full bg-zinc-100 dark:bg-white/5 rounded-full h-1.5 overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500 bg-emerald-500" 
            style={{ width: '65%' }}
          />
        </div>
      </div>
      
      {/* Subtle glow */}
      <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-[var(--accent-color)]/10 rounded-full blur-[60px] pointer-events-none" />
    </motion.div>
  );
}

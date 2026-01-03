"use client";

import { Wallet } from "lucide-react";

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
 * Shows remaining budget and projected savings
 */
export function BudgetCard({ budgetSummary, formatAmount, t }: BudgetCardProps) {
  const { totalBudget, budgetLeft, budgetProgress } = budgetSummary;
  
  // Calculate projected savings (estimate: 80% of remaining)
  const PROJECTED_SAVINGS_RATE = 0.8;
  const projectedSavings = budgetLeft * PROJECTED_SAVINGS_RATE;
  
  return (
    <div className="col-span-1 md:col-span-4 apple-card rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">
            {t('dashboard.budget')}
          </h3>
          <p className="text-2xl font-bold text-white tracking-tight">
            {t('dashboard.leftToSpend')}
          </p>
        </div>
        <div className="bg-[#232e3b] p-2 rounded-lg border border-white/5">
          <Wallet className="w-6 h-6 text-white" />
        </div>
      </div>
      
      {/* Circular Progress */}
      <div className="flex items-center justify-center py-6">
        <div className="relative h-40 w-40">
          {/* Background Circle */}
          <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
            <path 
              className="text-white/5" 
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="3"
            />
            {/* Progress Arc */}
            <path 
              className="text-[#007bff] drop-shadow-[0_0_10px_rgba(0,123,255,0.5)] transition-all duration-1000" 
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
              fill="none" 
              stroke="currentColor" 
              strokeDasharray={`${Math.min(budgetProgress, 100)}, 100`} 
              strokeLinecap="round" 
              strokeWidth="3"
            />
          </svg>
          
          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-white">
              Rp {formatAmount(budgetLeft)}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              of Rp {formatAmount(totalBudget)}
            </span>
          </div>
        </div>
      </div>
      
      {/* Projected Savings */}
      <div className="mt-2 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">{t('dashboard.projectedSavings')}</span>
          <span className="text-white font-semibold">
            Rp {formatAmount(projectedSavings)}
          </span>
        </div>
        <div className="w-full bg-[#232e3b] rounded-full h-1.5">
          <div 
            className="bg-green-500 h-1.5 rounded-full transition-all duration-500" 
            style={{ width: '65%' }}
          />
        </div>
      </div>
    </div>
  );
}

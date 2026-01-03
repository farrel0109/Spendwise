"use client";

import { Target } from "lucide-react";
import type { SavingsGoal } from "@/types";

interface TopGoalCardProps {
  goal: SavingsGoal | undefined;
  formatAmount: (amount: number) => string;
  onCreateGoal: () => void;
  t: (key: string) => string;
}

/**
 * Top goal card showing the highest progress savings goal
 * Displays goal progress with visual progress bar
 */
export function TopGoalCard({ goal, formatAmount, onCreateGoal, t }: TopGoalCardProps) {
  return (
    <div className="col-span-1 md:col-span-1 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-1 mb-4">
        <h3 className="text-white font-bold text-lg">{t('dashboard.topGoal')}</h3>
      </div>
      
      {/* Goal Card */}
      <div className="flex-1 apple-card rounded-2xl p-6 flex flex-col justify-center items-center relative overflow-hidden text-center group">
        {goal ? (
          <GoalContent goal={goal} formatAmount={formatAmount} t={t} />
        ) : (
          <EmptyGoalState onCreateGoal={onCreateGoal} />
        )}
        
        {/* Confetti texture overlay */}
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none" />
      </div>
    </div>
  );
}

interface GoalContentProps {
  goal: SavingsGoal;
  formatAmount: (amount: number) => string;
  t: (key: string) => string;
}

/**
 * Content for when a goal exists
 */
function GoalContent({ goal, formatAmount, t }: GoalContentProps) {
  const progressPercent = Math.min(goal.progress, 100);
  
  return (
    <>
      {/* Goal Icon */}
      <div 
        className="h-20 w-20 rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(251,191,36,0.4)] group-hover:scale-110 transition-transform duration-500" 
        style={{ background: goal.color || '#F59E0B' }}
      >
        <Target className="w-10 h-10 text-white" />
      </div>
      
      {/* Goal Name */}
      <h4 className="text-white text-xl font-bold mb-1">{goal.name}</h4>
      <p className="text-slate-400 text-sm mb-6">
        Keep saving! You&apos;re almost halfway there.
      </p>
      
      {/* Progress Section */}
      <div className="w-full space-y-2">
        <div className="flex justify-between text-xs font-semibold text-slate-300">
          <span>Rp {formatAmount(goal.current_amount)}</span>
          <span>Rp {formatAmount(goal.target_amount)}</span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-[#232e3b] rounded-full h-3 border border-white/5">
          <div 
            className="h-full rounded-full relative transition-all duration-1000" 
            style={{ 
              width: `${progressPercent}%`, 
              background: goal.color || '#007bff' 
            }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-full bg-white/50 rounded-r-full" />
          </div>
        </div>
        
        <p className="text-right text-xs text-[#007bff] font-bold mt-1">
          {Math.round(goal.progress)}% {t('dashboard.funded')}
        </p>
      </div>
    </>
  );
}

interface EmptyGoalStateProps {
  onCreateGoal: () => void;
}

/**
 * Empty state when no goals exist
 */
function EmptyGoalState({ onCreateGoal }: EmptyGoalStateProps) {
  return (
    <div className="text-center">
      <div className="h-20 w-20 rounded-full bg-[#232e3b] flex items-center justify-center mb-4 mx-auto">
        <Target className="w-10 h-10 text-slate-500" />
      </div>
      <h4 className="text-white text-lg font-bold mb-2">No Goals Yet</h4>
      <button 
        onClick={onCreateGoal}
        className="text-[#007bff] text-sm font-bold hover:underline"
      >
        Create a Goal
      </button>
    </div>
  );
}

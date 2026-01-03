"use client";

import { Target } from "lucide-react";
import { motion } from "framer-motion";
import type { SavingsGoal } from "@/types";

interface TopGoalCardProps {
  goal: SavingsGoal | undefined;
  formatAmount: (amount: number) => string;
  onCreateGoal: () => void;
  t: (key: string) => string;
}

/**
 * Top goal card showing the highest progress savings goal
 * Premium design with animations
 */
export function TopGoalCard({ goal, formatAmount, onCreateGoal, t }: TopGoalCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="col-span-1 md:col-span-1 flex flex-col h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-1 mb-4">
        <h3 className="text-white font-bold text-lg">{t('dashboard.topGoal')}</h3>
      </div>
      
      {/* Goal Card */}
      <div className="flex-1 premium-card rounded-2xl p-6 flex flex-col justify-center items-center relative overflow-hidden text-center group">
        {goal ? (
          <GoalContent goal={goal} formatAmount={formatAmount} t={t} />
        ) : (
          <EmptyGoalState onCreateGoal={onCreateGoal} />
        )}
        
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
      </div>
    </motion.div>
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
      <motion.div 
        whileHover={{ scale: 1.1 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="h-20 w-20 rounded-full flex items-center justify-center mb-4 shadow-lg glow-accent" 
        style={{ background: `linear-gradient(135deg, var(--accent-color), ${goal.color || '#ec4899'})` }}
      >
        <Target className="w-10 h-10 text-white" />
      </motion.div>
      
      {/* Goal Name */}
      <h4 className="text-white text-xl font-bold mb-1">{goal.name}</h4>
      <p className="text-zinc-500 text-sm mb-6">
        Keep saving! You&apos;re making great progress.
      </p>
      
      {/* Progress Section */}
      <div className="w-full space-y-3">
        <div className="flex justify-between text-xs font-semibold text-zinc-400">
          <span>Rp {formatAmount(goal.current_amount)}</span>
          <span>Rp {formatAmount(goal.target_amount)}</span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-white/5 rounded-full h-2.5 border border-white/5 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1, delay: 0.5 }}
            className="h-full rounded-full relative progress-accent" 
            style={{ background: `linear-gradient(90deg, var(--accent-color), ${goal.color || '#ec4899'})` }}
          />
        </div>
        
        <p className="text-right text-xs text-[var(--accent-color)] font-bold mt-2">
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
      <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mb-4 mx-auto border border-white/5">
        <Target className="w-10 h-10 text-zinc-600" />
      </div>
      <h4 className="text-white text-lg font-bold mb-2">No Goals Yet</h4>
      <button 
        onClick={onCreateGoal}
        className="text-[var(--accent-color)] text-sm font-bold hover:opacity-80 transition-opacity"
      >
        Create a Goal
      </button>
    </div>
  );
}

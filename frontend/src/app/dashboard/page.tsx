"use client";

import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboardData } from "@/hooks";
import { useLanguage } from "@/context/LanguageContext";
import { usePrivacy } from "@/context/PrivacyContext";
import { formatCurrency } from "@/utils";
import { Wallet, Target, RefreshCw } from "lucide-react";

// Dashboard Components
import QuickAddFAB from "@/components/dashboard/QuickAddFAB";
import { NetWorthSection } from "./components/NetWorthSection";
import { BudgetCard } from "./components/BudgetCard";
import { AccountsSection } from "./components/AccountsSection";
import { TopGoalCard } from "./components/TopGoalCard";
import { TransactionsTable } from "./components/TransactionsTable";

/**
 * Skeleton component for individual cards
 */
function CardSkeleton({ className = "", children }: { className?: string; children?: React.ReactNode }) {
  return (
    <div className={`premium-card rounded-2xl animate-pulse ${className}`}>
      {children}
    </div>
  );
}

/**
 * Net Worth Skeleton
 */
function NetWorthSkeleton() {
  return (
    <CardSkeleton className="col-span-1 md:col-span-8 p-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="h-3 w-32 bg-zinc-200 dark:bg-white/10 rounded mb-3" />
          <div className="h-14 w-72 bg-zinc-200 dark:bg-white/10 rounded mb-2" />
          <div className="h-6 w-20 bg-emerald-500/20 rounded-lg" />
        </div>
        <div className="h-9 w-40 bg-zinc-100 dark:bg-white/5 rounded-xl" />
      </div>
      <div className="h-48 w-full bg-zinc-100 dark:bg-white/5 rounded-xl" />
    </CardSkeleton>
  );
}

/**
 * Budget Skeleton
 */
function BudgetSkeleton() {
  return (
    <CardSkeleton className="col-span-1 md:col-span-4 p-8 flex flex-col">
      <div className="flex justify-between">
        <div>
          <div className="h-3 w-20 bg-zinc-200 dark:bg-white/10 rounded mb-2" />
          <div className="h-6 w-32 bg-zinc-200 dark:bg-white/10 rounded" />
        </div>
        <div className="w-12 h-12 bg-zinc-100 dark:bg-white/5 rounded-xl" />
      </div>
      <div className="flex-1 flex items-center justify-center py-6">
        <div className="w-44 h-44 rounded-full border-[6px] border-zinc-100 dark:border-white/5 flex items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-24 bg-zinc-200 dark:bg-white/10 rounded mb-2 mx-auto" />
            <div className="h-4 w-20 bg-zinc-100 dark:bg-white/5 rounded mx-auto" />
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <div className="h-3 w-24 bg-zinc-100 dark:bg-white/5 rounded" />
          <div className="h-3 w-20 bg-zinc-200 dark:bg-white/10 rounded" />
        </div>
        <div className="h-1.5 w-full bg-zinc-100 dark:bg-white/5 rounded-full" />
      </div>
    </CardSkeleton>
  );
}

/**
 * Account Card Skeleton
 */
function AccountCardSkeleton() {
  return (
    <CardSkeleton className="h-48 p-6">
      <div className="flex justify-between mb-6">
        <div className="h-8 w-12 bg-zinc-200 dark:bg-white/10 rounded-lg" />
        <div className="h-5 w-5 bg-zinc-100 dark:bg-white/5 rounded" />
      </div>
      <div className="h-3 w-20 bg-zinc-100 dark:bg-white/5 rounded mb-2" />
      <div className="h-5 w-32 bg-zinc-200 dark:bg-white/10 rounded mb-6" />
      <div className="flex justify-between items-end">
        <div>
          <div className="h-2 w-12 bg-zinc-100 dark:bg-white/5 rounded mb-1" />
          <div className="h-5 w-24 bg-zinc-200 dark:bg-white/10 rounded" />
        </div>
        <div className="h-8 w-8 bg-zinc-200 dark:bg-white/10 rounded-full" />
      </div>
    </CardSkeleton>
  );
}

/**
 * Goal Skeleton
 */
function GoalSkeleton() {
  return (
    <CardSkeleton className="p-6 flex flex-col items-center justify-center text-center">
      <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-white/5 mb-4" />
      <div className="h-5 w-24 bg-zinc-200 dark:bg-white/10 rounded mb-2" />
      <div className="h-3 w-32 bg-zinc-100 dark:bg-white/5 rounded mb-6" />
      <div className="w-full space-y-2">
        <div className="flex justify-between">
          <div className="h-2 w-16 bg-zinc-100 dark:bg-white/5 rounded" />
          <div className="h-2 w-16 bg-zinc-100 dark:bg-white/5 rounded" />
        </div>
        <div className="h-2.5 w-full bg-zinc-100 dark:bg-white/5 rounded-full" />
        <div className="h-3 w-16 bg-zinc-100 dark:bg-white/5 rounded ml-auto" />
      </div>
    </CardSkeleton>
  );
}

/**
 * Transaction Row Skeleton
 */
function TransactionRowSkeleton() {
  return (
    <div className="flex items-center gap-4 py-4 border-b border-zinc-200 dark:border-white/5 last:border-0">
      <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-white/5" />
      <div className="flex-1">
        <div className="h-4 w-32 bg-zinc-200 dark:bg-white/10 rounded mb-2" />
        <div className="h-3 w-20 bg-zinc-100 dark:bg-white/5 rounded" />
      </div>
      <div className="h-5 w-24 bg-zinc-200 dark:bg-white/10 rounded" />
    </div>
  );
}

/**
 * Empty State Component
 */
function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action,
  actionLabel
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string; 
  action?: () => void;
  actionLabel?: string;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center text-center py-12"
    >
      <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted" />
      </div>
      <h3 className="text-lg font-bold text-primary mb-1">{title}</h3>
      <p className="text-muted text-sm mb-4 max-w-xs">{description}</p>
      {action && actionLabel && (
        <button
          onClick={action}
          className="text-[var(--accent-color)] text-sm font-medium hover:opacity-80 transition-opacity"
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
}

/**
 * Main Dashboard Page
 * Displays financial overview with net worth, budgets, accounts, goals, and transactions
 * Implements progressive rendering with component-level loading states
 */
export default function Dashboard() {
  const router = useRouter();
  const { t } = useLanguage();
  const { isPrivacyMode } = usePrivacy();
  
  // Use custom hook for all data fetching
  const {
    accounts,
    transactions,
    netWorth,
    topGoal,
    budgetSummary,
    loading,
    refresh,
  } = useDashboardData();

  // Currency formatter with privacy mode support
  const formatAmount = (amount: number) => formatCurrency(amount, isPrivacyMode);

  // Progressive rendering: Show skeleton for specific sections while loading
  const showNetWorthSkeleton = loading && !netWorth;
  const showBudgetSkeleton = loading && budgetSummary.totalBudget === 0;
  const showAccountsSkeleton = loading && accounts.length === 0;
  const showGoalSkeleton = loading && !topGoal;
  const showTransactionsSkeleton = loading && transactions.length === 0;

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Top Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Net Worth Card (Large) */}
          <AnimatePresence mode="wait">
            {showNetWorthSkeleton ? (
              <NetWorthSkeleton key="networth-skeleton" />
            ) : (
              <motion.div
                key="networth-content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="col-span-1 md:col-span-8"
              >
                <NetWorthSection 
                  netWorth={netWorth} 
                  formatAmount={formatAmount}
                  t={t}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Budget Card (Medium) */}
          <AnimatePresence mode="wait">
            {showBudgetSkeleton ? (
              <BudgetSkeleton key="budget-skeleton" />
            ) : (
              <motion.div
                key="budget-content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="col-span-1 md:col-span-4"
              >
                <BudgetCard
                  budgetSummary={budgetSummary}
                  formatAmount={formatAmount}
                  t={t}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Row 2: Accounts & Goals */}
          <div className="col-span-1 md:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Accounts (2/3 width) */}
            <AnimatePresence mode="wait">
              {showAccountsSkeleton ? (
                <div key="accounts-skeleton" className="col-span-1 md:col-span-2 space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <div className="h-5 w-32 bg-zinc-200 dark:bg-white/10 rounded" />
                    <div className="h-4 w-16 bg-zinc-100 dark:bg-white/5 rounded" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <AccountCardSkeleton />
                    <AccountCardSkeleton />
                  </div>
                </div>
              ) : accounts.length === 0 && !loading ? (
                <motion.div
                  key="accounts-empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-1 md:col-span-2 premium-card rounded-2xl"
                >
                  <EmptyState
                    icon={Wallet}
                    title="No Accounts Yet"
                    description="Add your bank accounts, e-wallets, or cash to start tracking."
                    action={() => router.push("/dashboard/accounts")}
                    actionLabel="+ Add Account"
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="accounts-content"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="col-span-1 md:col-span-2"
                >
                  <AccountsSection
                    accounts={accounts}
                    formatAmount={formatAmount}
                    onAddNew={() => router.push("/dashboard/accounts")}
                    t={t}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Top Goal (1/3 width) */}
            <AnimatePresence mode="wait">
              {showGoalSkeleton ? (
                <div key="goal-skeleton" className="flex flex-col h-full">
                  <div className="flex items-center justify-between px-1 mb-4">
                    <div className="h-5 w-24 bg-zinc-200 dark:bg-white/10 rounded" />
                  </div>
                  <GoalSkeleton />
                </div>
              ) : !topGoal && !loading ? (
                <motion.div
                  key="goal-empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col h-full"
                >
                  <div className="px-1 mb-4">
                    <h3 className="text-primary font-bold text-lg">{t('dashboard.topGoal')}</h3>
                  </div>
                  <div className="flex-1 premium-card rounded-2xl">
                    <EmptyState
                      icon={Target}
                      title="No Goals Yet"
                      description="Set a savings goal to stay motivated."
                      action={() => router.push("/dashboard/goals")}
                      actionLabel="+ Create Goal"
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="goal-content"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="col-span-1"
                >
                  <TopGoalCard
                    goal={topGoal}
                    formatAmount={formatAmount}
                    onCreateGoal={() => router.push("/dashboard/goals")}
                    t={t}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Recent Transactions */}
          <AnimatePresence mode="wait">
            {showTransactionsSkeleton ? (
              <div key="txn-skeleton" className="col-span-1 md:col-span-12 premium-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="h-5 w-48 bg-zinc-200 dark:bg-white/10 rounded" />
                  <div className="h-9 w-40 bg-zinc-100 dark:bg-white/5 rounded-xl" />
                </div>
                {[1, 2, 3, 4].map((i) => (
                  <TransactionRowSkeleton key={i} />
                ))}
              </div>
            ) : transactions.length === 0 && !loading ? (
              <motion.div
                key="txn-empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-1 md:col-span-12 premium-card rounded-2xl"
              >
                <EmptyState
                  icon={RefreshCw}
                  title="No Transactions Yet"
                  description="Add your first transaction to start tracking your spending."
                  action={() => router.push("/dashboard/transactions")}
                  actionLabel="+ Add Transaction"
                />
              </motion.div>
            ) : (
              <motion.div
                key="txn-content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="col-span-1 md:col-span-12"
              >
                <TransactionsTable
                  transactions={transactions}
                  formatAmount={formatAmount}
                  onViewAll={() => router.push("/dashboard/transactions")}
                  t={t}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      
      {/* FAB */}
      <QuickAddFAB accounts={accounts} onSuccess={refresh} />
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useDashboardData } from "@/hooks";
import { useLanguage } from "@/context/LanguageContext";
import { usePrivacy } from "@/context/PrivacyContext";
import { formatCurrency } from "@/utils";

// Dashboard Components
import QuickAddFAB from "@/components/dashboard/QuickAddFAB";
import { NetWorthSection } from "./components/NetWorthSection";
import { BudgetCard } from "./components/BudgetCard";
import { AccountsSection } from "./components/AccountsSection";
import { TopGoalCard } from "./components/TopGoalCard";
import { TransactionsTable } from "./components/TransactionsTable";
import { DashboardSkeleton } from "./components/DashboardSkeleton";

/**
 * Main Dashboard Page
 * Displays financial overview with net worth, budgets, accounts, goals, and transactions
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

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 scroll-smooth pb-32">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Net Worth Card (Large) */}
          <NetWorthSection 
            netWorth={netWorth} 
            formatAmount={formatAmount}
            t={t}
          />

          {/* Budget Card (Medium) */}
          <BudgetCard
            budgetSummary={budgetSummary}
            formatAmount={formatAmount}
            t={t}
          />

          {/* Row 2: Accounts & Goals */}
          <div className="col-span-1 md:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Accounts (2/3 width) */}
            <AccountsSection
              accounts={accounts}
              formatAmount={formatAmount}
              onAddNew={() => router.push("/dashboard/accounts")}
              t={t}
            />

            {/* Top Goal (1/3 width) */}
            <TopGoalCard
              goal={topGoal}
              formatAmount={formatAmount}
              onCreateGoal={() => router.push("/dashboard/goals")}
              t={t}
            />
          </div>

          {/* Recent Transactions */}
          <TransactionsTable
            transactions={transactions}
            formatAmount={formatAmount}
            onViewAll={() => router.push("/dashboard/transactions")}
            t={t}
          />
        </div>
      </div>
      
      {/* FAB */}
      <QuickAddFAB accounts={accounts} onSuccess={refresh} />
    </div>
  );
}

"use client";

import Link from "next/link";
import { type Budget } from "@/lib/api";

interface BudgetProgressProps {
  budgets: Budget[];
}

export default function BudgetProgress({ budgets }: BudgetProgressProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (budgets.length === 0) {
    return (
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Budgets</h3>
          <Link
            href="/dashboard/budgets"
            className="text-sm text-purple-400 hover:text-purple-300"
          >
            Manage →
          </Link>
        </div>
        <div className="text-center py-6">
          <p className="text-slate-400 text-sm">No budgets set</p>
          <Link
            href="/dashboard/budgets"
            className="inline-flex mt-2 text-sm text-purple-400 hover:text-purple-300"
          >
            + Create Budget
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Budgets</h3>
        <Link
          href="/dashboard/budgets"
          className="text-sm text-purple-400 hover:text-purple-300"
        >
          See All →
        </Link>
      </div>

      <div className="space-y-4">
        {budgets.slice(0, 4).map((budget) => {
          const percent = Math.min(budget.percentUsed, 100);
          const isOver = budget.isOverBudget;
          const isNear = budget.isNearLimit;

          return (
            <div key={budget.id}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{budget.categories?.icon || "📊"}</span>
                  <span className="text-sm font-medium text-white">
                    {budget.categories?.name || "Unknown"}
                  </span>
                </div>
                <span
                  className={`text-sm font-medium ${
                    isOver ? "text-red-400" : isNear ? "text-orange-400" : "text-slate-400"
                  }`}
                >
                  {budget.percentUsed}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    isOver
                      ? "bg-gradient-to-r from-red-500 to-red-400"
                      : isNear
                      ? "bg-gradient-to-r from-orange-500 to-yellow-400"
                      : "bg-gradient-to-r from-green-500 to-emerald-400"
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>

              {/* Amount Info */}
              <div className="flex justify-between mt-1 text-xs text-slate-500">
                <span>Rp {formatCurrency(budget.spent)} spent</span>
                <span>Rp {formatCurrency(budget.amount)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

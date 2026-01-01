"use client";

import Link from "next/link";
import { type SavingsGoal } from "@/lib/api";

interface GoalsProgressProps {
  goals: SavingsGoal[];
}

export default function GoalsProgress({ goals }: GoalsProgressProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (goals.length === 0) {
    return (
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Savings Goals</h3>
          <Link
            href="/dashboard/goals"
            className="text-sm text-purple-400 hover:text-purple-300"
          >
            Manage →
          </Link>
        </div>
        <div className="text-center py-6">
          <p className="text-slate-400 text-sm">No goals yet</p>
          <Link
            href="/dashboard/goals"
            className="inline-flex mt-2 text-sm text-purple-400 hover:text-purple-300"
          >
            + Create Goal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Savings Goals</h3>
        <Link
          href="/dashboard/goals"
          className="text-sm text-purple-400 hover:text-purple-300"
        >
          See All →
        </Link>
      </div>

      <div className="space-y-4">
        {goals.slice(0, 3).map((goal) => {
          const isComplete = goal.is_completed || goal.progress >= 100;

          return (
            <div
              key={goal.id}
              className={`p-4 rounded-xl ${
                isComplete ? "bg-green-500/10 border border-green-500/30" : "bg-slate-700/30"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{goal.icon}</span>
                  <div>
                    <p className="font-medium text-white">{goal.name}</p>
                    {goal.target_date && (
                      <p className="text-xs text-slate-400">
                        Target: {new Date(goal.target_date).toLocaleDateString("id-ID", { month: "short", year: "numeric" })}
                      </p>
                    )}
                  </div>
                </div>
                {isComplete && <span className="text-green-400">✓</span>}
              </div>

              {/* Circular Progress */}
              <div className="flex items-center space-x-4">
                <div className="relative w-16 h-16 flex-shrink-0">
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="transparent"
                      className="text-slate-700"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="url(#goalGradient)"
                      strokeWidth="6"
                      fill="transparent"
                      strokeLinecap="round"
                      strokeDasharray={`${goal.progress * 1.76} 176`}
                      className="transition-all duration-500"
                    />
                    <defs>
                      <linearGradient id="goalGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={goal.color || "#22c55e"} />
                        <stop offset="100%" stopColor="#84cc16" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">{goal.progress}%</span>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Saved</span>
                    <span className="text-white font-medium">
                      Rp {formatCurrency(goal.current_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Target</span>
                    <span className="text-slate-300">
                      Rp {formatCurrency(goal.target_amount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

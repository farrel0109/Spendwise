"use client";

import Link from "next/link";
import { format } from "date-fns";
import { type Transaction } from "@/lib/api";

interface RecentTransactionsProps {
  transactions: Transaction[];
  onRefresh: () => void;
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (transactions.length === 0) {
    return (
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
          <Link
            href="/dashboard/transactions"
            className="text-sm text-purple-400 hover:text-purple-300"
          >
            View All →
          </Link>
        </div>
        <div className="text-center py-8">
          <p className="text-slate-400">No transactions yet</p>
          <p className="text-sm text-slate-500 mt-1">
            Start tracking by adding your first transaction
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
        <Link
          href="/dashboard/transactions"
          className="text-sm text-purple-400 hover:text-purple-300"
        >
          View All →
        </Link>
      </div>

      <div className="space-y-2">
        {transactions.map((txn) => (
          <div
            key={txn.id}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-700/20 hover:bg-slate-700/40 transition-colors"
          >
            <div className="flex items-center space-x-3">
              {/* Category Icon */}
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                style={{ backgroundColor: `${txn.categories?.color || "#6b7280"}20` }}
              >
                {txn.categories?.icon || (txn.type === "income" ? "💰" : txn.type === "transfer" ? "↔️" : "💸")}
              </div>

              <div>
                <p className="font-medium text-white">
                  {txn.description || txn.categories?.name || "Uncategorized"}
                </p>
                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <span>{txn.accounts?.name || "Unknown"}</span>
                  <span>•</span>
                  <span>{format(new Date(txn.txn_date), "MMM d")}</span>
                  {txn.emotion && <span>{txn.emotion}</span>}
                </div>
              </div>
            </div>

            <div className="text-right">
              <p
                className={`font-semibold ${
                  txn.type === "income"
                    ? "text-green-400"
                    : txn.type === "transfer"
                    ? "text-blue-400"
                    : "text-red-400"
                }`}
              >
                {txn.type === "income" ? "+" : txn.type === "expense" ? "-" : ""}
                Rp {formatCurrency(txn.amount)}
              </p>
              <p className="text-xs text-slate-500 capitalize">{txn.type}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { type Account } from "@/lib/api";

interface AccountsOverviewProps {
  accounts: Account[];
}

const accountTypeIcons: Record<string, string> = {
  cash: "💵",
  bank: "🏦",
  "e-wallet": "📱",
  investment: "📈",
  credit_card: "💳",
  loan: "📋",
};

export default function AccountsOverview({ accounts }: AccountsOverviewProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(amount));
  };

  if (accounts.length === 0) {
    return (
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Accounts</h3>
          <Link
            href="/dashboard/accounts"
            className="text-sm text-purple-400 hover:text-purple-300"
          >
            Manage →
          </Link>
        </div>
        <div className="text-center py-8">
          <p className="text-slate-400 mb-4">No accounts yet</p>
          <Link
            href="/dashboard/accounts"
            className="inline-flex px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
          >
            + Add Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Accounts</h3>
        <Link
          href="/dashboard/accounts"
          className="text-sm text-purple-400 hover:text-purple-300"
        >
          See All →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {accounts.slice(0, 4).map((account) => (
          <div
            key={account.id}
            className="flex items-center justify-between p-4 rounded-xl bg-slate-700/30 hover:bg-slate-700/50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                style={{ backgroundColor: `${account.color}20` }}
              >
                {account.icon || accountTypeIcons[account.type] || "💳"}
              </div>
              <div>
                <p className="font-medium text-white">{account.name}</p>
                <p className="text-xs text-slate-400 capitalize">{account.type.replace("_", " ")}</p>
              </div>
            </div>
            <div className="text-right">
              <p
                className={`font-semibold ${
                  account.balance >= 0 ? "text-white" : "text-red-400"
                }`}
              >
                Rp {formatCurrency(account.balance)}
              </p>
              {!account.is_asset && (
                <p className="text-xs text-orange-400">Debt</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {accounts.length > 4 && (
        <div className="mt-4 text-center">
          <Link
            href="/dashboard/accounts"
            className="text-sm text-slate-400 hover:text-white"
          >
            +{accounts.length - 4} more accounts
          </Link>
        </div>
      )}
    </div>
  );
}

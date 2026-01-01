"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { format } from "date-fns";
import { deleteTransaction, type Transaction } from "@/lib/api";

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: () => void;
  onError?: (message: string) => void;
}

export default function TransactionList({ transactions, onDelete, onError }: TransactionListProps) {
  const { getToken } = useAuth();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [loadingDelete, setLoadingDelete] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (confirmDelete !== id) {
      setConfirmDelete(id);
      return;
    }

    try {
      setLoadingDelete(id);
      const token = await getToken();
      
      if (!token) {
        onError?.("Authentication required");
        return;
      }

      await deleteTransaction(token, id);
      setConfirmDelete(null);
      onDelete();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      onError?.("Failed to delete transaction");
    } finally {
      setLoadingDelete(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (transactions.length === 0) {
    return (
      <div className="bg-slate-800/30 rounded-xl p-8 border border-slate-700/50 text-center">
        <div className="text-4xl mb-3">📝</div>
        <p className="text-slate-400">No transactions yet</p>
        <p className="text-slate-500 text-sm mt-1">Add your first transaction to start tracking</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 overflow-hidden">
      <div className="divide-y divide-slate-700/50">
        {transactions.map((txn) => (
          <div
            key={txn.id}
            className="flex items-center justify-between p-4 hover:bg-slate-700/20 transition-colors group"
          >
            <div className="flex items-center space-x-3">
              {/* Category/Type Icon */}
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
                  <span>{format(new Date(txn.txn_date), "MMM d, yyyy")}</span>
                  {txn.emotion && <span>{txn.emotion}</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
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
              </div>

              {/* Delete Button */}
              {confirmDelete === txn.id ? (
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleDelete(txn.id)}
                    disabled={loadingDelete === txn.id}
                    className="px-2 py-1 bg-red-500 text-white text-xs rounded disabled:opacity-50"
                  >
                    {loadingDelete === txn.id ? "..." : "Yes"}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="px-2 py-1 bg-slate-600 text-white text-xs rounded"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleDelete(txn.id)}
                  className="p-1.5 rounded text-slate-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                >
                  🗑️
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

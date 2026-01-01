"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { createTransaction, getAccounts, type Category, type Account } from "@/lib/api";

interface TransactionFormProps {
  categories: Category[];
  onSuccess: () => void;
  onError?: (message: string) => void;
}

export default function TransactionForm({ categories, onSuccess, onError }: TransactionFormProps) {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [type, setType] = useState<"income" | "expense">("expense");
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    category_id: "",
    txn_date: new Date().toISOString().split("T")[0],
    account_id: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const token = await getToken();
        if (token) {
          const data = await getAccounts(token);
          setAccounts(data.accounts || []);
          if (data.accounts?.length > 0) {
            setFormData(prev => ({ ...prev, account_id: data.accounts[0].id }));
          }
        }
      } catch (error) {
        console.error("Error fetching accounts:", error);
      }
    };
    fetchAccounts();
  }, [getToken]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.account_id) {
      newErrors.account_id = "Please select an account";
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }
    
    if (parseFloat(formData.amount) > 999999999.99) {
      newErrors.amount = "Amount is too large";
    }
    
    if (!formData.txn_date) {
      newErrors.txn_date = "Date is required";
    }
    
    if (formData.description.length > 500) {
      newErrors.description = "Description must be 500 characters or less";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      onError?.("Please fix the errors above");
      return;
    }

    try {
      setLoading(true);
      const token = await getToken();
      
      if (!token) {
        onError?.("Authentication required");
        return;
      }

      await createTransaction(token, {
        accountId: formData.account_id,
        categoryId: formData.category_id ? parseInt(formData.category_id) : undefined,
        amount: parseFloat(formData.amount),
        type,
        description: formData.description,
        txnDate: formData.txn_date,
      });

      setFormData({
        amount: "",
        description: "",
        category_id: "",
        txn_date: new Date().toISOString().split("T")[0],
        account_id: accounts[0]?.id || "",
      });
      setErrors({});
      onSuccess();
    } catch (error) {
      console.error("Error creating transaction:", error);
      onError?.("Failed to create transaction. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(c => c.type === type);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
      <h3 className="text-lg font-semibold text-white mb-4">Add Transaction</h3>
      
      {/* Type Toggle */}
      <div className="flex space-x-2">
        <button
          type="button"
          onClick={() => setType("expense")}
          className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
            type === "expense"
              ? "bg-red-500/20 text-red-400 border border-red-500/30"
              : "bg-slate-700/50 text-slate-400 hover:text-white"
          }`}
        >
          Expense
        </button>
        <button
          type="button"
          onClick={() => setType("income")}
          className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
            type === "income"
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "bg-slate-700/50 text-slate-400 hover:text-white"
          }`}
        >
          Income
        </button>
      </div>

      {/* Account */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Account *</label>
        <select
          value={formData.account_id}
          onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
          className={`w-full bg-slate-700/50 border rounded-lg px-4 py-2.5 text-white ${
            errors.account_id ? "border-red-500" : "border-slate-600"
          }`}
          required
        >
          <option value="">Select account</option>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.icon} {acc.name}
            </option>
          ))}
        </select>
        {errors.account_id && <p className="text-red-400 text-xs mt-1">{errors.account_id}</p>}
      </div>

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Amount *</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">Rp</span>
          <input
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="0"
            className={`w-full bg-slate-700/50 border rounded-lg pl-10 pr-4 py-2.5 text-white ${
              errors.amount ? "border-red-500" : "border-slate-600"
            }`}
            required
          />
        </div>
        {errors.amount && <p className="text-red-400 text-xs mt-1">{errors.amount}</p>}
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
        <select
          value={formData.category_id}
          onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
          className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white"
        >
          <option value="">No category</option>
          {filteredCategories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
        <input
          type="text"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="What's this for?"
          className={`w-full bg-slate-700/50 border rounded-lg px-4 py-2.5 text-white ${
            errors.description ? "border-red-500" : "border-slate-600"
          }`}
          maxLength={500}
        />
        <div className="flex justify-between text-xs mt-1">
          {errors.description ? (
            <span className="text-red-400">{errors.description}</span>
          ) : (
            <span className="text-slate-500"></span>
          )}
          <span className="text-slate-500">{formData.description.length}/500</span>
        </div>
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Date *</label>
        <input
          type="date"
          value={formData.txn_date}
          onChange={(e) => setFormData({ ...formData, txn_date: e.target.value })}
          className={`w-full bg-slate-700/50 border rounded-lg px-4 py-2.5 text-white ${
            errors.txn_date ? "border-red-500" : "border-slate-600"
          }`}
          required
        />
        {errors.txn_date && <p className="text-red-400 text-xs mt-1">{errors.txn_date}</p>}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-lg font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center justify-center space-x-2">
            <span className="animate-spin">⏳</span>
            <span>Adding...</span>
          </span>
        ) : (
          `Add ${type === "income" ? "Income" : "Expense"}`
        )}
      </button>
    </form>
  );
}

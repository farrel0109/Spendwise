"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import toast from "react-hot-toast";
import { createTransaction, getCategories, type Account, type Category } from "@/lib/api";
import { 
  Plus, 
  X, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw, 
  Calendar, 
  FileText, 
  Smile,
  Wallet,
  Check
} from "lucide-react";

interface QuickAddFABProps {
  accounts: Account[];
  onSuccess: () => void;
}

const EMOTIONS = ["Happy", "Neutral", "Sad", "Frustrated", "Confused"];

export default function QuickAddFAB({ accounts, onSuccess }: QuickAddFABProps) {
  const { getToken } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [type, setType] = useState<"income" | "expense" | "transfer">("expense");
  const [formData, setFormData] = useState({
    accountId: "",
    toAccountId: "",
    categoryId: "",
    amount: "",
    description: "",
    txnDate: new Date().toISOString().split("T")[0],
    emotion: "",
  });

  const openModal = async () => {
    setIsOpen(true);
    if (accounts.length > 0 && !formData.accountId) {
      setFormData(prev => ({ ...prev, accountId: accounts[0].id }));
    }
    try {
      const token = await getToken();
      if (token) {
        const cats = await getCategories(token);
        setCategories(cats);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.accountId || !formData.amount) {
      toast.error("Please fill required fields");
      return;
    }

    if (type === "transfer" && !formData.toAccountId) {
      toast.error("Select destination account");
      return;
    }

    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;

      await createTransaction(token, {
        accountId: formData.accountId,
        toAccountId: type === "transfer" ? formData.toAccountId : undefined,
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : undefined,
        amount: parseFloat(formData.amount),
        type,
        description: formData.description,
        txnDate: formData.txnDate,
        emotion: formData.emotion || undefined,
      });

      toast.success("Transaction added successfully");
      setIsOpen(false);
      setFormData({
        accountId: accounts[0]?.id || "",
        toAccountId: "",
        categoryId: "",
        amount: "",
        description: "",
        txnDate: new Date().toISOString().split("T")[0],
        emotion: "",
      });
      onSuccess();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to add transaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* FAB */}
      <button
        onClick={openModal}
        className="fixed bottom-24 md:bottom-10 right-6 md:right-10 w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-lg shadow-blue-500/40 flex items-center justify-center text-white hover:scale-110 transition-all z-40 group"
      >
        <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0F172A]/80 backdrop-blur-sm transition-opacity" onClick={() => setIsOpen(false)} />

          <div className="relative w-full max-w-lg bg-[#1E293B] rounded-3xl overflow-hidden animate-slideUp shadow-2xl ring-1 ring-white/10">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#334155]/50 bg-[#1E293B]/50 backdrop-blur-md">
              <button onClick={() => setIsOpen(false)} className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors rounded-xl hover:bg-white/5">
                <X className="w-6 h-6" />
              </button>
              <span className="text-lg font-bold text-white">New Transaction</span>
              <div className="w-10" /> {/* Spacer for centering */}
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
              {/* Type Segmented Control */}
              <div className="flex bg-[#0F172A] p-1.5 rounded-2xl border border-[#334155]/50">
                <button
                  type="button"
                  onClick={() => setType("expense")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-xl transition-all ${
                    type === "expense" 
                      ? "bg-red-500 text-white shadow-lg shadow-red-500/20" 
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setType("income")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-xl transition-all ${
                    type === "income" 
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  Income
                </button>
                <button
                  type="button"
                  onClick={() => setType("transfer")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-xl transition-all ${
                    type === "transfer" 
                      ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" 
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <RefreshCw className="w-4 h-4" />
                  Transfer
                </button>
              </div>

              {/* Amount */}
              <div className="text-center py-4">
                <p className="text-xs text-slate-400 mb-3 uppercase tracking-wider font-bold">Amount</p>
                <div className="flex items-center justify-center relative">
                  <span className="text-3xl text-slate-500 mr-3 font-medium">Rp</span>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0"
                    className="text-5xl font-bold text-center bg-transparent border-none w-64 p-0 text-white focus:outline-none placeholder:text-[#334155] tracking-tight"
                    autoFocus
                    required
                  />
                </div>
              </div>

              <div className="space-y-5">
                {/* Account Selection */}
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400 uppercase tracking-wider font-bold flex items-center gap-1.5 pl-1">
                      <Wallet className="w-3 h-3" />
                      {type === "transfer" ? "From" : "Account"}
                    </label>
                    <div className="relative">
                      <select
                        value={formData.accountId}
                        onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                        className="w-full bg-[#0F172A] rounded-xl px-4 py-3.5 text-sm text-white border border-[#334155]/50 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 appearance-none transition-all"
                        required
                      >
                        <option value="">Select Account</option>
                        {accounts.map((acc) => (
                          <option key={acc.id} value={acc.id}>{acc.name}</option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                        <ArrowDownLeft className="w-4 h-4 rotate-[-45deg]" />
                      </div>
                    </div>
                  </div>

                  {type === "transfer" ? (
                    <div className="space-y-2">
                      <label className="text-xs text-slate-400 uppercase tracking-wider font-bold flex items-center gap-1.5 pl-1">
                        <Wallet className="w-3 h-3" />
                        To
                      </label>
                      <div className="relative">
                        <select
                          value={formData.toAccountId}
                          onChange={(e) => setFormData({ ...formData, toAccountId: e.target.value })}
                          className="w-full bg-[#0F172A] rounded-xl px-4 py-3.5 text-sm text-white border border-[#334155]/50 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 appearance-none transition-all"
                          required
                        >
                          <option value="">Select Account</option>
                          {accounts.filter(a => a.id !== formData.accountId).map((acc) => (
                            <option key={acc.id} value={acc.id}>{acc.name}</option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                          <ArrowDownLeft className="w-4 h-4 rotate-[-45deg]" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-xs text-slate-400 uppercase tracking-wider font-bold flex items-center gap-1.5 pl-1">
                        <FileText className="w-3 h-3" />
                        Category
                      </label>
                      <div className="relative">
                        <select
                          value={formData.categoryId}
                          onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                          className="w-full bg-[#0F172A] rounded-xl px-4 py-3.5 text-sm text-white border border-[#334155]/50 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 appearance-none transition-all"
                        >
                          <option value="">Uncategorized</option>
                          {categories.filter((c) => c.type === type).map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                          <ArrowDownLeft className="w-4 h-4 rotate-[-45deg]" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Note & Date */}
                <div className="grid grid-cols-2 gap-5">
                  <div className="col-span-2 space-y-2">
                    <label className="text-xs text-slate-400 uppercase tracking-wider font-bold flex items-center gap-1.5 pl-1">
                      <FileText className="w-3 h-3" />
                      Note
                    </label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="What's this for?"
                      className="w-full bg-[#0F172A] rounded-xl px-4 py-3.5 text-sm text-white border border-[#334155]/50 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-600 transition-all"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400 uppercase tracking-wider font-bold flex items-center gap-1.5 pl-1">
                      <Calendar className="w-3 h-3" />
                      Date
                    </label>
                    <input
                      type="date"
                      value={formData.txnDate}
                      onChange={(e) => setFormData({ ...formData, txnDate: e.target.value })}
                      className="w-full bg-[#0F172A] rounded-xl px-4 py-3.5 text-sm text-white border border-[#334155]/50 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-slate-400 uppercase tracking-wider font-bold flex items-center gap-1.5 pl-1">
                      <Smile className="w-3 h-3" />
                      Mood
                    </label>
                    <div className="relative">
                      <select
                        value={formData.emotion}
                        onChange={(e) => setFormData({ ...formData, emotion: e.target.value })}
                        className="w-full bg-[#0F172A] rounded-xl px-4 py-3.5 text-sm text-white border border-[#334155]/50 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 appearance-none transition-all"
                      >
                        <option value="">Neutral</option>
                        {EMOTIONS.map((e) => (
                          <option key={e} value={e}>{e}</option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                        <ArrowDownLeft className="w-4 h-4 rotate-[-45deg]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleSubmit} 
                disabled={loading} 
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Save Transaction
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

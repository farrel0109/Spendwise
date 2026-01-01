"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { getAccounts, createAccount, deleteAccount, type Account } from "@/lib/api";
import { 
  Plus, 
  Trash2, 
  Wallet, 
  CreditCard, 
  Banknote, 
  Landmark, 
  Smartphone, 
  TrendingUp,
  X,
  MoreHorizontal,
  Check
} from "lucide-react";

const ACCOUNT_TYPES = [
  { value: "cash", label: "Cash", isAsset: true, icon: Banknote },
  { value: "bank", label: "Bank", isAsset: true, icon: Landmark },
  { value: "e-wallet", label: "E-Wallet", isAsset: true, icon: Smartphone },
  { value: "investment", label: "Investment", isAsset: true, icon: TrendingUp },
  { value: "credit_card", label: "Credit Card", isAsset: false, icon: CreditCard },
  { value: "loan", label: "Loan", isAsset: false, icon: Wallet },
];

const COLORS = [
  "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
  "#EC4899", "#06B6D4", "#6366F1", "#14B8A6", "#F97316",
];

export default function AccountsPage() {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [summary, setSummary] = useState({ totalAssets: 0, totalLiabilities: 0, netWorth: 0 });
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "bank",
    color: COLORS[0],
    initialBalance: "",
    institution: "",
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(amount));
  };

  const fetchAccounts = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const data = await getAccounts(token);
      setAccounts(data.accounts || []);
      setSummary(data.summary || { totalAssets: 0, totalLiabilities: 0, netWorth: 0 });
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to load accounts");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("Name is required");
      return;
    }

    try {
      setFormLoading(true);
      const token = await getToken();
      if (!token) return;

      const accountType = ACCOUNT_TYPES.find((t) => t.value === formData.type);

      await createAccount(token, {
        name: formData.name,
        type: formData.type,
        color: formData.color,
        initialBalance: parseFloat(formData.initialBalance) || 0,
        isAsset: accountType?.isAsset ?? true,
        institution: formData.institution || undefined,
      });

      toast.success("Account created");
      setShowForm(false);
      setFormData({ name: "", type: "bank", color: COLORS[0], initialBalance: "", institution: "" });
      fetchAccounts();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to create account");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this account?")) return;
    try {
      const token = await getToken();
      if (!token) return;
      await deleteAccount(token, id);
      toast.success("Deleted");
      fetchAccounts();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to delete");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent shadow-lg shadow-blue-500/20"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-32 md:pb-12 max-w-[1600px] mx-auto px-6 md:px-10">
      {/* Header */}
      <div className="flex items-center justify-between pt-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-xl">
              <Wallet className="w-8 h-8 text-blue-500" />
            </div>
            Accounts
          </h1>
          <p className="text-slate-400 mt-1 ml-14">Manage your financial sources</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-semibold shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Add Account</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1E293B] rounded-3xl p-6 border border-[#334155]/30 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingUp className="w-24 h-24 text-emerald-500" />
          </div>
          <p className="text-sm text-slate-400 mb-2 uppercase tracking-wider font-bold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Total Assets
          </p>
          <p className="text-3xl font-bold text-emerald-500">Rp {formatCurrency(summary.totalAssets)}</p>
        </div>
        
        <div className="bg-[#1E293B] rounded-3xl p-6 border border-[#334155]/30 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <CreditCard className="w-24 h-24 text-red-500" />
          </div>
          <p className="text-sm text-slate-400 mb-2 uppercase tracking-wider font-bold flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-red-500" />
            Total Liabilities
          </p>
          <p className="text-3xl font-bold text-red-500">Rp {formatCurrency(summary.totalLiabilities)}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-6 shadow-xl shadow-blue-600/20 relative overflow-hidden group text-white">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wallet className="w-24 h-24 text-white" />
          </div>
          <p className="text-sm text-blue-100 mb-2 uppercase tracking-wider font-bold flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Net Worth
          </p>
          <p className="text-3xl font-bold">Rp {formatCurrency(summary.netWorth)}</p>
        </div>
      </div>

      {/* Accounts Grid */}
      {accounts.length === 0 ? (
        <div className="bg-[#1E293B] rounded-3xl p-16 text-center border border-dashed border-[#334155]">
          <div className="w-20 h-20 bg-[#0F172A] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#334155]">
            <Wallet className="w-10 h-10 text-slate-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No accounts yet</h3>
          <p className="text-slate-400 max-w-sm mx-auto">Add your first account to start tracking your income, expenses, and net worth.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {accounts.map((account) => {
            const TypeIcon = ACCOUNT_TYPES.find(t => t.value === account.type)?.icon || Wallet;
            
            return (
              <div key={account.id} className="bg-[#1E293B] p-6 rounded-3xl border border-[#334155]/30 hover:border-blue-500/50 transition-all group hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: account.color }}>
                    <TypeIcon className="w-7 h-7" />
                  </div>
                  <button
                    onClick={() => handleDelete(account.id)}
                    className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete Account"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{account.type.replace("_", " ")}</p>
                    {account.institution && (
                      <span className="px-2 py-0.5 rounded-md bg-[#0F172A] text-[10px] text-slate-400 border border-[#334155]">
                        {account.institution}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-white text-xl mb-4 truncate">{account.name}</h3>
                  
                  <div className="pt-4 border-t border-[#334155]/50 flex items-end justify-between">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Current Balance</p>
                      <p className={`font-bold text-2xl ${account.balance >= 0 ? 'text-white' : 'text-red-500'}`}>
                        Rp {formatCurrency(account.balance)}
                      </p>
                    </div>
                    {!account.is_asset && (
                      <span className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-500 text-xs font-bold border border-amber-500/20">
                        DEBT
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Account Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0F172A]/80 backdrop-blur-sm transition-opacity" onClick={() => setShowForm(false)} />

          <div className="relative w-full max-w-lg bg-[#1E293B] rounded-3xl overflow-hidden animate-slideUp shadow-2xl ring-1 ring-white/10">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#334155]/50 bg-[#1E293B]/50 backdrop-blur-md">
              <button onClick={() => setShowForm(false)} className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors rounded-xl hover:bg-white/5">
                <X className="w-6 h-6" />
              </button>
              <span className="text-lg font-bold text-white">New Account</span>
              <div className="w-10" />
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-xs text-slate-400 mb-2 uppercase tracking-wider font-bold">Account Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Main Savings"
                  className="w-full bg-[#0F172A] rounded-xl px-4 py-3.5 text-sm text-white border border-[#334155]/50 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-600 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-2 uppercase tracking-wider font-bold">Account Type</label>
                <div className="grid grid-cols-3 gap-3">
                  {ACCOUNT_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: type.value })}
                      className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                        formData.type === type.value 
                          ? "bg-blue-500/10 border-blue-500 text-blue-500 shadow-lg shadow-blue-500/10" 
                          : "bg-[#0F172A] border-transparent text-slate-400 hover:bg-[#334155]/30 hover:text-white"
                      }`}
                    >
                      <type.icon className="w-5 h-5" />
                      <span className="text-[10px] font-bold">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs text-slate-400 mb-2 uppercase tracking-wider font-bold">Initial Balance</label>
                  <div className="flex items-center bg-[#0F172A] rounded-xl px-4 border border-[#334155]/50 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
                    <span className="text-slate-500 mr-2 font-medium">Rp</span>
                    <input
                      type="number"
                      value={formData.initialBalance}
                      onChange={(e) => setFormData({ ...formData, initialBalance: e.target.value })}
                      placeholder="0"
                      className="w-full bg-transparent py-3.5 text-sm text-white border-none focus:outline-none placeholder:text-slate-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-2 uppercase tracking-wider font-bold">Institution</label>
                  <input
                    type="text"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    placeholder="e.g., BCA"
                    className="w-full bg-[#0F172A] rounded-xl px-4 py-3.5 text-sm text-white border border-[#334155]/50 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-3 uppercase tracking-wider font-bold">Color Tag</label>
                <div className="flex flex-wrap gap-3">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-10 h-10 rounded-full transition-transform shadow-lg ${
                        formData.color === color ? "scale-110 ring-2 ring-white ring-offset-2 ring-offset-[#1E293B]" : "hover:scale-105 opacity-80 hover:opacity-100"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <button 
                onClick={handleSubmit} 
                disabled={formLoading} 
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
              >
                {formLoading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Create Account
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { getDebts, createDebt, settleDebt, deleteDebt, type Debt } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { 
  Banknote, 
  Plus, 
  Trash2, 
  CheckCircle,
  X,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";


export default function DebtsPage() {
  const { getToken } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'owed' | 'owe'>('owe');
  
  const [formData, setFormData] = useState({
    personName: "",
    amount: "",
    description: "",
    dueDate: "",
    type: "owe" as "owe" | "owed", // "owe" = I owe someone (negative), "owed" = Someone owes me (positive)
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(amount));
  };

  const fetchData = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const data = await getDebts(token);
      setDebts(data.debts || []);
    } catch (error) {
      console.error("Error:", error);
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [getToken, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      const token = await getToken();
      if (!token) return;

      // If "owe", amount is negative. If "owed", amount is positive.
      const amount = parseFloat(formData.amount) * (formData.type === 'owe' ? -1 : 1);

      await createDebt(token, {
        personName: formData.personName,
        amount: amount,
        description: formData.description,
        dueDate: formData.dueDate || undefined,
      });

      toast.success(t('common.create') + " Success");
      setShowForm(false);
      setFormData({ personName: "", amount: "", description: "", dueDate: "", type: "owe" });
      fetchData();
    } catch (error) {
      console.error("Error:", error);
      toast.error(t('common.error'));
    } finally {
      setFormLoading(false);
    }
  };

  const handleSettle = async (id: string) => {
    if (!confirm("Mark this debt as fully settled?")) return;
    try {
      const token = await getToken();
      if (!token) return;
      await settleDebt(token, id);
      toast.success("Settled!");
      fetchData();
    } catch (error) {
      console.error("Error:", error);
      toast.error(t('common.error'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('common.delete') + "?")) return;
    try {
      const token = await getToken();
      if (!token) return;
      await deleteDebt(token, id);
      toast.success(t('common.delete') + " Success");
      fetchData();
    } catch (error) {
      console.error("Error:", error);
      toast.error(t('common.error'));
    }
  };

  const filteredDebts = debts.filter(d => 
    activeTab === 'owe' ? d.amount < 0 : d.amount > 0
  );

  if (loading) {
    return (
      <div className="space-y-8 pb-32 md:pb-12 max-w-[1600px] mx-auto px-6 md:px-10">
        <div className="flex items-center justify-between pt-4">
          <div>
            <div className="h-10 w-48 bg-white/10 rounded-xl animate-pulse mb-2" />
            <div className="h-4 w-32 bg-white/5 rounded animate-pulse" />
          </div>
          <div className="h-12 w-32 bg-white/10 rounded-2xl animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <DebtCardSkeleton />
          <DebtCardSkeleton />
          <DebtCardSkeleton />
        </div>
      </div>
    );
  }



  return (
    <div className="space-y-8 pb-32 md:pb-12 max-w-[1600px] mx-auto px-6 md:px-10">
      {/* Header */}
      <div className="flex items-center justify-between pt-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-[var(--accent-color)]/10 rounded-xl">
              <Banknote className="w-8 h-8 text-[var(--accent-color)]" />
            </div>
            {t('nav.debts')}
          </h1>
          <p className="text-slate-400 mt-1 ml-14">Track who owes you and who you owe</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[var(--accent-color)] hover:bg-[var(--accent-color-hover)] text-white rounded-2xl font-semibold shadow-lg shadow-[var(--accent-color)]/20 hover:shadow-[var(--accent-color)]/40 hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Add Record</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-[var(--color-surface-elevated)] rounded-2xl w-fit border border-white/5">
        <button
          onClick={() => setActiveTab('owe')}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'owe' 
              ? "bg-[var(--color-surface)] text-red-400 shadow-sm border border-white/5" 
              : "text-slate-400 hover:text-white"
          }`}
        >
          I Owe (Payables)
        </button>
        <button
          onClick={() => setActiveTab('owed')}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'owed' 
              ? "bg-[var(--color-surface)] text-emerald-400 shadow-sm border border-white/5" 
              : "text-slate-400 hover:text-white"
          }`}
        >
          Owed to Me (Receivables)
        </button>
      </div>

      {/* Debts Grid */}
      {filteredDebts.length === 0 ? (
        <div className="bg-[var(--color-surface-elevated)] rounded-3xl p-16 text-center border border-dashed border-white/5">
          <div className="w-20 h-20 bg-[var(--color-surface)] rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
            <CheckCircle className="w-10 h-10 text-slate-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">All clear!</h3>
          <p className="text-slate-400 max-w-sm mx-auto">
            {activeTab === 'owe' ? "You don't owe anyone anything." : "No one owes you anything right now."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDebts.map((debt) => (
            <div key={debt.id} className="apple-card p-6 rounded-3xl relative overflow-hidden group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border ${
                    debt.amount < 0 
                      ? "bg-red-500/10 border-red-500/20 text-red-500" 
                      : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                  }`}>
                    {debt.amount < 0 ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-500" />
                      {debt.person_name}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">{debt.description || "No description"}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(debt.id)}
                  className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Amount</p>
                  <p className={`text-3xl font-bold ${debt.amount < 0 ? "text-red-500" : "text-emerald-500"}`}>
                    Rp {formatCurrency(debt.amount)}
                  </p>
                </div>

                {debt.due_date && (
                  <div className="flex items-center gap-2 text-slate-400 text-sm bg-[var(--color-surface)] p-2 rounded-lg border border-white/5 w-fit">
                    <Calendar className="w-4 h-4" />
                    Due: {new Date(debt.due_date).toLocaleDateString()}
                  </div>
                )}

                {!debt.is_settled && (
                  <button
                    onClick={() => handleSettle(debt.id)}
                    className="w-full py-3 bg-white/5 hover:bg-[#2d3b4b] text-white rounded-xl font-semibold border border-white/5 transition-all flex items-center justify-center gap-2 mt-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark as Settled
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Debt Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4">
          <div className="absolute inset-0 bg-[var(--color-surface)]/80 backdrop-blur-sm transition-opacity" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-lg bg-[var(--color-surface-elevated)] rounded-3xl overflow-hidden animate-slideUp shadow-2xl ring-1 ring-white/10">
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-[var(--color-surface-elevated)]/50 backdrop-blur-md">
              <button onClick={() => setShowForm(false)} className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors rounded-xl hover:bg-white/5">
                <X className="w-6 h-6" />
              </button>
              <span className="text-lg font-bold text-white">Add Record</span>
              <div className="w-10" />
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'owe' })}
                  className={`p-4 rounded-xl border text-center transition-all ${
                    formData.type === 'owe' 
                      ? "bg-red-500/10 border-red-500 text-red-500" 
                      : "bg-[var(--color-surface)] border-white/5 text-slate-400 hover:bg-white/5"
                  }`}
                >
                  <p className="font-bold">I Owe</p>
                  <p className="text-xs opacity-70">(Payable)</p>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'owed' })}
                  className={`p-4 rounded-xl border text-center transition-all ${
                    formData.type === 'owed' 
                      ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" 
                      : "bg-[var(--color-surface)] border-white/5 text-slate-400 hover:bg-white/5"
                  }`}
                >
                  <p className="font-bold">Owed to Me</p>
                  <p className="text-xs opacity-70">(Receivable)</p>
                </button>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-2 uppercase tracking-wider font-bold">Person Name</label>
                <input
                  type="text"
                  value={formData.personName}
                  onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
                  placeholder="e.g., John Doe"
                  className="w-full bg-[var(--color-surface)] rounded-xl px-4 py-3.5 text-sm text-white border border-white/5 focus:border-[var(--accent-color)] focus:ring-4 focus:ring-[var(--accent-color)]/10 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-2 uppercase tracking-wider font-bold">Amount</label>
                <div className="flex items-center bg-[var(--color-surface)] rounded-xl px-4 border border-white/5 focus-within:border-[var(--accent-color)] focus-within:ring-4 focus-within:ring-[var(--accent-color)]/10 transition-all">
                  <span className="text-slate-500 mr-2 font-medium">Rp</span>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0"
                    className="w-full bg-transparent py-3.5 text-sm text-white border-none focus:outline-none placeholder:text-slate-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-2 uppercase tracking-wider font-bold">Due Date (Optional)</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full bg-[var(--color-surface)] rounded-xl px-4 py-3.5 text-sm text-white border border-white/5 focus:border-[var(--accent-color)] focus:ring-4 focus:ring-[var(--accent-color)]/10 transition-all"
                />
              </div>

              <button 
                disabled={formLoading} 
                className="w-full py-4 bg-[var(--accent-color)] hover:bg-[var(--accent-color-hover)] text-white rounded-2xl font-bold text-lg shadow-lg shadow-[var(--accent-color)]/20 hover:shadow-[var(--accent-color)]/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
              >
                {formLoading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Save Record"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Debt Card Skeleton
function DebtCardSkeleton() {
  return (
    <div className="premium-card p-6 rounded-3xl animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white/10" />
          <div>
            <div className="h-5 w-28 bg-white/10 rounded mb-2" />
            <div className="h-3 w-20 bg-white/5 rounded" />
          </div>
        </div>
        <div className="w-8 h-8 bg-white/5 rounded-xl" />
      </div>
      <div className="pt-4 border-t border-white/5">
        <div className="h-7 w-32 bg-white/10 rounded" />
      </div>
    </div>
  );
}

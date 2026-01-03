"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { getBudgets, getCategories, createBudget, deleteBudget, type Budget, type Category } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { 
  PieChart, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  CheckCircle,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";


export default function BudgetsPage() {
  const { getToken } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    categoryId: "",
    amount: "",
    alertThreshold: "80",
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

      const [budgetData, categoryData] = await Promise.all([
        getBudgets(token),
        getCategories(token)
      ]);

      setBudgets(budgetData || []);
      setCategories(categoryData.filter(c => c.type === 'expense') || []);
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
    if (!formData.categoryId || !formData.amount) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setFormLoading(true);
      const token = await getToken();
      if (!token) return;

      await createBudget(token, {
        categoryId: parseInt(formData.categoryId),
        amount: parseFloat(formData.amount),
        alertThreshold: parseInt(formData.alertThreshold),
      });

      toast.success(t('common.create') + " Success");
      setShowForm(false);
      setFormData({ categoryId: "", amount: "", alertThreshold: "80" });
      fetchData();
    } catch (error) {
      console.error("Error:", error);
      toast.error(t('common.error'));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('common.delete') + "?")) return;
    try {
      const token = await getToken();
      if (!token) return;
      await deleteBudget(token, id);
      toast.success(t('common.delete') + " Success");
      fetchData();
    } catch (error) {
      console.error("Error:", error);
      toast.error(t('common.error'));
    }
  };


// Budget Card Skeleton
function BudgetCardSkeleton() {
  return (
    <div className="premium-card p-6 rounded-3xl animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/10" />
          <div>
            <div className="h-5 w-24 bg-white/10 rounded mb-2" />
            <div className="h-3 w-32 bg-white/5 rounded" />
          </div>
        </div>
        <div className="w-8 h-8 bg-white/5 rounded-xl" />
      </div>
      <div className="space-y-3">
        <div className="flex justify-between">
          <div className="h-3 w-20 bg-white/5 rounded" />
          <div className="h-3 w-16 bg-white/10 rounded" />
        </div>
        <div className="h-2.5 w-full bg-white/5 rounded-full" />
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
              <PieChart className="w-8 h-8 text-[var(--accent-color)]" />
            </div>
            {t('nav.budgeting')}
          </h1>
          <p className="text-slate-400 mt-1 ml-14">Manage your monthly spending limits</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[var(--accent-color)] hover:bg-[var(--accent-color-hover)] text-white rounded-2xl font-semibold shadow-lg shadow-[var(--accent-color)]/20 hover:shadow-[var(--accent-color)]/40 hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Add Budget</span>
        </button>
      </div>

      {/* Budgets Grid with Progressive Loading */}
      <AnimatePresence mode="wait">
        {loading ? (
          <div key="budget-skeleton" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <BudgetCardSkeleton />
            <BudgetCardSkeleton />
            <BudgetCardSkeleton />
          </div>
        ) : budgets.length === 0 ? (
          <motion.div 
            key="budget-empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="premium-card rounded-3xl p-16 text-center"
          >
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
              <PieChart className="w-10 h-10 text-zinc-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No budgets set</h3>
            <p className="text-zinc-500 max-w-sm mx-auto mb-4">Create a budget to track your spending and save more.</p>
            <button 
              onClick={() => setShowForm(true)}
              className="text-[var(--accent-color)] text-sm font-medium hover:opacity-80 transition-opacity"
            >
              + Create Budget
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="budget-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {budgets.map((budget, index) => (
              <motion.div
                key={budget.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="premium-card p-6 rounded-3xl relative overflow-hidden group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-[var(--color-surface)] border border-white/5">
                    {budget.categories?.icon || "💰"}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">{budget.categories?.name}</h3>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Monthly</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(budget.id)}
                  className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Spent</span>
                    <span className="text-white font-bold">Rp {formatCurrency(budget.spent)}</span>
                  </div>
                  <div className="w-full bg-[var(--color-surface)] rounded-full h-3 border border-white/5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        budget.isOverBudget ? "bg-red-500" : 
                        budget.isNearLimit ? "bg-yellow-500" : "bg-[var(--accent-color)]"
                      }`}
                      style={{ width: `${Math.min(budget.percentUsed, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-end pt-2 border-t border-white/5">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Remaining</p>
                    <p className={`font-bold text-xl ${budget.remaining < 0 ? "text-red-500" : "text-emerald-500"}`}>
                      Rp {formatCurrency(budget.remaining)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 mb-1">Limit</p>
                    <p className="font-bold text-white">Rp {formatCurrency(budget.amount)}</p>
                  </div>
                </div>

                {budget.isOverBudget && (
                  <div className="flex items-center gap-2 text-red-400 text-xs font-bold bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                    <AlertTriangle className="w-4 h-4" />
                    Over Budget!
                  </div>
                )}
              </div>
            </div>
                </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Budget Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4">
          <div className="absolute inset-0 bg-[var(--color-surface)]/80 backdrop-blur-sm transition-opacity" onClick={() => setShowForm(false)} />

          <div className="relative w-full max-w-lg bg-[var(--color-surface-elevated)] rounded-3xl overflow-hidden animate-slideUp shadow-2xl ring-1 ring-white/10">
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-[var(--color-surface-elevated)]/50 backdrop-blur-md">
              <button onClick={() => setShowForm(false)} className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors rounded-xl hover:bg-white/5">
                <X className="w-6 h-6" />
              </button>
              <span className="text-lg font-bold text-white">New Budget</span>
              <div className="w-10" />
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-xs text-slate-400 mb-2 uppercase tracking-wider font-bold">Category</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full bg-[var(--color-surface)] rounded-xl px-4 py-3.5 text-sm text-white border border-white/5 focus:border-[var(--accent-color)] focus:ring-4 focus:ring-[var(--accent-color)]/10 transition-all appearance-none"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-2 uppercase tracking-wider font-bold">Monthly Limit</label>
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
                <label className="block text-xs text-slate-400 mb-2 uppercase tracking-wider font-bold">Alert Threshold (%)</label>
                <input
                  type="range"
                  min="50"
                  max="100"
                  step="5"
                  value={formData.alertThreshold}
                  onChange={(e) => setFormData({ ...formData, alertThreshold: e.target.value })}
                  className="w-full h-2 bg-[var(--color-surface)] rounded-lg appearance-none cursor-pointer accent-[var(--accent-color)]"
                />
                <div className="text-right text-sm text-[var(--accent-color)] font-bold mt-1">{formData.alertThreshold}%</div>
              </div>

              <button 
                disabled={formLoading} 
                className="w-full py-4 bg-[var(--accent-color)] hover:bg-[var(--accent-color-hover)] text-white rounded-2xl font-bold text-lg shadow-lg shadow-[var(--accent-color)]/20 hover:shadow-[var(--accent-color)]/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
              >
                {formLoading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Create Budget
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

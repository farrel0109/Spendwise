"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { getGoals, createGoal, contributeToGoal, deleteGoal, type SavingsGoal } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { 
  Target, 
  Plus, 
  Trash2, 
  Trophy, 
  CheckCircle,
  X,
  Plane,
  Car,
  Home,
  Smartphone,
  Gift,
  TrendingUp
} from "lucide-react";

const ICONS = [
  { name: "Target", icon: Target },
  { name: "Travel", icon: Plane },
  { name: "Car", icon: Car },
  { name: "Home", icon: Home },
  { name: "Gadget", icon: Smartphone },
  { name: "Gift", icon: Gift },
  { name: "Invest", icon: TrendingUp },
];

const COLORS = [
  "#007bff", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"
];

export default function GoalsPage() {
  const { getToken } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showContribute, setShowContribute] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    targetAmount: "",
    targetDate: "",
    icon: "Target",
    color: COLORS[0],
  });

  const [contributeAmount, setContributeAmount] = useState("");

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
      const data = await getGoals(token);
      setGoals(data || []);
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

      await createGoal(token, {
        name: formData.name,
        targetAmount: parseFloat(formData.targetAmount),
        targetDate: formData.targetDate || undefined,
        icon: formData.icon,
        color: formData.color,
      });

      toast.success(t('common.create') + " Success");
      setShowForm(false);
      setFormData({ name: "", targetAmount: "", targetDate: "", icon: "Target", color: COLORS[0] });
      fetchData();
    } catch (error) {
      console.error("Error:", error);
      toast.error(t('common.error'));
    } finally {
      setFormLoading(false);
    }
  };

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showContribute || !contributeAmount) return;

    try {
      setFormLoading(true);
      const token = await getToken();
      if (!token) return;

      await contributeToGoal(token, showContribute, parseFloat(contributeAmount));
      toast.success("Contribution added!");
      setShowContribute(null);
      setContributeAmount("");
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
      await deleteGoal(token, id);
      toast.success(t('common.delete') + " Success");
      fetchData();
    } catch (error) {
      console.error("Error:", error);
      toast.error(t('common.error'));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#007bff] border-t-transparent shadow-lg shadow-[#007bff]/20"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-32 md:pb-12 max-w-[1600px] mx-auto px-6 md:px-10">
      {/* Header */}
      <div className="flex items-center justify-between pt-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-[#007bff]/10 rounded-xl">
              <Target className="w-8 h-8 text-[#007bff]" />
            </div>
            {t('nav.goals')}
          </h1>
          <p className="text-slate-400 mt-1 ml-14">Save for your dreams</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#007bff] hover:bg-[#0056b3] text-white rounded-2xl font-semibold shadow-lg shadow-[#007bff]/20 hover:shadow-[#007bff]/40 hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>New Goal</span>
        </button>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <div className="bg-[#18222d] rounded-3xl p-16 text-center border border-dashed border-[#232e3b]">
          <div className="w-20 h-20 bg-[#0f1923] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#232e3b]">
            <Trophy className="w-10 h-10 text-slate-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No goals yet</h3>
          <p className="text-slate-400 max-w-sm mx-auto">Set a financial goal to stay motivated.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const Icon = ICONS.find(i => i.name === goal.icon)?.icon || Target;
            
            return (
              <div key={goal.id} className="apple-card p-6 rounded-3xl relative overflow-hidden group flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: goal.color }}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1">
                  <h3 className="font-bold text-white text-xl mb-1">{goal.name}</h3>
                  <p className="text-slate-400 text-sm mb-4">
                    Target: Rp {formatCurrency(goal.target_amount)}
                  </p>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-slate-300">
                      <span>Rp {formatCurrency(goal.current_amount)}</span>
                      <span>{Math.round(goal.progress)}%</span>
                    </div>
                    <div className="w-full bg-[#0f1923] rounded-full h-3 border border-[#232e3b] overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500 relative"
                        style={{ width: `${Math.min(goal.progress, 100)}%`, backgroundColor: goal.color }}
                      >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-full bg-white/50 rounded-r-full"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowContribute(goal.id)}
                  className="mt-6 w-full py-3 bg-[#232e3b] hover:bg-[#2d3b4b] text-white rounded-xl font-semibold border border-white/5 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Savings
                </button>

                {goal.is_completed && (
                  <div className="absolute inset-0 bg-[#0f1923]/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 animate-fadeIn">
                    <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-yellow-500/50 animate-bounce">
                      <Trophy className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Goal Reached!</h3>
                    <p className="text-slate-300">Congratulations on saving Rp {formatCurrency(goal.target_amount)}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Goal Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0f1923]/80 backdrop-blur-sm transition-opacity" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-lg bg-[#18222d] rounded-3xl overflow-hidden animate-slideUp shadow-2xl ring-1 ring-white/10">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#232e3b] bg-[#18222d]/50 backdrop-blur-md">
              <button onClick={() => setShowForm(false)} className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors rounded-xl hover:bg-white/5">
                <X className="w-6 h-6" />
              </button>
              <span className="text-lg font-bold text-white">New Goal</span>
              <div className="w-10" />
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-xs text-slate-400 mb-2 uppercase tracking-wider font-bold">Goal Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., New Laptop"
                  className="w-full bg-[#0f1923] rounded-xl px-4 py-3.5 text-sm text-white border border-[#232e3b] focus:border-[#007bff] focus:ring-4 focus:ring-[#007bff]/10 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-2 uppercase tracking-wider font-bold">Target Amount</label>
                <div className="flex items-center bg-[#0f1923] rounded-xl px-4 border border-[#232e3b] focus-within:border-[#007bff] focus-within:ring-4 focus-within:ring-[#007bff]/10 transition-all">
                  <span className="text-slate-500 mr-2 font-medium">Rp</span>
                  <input
                    type="number"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    placeholder="0"
                    className="w-full bg-transparent py-3.5 text-sm text-white border-none focus:outline-none placeholder:text-slate-600"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-3 uppercase tracking-wider font-bold">Icon & Color</label>
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {ICONS.map((item) => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: item.name })}
                      className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                        formData.icon === item.name 
                          ? "bg-[#007bff]/10 border-[#007bff] text-[#007bff]" 
                          : "bg-[#0f1923] border-transparent text-slate-400 hover:bg-[#232e3b]"
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="text-[10px] font-bold">{item.name}</span>
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 rounded-full transition-transform shadow-lg ${
                        formData.color === color ? "scale-110 ring-2 ring-white ring-offset-2 ring-offset-[#18222d]" : "hover:scale-105 opacity-80"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <button 
                disabled={formLoading} 
                className="w-full py-4 bg-[#007bff] hover:bg-[#0056b3] text-white rounded-2xl font-bold text-lg shadow-lg shadow-[#007bff]/20 hover:shadow-[#007bff]/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
              >
                {formLoading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Create Goal"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Contribute Modal */}
      {showContribute && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0f1923]/80 backdrop-blur-sm transition-opacity" onClick={() => setShowContribute(null)} />
          <div className="relative w-full max-w-sm bg-[#18222d] rounded-3xl overflow-hidden animate-slideUp shadow-2xl ring-1 ring-white/10 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Add Savings</h3>
            <form onSubmit={handleContribute}>
              <div className="flex items-center bg-[#0f1923] rounded-xl px-4 border border-[#232e3b] focus-within:border-[#007bff] focus-within:ring-4 focus-within:ring-[#007bff]/10 transition-all mb-4">
                <span className="text-slate-500 mr-2 font-medium">Rp</span>
                <input
                  type="number"
                  value={contributeAmount}
                  onChange={(e) => setContributeAmount(e.target.value)}
                  placeholder="0"
                  className="w-full bg-transparent py-3.5 text-sm text-white border-none focus:outline-none placeholder:text-slate-600"
                  autoFocus
                  required
                />
              </div>
              <button 
                disabled={formLoading} 
                className="w-full py-3 bg-[#007bff] hover:bg-[#0056b3] text-white rounded-xl font-bold shadow-lg shadow-[#007bff]/20 transition-all disabled:opacity-50"
              >
                {formLoading ? "Saving..." : "Confirm"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { getTrends, getPatterns, getHealthScore, type HealthScore } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Activity,
  Calendar,
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart as RePieChart,
  Pie
} from "recharts";

const COLORS = ["#007bff", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

// Types for API responses
interface TrendData {
  month: string;
  income: number;
  expense: number;
  net_savings: number;
  [key: string]: string | number;
}

interface PatternData {
  category_name: string;
  total_amount: number;
  percentage: number;
  [key: string]: string | number;
}

export default function AnalyticsPage() {
  const { getToken } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [patterns, setPatterns] = useState<PatternData[]>([]);
  const [healthScore, setHealthScore] = useState<HealthScore | null>(null);
  const [period, setPeriod] = useState("6"); // months

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

      const [trendsData, patternsData, healthData] = await Promise.all([
        getTrends(token, parseInt(period)),
        getPatterns(token),
        getHealthScore(token)
      ]);

      setTrends(trendsData.trends || []);
      setPatterns(patternsData.byCategory || []);
      setHealthScore(healthData);
    } catch (error) {
      console.error("Error:", error);
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [getToken, period, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
              <BarChart3 className="w-8 h-8 text-[#007bff]" />
            </div>
            {t('nav.analytics')}
          </h1>
          <p className="text-slate-400 mt-1 ml-14">Deep dive into your financial habits</p>
        </div>
        
        <div className="flex items-center gap-2 bg-[#18222d] p-1 rounded-xl border border-[#232e3b]">
          {["3", "6", "12"].map((m) => (
            <button
              key={m}
              onClick={() => setPeriod(m)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                period === m 
                  ? "bg-[#007bff] text-white shadow-lg shadow-[#007bff]/20" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {m}M
            </button>
          ))}
        </div>
      </div>

      {/* Health Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="apple-card p-6 rounded-3xl relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-500" />
              Financial Health
            </h3>
            <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
              healthScore?.grade === 'A' ? 'bg-emerald-500/10 text-emerald-500' :
              healthScore?.grade === 'B' ? 'bg-blue-500/10 text-blue-500' :
              'bg-yellow-500/10 text-yellow-500'
            }`}>
              Grade {healthScore?.grade || 'N/A'}
            </span>
          </div>
          <div className="flex items-end gap-4">
            <p className="text-5xl font-black text-white">{healthScore?.score || 0}</p>
            <p className="text-slate-400 mb-2 font-medium">/ 100 Points</p>
          </div>
          <div className="mt-4 space-y-2">
            {healthScore?.tips.slice(0, 2).map((tip, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-slate-300 bg-[#0f1923] p-2 rounded-lg border border-[#232e3b]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#007bff] mt-1.5 shrink-0" />
                {tip}
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 apple-card p-6 rounded-3xl relative overflow-hidden">
          <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#007bff]" />
            Income vs Expense Trend
          </h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18222d', border: '1px solid #232e3b', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: number | undefined) => [`Rp ${formatCurrency(value || 0)}`, ''] as [string, string]}
                />
                <Area type="monotone" dataKey="income" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" name="Income" />
                <Area type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" name="Expense" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Spending Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="apple-card p-6 rounded-3xl">
          <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-purple-500" />
            Spending by Category
          </h3>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={patterns}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="total_amount"
                >
                  {patterns.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18222d', border: '1px solid #232e3b', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: number | undefined) => [`Rp ${formatCurrency(value || 0)}`, ''] as [string, string]}
                />
              </RePieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {patterns.slice(0, 6).map((entry, index) => (
              <div key={index} className="flex items-center gap-2 text-xs text-slate-400">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="truncate">{entry.category_name}</span>
                <span className="ml-auto font-bold text-white">{Math.round(entry.percentage)}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="apple-card p-6 rounded-3xl">
          <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-500" />
            Monthly Summary
          </h3>
          <div className="space-y-4">
            {trends.slice(-5).reverse().map((month, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-[#0f1923] border border-[#232e3b]">
                <div>
                  <p className="text-white font-bold">{month.month}</p>
                  <p className="text-xs text-slate-500">Net: Rp {formatCurrency(month.net_savings)}</p>
                </div>
                <div className="flex gap-4 text-right">
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">In</p>
                    <p className="text-emerald-500 font-bold text-sm">+Rp {formatCurrency(month.income)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">Out</p>
                    <p className="text-red-500 font-bold text-sm">-Rp {formatCurrency(month.expense)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

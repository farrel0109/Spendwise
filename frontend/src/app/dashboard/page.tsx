"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  syncUser,
  getAccounts,
  getTransactions,
  getGoals,
  getBudgets,
  getCurrentNetWorth,
  getUserStats,
  type Account,
  type Transaction,
  type SavingsGoal,
  type Budget,
  type UserStats,
} from "@/lib/api";
import QuickAddFAB from "@/components/dashboard/QuickAddFAB";
import { useLanguage } from "@/context/LanguageContext";
import { usePrivacy } from "@/context/PrivacyContext";
import { 
  TrendingUp, 
  Wallet, 
  ArrowRight, 
  Smile,
  Info,
  CreditCard,
  Plane,
  Target
} from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";

interface NetWorthData {
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
}

const MOCK_CHART_DATA = [
  { name: 'Mon', value: 138000 },
  { name: 'Tue', value: 139500 },
  { name: 'Wed', value: 138800 },
  { name: 'Thu', value: 140200 },
  { name: 'Fri', value: 141500 },
  { name: 'Sat', value: 142050 },
  { name: 'Sun', value: 142050 },
];

export default function Dashboard() {
  const { getToken } = useAuth();
  const { user, isLoaded } = useUser();
  const { t } = useLanguage();
  const { isPrivacyMode } = usePrivacy();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [netWorth, setNetWorth] = useState<NetWorthData | null>(null);

  const formatCurrency = (amount: number) => {
    if (isPrivacyMode) return "••••••";
    return new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(amount));
  };

  // Ref to track if we've already synced user to prevent 429s
  const hasSyncedUser = useRef(false);

  const fetchData = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;

      // Only sync user once per session/mount
      if (!hasSyncedUser.current) {
        await syncUser(token, {
          email: user?.primaryEmailAddress?.emailAddress,
          fullName: user?.fullName || undefined,
          avatarUrl: user?.imageUrl,
        });
        hasSyncedUser.current = true;
      }

      const [accountsData, txnData, goalsData, budgetsData, statsData, netWorthData] = await Promise.all([
        getAccounts(token).catch(() => ({ accounts: [] })),
        getTransactions(token, { limit: 5 }).catch(() => ({ transactions: [] })),
        getGoals(token).catch(() => []),
        getBudgets(token).catch(() => []),
        getUserStats(token).catch(() => null),
        getCurrentNetWorth(token).catch(() => null),
      ]);

      setAccounts(accountsData?.accounts || []);
      setTransactions(txnData?.transactions || []);
      setGoals(goalsData || []);
      setBudgets(budgetsData || []);
      setStats(statsData);
      setNetWorth(netWorthData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [getToken, user, t]);

  useEffect(() => {
    if (isLoaded && user) {
      fetchData();
    }
  }, [isLoaded, user, fetchData]);

  // Calculate Budget Summary
  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const budgetLeft = totalBudget - totalSpent;
  const budgetProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  // Top Goal
  const topGoal = goals.sort((a, b) => b.progress - a.progress)[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#007bff] border-t-transparent shadow-lg shadow-[#007bff]/20"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 scroll-smooth pb-32">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Net Worth Card (Large) */}
          <div className="col-span-1 md:col-span-8 apple-card rounded-2xl p-6 relative overflow-hidden group">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider">{t('dashboard.netWorth')}</h3>
                  <Info className="w-4 h-4 text-slate-500 cursor-help" />
                </div>
                <div className="flex items-baseline gap-3">
                  <p className="text-4xl md:text-5xl font-black text-white tracking-tight">
                    Rp {formatCurrency(netWorth?.netWorth || 0)}
                  </p>
                  <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-500/10 text-green-400 text-sm font-bold border border-green-500/20">
                    <TrendingUp className="w-4 h-4 mr-0.5" />
                    +5.2%
                  </span>
                </div>
              </div>
              <div className="mt-4 md:mt-0">
                <div className="flex gap-4">
                  <button className="text-xs font-medium text-white bg-white/10 px-3 py-1.5 rounded-full hover:bg-white/20 transition-colors">1D</button>
                  <button className="text-xs font-medium text-white bg-[#007bff] px-3 py-1.5 rounded-full shadow-lg shadow-[#007bff]/20">1W</button>
                  <button className="text-xs font-medium text-slate-400 hover:text-white px-3 py-1.5 rounded-full transition-colors">1M</button>
                  <button className="text-xs font-medium text-slate-400 hover:text-white px-3 py-1.5 rounded-full transition-colors">1Y</button>
                </div>
              </div>
            </div>
            
            {/* Chart Area */}
            <div className="h-48 w-full relative z-10 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_CHART_DATA}>
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#007bff" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#007bff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#007bff" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#chartGradient)" 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e2936', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                    formatter={(value: number | undefined) => [`Rp ${formatCurrency(value || 0)}`, 'Net Worth'] as [string, string]}
                    labelStyle={{ display: 'none' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            {/* Background glow effect */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#007bff]/20 blur-3xl rounded-full pointer-events-none"></div>
          </div>

          {/* Budget/Income Card (Medium) */}
          <div className="col-span-1 md:col-span-4 apple-card rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">{t('dashboard.budget')}</h3>
                <p className="text-2xl font-bold text-white tracking-tight">{t('dashboard.leftToSpend')}</p>
              </div>
              <div className="bg-[#232e3b] p-2 rounded-lg border border-white/5">
                <Wallet className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <div className="flex items-center justify-center py-6">
              <div className="relative h-40 w-40">
                {/* Circular Progress Background */}
                <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                  <path className="text-white/5" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                  {/* Progress Value */}
                  <path 
                    className="text-[#007bff] drop-shadow-[0_0_10px_rgba(0,123,255,0.5)] transition-all duration-1000" 
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeDasharray={`${Math.min(budgetProgress, 100)}, 100`} 
                    strokeLinecap="round" 
                    strokeWidth="3"
                  ></path>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-white">Rp {formatCurrency(budgetLeft)}</span>
                  <span className="text-xs text-slate-400 font-medium">of Rp {formatCurrency(totalBudget)}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-2 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">{t('dashboard.projectedSavings')}</span>
                <span className="text-white font-semibold">Rp {formatCurrency(budgetLeft * 0.8)}</span>
              </div>
              <div className="w-full bg-[#232e3b] rounded-full h-1.5">
                <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
          </div>

          {/* Row 2: Accounts & Goals */}
          <div className="col-span-1 md:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Accounts (2/3 width) */}
            <div className="col-span-1 md:col-span-2 space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-white font-bold text-lg">{t('dashboard.myAccounts')}</h3>
                <button onClick={() => router.push("/dashboard/accounts")} className="text-[#007bff] text-sm font-medium hover:text-[#0056b3] transition-colors">{t('dashboard.addNew')}</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {accounts.slice(0, 2).map((account, idx) => (
                  <div 
                    key={account.id} 
                    className="group relative h-48 rounded-2xl p-6 flex flex-col justify-between border border-white/10 transition-transform hover:-translate-y-1 overflow-hidden cursor-pointer"
                    style={{ 
                      backgroundImage: idx === 0 
                        ? 'linear-gradient(135deg, #2b303b 0%, #1e2329 100%)' 
                        : 'linear-gradient(135deg, #101418 0%, #000000 100%)' 
                    }}
                  >
                    <div className="flex justify-between items-start z-10">
                      <div className="h-8 w-12 bg-white/10 rounded flex items-center justify-center backdrop-blur-sm border border-white/5">
                        <div className="w-3 h-3 rounded-full bg-red-500 opacity-80 -mr-1"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500 opacity-80"></div>
                      </div>
                      <CreditCard className="text-white/50 w-6 h-6" />
                    </div>
                    <div className="z-10">
                      <p className="text-slate-400 text-sm font-medium mb-1 capitalize">{account.type.replace('_', ' ')}</p>
                      <p className="text-white text-2xl font-bold tracking-tight truncate">{account.name}</p>
                    </div>
                    <div className="flex justify-between items-end z-10">
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">{t('dashboard.balance')}</p>
                        <p className="text-white text-xl font-bold">Rp {formatCurrency(account.balance)}</p>
                      </div>
                      <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center">
                        <ArrowRight className="text-black w-4 h-4 font-bold" />
                      </div>
                    </div>
                    {/* Decoration */}
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Goals / Gamification (1/3 width) */}
            <div className="col-span-1 md:col-span-1 flex flex-col h-full">
              <div className="flex items-center justify-between px-1 mb-4">
                <h3 className="text-white font-bold text-lg">{t('dashboard.topGoal')}</h3>
              </div>
              <div className="flex-1 apple-card rounded-2xl p-6 flex flex-col justify-center items-center relative overflow-hidden text-center group">
                {topGoal ? (
                  <>
                    <div className="h-20 w-20 rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(251,191,36,0.4)] group-hover:scale-110 transition-transform duration-500" style={{ background: topGoal.color || '#F59E0B' }}>
                      <Target className="w-10 h-10 text-white" />
                    </div>
                    <h4 className="text-white text-xl font-bold mb-1">{topGoal.name}</h4>
                    <p className="text-slate-400 text-sm mb-6">Keep saving! You're almost halfway there.</p>
                    <div className="w-full space-y-2">
                      <div className="flex justify-between text-xs font-semibold text-slate-300">
                        <span>Rp {formatCurrency(topGoal.current_amount)}</span>
                        <span>Rp {formatCurrency(topGoal.target_amount)}</span>
                      </div>
                      <div className="w-full bg-[#232e3b] rounded-full h-3 border border-white/5">
                        <div 
                          className="h-full rounded-full relative transition-all duration-1000" 
                          style={{ width: `${Math.min(topGoal.progress, 100)}%`, background: topGoal.color || '#007bff' }}
                        >
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-full bg-white/50 rounded-r-full"></div>
                        </div>
                      </div>
                      <p className="text-right text-xs text-[#007bff] font-bold mt-1">{Math.round(topGoal.progress)}% {t('dashboard.funded')}</p>
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <div className="h-20 w-20 rounded-full bg-[#232e3b] flex items-center justify-center mb-4 mx-auto">
                      <Target className="w-10 h-10 text-slate-500" />
                    </div>
                    <h4 className="text-white text-lg font-bold mb-2">No Goals Yet</h4>
                    <button onClick={() => router.push("/dashboard/goals")} className="text-[#007bff] text-sm font-bold hover:underline">Create a Goal</button>
                  </div>
                )}
                
                {/* Confetti hint */}
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none"></div>
              </div>
            </div>

          </div>

          {/* Recent Transactions */}
          <div className="col-span-1 md:col-span-12 apple-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-bold text-lg">{t('dashboard.recentTransactions')}</h3>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 rounded-lg bg-[#232e3b] text-xs font-medium text-white border border-white/5 hover:bg-white/10 transition-colors">All</button>
                <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors">{t('common.expense')}</button>
                <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors">{t('common.income')}</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs text-slate-500 border-b border-white/5">
                    <th className="font-medium py-3 pl-2">Merchant</th>
                    <th className="font-medium py-3">Category</th>
                    <th className="font-medium py-3">Date</th>
                    <th className="font-medium py-3 text-center">Mood</th>
                    <th className="font-medium py-3 pr-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {transactions.map((txn) => (
                    <tr key={txn.id} className="group hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                      <td className="py-4 pl-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg shrink-0">
                            {txn.type === 'income' ? '💰' : '🛒'}
                          </div>
                          <div>
                            <p className="text-white font-medium">{txn.description || "Transaction"}</p>
                            <p className="text-slate-500 text-xs">{txn.accounts?.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-slate-400">{txn.categories?.name || "Uncategorized"}</td>
                      <td className="py-4 text-slate-400">
                        {new Date(txn.txn_date).toLocaleDateString(t('common.loading') === 'Memuat...' ? 'id-ID' : 'en-US', { month: "short", day: "numeric" })}
                      </td>
                      <td className="py-4 text-center">
                        {txn.emotion && (
                          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/5 text-slate-400 border border-white/10" title={txn.emotion}>
                            <Smile className="w-[18px] h-[18px]" />
                          </div>
                        )}
                      </td>
                      <td className={`py-4 pr-2 text-right font-bold ${txn.type === 'income' ? 'text-green-400' : 'text-white'}`}>
                        {txn.type === 'income' ? '+' : '-'}Rp {formatCurrency(txn.amount)}
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">{t('dashboard.noTransactions')}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-center">
              <button onClick={() => router.push("/dashboard/transactions")} className="text-sm text-[#007bff] font-medium hover:text-[#0056b3] transition-colors flex items-center gap-1">
                {t('dashboard.viewAll')} 
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* FAB */}
      <QuickAddFAB accounts={accounts} onSuccess={fetchData} />
    </div>
  );
}

"use client";

import { TrendingUp, Info } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";
import { TIME_PERIODS } from "@/constants";
import type { NetWorthData } from "@/types";

// Mock chart data - will be replaced with real data from API
const MOCK_CHART_DATA = [
  { name: 'Mon', value: 138000 },
  { name: 'Tue', value: 139500 },
  { name: 'Wed', value: 138800 },
  { name: 'Thu', value: 140200 },
  { name: 'Fri', value: 141500 },
  { name: 'Sat', value: 142050 },
  { name: 'Sun', value: 142050 },
];

interface NetWorthSectionProps {
  netWorth: NetWorthData | null;
  formatAmount: (amount: number) => string;
  t: (key: string) => string;
}

/**
 * Net Worth card with chart visualization
 * Premium design matching landing page aesthetic
 */
export function NetWorthSection({ netWorth, formatAmount, t }: NetWorthSectionProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="col-span-1 md:col-span-8 premium-card rounded-2xl p-8 relative overflow-hidden group"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-secondary text-sm font-semibold uppercase tracking-wider">
              {t('dashboard.netWorth')}
            </h3>
            <Info className="w-4 h-4 text-zinc-600 cursor-help hover:text-zinc-400 transition-colors" />
          </div>
          <div className="flex items-baseline gap-4">
            <p className="text-5xl md:text-6xl font-black text-primary tracking-tight">
              Rp {formatAmount(netWorth?.netWorth || 0)}
            </p>
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm font-bold border border-emerald-500/20">
              <TrendingUp className="w-4 h-4 mr-1" />
              +5.2%
            </span>
          </div>
        </div>
        
        {/* Time Period Selector */}
        <div className="mt-6 md:mt-0">
          <div className="flex gap-1 p-1 bg-zinc-100 dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/5">
            <button className="text-xs font-medium text-secondary hover:text-primary px-3 py-1.5 rounded-lg transition-all">
              {TIME_PERIODS.day}
            </button>
            <button className="text-xs font-medium text-white bg-[var(--accent-color)] px-3 py-1.5 rounded-lg shadow-lg glow-accent">
              {TIME_PERIODS.week}
            </button>
            <button className="text-xs font-medium text-secondary hover:text-primary px-3 py-1.5 rounded-lg transition-all">
              {TIME_PERIODS.month}
            </button>
            <button className="text-xs font-medium text-secondary hover:text-primary px-3 py-1.5 rounded-lg transition-all">
              {TIME_PERIODS.year}
            </button>
          </div>
        </div>
      </div>
      
      {/* Chart Area */}
      <div className="h-48 w-full relative z-10 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={MOCK_CHART_DATA}>
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-color)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--accent-color)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="var(--accent-color)"
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#chartGradient)" 
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--color-surface-elevated)', 
                borderRadius: '12px', 
                border: '1px solid rgba(255,255,255,0.1)', 
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)' 
              }}
              itemStyle={{ color: '#fff', fontWeight: 'bold' }}
              formatter={(value: number | undefined) => [`Rp ${formatAmount(value || 0)}`, 'Net Worth'] as [string, string]}
              labelStyle={{ display: 'none' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {/* Background glow effect - violet gradient like landing page */}
      <div className="absolute -top-32 -right-32 w-80 h-80 bg-[var(--accent-color)]/20 blur-[100px] rounded-full pointer-events-none group-hover:bg-[var(--accent-color)]/30 transition-all duration-700" />
      <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-fuchsia-500/10 blur-[80px] rounded-full pointer-events-none" />
    </motion.div>
  );
}

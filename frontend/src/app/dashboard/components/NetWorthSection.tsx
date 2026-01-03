"use client";

import { TrendingUp, Info } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";
import { COLORS, TIME_PERIODS } from "@/constants";
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
 * Shows total net worth, trend percentage, and historical chart
 */
export function NetWorthSection({ netWorth, formatAmount, t }: NetWorthSectionProps) {
  return (
    <div className="col-span-1 md:col-span-8 apple-card rounded-2xl p-6 relative overflow-hidden group">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider">
              {t('dashboard.netWorth')}
            </h3>
            <Info className="w-4 h-4 text-slate-500 cursor-help" />
          </div>
          <div className="flex items-baseline gap-3">
            <p className="text-4xl md:text-5xl font-black text-white tracking-tight">
              Rp {formatAmount(netWorth?.netWorth || 0)}
            </p>
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-500/10 text-green-400 text-sm font-bold border border-green-500/20">
              <TrendingUp className="w-4 h-4 mr-0.5" />
              +5.2%
            </span>
          </div>
        </div>
        
        {/* Time Period Selector */}
        <div className="mt-4 md:mt-0">
          <div className="flex gap-4">
            <button className="text-xs font-medium text-white bg-white/10 px-3 py-1.5 rounded-full hover:bg-white/20 transition-colors">
              {TIME_PERIODS.day}
            </button>
            <button className="text-xs font-medium text-white bg-[#007bff] px-3 py-1.5 rounded-full shadow-lg shadow-[#007bff]/20">
              {TIME_PERIODS.week}
            </button>
            <button className="text-xs font-medium text-slate-400 hover:text-white px-3 py-1.5 rounded-full transition-colors">
              {TIME_PERIODS.month}
            </button>
            <button className="text-xs font-medium text-slate-400 hover:text-white px-3 py-1.5 rounded-full transition-colors">
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
                <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={COLORS.primary}
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#chartGradient)" 
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e2936', 
                borderRadius: '8px', 
                border: 'none', 
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
              }}
              itemStyle={{ color: '#fff', fontWeight: 'bold' }}
              formatter={(value: number | undefined) => [`Rp ${formatAmount(value || 0)}`, 'Net Worth'] as [string, string]}
              labelStyle={{ display: 'none' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {/* Background glow effect */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#007bff]/20 blur-3xl rounded-full pointer-events-none" />
    </div>
  );
}

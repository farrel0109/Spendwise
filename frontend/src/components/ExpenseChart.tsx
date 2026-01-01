"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface CategoryData {
  name: string;
  total: number;
  color: string;
  icon: string;
  percentage: number;
}

interface ExpenseChartProps {
  byCategory: CategoryData[];
}

export default function ExpenseChart({ byCategory }: ExpenseChartProps) {
  // Prepare data for pie chart
  const chartData = byCategory
    .filter((cat) => cat.total > 0)
    .map((cat) => ({
      name: cat.name,
      value: cat.total,
      color: cat.color,
    }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (chartData.length === 0) {
    return (
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Expenses by Category</h2>
        <div className="h-[300px] flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">📈</div>
            <p className="text-slate-400">No expense data yet</p>
            <p className="text-slate-500 text-sm">Add some expenses to see the chart</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
      <h2 className="text-lg font-semibold text-white mb-4">Expenses by Category</h2>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatCurrency(value as number)}
              contentStyle={{
                backgroundColor: "rgba(30, 41, 59, 0.9)",
                border: "1px solid rgba(148, 163, 184, 0.2)",
                borderRadius: "12px",
                color: "#fff",
              }}
            />
            <Legend
              wrapperStyle={{
                paddingTop: "20px",
              }}
              formatter={(value) => (
                <span style={{ color: "#94a3b8" }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

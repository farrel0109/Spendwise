"use client";

interface SummaryData {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

interface SummaryCardsProps {
  summary: SummaryData | null;
}

export default function SummaryCards({ summary }: SummaryCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const cards = [
    {
      title: "Total Income",
      value: summary?.totalIncome || 0,
      icon: "💰",
      gradient: "from-green-500 to-emerald-500",
      bgColor: "bg-green-500/10",
      textColor: "text-green-400",
    },
    {
      title: "Total Expenses",
      value: summary?.totalExpense || 0,
      icon: "💸",
      gradient: "from-red-500 to-rose-500",
      bgColor: "bg-red-500/10",
      textColor: "text-red-400",
    },
    {
      title: "Balance",
      value: summary?.balance || 0,
      icon: "📊",
      gradient: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-500/10",
      textColor: summary && summary.balance >= 0 ? "text-green-400" : "text-red-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card) => (
        <div
          key={card.title}
          className="relative overflow-hidden bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6"
        >
          {/* Gradient Background */}
          <div
            className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 bg-gradient-to-br ${card.gradient}`}
          />
          
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-sm font-medium">{card.title}</span>
              <span className="text-2xl">{card.icon}</span>
            </div>
            
            <p className={`text-2xl font-bold ${card.textColor}`}>
              {formatCurrency(card.value)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

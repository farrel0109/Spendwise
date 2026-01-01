"use client";

interface NetWorthData {
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
}

interface NetWorthCardProps {
  data: NetWorthData | null;
}

export default function NetWorthCard({ data }: NetWorthCardProps) {
  if (!data) {
    return (
      <div className="bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-orange-600/20 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-700 rounded w-24 mb-4"></div>
          <div className="h-10 bg-slate-700 rounded w-48"></div>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-orange-600/20 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>
      <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl"></div>
      
      <div className="relative">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Net Worth */}
          <div>
            <p className="text-slate-400 text-sm mb-1">Net Worth</p>
            <h2 className={`text-3xl md:text-4xl font-bold ${data.netWorth >= 0 ? 'text-white' : 'text-red-400'}`}>
              {formatCurrency(data.netWorth)}
            </h2>
          </div>

          {/* Assets & Liabilities */}
          <div className="flex space-x-6">
            <div>
              <p className="text-slate-400 text-xs mb-1">Assets</p>
              <p className="text-lg font-semibold text-green-400">
                {formatCurrency(data.totalAssets)}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-xs mb-1">Liabilities</p>
              <p className="text-lg font-semibold text-red-400">
                {formatCurrency(data.totalLiabilities)}
              </p>
            </div>
          </div>
        </div>

        {/* Progress visualization */}
        <div className="mt-6">
          <div className="flex h-3 rounded-full overflow-hidden bg-slate-700/50">
            <div
              className="bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
              style={{
                width: data.totalAssets + data.totalLiabilities > 0
                  ? `${(data.totalAssets / (data.totalAssets + data.totalLiabilities)) * 100}%`
                  : "50%",
              }}
            ></div>
            <div
              className="bg-gradient-to-r from-red-500 to-orange-400 transition-all duration-500"
              style={{
                width: data.totalAssets + data.totalLiabilities > 0
                  ? `${(data.totalLiabilities / (data.totalAssets + data.totalLiabilities)) * 100}%`
                  : "50%",
              }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-slate-500">
            <span>Assets</span>
            <span>Liabilities</span>
          </div>
        </div>
      </div>
    </div>
  );
}

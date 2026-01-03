"use client";

export function DashboardSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 pb-32">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Net Worth Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="col-span-1 md:col-span-8 premium-card rounded-2xl p-8 animate-pulse">
            <div className="h-4 w-24 bg-white/10 rounded mb-4" />
            <div className="h-12 w-64 bg-white/10 rounded mb-8" />
            <div className="h-48 w-full bg-white/5 rounded-xl" />
          </div>
          
          {/* Budget Skeleton */}
          <div className="col-span-1 md:col-span-4 premium-card rounded-2xl p-8 animate-pulse">
            <div className="h-4 w-20 bg-white/10 rounded mb-4" />
            <div className="flex justify-center py-6">
              <div className="w-40 h-40 rounded-full bg-white/5 border-4 border-white/10" />
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full" />
          </div>
          
          {/* Accounts & Goals Skeleton */}
          <div className="col-span-1 md:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-2 space-y-4">
              <div className="h-6 w-32 bg-white/10 rounded" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-48 premium-card rounded-2xl animate-pulse" />
                <div className="h-48 premium-card rounded-2xl animate-pulse" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-6 w-24 bg-white/10 rounded" />
              <div className="h-[calc(100%-40px)] premium-card rounded-2xl animate-pulse" />
            </div>
          </div>
          
          {/* Transactions Skeleton */}
          <div className="col-span-1 md:col-span-12 premium-card rounded-2xl p-6 animate-pulse">
            <div className="h-6 w-48 bg-white/10 rounded mb-6" />
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4 py-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5" />
                  <div className="flex-1">
                    <div className="h-4 w-32 bg-white/10 rounded mb-2" />
                    <div className="h-3 w-20 bg-white/5 rounded" />
                  </div>
                  <div className="h-5 w-24 bg-white/10 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

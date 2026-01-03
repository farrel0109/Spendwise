"use client";

/**
 * Loading skeleton for the dashboard page
 * Displays placeholder animation while data is loading
 */
export function DashboardSkeleton() {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#007bff] border-t-transparent shadow-lg shadow-[#007bff]/20" />
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import { useLanguage } from "@/context/LanguageContext";
import { 
  LayoutDashboard, 
  Wallet, 
  CreditCard, 
  PieChart, 
  Target, 
  Banknote, 
  BarChart3, 
  Trophy,
  Settings,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const { t } = useLanguage();

  const navItems = [
    { href: "/dashboard", label: t('nav.dashboard'), icon: LayoutDashboard },
    { href: "/dashboard/accounts", label: t('nav.accounts'), icon: Wallet },
    { href: "/dashboard/transactions", label: t('nav.transactions'), icon: CreditCard },
    { href: "/dashboard/budgets", label: t('nav.budgeting'), icon: PieChart },
    { href: "/dashboard/goals", label: t('nav.goals'), icon: Target },
    { href: "/dashboard/debts", label: t('nav.debts'), icon: Banknote },
    { href: "/dashboard/analytics", label: t('nav.analytics'), icon: BarChart3 },
    { href: "/dashboard/achievements", label: t('nav.rewards'), icon: Trophy },
    { href: "/dashboard/settings", label: t('nav.settings') || 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#101418] border-r border-white/5 pt-6 pb-4 px-4 justify-between shrink-0 z-20 h-screen sticky top-0">
        <div className="flex flex-col gap-6">
          {/* Branding */}
          <div className="flex items-center gap-3 px-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#007bff] to-blue-400 flex items-center justify-center shadow-lg shadow-[#007bff]/20">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white text-lg font-bold tracking-tight">SpendWise</h1>
              <p className="text-slate-500 text-xs font-medium">{t('nav.premium')}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-1 overflow-y-auto max-h-[calc(100vh-200px)] custom-scrollbar">
            {navItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                    isActive
                      ? "bg-[#007bff] text-white shadow-md shadow-[#007bff]/20"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <item.icon className={`w-[22px] h-[22px] transition-transform ${!isActive && "group-hover:scale-110"}`} />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors mt-auto">
          {user?.imageUrl ? (
            <img src={user.imageUrl} alt="Profile" className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <div className="h-9 w-9 rounded-full bg-slate-700" />
          )}
          <div className="flex flex-col overflow-hidden">
            <p className="text-white text-sm font-medium truncate">{user?.fullName || "User"}</p>
            <p className="text-slate-500 text-xs truncate">{user?.primaryEmailAddress?.emailAddress}</p>
          </div>
        </div>
      </aside>

      {/* Mobile/Tablet Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#101418]/90 backdrop-blur-xl border-t border-white/5 z-50 pb-safe">
        <div className="flex justify-around items-center h-[70px] px-2">
          {navItems.slice(0, 5).map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center justify-center py-2 group ${
                  isActive ? "text-[#007bff]" : "text-slate-500"
                }`}
              >
                <div className={`p-1.5 rounded-full transition-all duration-300 ${
                  isActive ? "bg-[#007bff]/10 -translate-y-1" : "group-active:scale-90"
                }`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <span className={`text-[10px] font-medium mt-1 transition-opacity ${isActive ? "opacity-100" : "opacity-70"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

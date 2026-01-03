"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import { useLanguage } from "@/context/LanguageContext";
import { NAV_ITEMS, MOBILE_NAV_ITEMS, type NavItem } from "@/constants/navigation";

/**
 * Main sidebar navigation component
 * Premium dark theme matching landing page aesthetic
 */
export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const { t } = useLanguage();

  return (
    <>
      <DesktopSidebar 
        pathname={pathname} 
        user={user} 
        t={t} 
      />
      <MobileNav 
        pathname={pathname} 
        t={t} 
      />
    </>
  );
}

// ============================================
// Desktop Sidebar
// ============================================

interface DesktopSidebarProps {
  pathname: string;
  user: ReturnType<typeof useUser>['user'];
  t: (key: string) => string;
}

function DesktopSidebar({ pathname, user, t }: DesktopSidebarProps) {
  return (
    <aside className="hidden lg:flex flex-col w-64 bg-[var(--color-surface)]/80 backdrop-blur-xl border-r border-white/5 pt-6 pb-4 px-4 justify-between shrink-0 z-20 h-screen sticky top-0">
      <div className="flex flex-col gap-6">
        {/* Branding */}
        <div className="flex items-center gap-3 px-2">
          <div>
            <h1 className="text-white text-lg font-bold tracking-tight">SpendWise</h1>
            <p className="text-zinc-500 text-xs font-medium">{t('nav.premium')}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 overflow-y-auto max-h-[calc(100vh-200px)] custom-scrollbar">
          {NAV_ITEMS.map((item) => (
            <NavLink 
              key={item.href}
              item={item}
              pathname={pathname}
              t={t}
            />
          ))}
        </nav>
      </div>

      {/* User Profile */}
      <UserProfile user={user} />
    </aside>
  );
}

// ============================================
// Navigation Link
// ============================================

interface NavLinkProps {
  item: NavItem;
  pathname: string;
  t: (key: string) => string;
}

function NavLink({ item, pathname, t }: NavLinkProps) {
  const isActive = pathname === item.href || 
    (item.href !== "/dashboard" && pathname.startsWith(item.href));
  
  const Icon = item.icon;
  const label = t(item.labelKey) || item.labelKey.split('.').pop();
  
  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
        isActive
          ? "bg-[var(--accent-color)] text-white shadow-lg glow-accent"
          : "text-zinc-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      <Icon className={`w-[22px] h-[22px] transition-transform ${!isActive && "group-hover:scale-110"}`} />
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}

// ============================================
// User Profile Section
// ============================================

interface UserProfileProps {
  user: ReturnType<typeof useUser>['user'];
}

function UserProfile({ user }: UserProfileProps) {
  return (
    <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors mt-auto">
      <UserButton 
        afterSignOutUrl="/sign-in"  
        appearance={{
          elements: {
            avatarBox: "w-9 h-9 border border-white/10",
            userButtonPopoverCard: "bg-[var(--color-surface-elevated)] border border-white/10",
            userButtonPopoverActionButton: "text-zinc-300 hover:bg-white/10",
            userButtonPopoverActionButtonText: "text-zinc-300",
            userButtonPopoverActionButtonIcon: "text-zinc-400",
            userButtonPopoverFooter: "hidden"
          }
        }}
      />
      <div className="flex flex-col overflow-hidden">
        <p className="text-white text-sm font-medium truncate">
          {user?.fullName || "User"}
        </p>
        <p className="text-zinc-500 text-xs truncate">
          {user?.primaryEmailAddress?.emailAddress}
        </p>
      </div>
    </div>
  );
}

// ============================================
// Mobile Bottom Navigation
// ============================================

interface MobileNavProps {
  pathname: string;
  t: (key: string) => string;
}

function MobileNav({ pathname, t }: MobileNavProps) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[var(--color-surface)]/90 backdrop-blur-xl border-t border-white/5 z-50 pb-safe">
      <div className="flex justify-around items-center h-[70px] px-2">
        {MOBILE_NAV_ITEMS.map((item) => (
          <MobileNavItem
            key={item.href}
            item={item}
            pathname={pathname}
            t={t}
          />
        ))}
      </div>
    </nav>
  );
}

interface MobileNavItemProps {
  item: NavItem;
  pathname: string;
  t: (key: string) => string;
}

function MobileNavItem({ item, pathname, t }: MobileNavItemProps) {
  const isActive = pathname === item.href || 
    (item.href !== "/dashboard" && pathname.startsWith(item.href));
  
  const Icon = item.icon;
  const label = t(item.labelKey) || item.labelKey.split('.').pop();
  
  return (
    <Link
      href={item.href}
      className={`flex-1 flex flex-col items-center justify-center py-2 group ${
        isActive ? "text-[var(--accent-color)]" : "text-zinc-500"
      }`}
    >
      <div className={`p-1.5 rounded-full transition-all duration-300 ${
        isActive ? "bg-[var(--accent-color)]/10 -translate-y-1" : "group-active:scale-90"
      }`}>
        <Icon className="w-6 h-6" />
      </div>
      <span className={`text-[10px] font-medium mt-1 transition-opacity ${
        isActive ? "opacity-100" : "opacity-70"
      }`}>
        {label}
      </span>
    </Link>
  );
}

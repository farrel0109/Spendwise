"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import { useLanguage } from "@/context/LanguageContext";
import { NAV_ITEMS, type NavItem } from "@/constants/navigation";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

/**
 * Main sidebar navigation component
 * Premium dark theme matching landing page aesthetic
 * Supports both Desktop (fixed) and Mobile (drawer) modes
 */
export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const { t } = useLanguage();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Close profile drawer on route change
  useEffect(() => {
    setIsProfileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Desktop Sidebar (Hidden on Mobile) */}
      <DesktopSidebar 
        pathname={pathname} 
        user={user} 
        t={t} 
      />

      {/* Mobile Bottom Navigation (Hidden on Desktop) */}
      <MobileBottomNav 
        pathname={pathname}
        onProfileClick={() => setIsProfileOpen(true)}
        t={t}
        user={user}
      />

      {/* Profile Drawer (Mobile Only) */}
      <ProfileDrawer 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)}
        pathname={pathname}
        user={user}
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
            <h1 className="text-primary text-lg font-bold tracking-tight">SpendWise</h1>
            <p className="text-muted text-xs font-medium">{t('nav.premium')}</p>
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
// Mobile Bottom Navigation
// ============================================

interface MobileBottomNavProps {
  pathname: string;
  onProfileClick: () => void;
  t: (key: string) => string;
  user: ReturnType<typeof useUser>['user'];
}

function MobileBottomNav({ pathname, onProfileClick, t, user }: MobileBottomNavProps) {
  // Main items for bottom nav: Dashboard, Transactions, Accounts
  const mainItems = NAV_ITEMS.slice(0, 3);

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[var(--color-surface)]/90 backdrop-blur-xl border-t border-white/5 z-40 pb-safe">
      <div className="flex justify-around items-center h-[70px] px-2">
        {mainItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 w-16 h-full transition-colors ${
                isActive ? "text-[var(--accent-color)]" : "text-secondary hover:text-primary"
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? "bg-[var(--accent-color)]/10" : ""}`}>
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-medium truncate max-w-full">
                {t(item.labelKey) || item.labelKey.split('.').pop()}
              </span>
            </Link>
          );
        })}

        {/* Profile / Menu Button with User Avatar */}
        <button
          onClick={onProfileClick}
          className="flex flex-col items-center justify-center gap-1 w-16 h-full text-secondary hover:text-primary transition-colors"
        >
          <div className="p-1.5 rounded-xl">
             <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center border border-white/10 overflow-hidden">
                {user?.imageUrl ? (
                  <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                )}
             </div>
          </div>
          <span className="text-[10px] font-medium">Profile</span>
        </button>
      </div>
    </nav>
  );
}

// ============================================
// Profile Drawer (Mobile Only)
// ============================================

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  pathname: string;
  user: ReturnType<typeof useUser>['user'];
  t: (key: string) => string;
}

function ProfileDrawer({ isOpen, onClose, pathname, user, t }: ProfileDrawerProps) {
  // Remaining items
  const remainingItems = NAV_ITEMS.slice(3);

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div 
        className={`fixed inset-x-0 bottom-0 bg-[var(--color-surface-elevated)] rounded-t-3xl border-t border-white/10 z-50 lg:hidden flex flex-col max-h-[85vh] transition-transform duration-300 ease-out ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Handle */}
        <div className="w-full flex justify-center pt-3 pb-1" onClick={onClose}>
          <div className="w-12 h-1.5 rounded-full bg-white/10" />
        </div>

        {/* User Info Header */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-4">
            <UserButton 
              afterSignOutUrl="/sign-in"
              appearance={{
                elements: {
                  avatarBox: "w-14 h-14 border-2 border-white/10",
                  userButtonPopoverCard: "bg-[var(--color-surface-elevated)] border border-white/10"
                }
              }}
            />
            <div>
              <h3 className="text-primary font-bold text-lg">{user?.fullName || "User"}</h3>
              <p className="text-muted text-sm">{user?.primaryEmailAddress?.emailAddress}</p>
            </div>
            <button 
              onClick={onClose}
              className="ml-auto p-2 text-secondary hover:text-primary rounded-full hover:bg-white/5"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="grid grid-cols-2 gap-3">
            {remainingItems.map((item) => (
              <NavLink 
                key={item.href}
                item={item}
                pathname={pathname}
                t={t}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ============================================
// Navigation Link (Reusable)
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
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
        isActive
          ? "bg-[var(--accent-color)] text-white shadow-lg glow-accent"
          : "bg-white/5 text-secondary hover:bg-white/10 hover:text-primary"
      }`}
    >
      <Icon className={`w-5 h-5 transition-transform ${!isActive && "group-hover:scale-110"}`} />
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}

// ============================================
// User Profile Section (Desktop)
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
        <p className="text-primary text-sm font-medium truncate">
          {user?.fullName || "User"}
        </p>
        <p className="text-muted text-xs truncate">
          {user?.primaryEmailAddress?.emailAddress}
        </p>
      </div>
    </div>
  );
}


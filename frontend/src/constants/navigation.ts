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
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  labelKey: string;
  icon: LucideIcon;
}

/**
 * Main navigation items for the sidebar
 * labelKey corresponds to translation keys in LanguageContext
 */
export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { href: "/dashboard/accounts", labelKey: "nav.accounts", icon: Wallet },
  { href: "/dashboard/transactions", labelKey: "nav.transactions", icon: CreditCard },
  { href: "/dashboard/budgets", labelKey: "nav.budgeting", icon: PieChart },
  { href: "/dashboard/goals", labelKey: "nav.goals", icon: Target },
  { href: "/dashboard/debts", labelKey: "nav.debts", icon: Banknote },
  { href: "/dashboard/analytics", labelKey: "nav.analytics", icon: BarChart3 },
  { href: "/dashboard/achievements", labelKey: "nav.rewards", icon: Trophy },
  { href: "/dashboard/settings", labelKey: "nav.settings", icon: Settings },
];

/**
 * Mobile bottom navigation (subset of main nav)
 * Shows first 5 items for quick access
 */
export const MOBILE_NAV_ITEMS = NAV_ITEMS.slice(0, 5);

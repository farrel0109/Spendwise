"use client";

import React, { createContext, useContext, useSyncExternalStore, useCallback, ReactNode } from 'react';

type Language = 'en' | 'id';

const STORAGE_KEY = 'spendwise-lang';

// Get language from localStorage or browser
function getLanguageFromStorage(): Language {
  if (typeof window === 'undefined') return 'en';
  const savedLang = localStorage.getItem(STORAGE_KEY);
  if (savedLang === 'en' || savedLang === 'id') return savedLang;
  // Auto-detect from browser
  const browserLang = navigator.language.split('-')[0];
  return browserLang === 'id' ? 'id' : 'en';
}

// Subscribe to localStorage changes
function subscribeToLanguage(callback: () => void) {
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      callback();
    }
  };
  window.addEventListener('storage', handleStorageChange);
  return () => window.removeEventListener('storage', handleStorageChange);
}

// Server snapshot - always return 'en' for SSR
function getLanguageServerSnapshot(): Language {
  return 'en';
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Type-safe translations record
type TranslationRecord = Record<string, string>;

const translations: Record<Language, TranslationRecord> = {
  en: {
    // Sidebar
    'nav.dashboard': 'Dashboard',
    'nav.accounts': 'Accounts',
    'nav.transactions': 'Transactions',
    'nav.budgeting': 'Budgeting',
    'nav.goals': 'Goals',
    'nav.debts': 'Debts',
    'nav.analytics': 'Analytics',
    'nav.rewards': 'Rewards',
    'nav.premium': 'Premium Plan',
    'nav.settings': 'Settings',
    
    // TopBar
    'header.greeting.morning': 'Good Morning',
    'header.greeting.afternoon': 'Good Afternoon',
    'header.greeting.evening': 'Good Evening',
    'header.subtitle': 'Here is your financial overview for',
    'header.hideAmounts': 'Hide Amounts',
    'header.showAmounts': 'Show Amounts',

    // Dashboard
    'dashboard.netWorth': 'Total Net Worth',
    'dashboard.budget': 'Monthly Budget',
    'dashboard.leftToSpend': 'Left to spend',
    'dashboard.projectedSavings': 'Projected Savings',
    'dashboard.myAccounts': 'My Accounts',
    'dashboard.addNew': 'Add New +',
    'dashboard.topGoal': 'Top Goal',
    'dashboard.funded': 'Funded',
    'dashboard.recentTransactions': 'Recent Transactions',
    'dashboard.viewAll': 'View All Transactions',
    'dashboard.noTransactions': 'No transactions found',
    'dashboard.balance': 'Balance',
    'dashboard.due': 'Due',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'Something went wrong',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.create': 'Create',
    'common.update': 'Update',
    'common.income': 'Income',
    'common.expense': 'Expense',
    'common.transfer': 'Transfer',

    // Settings
    'settings.title': 'Settings',
    'settings.profile': 'Profile',
    'settings.preferences': 'Preferences',
    'settings.appearance': 'Appearance',
    'settings.notifications': 'Notifications',
    'settings.language': 'Language',
    'settings.currency': 'Currency',
    'settings.privacy': 'Privacy',
  },
  id: {
    // Sidebar
    'nav.dashboard': 'Dasbor',
    'nav.accounts': 'Akun',
    'nav.transactions': 'Transaksi',
    'nav.budgeting': 'Anggaran',
    'nav.goals': 'Target',
    'nav.debts': 'Utang',
    'nav.analytics': 'Analitik',
    'nav.rewards': 'Hadiah',
    'nav.premium': 'Paket Premium',
    'nav.settings': 'Pengaturan',

    // TopBar
    'header.greeting.morning': 'Selamat Pagi',
    'header.greeting.afternoon': 'Selamat Siang',
    'header.greeting.evening': 'Selamat Malam',
    'header.subtitle': 'Berikut ringkasan keuangan Anda untuk',
    'header.hideAmounts': 'Sembunyikan Nominal',
    'header.showAmounts': 'Tampilkan Nominal',

    // Dashboard
    'dashboard.netWorth': 'Total Kekayaan Bersih',
    'dashboard.budget': 'Anggaran Bulanan',
    'dashboard.leftToSpend': 'Tersisa untuk dibelanjakan',
    'dashboard.projectedSavings': 'Proyeksi Tabungan',
    'dashboard.myAccounts': 'Akun Saya',
    'dashboard.addNew': 'Tambah Baru +',
    'dashboard.topGoal': 'Target Utama',
    'dashboard.funded': 'Terdanai',
    'dashboard.recentTransactions': 'Transaksi Terbaru',
    'dashboard.viewAll': 'Lihat Semua Transaksi',
    'dashboard.noTransactions': 'Tidak ada transaksi',
    'dashboard.balance': 'Saldo',
    'dashboard.due': 'Jatuh Tempo',
    
    // Common
    'common.loading': 'Memuat...',
    'common.error': 'Terjadi kesalahan',
    'common.save': 'Simpan',
    'common.cancel': 'Batal',
    'common.delete': 'Hapus',
    'common.edit': 'Edit',
    'common.create': 'Buat',
    'common.update': 'Perbarui',
    'common.income': 'Pemasukan',
    'common.expense': 'Pengeluaran',
    'common.transfer': 'Transfer',

    // Settings
    'settings.title': 'Pengaturan',
    'settings.profile': 'Profil',
    'settings.preferences': 'Preferensi',
    'settings.appearance': 'Tampilan',
    'settings.notifications': 'Notifikasi',
    'settings.language': 'Bahasa',
    'settings.currency': 'Mata Uang',
    'settings.privacy': 'Privasi',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Use useSyncExternalStore for localStorage sync
  const language = useSyncExternalStore(
    subscribeToLanguage,
    getLanguageFromStorage,
    getLanguageServerSnapshot
  );

  const setLanguage = useCallback((lang: Language) => {
    localStorage.setItem(STORAGE_KEY, lang);
    // Dispatch storage event to trigger re-render
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
  }, []);

  const t = useCallback((key: string): string => {
    return translations[language][key] || key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'id';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
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
    'nav.settings': 'Settings',
    'settings.title': 'Settings',
    'settings.subtitle': 'Customize your SpendWise experience',
    'settings.profile': 'Profile',
    'settings.appearance': 'Appearance',
    'settings.preferences': 'Preferences',
    'settings.notifications': 'Notifications',
    'settings.privacy': 'Privacy & Data',
    'settings.save': 'Save Changes',
    'settings.saved': 'Saved!',
    'settings.saving': 'Saving...',
  },
  id: {
    // Sidebar
    'nav.dashboard': 'Dasbor',
    'nav.accounts': 'Rekening',
    'nav.transactions': 'Transaksi',
    'nav.budgeting': 'Anggaran',
    'nav.goals': 'Target',
    'nav.debts': 'Hutang',
    'nav.analytics': 'Analisis',
    'nav.rewards': 'Hadiah',
    'nav.premium': 'Paket Premium',

    // TopBar
    'header.greeting.morning': 'Selamat Pagi',
    'header.greeting.afternoon': 'Selamat Siang',
    'header.greeting.evening': 'Selamat Malam',
    'header.subtitle': 'Berikut ringkasan keuangan Anda untuk',
    'header.hideAmounts': 'Sembunyikan Saldo',
    'header.showAmounts': 'Tampilkan Saldo',

    // Dashboard
    'dashboard.netWorth': 'Total Kekayaan Bersih',
    'dashboard.budget': 'Anggaran Bulanan',
    'dashboard.leftToSpend': 'Sisa anggaran',
    'dashboard.projectedSavings': 'Proyeksi Tabungan',
    'dashboard.myAccounts': 'Rekening Saya',
    'dashboard.addNew': 'Tambah +',
    'dashboard.topGoal': 'Target Utama',
    'dashboard.funded': 'Tercapai',
    'dashboard.recentTransactions': 'Transaksi Terakhir',
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
    'common.edit': 'Ubah',
    'common.create': 'Buat',
    'common.update': 'Perbarui',
    'common.income': 'Pemasukan',
    'common.expense': 'Pengeluaran',
    'common.transfer': 'Transfer',

    // Settings
    'nav.settings': 'Pengaturan',
    'settings.title': 'Pengaturan',
    'settings.subtitle': 'Sesuaikan pengalaman SpendWise Anda',
    'settings.profile': 'Profil',
    'settings.appearance': 'Tampilan',
    'settings.preferences': 'Preferensi',
    'settings.notifications': 'Notifikasi',
    'settings.privacy': 'Privasi & Data',
    'settings.save': 'Simpan Perubahan',
    'settings.saved': 'Tersimpan!',
    'settings.saving': 'Menyimpan...',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    // Auto-detect language
    const browserLang = navigator.language.split('-')[0];
    if (browserLang === 'id') {
      setLanguage('id');
    }
    
    // Check local storage
    const savedLang = localStorage.getItem('spendwise-lang') as Language;
    if (savedLang) {
      setLanguage(savedLang);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('spendwise-lang', lang);
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    // Simple lookup, currently flat but prepared for nested if needed
    // For now, keys are flat in the object above for simplicity
    return (translations[language] as any)[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
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

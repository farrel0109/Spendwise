"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface PrivacyContextType {
  isPrivacyMode: boolean;
  togglePrivacyMode: () => void;
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined);

export function PrivacyProvider({ children }: { children: ReactNode }) {
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);

  useEffect(() => {
    // Restore preference from local storage
    const savedMode = localStorage.getItem('spendwise-privacy-mode');
    if (savedMode === 'true') {
      setIsPrivacyMode(true);
    }
  }, []);

  const togglePrivacyMode = () => {
    setIsPrivacyMode(prev => {
      const newValue = !prev;
      localStorage.setItem('spendwise-privacy-mode', String(newValue));
      return newValue;
    });
  };

  return (
    <PrivacyContext.Provider value={{ isPrivacyMode, togglePrivacyMode }}>
      {children}
    </PrivacyContext.Provider>
  );
}

export function usePrivacy() {
  const context = useContext(PrivacyContext);
  if (context === undefined) {
    throw new Error('usePrivacy must be used within a PrivacyProvider');
  }
  return context;
}

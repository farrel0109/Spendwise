"use client";

import React, { createContext, useContext, useSyncExternalStore, useCallback, ReactNode } from 'react';

interface PrivacyContextType {
  isPrivacyMode: boolean;
  togglePrivacyMode: () => void;
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined);

const STORAGE_KEY = 'spendwise-privacy-mode';

// Subscribe to localStorage changes
function subscribeToPrivacyMode(callback: () => void) {
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      callback();
    }
  };
  window.addEventListener('storage', handleStorageChange);
  return () => window.removeEventListener('storage', handleStorageChange);
}

// Get current value from localStorage
function getPrivacyModeSnapshot(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEY) === 'true';
}

// Server snapshot - always return false for SSR
function getPrivacyModeServerSnapshot(): boolean {
  return false;
}

export function PrivacyProvider({ children }: { children: ReactNode }) {
  // Use useSyncExternalStore for localStorage sync
  const isPrivacyMode = useSyncExternalStore(
    subscribeToPrivacyMode,
    getPrivacyModeSnapshot,
    getPrivacyModeServerSnapshot
  );

  const togglePrivacyMode = useCallback(() => {
    const newValue = !getPrivacyModeSnapshot();
    localStorage.setItem(STORAGE_KEY, String(newValue));
    // Dispatch storage event to trigger re-render
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
  }, []);

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

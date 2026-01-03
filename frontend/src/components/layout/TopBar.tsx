"use client";

import { useAuth, useUser, UserButton } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import { getUserStats } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { usePrivacy } from "@/context/PrivacyContext";
import { Bell, Eye, EyeOff, Globe } from "lucide-react";

export default function TopBar() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const { t, language, setLanguage } = useLanguage();
  const { isPrivacyMode, togglePrivacyMode } = usePrivacy();
  
  const hasFetched = useRef(false);

  useEffect(() => {
    const fetchStats = async () => {
      if (hasFetched.current) return;
      
      try {
        const token = await getToken();
        if (!token) return;
        
        hasFetched.current = true;
        await getUserStats(token);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    
    if (user) {
      fetchStats();
    }
  }, [getToken, user]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('header.greeting.morning');
    if (hour < 18) return t('header.greeting.afternoon');
    return t('header.greeting.evening');
  };

  const currentDate = new Date().toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { 
    month: "long", 
    day: "numeric" 
  });

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'id' : 'en');
  };

  return (
    <header className="h-20 shrink-0 px-6 md:px-10 flex items-center justify-between border-b border-white/5 bg-[var(--color-surface)]/80 backdrop-blur-xl sticky top-0 z-10">
      <div className="flex flex-col">
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
          {getGreeting()}, {user?.firstName || "User"}
        </h2>
        <p className="text-zinc-500 text-sm hidden md:block">
          {t('header.subtitle')} {currentDate}.
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Language Toggle */}
        <button 
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-zinc-400 hover:text-white hover:bg-white/10 hover:border-white/10 transition-all text-sm font-medium"
          title={language === 'en' ? 'Switch to Indonesian' : 'Switch to English'}
        >
          <Globe className="w-[18px] h-[18px]" />
          <span className="uppercase">{language}</span>
        </button>

        {/* Privacy Toggle */}
        <button 
          onClick={togglePrivacyMode}
          className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-zinc-400 hover:text-white hover:bg-white/10 hover:border-white/10 transition-all text-sm font-medium"
        >
          {isPrivacyMode ? <Eye className="w-[18px] h-[18px]" /> : <EyeOff className="w-[18px] h-[18px]" />}
          <span className="hidden lg:inline">{isPrivacyMode ? t('header.showAmounts') : t('header.hideAmounts')}</span>
        </button>

        {/* Notifications */}
        <button className="relative p-2.5 rounded-xl text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[var(--accent-color)] border-2 border-[var(--color-surface)]"></span>
        </button>

        {/* Mobile Profile */}
        <div className="md:hidden flex items-center">
          <UserButton 
            afterSignOutUrl="/sign-in"
            appearance={{
              elements: {
                avatarBox: "w-9 h-9 border border-white/10"
              }
            }}
          />
        </div>
      </div>
    </header>
  );
}

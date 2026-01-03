"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { usePrivacy } from "@/context/PrivacyContext";
import { getUserSettings, updateProfile, exportUserData } from "@/lib/api";
import { 
  User, 
  Palette, 
  Settings2, 
  Bell, 
  Shield, 
  Save, 
  Download,
  Check,
  Loader2,
  Sun,
  Moon,
  Monitor
} from "lucide-react";

// Accent color options - using CSS variable friendly format
const ACCENT_COLORS = [
  { name: "Violet", value: "#8b5cf6", key: "purple" },
  { name: "Blue", value: "#3b82f6", key: "blue" },
  { name: "Green", value: "#10b981", key: "green" },
  { name: "Red", value: "#ef4444", key: "red" },
  { name: "Orange", value: "#f97316", key: "orange" },
  { name: "Pink", value: "#ec4899", key: "pink" },
  { name: "Teal", value: "#14b8a6", key: "teal" },
];

// Currency options
const CURRENCIES = [
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp" },
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM" },
];

type TabType = "profile" | "appearance" | "preferences" | "notifications" | "privacy";

export default function SettingsPage() {
  const { getToken } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { isPrivacyMode, togglePrivacyMode } = usePrivacy();
  
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Form states
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [theme, setTheme] = useState<"light" | "dark" | "system">("dark");
  const [accentColor, setAccentColor] = useState("#8b5cf6");
  const [currency, setCurrency] = useState("IDR");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
  const [notificationBudget, setNotificationBudget] = useState(true);
  const [notificationGoals, setNotificationGoals] = useState(true);
  const [notificationAchievements, setNotificationAchievements] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        
        const data = await getUserSettings(token);
        
        setDisplayName(data.displayName || "");
        setBio(data.bio || "");
        setTheme(data.theme || "dark");
        setAccentColor(data.accentColor || "#8b5cf6");
        setCurrency(data.currency || "IDR");
        setDateFormat(data.dateFormat || "DD/MM/YYYY");
        setNotificationBudget(data.notificationBudget ?? true);
        setNotificationGoals(data.notificationGoals ?? true);
        setNotificationAchievements(data.notificationAchievements ?? true);
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [getToken]);

  // Apply accent color to document
  useEffect(() => {
    const color = ACCENT_COLORS.find(c => c.value === accentColor);
    if (color) {
      document.documentElement.setAttribute('data-accent', color.key);
    }
  }, [accentColor]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    
    try {
      const token = await getToken();
      if (!token) return;

      await updateProfile(token, {
        displayName,
        bio,
        theme,
        accentColor,
        currency,
        language: language as 'id' | 'en',
        dateFormat,
        notificationBudget,
        notificationGoals,
        notificationAchievements,
        privacyHideAmounts: isPrivacyMode,
      });

      setSaved(true);
      toast.success("Settings saved successfully!");
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    
    try {
      const token = await getToken();
      if (!token) return;

      const data = await exportUserData(token);
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `spendwise-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Data exported successfully!");
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export data");
    } finally {
      setExporting(false);
    }
  };

  const tabs = [
    { id: "profile" as TabType, label: "Profile", icon: User },
    { id: "appearance" as TabType, label: "Appearance", icon: Palette },
    { id: "preferences" as TabType, label: "Preferences", icon: Settings2 },
    { id: "notifications" as TabType, label: "Notifications", icon: Bell },
    { id: "privacy" as TabType, label: "Privacy & Data", icon: Shield },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-color)]" />
          <p className="text-zinc-500 text-sm">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto py-2"
    >
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Settings</h1>
        <p className="text-zinc-500">Customize your SpendWise experience</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:w-56 shrink-0">
          <div className="premium-card rounded-2xl overflow-hidden p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                  activeTab === tab.id 
                    ? "bg-[var(--accent-color)] text-white shadow-lg" 
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium text-sm">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="premium-card rounded-2xl p-8"
            >
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Profile</h2>
                    <p className="text-zinc-500 text-sm">Personalize how others see you</p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-3">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        maxLength={50}
                        placeholder="Your display name"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]/50 focus:border-[var(--accent-color)]/50 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-3">
                        Bio
                      </label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        maxLength={160}
                        rows={3}
                        placeholder="Tell us about yourself..."
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]/50 focus:border-[var(--accent-color)]/50 transition-all resize-none"
                      />
                      <p className="text-xs text-zinc-600 mt-2 text-right">{bio.length}/160</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Appearance Tab */}
              {activeTab === "appearance" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Appearance</h2>
                    <p className="text-zinc-500 text-sm">Customize how SpendWise looks</p>
                  </div>

                  <div className="space-y-8">
                    {/* Theme Selector */}
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-4">
                        Theme
                      </label>
                      <div className="grid grid-cols-3 gap-4">
                        {([
                          { value: "light", icon: Sun, label: "Light" },
                          { value: "dark", icon: Moon, label: "Dark" },
                          { value: "system", icon: Monitor, label: "System" },
                        ] as const).map((t) => (
                          <button
                            key={t.value}
                            onClick={() => setTheme(t.value)}
                            className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all ${
                              theme === t.value
                                ? "bg-[var(--accent-color)]/10 border-[var(--accent-color)] text-white"
                                : "bg-white/5 border-white/10 text-zinc-400 hover:border-white/20 hover:text-white"
                            }`}
                          >
                            <t.icon className="w-6 h-6" />
                            <span className="text-sm font-medium">{t.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Accent Color */}
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-4">
                        Accent Color
                      </label>
                      <div className="flex flex-wrap gap-4">
                        {ACCENT_COLORS.map((color) => (
                          <button
                            key={color.value}
                            onClick={() => setAccentColor(color.value)}
                            className={`group relative w-12 h-12 rounded-full transition-all ${
                              accentColor === color.value
                                ? "ring-2 ring-white ring-offset-4 ring-offset-[var(--color-surface-elevated)] scale-110"
                                : "hover:scale-105"
                            }`}
                            style={{ backgroundColor: color.value }}
                            title={color.name}
                          >
                            {accentColor === color.value && (
                              <Check className="w-5 h-5 text-white absolute inset-0 m-auto" />
                            )}
                          </button>
                        ))}
                      </div>
                      
                      {/* Preview */}
                      <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-xs text-zinc-500 mb-3">Preview</p>
                        <div className="flex items-center gap-3">
                          <button 
                            className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all"
                            style={{ backgroundColor: accentColor }}
                          >
                            Primary Button
                          </button>
                          <span className="text-sm" style={{ color: accentColor }}>Accent Link</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === "preferences" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Preferences</h2>
                    <p className="text-zinc-500 text-sm">Set your preferred currency and language</p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-3">
                        Currency
                      </label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]/50 focus:border-[var(--accent-color)]/50 transition-all"
                      >
                        {CURRENCIES.map((c) => (
                          <option key={c.code} value={c.code} className="bg-[var(--color-surface-elevated)]">
                            {c.symbol} {c.code} - {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-3">
                        Language
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => setLanguage("id")}
                          className={`px-4 py-4 rounded-xl border transition-all flex items-center gap-3 ${
                            language === "id"
                              ? "bg-[var(--accent-color)]/10 border-[var(--accent-color)] text-white"
                              : "bg-white/5 border-white/10 text-zinc-400 hover:border-white/20 hover:text-white"
                          }`}
                        >
                          <span className="font-bold text-lg">ID</span>
                          <span className="font-medium">Bahasa Indonesia</span>
                        </button>
                        <button
                          onClick={() => setLanguage("en")}
                          className={`px-4 py-4 rounded-xl border transition-all flex items-center gap-3 ${
                            language === "en"
                              ? "bg-[var(--accent-color)]/10 border-[var(--accent-color)] text-white"
                              : "bg-white/5 border-white/10 text-zinc-400 hover:border-white/20 hover:text-white"
                          }`}
                        >
                          <span className="font-bold text-lg">EN</span>
                          <span className="font-medium">English</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-3">
                        Date Format
                      </label>
                      <select
                        value={dateFormat}
                        onChange={(e) => setDateFormat(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]/50 focus:border-[var(--accent-color)]/50 transition-all"
                      >
                        <option value="DD/MM/YYYY" className="bg-[var(--color-surface-elevated)]">DD/MM/YYYY (31/12/2025)</option>
                        <option value="MM/DD/YYYY" className="bg-[var(--color-surface-elevated)]">MM/DD/YYYY (12/31/2025)</option>
                        <option value="YYYY-MM-DD" className="bg-[var(--color-surface-elevated)]">YYYY-MM-DD (2025-12-31)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === "notifications" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Notifications</h2>
                    <p className="text-zinc-500 text-sm">Control what notifications you receive</p>
                  </div>

                  <div className="space-y-4">
                    {[
                      { 
                        id: "budget", 
                        label: "Budget Alerts", 
                        description: "Get notified when approaching budget limits",
                        value: notificationBudget,
                        onChange: setNotificationBudget
                      },
                      { 
                        id: "goals", 
                        label: "Goal Reminders", 
                        description: "Reminders about your savings goals",
                        value: notificationGoals,
                        onChange: setNotificationGoals
                      },
                      { 
                        id: "achievements", 
                        label: "Achievement Notifications", 
                        description: "Celebrate when you unlock achievements",
                        value: notificationAchievements,
                        onChange: setNotificationAchievements
                      },
                    ].map((item) => (
                      <div 
                        key={item.id}
                        className="flex items-center justify-between p-5 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors"
                      >
                        <div>
                          <p className="text-white font-medium">{item.label}</p>
                          <p className="text-zinc-500 text-sm mt-0.5">{item.description}</p>
                        </div>
                        <button
                          onClick={() => item.onChange(!item.value)}
                          className={`relative w-14 h-8 rounded-full transition-all ${
                            item.value ? "bg-[var(--accent-color)]" : "bg-white/10"
                          }`}
                        >
                          <motion.div 
                            animate={{ x: item.value ? 24 : 4 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg"
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === "privacy" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Privacy & Data</h2>
                    <p className="text-zinc-500 text-sm">Manage your privacy settings and data</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-5 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                      <div>
                        <p className="text-white font-medium">Hide Amounts by Default</p>
                        <p className="text-zinc-500 text-sm mt-0.5">Blur all monetary values for privacy</p>
                      </div>
                      <button
                        onClick={togglePrivacyMode}
                        className={`relative w-14 h-8 rounded-full transition-all ${
                          isPrivacyMode ? "bg-[var(--accent-color)]" : "bg-white/10"
                        }`}
                      >
                        <motion.div 
                          animate={{ x: isPrivacyMode ? 24 : 4 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg"
                        />
                      </button>
                    </div>

                    <div className="p-5 bg-white/5 rounded-xl border border-white/5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">Export Your Data</p>
                          <p className="text-zinc-500 text-sm mt-0.5">Download all your SpendWise data as JSON</p>
                        </div>
                        <button
                          onClick={handleExport}
                          disabled={exporting}
                          className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl font-medium transition-all disabled:opacity-50 border border-white/5"
                        >
                          {exporting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                          Export
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="mt-10 pt-8 border-t border-white/5">
                <motion.button
                  onClick={handleSave}
                  disabled={saving}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-2 px-8 py-3.5 rounded-xl font-medium transition-all ${
                    saved 
                      ? "bg-emerald-500 text-white" 
                      : "bg-[var(--accent-color)] hover:opacity-90 text-white shadow-lg glow-accent"
                  } disabled:opacity-50`}
                >
                  {saving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : saved ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  {saved ? "Saved!" : saving ? "Saving..." : "Save Changes"}
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

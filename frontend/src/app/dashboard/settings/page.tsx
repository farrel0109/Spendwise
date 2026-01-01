"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useLanguage } from "@/context/LanguageContext";
import { usePrivacy } from "@/context/PrivacyContext";
import { getUserSettings, updateProfile, exportUserData, type UserSettings } from "@/lib/api";
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
  ChevronRight
} from "lucide-react";

// Accent color options
const ACCENT_COLORS = [
  { name: "Blue", value: "#007aff" },
  { name: "Green", value: "#34c759" },
  { name: "Purple", value: "#af52de" },
  { name: "Red", value: "#ff3b30" },
  { name: "Orange", value: "#ff9500" },
  { name: "Pink", value: "#ff2d55" },
  { name: "Teal", value: "#5ac8fa" },
  { name: "Gray", value: "#8e8e93" },
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
  const { t, language, setLanguage } = useLanguage();
  const { isPrivacyMode, togglePrivacyMode } = usePrivacy();
  
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Form states
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [theme, setTheme] = useState<"light" | "dark" | "system">("dark");
  const [accentColor, setAccentColor] = useState("#007aff");
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
        setSettings(data);
        
        // Populate form
        setDisplayName(data.displayName || "");
        setBio(data.bio || "");
        setTheme(data.theme || "dark");
        setAccentColor(data.accentColor || "#007aff");
        setCurrency(data.currency || "IDR");
        setDateFormat(data.dateFormat || "DD/MM/YYYY");
        setNotificationBudget(data.notificationBudget ?? true);
        setNotificationGoals(data.notificationGoals ?? true);
        setNotificationAchievements(data.notificationAchievements ?? true);
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [getToken]);

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
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Error saving settings:", error);
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
      
      // Download as JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `spendwise-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting data:", error);
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
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-slate-400">Customize your SpendWise experience</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 shrink-0">
          <div className="bg-[#1a2332] rounded-2xl border border-white/5 overflow-hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all ${
                  activeTab === tab.id 
                    ? "bg-blue-500/10 text-blue-400 border-l-2 border-blue-500" 
                    : "text-slate-400 hover:bg-white/5 hover:text-white border-l-2 border-transparent"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
                <ChevronRight className={`w-4 h-4 ml-auto transition-transform ${activeTab === tab.id ? "rotate-90" : ""}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <div className="bg-[#1a2332] rounded-2xl border border-white/5 p-6">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-1">Profile</h2>
                  <p className="text-slate-400 text-sm">Personalize how others see you</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      maxLength={50}
                      placeholder="Your display name"
                      className="w-full px-4 py-3 bg-[#0f1923] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      maxLength={160}
                      rows={3}
                      placeholder="Tell us about yourself..."
                      className="w-full px-4 py-3 bg-[#0f1923] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none"
                    />
                    <p className="text-xs text-slate-500 mt-1 text-right">{bio.length}/160</p>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === "appearance" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-1">Appearance</h2>
                  <p className="text-slate-400 text-sm">Customize how SpendWise looks</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Theme
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {(["light", "dark", "system"] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => setTheme(t)}
                          className={`px-4 py-3 rounded-xl border transition-all capitalize ${
                            theme === t
                              ? "bg-blue-500/20 border-blue-500 text-blue-400"
                              : "bg-[#0f1923] border-white/10 text-slate-400 hover:border-white/20"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Accent Color
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {ACCENT_COLORS.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => setAccentColor(color.value)}
                          className={`w-10 h-10 rounded-full transition-all ${
                            accentColor === color.value
                              ? "ring-2 ring-white ring-offset-2 ring-offset-[#1a2332] scale-110"
                              : "hover:scale-105"
                          }`}
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === "preferences" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-1">Preferences</h2>
                  <p className="text-slate-400 text-sm">Set your preferred currency and language</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Currency
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-4 py-3 bg-[#0f1923] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.symbol} {c.code} - {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Language
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setLanguage("id")}
                        className={`px-4 py-3 rounded-xl border transition-all flex items-center gap-2 ${
                          language === "id"
                            ? "bg-blue-500/20 border-blue-500 text-blue-400"
                            : "bg-[#0f1923] border-white/10 text-slate-400 hover:border-white/20"
                        }`}
                      >
                        <span className="text-lg">🇮🇩</span>
                        <span>Bahasa Indonesia</span>
                      </button>
                      <button
                        onClick={() => setLanguage("en")}
                        className={`px-4 py-3 rounded-xl border transition-all flex items-center gap-2 ${
                          language === "en"
                            ? "bg-blue-500/20 border-blue-500 text-blue-400"
                            : "bg-[#0f1923] border-white/10 text-slate-400 hover:border-white/20"
                        }`}
                      >
                        <span className="text-lg">🇺🇸</span>
                        <span>English</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Date Format
                    </label>
                    <select
                      value={dateFormat}
                      onChange={(e) => setDateFormat(e.target.value)}
                      className="w-full px-4 py-3 bg-[#0f1923] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2025)</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2025)</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD (2025-12-31)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-1">Notifications</h2>
                  <p className="text-slate-400 text-sm">Control what notifications you receive</p>
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
                      className="flex items-center justify-between p-4 bg-[#0f1923] rounded-xl border border-white/5"
                    >
                      <div>
                        <p className="text-white font-medium">{item.label}</p>
                        <p className="text-slate-500 text-sm">{item.description}</p>
                      </div>
                      <button
                        onClick={() => item.onChange(!item.value)}
                        className={`relative w-12 h-7 rounded-full transition-all ${
                          item.value ? "bg-blue-500" : "bg-slate-600"
                        }`}
                      >
                        <div 
                          className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${
                            item.value ? "left-6" : "left-1"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === "privacy" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-1">Privacy & Data</h2>
                  <p className="text-slate-400 text-sm">Manage your privacy settings and data</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-[#0f1923] rounded-xl border border-white/5">
                    <div>
                      <p className="text-white font-medium">Hide Amounts by Default</p>
                      <p className="text-slate-500 text-sm">Blur all monetary values for privacy</p>
                    </div>
                    <button
                      onClick={togglePrivacyMode}
                      className={`relative w-12 h-7 rounded-full transition-all ${
                        isPrivacyMode ? "bg-blue-500" : "bg-slate-600"
                      }`}
                    >
                      <div 
                        className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${
                          isPrivacyMode ? "left-6" : "left-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="p-4 bg-[#0f1923] rounded-xl border border-white/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">Export Your Data</p>
                        <p className="text-slate-500 text-sm">Download all your SpendWise data as JSON</p>
                      </div>
                      <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all disabled:opacity-50"
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
            <div className="mt-8 pt-6 border-t border-white/5">
              <button
                onClick={handleSave}
                disabled={saving}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  saved 
                    ? "bg-green-500 text-white" 
                    : "bg-blue-500 hover:bg-blue-600 text-white"
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
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

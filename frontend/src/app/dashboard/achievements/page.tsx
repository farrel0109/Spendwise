"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import {
  getUserStats,
  getAchievements,
  type UserStats,
  type Achievement,
} from "@/lib/api";

const LEVEL_TITLES = [
  "Beginner",
  "Tracker",
  "Saver",
  "Budgeter",
  "Analyst",
  "Strategist",
  "Expert",
  "Master",
  "Guru",
  "Legend",
  "Mythic",
];

export default function AchievementsPage() {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [summary, setSummary] = useState({
    earnedCount: 0,
    totalCount: 0,
    completionPercent: 0,
  });

  const fetchData = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const [statsData, achData] = await Promise.all([
        getUserStats(token),
        getAchievements(token),
      ]);

      setStats(statsData);
      setAchievements(achData.achievements || []);
      setSummary({
        earnedCount: achData.earnedCount || 0,
        totalCount: achData.totalCount || 0,
        completionPercent: achData.completionPercent || 0,
      });
    } catch (error) {
      console.error("Error fetching achievements:", error);
      toast.error("Failed to load achievements");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="space-y-8 pb-32 md:pb-12 max-w-[1600px] mx-auto px-6 md:px-10">
        <div className="h-10 w-48 bg-zinc-200 dark:bg-white/10 rounded-xl animate-pulse mb-2" />
        <div className="h-4 w-32 bg-zinc-100 dark:bg-white/5 rounded animate-pulse" />
        
        <div className="bg-[var(--color-surface-elevated)] rounded-2xl p-6 border border-zinc-200 dark:border-white/5 animate-pulse">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-white/10" />
                <div className="h-4 w-20 bg-zinc-100 dark:bg-white/5 rounded" />
                <div className="h-3 w-16 bg-zinc-100 dark:bg-white/5 rounded" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[var(--color-surface-elevated)] rounded-xl p-4 border border-zinc-200 dark:border-white/5 animate-pulse">
          <div className="flex justify-between mb-4">
            <div className="h-6 w-32 bg-zinc-200 dark:bg-white/10 rounded" />
            <div className="h-6 w-16 bg-zinc-200 dark:bg-white/10 rounded" />
          </div>
          <div className="h-3 w-full bg-zinc-100 dark:bg-white/5 rounded-full" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-[var(--color-surface-elevated)] p-6 rounded-2xl border border-zinc-200 dark:border-white/5 animate-pulse flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-white/10 mb-3" />
              <div className="h-4 w-24 bg-zinc-100 dark:bg-white/5 rounded mb-2" />
              <div className="h-3 w-32 bg-zinc-100 dark:bg-white/5 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary">Achievements</h1>
        <p className="text-muted">Track your progress and earn badges</p>
      </div>

      {/* Stats Card */}
      {stats && (
        <div className="bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-orange-600/20 backdrop-blur-xl rounded-2xl border border-[var(--accent-color)]/30 p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Level */}
            <div className="text-center">
              <div className="text-5xl font-bold text-white mb-1">
                {stats.level}
              </div>
              <p className="text-[var(--accent-color)] text-sm">Level</p>
              <p className="text-white/70 text-xs">
                {LEVEL_TITLES[stats.level - 1] || "Legend"}
              </p>
            </div>

            {/* XP Progress */}
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">
                {stats.xp}
              </div>
              <p className="text-[var(--accent-color)] text-sm">Total XP</p>
              <div className="mt-2">
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[var(--accent-color)] to-pink-500 transition-all duration-500"
                    style={{ width: `${stats.progressPercent}%` }}
                  />
                </div>
                <p className="text-white/70 text-xs mt-1">
                  {stats.xpProgress}/{stats.xpNeeded} to next level
                </p>
              </div>
            </div>

            {/* Streak */}
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-3xl mb-1">
                <span>🔥</span>
                <span className="font-bold text-orange-400">{stats.streak}</span>
              </div>
              <p className="text-orange-400 text-sm">Day Streak</p>
              <p className="text-white/70 text-xs">
                Best: {stats.longestStreak} days
              </p>
            </div>

            {/* Financial Score */}
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-1">
                {stats.financialScore}
              </div>
              <p className="text-green-400 text-sm">Financial Score</p>
              <p className="text-white/70 text-xs">
                {stats.totalTransactions} transactions
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Achievement Progress */}
      <div className="bg-[var(--color-surface-elevated)] rounded-xl border border-zinc-200 dark:border-white/5 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-primary">Badge Collection</h3>
          <span className="text-[var(--accent-color)] font-medium">
            {summary.earnedCount}/{summary.totalCount} ({summary.completionPercent}%)
          </span>
        </div>
        <div className="h-3 bg-zinc-200 dark:bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[var(--accent-color)] via-pink-500 to-orange-500 transition-all duration-500"
            style={{ width: `${summary.completionPercent}%` }}
          />
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`relative rounded-2xl border p-6 text-center transition-all ${
              achievement.earned
                ? "bg-gradient-to-br from-[var(--accent-color)]/10 to-pink-500/10 border-[var(--accent-color)]/30"
                : "bg-[var(--color-surface-elevated)] border-zinc-200 dark:border-white/5 grayscale opacity-60"
            }`}
          >
            {/* Badge Icon */}
            <div
              className={`text-5xl mb-3 ${
                achievement.earned ? "" : "filter grayscale"
              }`}
            >
              {achievement.icon}
            </div>

            {/* Badge Name */}
            <h4 className="font-semibold text-primary mb-1">{achievement.name}</h4>

            {/* Description */}
            <p className="text-muted text-xs">{achievement.description}</p>

            {/* Earned Date */}
            {achievement.earned && achievement.earnedAt && (
              <p className="text-[var(--accent-color)] text-xs mt-2">
                Earned {new Date(achievement.earnedAt).toLocaleDateString("id-ID")}
              </p>
            )}

            {/* Locked Indicator */}
            {!achievement.earned && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl opacity-80">🔒</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Tips */}
      <div className="bg-[var(--color-surface-elevated)] rounded-xl border border-zinc-200 dark:border-white/5 p-6">
        <h3 className="text-lg font-semibold text-primary mb-4">💡 How to Earn More</h3>
        <ul className="space-y-2 text-muted text-sm">
          <li>• Log transactions daily to build your streak 🔥</li>
          <li>• Add emotions to your transactions for bonus XP ✨</li>
          <li>• Complete savings goals to unlock badges 🎯</li>
          <li>• Stay under budget to prove your skills 📊</li>
          <li>• Use all features to become a financial master 🏆</li>
        </ul>
      </div>
    </div>
  );
}

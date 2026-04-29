"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Users,
  GraduationCap,
  BookOpen,
  Building2,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Calendar,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

// Static color configuration
const COLOR_CLASSES = {
  emerald:
    "from-emerald-500 to-teal-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
  blue: "from-blue-500 to-cyan-600 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  violet:
    "from-violet-500 to-purple-600 bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400",
  amber:
    "from-amber-500 to-orange-600 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    students: 0,
    degrees: 0,
    subjects: 0,
    departments: 0,
    staff: 0,
    recentUsers: [],
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStats();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchStats() {
    try {
      setRefreshing(true);
      const res = await fetch("/api/admin/dashboard");
      const data = await res.json();

      setStats({
        students: data.students || 0,
        degrees: data.degrees || 0,
        subjects: data.subjects || 0,
        departments: data.departments || 0,
        staff: data.staff || 0,
        recentUsers: data.recentUsers || [],
        trends: data.trends || {},
      });
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const statCards = useMemo(
    () => [
      {
        label: "Total Students",
        value: stats.students,
        icon: Users,
        color: "emerald",
        trendUp: true,
        href: "/admin/users?role=student",
      },
      {
        label: "Degree Programs",
        value: stats.degrees,
        icon: GraduationCap,
        color: "blue",
        trendUp: true,
        href: "/admin/degrees",
      },
      {
        label: "Active Subjects",
        value: stats.subjects,
        icon: BookOpen,
        color: "violet",
        trendUp: true,
        href: "/admin/subjects",
      },
      {
        label: "Departments",
        value: stats.departments,
        icon: Building2,
        color: "amber",
        trendUp: true,
        href: "/admin/departments",
      },
    ],
    [stats.students, stats.degrees, stats.subjects, stats.departments]
  );

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Dashboard Overview
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Live system metrics • Updated {lastUpdated?.toLocaleTimeString()}
          </p>
        </div>
        <button
          onClick={fetchStats}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          const colors = COLOR_CLASSES[card.color];

          return (
            <Link
              key={card.label}
              href={card.href}
              className="group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div
                className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${colors} opacity-10 rounded-bl-full`}
              />

              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-lg ${colors}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>

              <div className="mt-4">
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {card.value.toLocaleString()}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {card.label}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

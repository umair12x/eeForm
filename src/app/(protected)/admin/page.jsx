// app/admin/page.jsx - Enhanced Dashboard
"use client"

import { useEffect, useState } from "react"
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
  RefreshCw
} from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Admin Dashboard | UAF Digital Enrollment Portal",
  description: "Admin overview with system statistics, user management, and quick actions.",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    students: 0,
    degrees: 0,
    subjects: 0,
    departments: 0,
    staff: 0,
    recentUsers: []
  })
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchStats()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  async function fetchStats() {
    try {
      setRefreshing(true)
      const res = await fetch("/api/admin/dashboard")
      const data = await res.json()
      
      setStats({
        students: data.students || 0,
        degrees: data.degrees || 0,
        subjects: data.subjects || 0,
        departments: data.departments || 0,
        staff: data.staff || 0,
        recentUsers: data.recentUsers || [],
        trends: data.trends || {}
      })
      setLastUpdated(new Date())
    } catch (err) {
      console.error("Failed to fetch stats:", err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const statCards = [
    {
      label: "Total Students",
      value: stats.students,
      icon: Users,
      color: "emerald",
      trend: "+12%",
      trendUp: true,
      href: "/admin/users?role=student"
    },
    {
      label: "Degree Programs",
      value: stats.degrees,
      icon: GraduationCap,
      color: "blue",
      trend: "+3",
      trendUp: true,
      href: "/admin/degrees"
    },
    {
      label: "Active Subjects",
      value: stats.subjects,
      icon: BookOpen,
      color: "violet",
      trend: "+8%",
      trendUp: true,
      href: "/admin/subjects"
    },
    {
      label: "Departments",
      value: stats.departments,
      icon: Building2,
      color: "amber",
      trend: "0",
      trendUp: true,
      href: "/admin/departments"
    }
  ]

  const colorClasses = {
    emerald: "from-emerald-500 to-teal-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
    blue: "from-blue-500 to-cyan-600 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
    violet: "from-violet-500 to-purple-600 bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400",
    amber: "from-amber-500 to-orange-600 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h1>
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
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon
          const colors = colorClasses[card.color]
          
          return (
            <Link
              key={card.label}
              href={card.href}
              className="group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${colors} opacity-10 rounded-bl-full`} />
              
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-lg ${colors}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${card.trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {card.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {card.trend}
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {card.value.toLocaleString()}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{card.label}</p>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Users */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              Recent Registrations
            </h2>
            <Link href="/admin/users" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All
            </Link>
          </div>
          
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {stats.recentUsers.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>No recent registrations</p>
              </div>
            ) : (
              stats.recentUsers.map((user, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                      {user.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email || user.registrationNumber} • {user.role}</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">{user.timeAgo}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { label: "Create New User", href: "/admin/create-user", icon: Users, color: "bg-emerald-100 text-emerald-600" },
              { label: "Add Department", href: "/admin/departments", icon: Building2, color: "bg-blue-100 text-blue-600" },
              { label: "Manage Degrees", href: "/admin/degrees", icon: GraduationCap, color: "bg-violet-100 text-violet-600" },
              { label: "System Settings", href: "/admin/settings", icon: MoreHorizontal, color: "bg-slate-100 text-slate-600" }
            ].map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                >
                  <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{action.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
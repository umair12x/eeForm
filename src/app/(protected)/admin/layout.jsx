// app/admin/layout.jsx - Enhanced Admin Layout
"use client"

import { useState, useEffect } from "react"
import AdminNavbar from "@/components/layout/AdminNavbar"

export const metadata = {
  title: "Admin Dashboard | UAF Digital Enrollment Portal",
  description: "Admin control panel for managing departments, degrees, users, and system settings.",
};

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <AdminNavbar />
      
      {/* Breadcrumb & Header Space */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <span className="hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer">Admin</span>
              <span>/</span>
              <span className="text-slate-900 dark:text-white font-medium">Dashboard</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-slate-500 dark:text-slate-400">System Online</span>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
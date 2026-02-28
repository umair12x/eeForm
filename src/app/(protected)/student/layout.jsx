// app/student/layout.jsx - Enhanced Student Layout
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  CreditCard,
  FileText,
  GraduationCap,
  ChevronRight,
  Bell,
  Settings,
  LogOut,
  User,
  BookOpen,
  Calendar,
  HelpCircle,
  Menu,
  X
} from "lucide-react"

export default function StudentLayout({ children }) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState(2)
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Fetch user data
    fetchUser()
  }, [])

  async function fetchUser() {
    try {
      const res = await fetch("/api/auth/me")
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      }
    } catch (err) {
      console.error("Error fetching user:", err)
    }
  }

  const navigation = [
    {
      name: "Dashboard",
      href: "/student",
      icon: LayoutDashboard,
      description: "Overview & Status",
      color: "blue"
    },
    {
      name: "Fee Submission",
      href: "/student/fee",
      icon: CreditCard,
      description: "Pay & Track Fees",
      color: "emerald"
    },
    {
      name: "UG-1 Form",
      href: "/student/form/ug1",
      icon: FileText,
      description: "Course Registration",
      color: "violet"
    },
    {
      name: "GS-10 Form",
      href: "/student/form/gs10",
      icon: BookOpen,
      description: "Thesis/Research",
      color: "amber"
    },
  ]

  const isActive = (href) => {
    if (href === "/student") {
      return pathname === "/student" || pathname === "/student/"
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
     

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Navigation */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                  <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Student Services
                  </h2>
                </div>

                <nav className="p-3 space-y-1">
                  {navigation.map((item) => {
                    const active = isActive(item.href)
                    const Icon = item.icon

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`
                          group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                          ${active
                            ? `bg-${item.color}-50 dark:bg-${item.color}-950/30 text-${item.color}-700 dark:text-${item.color}-300 shadow-sm ring-1 ring-${item.color}-200 dark:ring-${item.color}-800`
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                          }
                        `}
                      >
                        <div className={`
                          flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200
                          ${active
                            ? `bg-${item.color}-600 text-white shadow-md`
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-white dark:group-hover:bg-slate-700"
                          }
                        `}>
                          <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="truncate font-semibold">{item.name}</span>
                            {active && <ChevronRight className="w-4 h-4 animate-in slide-in-from-left-1" />}
                          </div>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                            {item.description}
                          </p>
                        </div>
                      </Link>
                    )
                  })}
                </nav>
              </div>

              {/* Quick Stats */}
             

              {/* Help Card */}
              <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl shadow-lg p-5 text-white">
                <div className="flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-indigo-200 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-sm mb-1">Need Assistance?</h3>
                    <p className="text-xs text-indigo-100 mb-3">
                      Contact registrar office for help with forms and payments.
                    </p>
                    <button className="w-full py-2 px-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg text-xs font-medium transition-colors">
                      Contact Support
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 min-h-[calc(100vh-12rem)]">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
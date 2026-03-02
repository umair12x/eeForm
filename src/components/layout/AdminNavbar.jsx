// AdminNavbar - Enhanced Sub-Navigation
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Building2, 
  GraduationCap, 
  BookOpen, 
  Users, 
  UserPlus,
  Settings,
  Shield,
  ChevronRight,
  MoreHorizontal
} from "lucide-react"

export default function AdminNavbar() {
  const pathname = usePathname()

  const links = [
    { 
      name: "Dashboard", 
      href: "/admin",
      icon: LayoutDashboard,
      description: "Overview & Analytics"
    },
    { 
      name: "Departments", 
      href: "/admin/departments",
      icon: Building2,
      description: "Manage Departments"
    },
    { 
      name: "Degrees", 
      href: "/admin/degrees",
      icon: GraduationCap,
      description: "Degree Programs"
    },
    { 
      name: "Subjects", 
      href: "/admin/subjects",
      icon: BookOpen,
      description: "Course Subjects"
    },
    { 
      name: "Users", 
      href: "/admin/users",
      icon: Users,
      description: "User Management"
    },
    { 
      name: "Create User", 
      href: "/admin/create-user",
      icon: UserPlus,
      description: "Add New User",
      highlight: true
    },
  ]

  const isActive = (href) => {
    if (href === "/admin") {
      return pathname === "/admin" || pathname === "/admin/"
    }
    return pathname.startsWith(href)
  }

  const activeLink = links.find(link => isActive(link.href))
  const activeName = activeLink?.name || "Dashboard"

  return (
    <div className=" bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      {/* Primary Admin Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-14 gap-4">
          
          {/* Admin Identity */}
          <div className="flex items-center gap-3 pr-4 border-r border-slate-200 dark:border-slate-800 shrink-0">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
              <Shield className="w-4 h-4" strokeWidth={2.5} />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Admin
                </h2>
                <ChevronRight className="w-3 h-3 text-slate-400" />
                <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                  {activeName}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Pills */}
          <nav className="flex-1 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-1 min-w-max">
              {links.map((link) => {
                const active = isActive(link.href)
                const Icon = link.icon
                
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`
                      group relative flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
                      ${active 
                        ? 'bg-violet-600 text-white shadow-md shadow-violet-200 dark:shadow-violet-900/30' 
                        : link.highlight
                          ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:hover:text-emerald-300'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                      }
                    `}
                  >
                    <Icon 
                      className={`w-4 h-4 transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-105'}`} 
                      strokeWidth={active ? 2.5 : 2}
                    />
                    <span className="hidden sm:inline">{link.name}</span>
                    <span className="sm:hidden">{link.name.split(' ')[0]}</span>
                    
                    {/* Highlight Indicator */}
                    {link.highlight && !active && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
                    )}
                  </Link>
                )
              })}
            </div>
          </nav>

          {/* Quick Actions */}
          <div className="hidden md:flex items-center gap-1 pl-4 border-l border-slate-200 dark:border-slate-800 shrink-0">
            <button className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">
              <Settings className="w-4 h-4" />
            </button>
            <button className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Context Bar (shows on scroll or when needed) */}
      <div className="hidden lg:block border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-9 gap-4 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              System Operational
            </span>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">|</span>
            <span className="hidden sm:inline">Last updated: {new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
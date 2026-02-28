// Main NavBar - Enhanced
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import {
  GraduationCap,
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  Settings,
  Shield,
  Building2,
  Banknote,
  UserCog,
  Users,
  ChevronDown,
  HelpCircle,
  Home,
  BookOpen,
  Mail,
  Bell,
  Search,
  FileText
} from "lucide-react"
import ThemeToggle from "./ThemeToggle"

export default function NavBar() {
  const router = useRouter()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [notifications, setNotifications] = useState(3)

  useEffect(() => {
    fetchUser()
    if (typeof window !== 'undefined') {
      const handleScroll = () => setIsScrolled(window.scrollY > 10)
      window.addEventListener('scroll', handleScroll)
      return () => window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  async function fetchUser() {
    try {
      const res = await fetch("/api/auth/me")
      const data = await res.json()
      if (res.ok) setUser(data.user)
    } catch (err) {
      console.error("Error fetching user:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(null)
      setShowUserMenu(false)
      setIsMenuOpen(false)
      router.push("/")
    } catch (err) {
      console.error("Error logging out:", err)
    }
  }

  const roleConfig = {
    admin: { 
      icon: Shield, 
      color: "text-violet-600 dark:text-violet-400", 
      bg: "bg-violet-50 dark:bg-violet-900/20",
      border: "border-violet-200 dark:border-violet-800",
      label: "Administrator",
      gradient: "from-violet-600 to-purple-600",
      accent: "violet"
    },
    "dg-office": { 
      icon: Building2, 
      color: "text-blue-600 dark:text-blue-400", 
      bg: "bg-blue-50 dark:bg-blue-900/20",
      border: "border-blue-200 dark:border-blue-800",
      label: "DG Office",
      gradient: "from-blue-600 to-cyan-600",
      accent: "blue"
    },
    "fee-office": { 
      icon: Banknote, 
      color: "text-emerald-600 dark:text-emerald-400", 
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      border: "border-emerald-200 dark:border-emerald-800",
      label: "Fee Office",
      gradient: "from-emerald-600 to-teal-600",
      accent: "emerald"
    },
    manager: { 
      icon: UserCog, 
      color: "text-amber-600 dark:text-amber-400", 
      bg: "bg-amber-50 dark:bg-amber-900/20",
      border: "border-amber-200 dark:border-amber-800",
      label: "Manager",
      gradient: "from-amber-600 to-orange-600",
      accent: "amber"
    },
    tutor: { 
      icon: Users, 
      color: "text-rose-600 dark:text-rose-400", 
      bg: "bg-rose-50 dark:bg-rose-900/20",
      border: "border-rose-200 dark:border-rose-800",
      label: "Tutor",
      gradient: "from-rose-600 to-pink-600",
      accent: "rose"
    },
    student: { 
      icon: GraduationCap, 
      color: "text-slate-600 dark:text-slate-400", 
      bg: "bg-slate-50 dark:bg-slate-800",
      border: "border-slate-200 dark:border-slate-700",
      label: "Student",
      gradient: "from-slate-600 to-slate-700",
      accent: "slate"
    }
  }

  const getUserConfig = () => {
    if (!user) return roleConfig.student
    return roleConfig[user.role] || roleConfig.student
  }

  const getUserDashboardLink = () => {
    if (!user) return "/login"
    const links = {
      admin: "/admin",
      "dg-office": "/dg-office",
      "fee-office": "/fee-office",
      manager: "/manager",
      tutor: "/tutor",
      student: "/student"
    }
    return links[user.role] || "/"
  }

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/guide", label: "Guide", icon: BookOpen },
    { href: "/about", label: "About", icon: FileText },
    { href: "/contact", label: "Contact", icon: Mail },
  ]

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showUserMenu && !e.target.closest('.user-menu-container')) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showUserMenu])

  if (pathname?.startsWith("/login") || pathname?.startsWith("/register")) return null

  const userConfig = getUserConfig()
  const UserIcon = userConfig.icon

  return (
    <nav className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-lg border-b border-slate-200/80 dark:border-slate-800/80' 
        : 'bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-md shadow-blue-200 dark:shadow-blue-900/30 group-hover:shadow-lg transition-all duration-300">
                <GraduationCap className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900">
                <div className="w-full h-full rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                UAF Portal
              </h1>
              <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                Digital Enrollment System
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-0.5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              const LinkIcon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <LinkIcon className={`w-4 h-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                  {link.label}
                </Link>
              )
            })}
          </div>

          {/* Right Section */}
          <div className="hidden md:flex items-center gap-2">
            

            {/* Theme Toggle */}
            <div className="p-1">
              <ThemeToggle />
            </div>

          

            {/* User Menu */}
            {loading ? (
              <div className="w-36 h-10 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse ml-2" />
            ) : user ? (
              <div className="relative user-menu-container ml-2">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg border transition-all duration-200 ${
                    showUserMenu 
                      ? `${userConfig.bg} ${userConfig.border}` 
                      : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-md ${userConfig.bg} flex items-center justify-center`}>
                    <UserIcon className={`w-4 h-4 ${userConfig.color}`} />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white leading-none">
                      {user.name?.split(' ')[0] || 'User'}
                    </span>
                    <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                      {userConfig.label}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                    {/* Header */}
                    <div className={`px-4 py-3 bg-gradient-to-r ${userConfig.gradient}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                          <UserIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-white text-sm truncate">{user.name}</p>
                          <p className="text-xs text-white/80 truncate">{user.email || user.registrationNumber}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-1.5">
                      <Link
                        href={getUserDashboardLink()}
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-500" />
                        Dashboard
                      </Link>

                      <Link
                        href="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <User className="w-4 h-4 text-slate-500" />
                        Profile
                      </Link>

                      {user.role === "admin" && (
                        <Link
                          href="/admin/settings"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                        >
                          <Settings className="w-4 h-4 text-slate-500" />
                          Settings
                        </Link>
                      )}

                      <div className="my-1 border-t border-slate-200 dark:border-slate-700" />

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all duration-200 ml-2"
              >
                <LogOut className="w-4 h-4 rotate-180" />
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <div className="scale-90">
              <ThemeToggle />
            </div>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="px-4 py-4 space-y-3">
            {/* Mobile User Card */}
            {user && (
              <div className={`p-3 rounded-xl ${userConfig.bg} border ${userConfig.border}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                    <UserIcon className={`w-6 h-6 ${userConfig.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{userConfig.label}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={getUserDashboardLink()}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold text-center bg-gradient-to-r ${userConfig.gradient} text-white`}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="py-2 px-3 rounded-lg text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Mobile Nav Links */}
            <div className="space-y-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href
                const LinkIcon = link.icon
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <LinkIcon className={`w-5 h-5 ${isActive ? userConfig.color : 'text-slate-500'}`} />
                    {link.label}
                  </Link>
                )
              })}
            </div>

            {/* Mobile Login */}
            {!user && (
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-semibold"
              >
                <LogOut className="w-5 h-5 rotate-180" />
                Sign In to Portal
              </Link>
            )}

            {/* Help Link */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <Link
                href="/help"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-400"
              >
                <HelpCircle className="w-5 h-5" />
                Need Help?
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
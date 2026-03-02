// app/student/layout.jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CreditCard,
  FileText,
  BookOpen,
  User,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronRight,
  GraduationCap,
  Settings,
  HelpCircle,
  Moon,
  Sun,
} from "lucide-react";

export default function StudentLayout({ children }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check system preference for dark mode
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    setIsDarkMode(prefersDark);

    // Apply dark mode class
    if (prefersDark) {
      document.documentElement.classList.add("dark");
    }

    fetchUser();
  }, []);

  useEffect(() => {
    // Toggle dark mode class
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  async function fetchUser() {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (err) {
      console.error("Error fetching user:", err);
    } finally {
      setIsLoading(false);
    }
  }

  const navigation = [
    {
      name: "Dashboard",
      href: "/student",
      icon: LayoutDashboard,
      description: "Overview & Status",
      gradient: "from-blue-500 to-blue-600",
      lightBg: "bg-blue-50",
      darkBg: "dark:bg-blue-500/10",
      textColor: "text-blue-600 dark:text-blue-400",
    },
    {
      name: "Fee Submission",
      href: "/student/fee",
      icon: CreditCard,
      description: "Pay & Track Fees",
      gradient: "from-emerald-500 to-emerald-600",
      lightBg: "bg-emerald-50",
      darkBg: "dark:bg-emerald-500/10",
      textColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      name: "UG-1 Form",
      href: "/student/form/ug1",
      icon: FileText,
      description: "Course Registration",
      gradient: "from-violet-500 to-violet-600",
      lightBg: "bg-violet-50",
      darkBg: "dark:bg-violet-500/10",
      textColor: "text-violet-600 dark:text-violet-400",
    },
    {
      name: "GS-10 Form",
      href: "/student/form/gs10",
      icon: BookOpen,
      description: "Thesis/Research",
      gradient: "from-amber-500 to-amber-600",
      lightBg: "bg-amber-50",
      darkBg: "dark:bg-amber-500/10",
      textColor: "text-amber-600 dark:text-amber-400",
    },
  ];

  const isActive = (href) => {
    if (href === "/student") {
      return pathname === "/student" || pathname === "/student/";
    }
    return pathname.startsWith(href);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm">
          <div className="absolute right-0 top-0 h-full w-64 bg-white dark:bg-slate-900 shadow-xl">
            <div className="p-4">
              <nav className="space-y-1">
                {navigation.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all
                        ${
                          active
                            ? `${item.lightBg} ${item.darkBg} ${item.textColor}`
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                      {active && <ChevronRight className="w-3 h-3 ml-auto" />}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-24 space-y-4">
              {/* Navigation */}
              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <nav className="p-2 space-y-1">
                  {navigation.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`
                          group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                          ${
                            active
                              ? `${item.lightBg} ${item.darkBg} ${item.textColor}`
                              : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                          }
                        `}
                      >
                        <div
                          className={`
                          flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                          ${
                            active
                              ? `bg-gradient-to-br ${item.gradient} text-white shadow-sm`
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                          }
                        `}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="truncate">{item.name}</span>
                          </div>
                          <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                            {item.description}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Help Card */}
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-4 shadow-lg">
                <div className="flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-indigo-200" />
                  <div>
                    <h4 className="font-medium text-white text-sm mb-1">
                      Need Help?
                    </h4>
                    <p className="text-xs text-indigo-100 mb-3">
                      Contact the office for assistance.
                    </p>
                    <button className="w-full px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium text-white transition-colors">
                      <Link href="/contact">Contact Us</Link>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

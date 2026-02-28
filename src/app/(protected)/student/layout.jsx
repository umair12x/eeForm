"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CreditCard,
  FileText,
  GraduationCap,
  ChevronRight,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";

export default function StudentLayout({ children }) {
  const pathname = usePathname();

  const navigation = [
    {
      name: "Dashboard",
      href: "/student",
      icon: LayoutDashboard,
      description: "Overview & Analytics",
    },
    {
      name: "Fee Submission",
      href: "/student/fee",
      icon: CreditCard,
      description: "Payments & Invoices",
    },
    {
      name: "UG-1 Form",
      href: "/student/form",
      icon: FileText,
      description: "Registration Forms",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Top Navigation Bar */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Main Navigation Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                  <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Navigation
                  </h2>
                </div>

                <nav className="p-3 space-y-1">
                  {navigation.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`
                          group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ease-out
                          ${
                            isActive
                              ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 shadow-sm ring-1 ring-indigo-200 dark:ring-indigo-800"
                              : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                          }
                        `}
                      >
                        <div
                          className={`
                          flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200
                          ${
                            isActive
                              ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-white dark:group-hover:bg-slate-700 group-hover:shadow-sm"
                          }
                        `}
                        >
                          <Icon
                            className="w-5 h-5"
                            strokeWidth={isActive ? 2.5 : 2}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="truncate font-semibold">
                              {item.name}
                            </span>
                            {isActive && (
                              <ChevronRight className="w-4 h-4 text-indigo-400 animate-in slide-in-from-left-1" />
                            )}
                          </div>
                          <p className="text-xs text-slate-400 dark:text-slate-500 font-normal mt-0.5 truncate">
                            {item.description}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Quick Info Card */}
              <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-indigo-950 p-5 text-white">
                <h3 className="font-semibold text-sm mb-1">Need Help?</h3>
                <p className="text-xs text-indigo-100 mb-3">
                  Contact the registrar office for assistance with forms and
                  payments.
                </p>
                <button className="w-full py-2 px-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg text-xs font-medium transition-colors duration-200">
                  Contact Support
                </button>
              </div>
            </div>
          </aside>

          {/* Mobile Navigation */}
          <div className="lg:hidden">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-2 overflow-x-auto">
              <div className="flex gap-1 min-w-max">
                {navigation.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`
                        flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap
                        ${
                          isActive
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }
                      `}
                    >
                      <Icon
                        className="w-4 h-4"
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="flex m-14">{children}</div>

       
        </div>
      </div>
    </div>
  );
}

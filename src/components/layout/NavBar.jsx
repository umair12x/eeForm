"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  FaMoon,
  FaSun,
  FaBars,
  FaTimes,
  FaUniversity,
  FaSignInAlt,
  FaUserCircle,
  FaUserTie,
  FaUserGraduate,
  FaSignOutAlt,
  FaChevronDown,
  FaCog,
  FaShieldAlt,
  FaMoneyBillWave,
  FaBuilding,
} from "react-icons/fa";
import ThemeToggle from "./ThemeToggle";

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  async function fetchUser() {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      
      if (res.ok) {
        setUser(data.user);
      }
    } catch (err) {
      console.error("Error fetching user:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setShowUserMenu(false);
      setIsMenuOpen(false);
      router.push("/");
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  const getUserIcon = () => {
    if (!user) return <FaUserCircle className="text-2xl" />;
    
    switch (user.role) {
      case "admin":
        return <FaShieldAlt className="text-2xl text-purple-500" />;
      case "dg-office":
        return <FaBuilding className="text-2xl text-blue-500" />;
      case "fee-office":
        return <FaMoneyBillWave className="text-2xl text-emerald-500" />;
      case "manager":
        return <FaUserTie className="text-2xl text-orange-500" />;
      case "tutor":
        return <FaUserGraduate className="text-2xl text-green-500" />;
      case "student":
        return <FaUserGraduate className="text-2xl text-gray-500" />;
      default:
        return <FaUserCircle className="text-2xl" />;
    }
  };

  const getRoleBadge = () => {
    if (!user) return null;
    
    const badges = {
      admin: { bg: "bg-purple-100 dark:bg-purple-900", text: "text-purple-700 dark:text-purple-300", label: "Admin" },
      "dg-office": { bg: "bg-blue-100 dark:bg-blue-900", text: "text-blue-700 dark:text-blue-300", label: "DG Office" },
      "fee-office": { bg: "bg-emerald-100 dark:bg-emerald-900", text: "text-emerald-700 dark:text-emerald-300", label: "Fee Office" },
      manager: { bg: "bg-orange-100 dark:bg-orange-900", text: "text-orange-700 dark:text-orange-300", label: "Manager" },
      tutor: { bg: "bg-green-100 dark:bg-green-900", text: "text-green-700 dark:text-green-300", label: "Tutor" },
      student: { bg: "bg-gray-100 dark:bg-gray-700", text: "text-gray-700 dark:text-gray-300", label: "Student" },
    };
    
    const badge = badges[user.role] || badges.student;
    
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full ${badge.bg} ${badge.text} font-medium`}>
        {badge.label}
      </span>
    );
  };

  const getUserDashboardLink = () => {
    if (!user) return "/login";
    
    switch (user.role) {
      case "admin": return "/admin";
      case "dg-office": return "/dg-office";
      case "fee-office": return "/fee-office";
      case "manager": return "/manager";
      case "tutor": return "/tutor";
      case "student": return "/student";
      default: return "/";
    }
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/guide", label: "Guide" },
    { href: "/contact", label: "Contact" },
  ];

  // Hide navbar on auth pages
  if (pathname?.startsWith("/login") || pathname?.startsWith("/register")) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="p-2.5 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
              <FaUniversity className="text-2xl text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                UAF Portal
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Digital Enrollment System
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors duration-300 ${
                  pathname === link.href
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <ThemeToggle />

            {/* User Menu */}
            {loading ? (
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                >
                  <div className="flex items-center space-x-3">
                    {getUserIcon()}
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {user.name?.split(' ')[0] || 'User'}
                      </span>
                      {getRoleBadge()}
                    </div>
                  </div>
                  <FaChevronDown className={`text-xs text-gray-500 transition-transform duration-200 ${
                    showUserMenu ? 'rotate-180' : ''
                  }`} />
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 animate-fadeIn">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {user.email || user.registrationNumber}
                      </p>
                      <div className="mt-2">
                        {getRoleBadge()}
                      </div>
                    </div>

                    {/* Dashboard Link */}
                    <Link
                      href={getUserDashboardLink()}
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <FaUserCircle className="text-gray-500" />
                      <span>Dashboard</span>
                    </Link>

                    {/* Settings Link (Admin only) */}
                    {user.role === "admin" && (
                      <Link
                        href="/admin/settings"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <FaCog className="text-gray-500" />
                        <span>Settings</span>
                      </Link>
                    )}

                    {/* Divider */}
                    <div className="my-2 border-t border-gray-200 dark:border-gray-700"></div>

                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <FaSignOutAlt />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                <FaSignInAlt size={16} />
                <span>Login</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-3 md:hidden">
            <ThemeToggle />
            {!loading && user && (
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800"
              >
                {getUserIcon()}
              </button>
            )}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-800 animate-slideDown">
            <div className="flex flex-col space-y-2">
              {/* Mobile User Info (if logged in) */}
              {user && (
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg mb-2">
                  <div className="flex items-center gap-3 mb-2">
                    {getUserIcon()}
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user.email || user.registrationNumber}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    {getRoleBadge()}
                    <button
                      onClick={handleLogout}
                      className="text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-1"
                    >
                      <FaSignOutAlt size={12} /> Logout
                    </button>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg font-medium transition-colors duration-200 ${
                    pathname === link.href
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {/* Dashboard Link for Mobile */}
              {user && (
                <Link
                  href={getUserDashboardLink()}
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg font-medium flex items-center gap-2"
                >
                  <FaUserCircle size={16} />
                  <span>Dashboard</span>
                </Link>
              )}

              {/* Mobile Login Button */}
              {!user && (
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <FaSignInAlt size={16} />
                  <span>Login</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* User Menu Overlay (for mobile) */}
      {showUserMenu && !isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setShowUserMenu(false)}>
          <div className="absolute right-4 top-20 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 animate-fadeIn">
            {/* Mobile User Dropdown Content */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {user?.email || user?.registrationNumber}
              </p>
              <div className="mt-2">{getRoleBadge()}</div>
            </div>
            <Link
              href={getUserDashboardLink()}
              onClick={() => setShowUserMenu(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FaUserCircle className="text-gray-500" />
              <span>Dashboard</span>
            </Link>
            {user?.role === "admin" && (
              <Link
                href="/admin/settings"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FaCog className="text-gray-500" />
                <span>Settings</span>
              </Link>
            )}
            <div className="my-2 border-t border-gray-200 dark:border-gray-700"></div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <FaSignOutAlt />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
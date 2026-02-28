"use client";

import { useEffect, useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";

export default function ThemeToggle({ variant = "icon" }) {
  const [theme, setTheme] = useState("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
    localStorage.setItem("theme", newTheme);
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
    );
  }

  const isDark = theme === "dark";

  // Compact icon-only variant (for navbars)
  if (variant === "icon") {
    return (
      <button
        onClick={toggleTheme}
        className={`
          relative p-2.5 rounded-xl transition-all duration-300 ease-out
          ${isDark 
            ? 'bg-slate-800 text-amber-400 hover:bg-slate-700 hover:text-amber-300' 
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
          }
          focus:outline-none focus:ring-2 focus:ring-blue-500/50
          active:scale-95
        `}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        <div className="relative w-5 h-5">
          <Sun 
            className={`
              absolute inset-0 w-5 h-5 transition-all duration-500 rotate-0 scale-100
              ${isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}
            `}
            strokeWidth={2}
          />
          <Moon 
            className={`
              absolute inset-0 w-5 h-5 transition-all duration-500
              ${isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}
            `}
            strokeWidth={2}
          />
        </div>
      </button>
    );
  }

  // Expanded button variant with label (for settings pages)
  if (variant === "button") {
    return (
      <button
        onClick={toggleTheme}
        className={`
          flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 w-full
          ${isDark 
            ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' 
            : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }
          focus:outline-none focus:ring-2 focus:ring-blue-500/50
        `}
      >
        <div className={`
          p-2 rounded-lg transition-colors duration-300
          ${isDark ? 'bg-slate-700 text-amber-400' : 'bg-slate-100 text-slate-600'}
        `}>
          {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-semibold">
            {isDark ? "Dark Mode" : "Light Mode"}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isDark ? "Easier on the eyes at night" : "Default office theme"}
          </p>
        </div>
        <div className={`
          w-12 h-6 rounded-full p-1 transition-colors duration-300
          ${isDark ? 'bg-blue-600' : 'bg-slate-300'}
        `}>
          <div className={`
            w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300
            ${isDark ? 'translate-x-6' : 'translate-x-0'}
          `} />
        </div>
      </button>
    );
  }

  // Segmented control variant (for settings/preferences)
  if (variant === "segmented") {
    return (
      <div className={`
        inline-flex p-1 rounded-xl border
        ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}
      `}>
        {[
          { key: "light", icon: Sun, label: "Light" },
          { key: "dark", icon: Moon, label: "Dark" }
        ].map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => {
              setTheme(key);
              if (key === "dark") {
                document.documentElement.classList.add("dark");
              } else {
                document.documentElement.classList.remove("dark");
              }
              localStorage.setItem("theme", key);
            }}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${theme === key
                ? isDark 
                  ? 'bg-slate-700 text-white shadow-sm' 
                  : 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }
            `}
          >
            <Icon className="w-4 h-4" strokeWidth={2} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>
    );
  }

  return null;
}
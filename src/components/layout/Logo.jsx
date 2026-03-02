// components/Logo.js - Updated with responsive support
"use client";

import { GraduationCap, Shield, CheckCircle } from "lucide-react";

export default function Logo({
  size = "md",
  variant = "full",
  className = "",
  responsive = false, // New prop for responsive behavior
}) {
  const baseSizes = {
    xs: { container: "w-8 h-8", icon: "w-4 h-4", text: "text-xs" },
    sm: { container: "w-10 h-10", icon: "w-5 h-5", text: "text-sm" },
    md: { container: "w-12 h-12", icon: "w-6 h-6", text: "text-base" },
    lg: { container: "w-16 h-16", icon: "w-8 h-8", text: "text-lg" },
    xl: { container: "w-20 h-20", icon: "w-10 h-10", text: "text-xl" },
  };

  // Responsive classes for different breakpoints
  const responsiveSizes = {
    xs: "w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12",
    sm: "w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16",
    md: "w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16",
    lg: "w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24",
    xl: "w-20 h-20 md:w-24 md:h-24 lg:w-32 lg:h-32",
  };

  const currentSize = baseSizes[size] || baseSizes.md;

  // Icon-only variant
  if (variant === "icon") {
    return (
      <div
        className={`relative ${responsive ? responsiveSizes[size] : currentSize.container} ${className}`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-emerald-500 rounded-xl md:rounded-2xl shadow-lg shadow-blue-500/25 dark:shadow-blue-900/50" />
        <div className="absolute inset-0 bg-white/10 dark:bg-white/5 rounded-xl md:rounded-2xl backdrop-blur-sm" />
        <div className="relative w-full h-full flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className={`${responsive ? "w-1/2 h-1/2" : currentSize.icon} text-white`}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path
              d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
              className="opacity-80"
            />
            <path d="M12 8v4l3 3" className="opacity-100" />
            <circle cx="12" cy="12" r="2" className="fill-white opacity-100" />
          </svg>
        </div>
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-emerald-500 rounded-xl md:rounded-2xl blur-lg opacity-30 dark:opacity-40 -z-10" />
      </div>
    );
  }

  // Compact variant
  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-2 md:gap-3 ${className}`}>
        <Logo size={size} variant="icon" responsive={responsive} />
        <div className="flex flex-col">
          <span
            className={`font-bold tracking-tight text-slate-900 dark:text-white ${responsive ? "text-sm md:text-base" : currentSize.text}`}
          >
            UAF
          </span>
          <span className="text-[8px] md:text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Enrollment
          </span>
        </div>
      </div>
    );
  }

  // Full variant (default)
  return (
    <div className={`flex items-center gap-3 md:gap-4 ${className}`}>
      <div
        className={`relative ${responsive ? responsiveSizes[size] : currentSize.container} shrink-0`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-emerald-500 rounded-xl md:rounded-2xl shadow-xl shadow-blue-500/20 dark:shadow-blue-900/40" />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent rounded-xl md:rounded-2xl" />

        <div className="relative w-full h-full flex items-center justify-center p-2 md:p-3">
          <div className="relative w-full h-full">
            <Shield
              className="absolute inset-0 w-full h-full text-white/20"
              strokeWidth={1.5}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <GraduationCap
                className="w-3/5 h-3/5 text-white drop-shadow-md"
                strokeWidth={2}
              />
            </div>
            <div className="absolute bottom-0.5 right-0.5 w-1/3 h-1/3 bg-emerald-400 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle className="w-2/3 h-2/3 text-white" strokeWidth={3} />
            </div>
          </div>
        </div>
        <div className="absolute -inset-2 bg-gradient-to-r from-blue-600/30 via-indigo-600/30 to-emerald-500/30 rounded-2xl md:rounded-3xl blur-xl -z-10 dark:opacity-60" />
      </div>

      <div className="flex flex-col">
        <div className="flex items-baseline gap-1 md:gap-2">
          <span
            className={`font-black tracking-tight text-slate-900 dark:text-white ${responsive ? "text-lg md:text-xl lg:text-2xl" : currentSize.text} leading-none`}
          >
            UAF
          </span>
          <span
            className={`font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500 ${responsive ? "text-lg md:text-xl lg:text-2xl" : currentSize.text} leading-none`}
          >
            Enrollment
          </span>
        </div>
       

        <div className="flex items-center gap-1.5 mt-1.5 md:mt-2">
          <span className="relative flex h-1.5 w-1.5 md:h-2 md:w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-full w-full bg-emerald-500"></span>
          </span>
          <span className="text-[8px] md:text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
            System Online
          </span>
        </div>
      </div>
    </div>
  );
}

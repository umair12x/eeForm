// components/Logo.js
'use client';

import { GraduationCap, Shield, Database, Lock, CheckCircle } from 'lucide-react';

export default function Logo({ size = 'md', variant = 'full', className = '' }) {
  const sizes = {
    xs: { container: 'w-8 h-8', icon: 'w-4 h-4', text: 'text-xs' },
    sm: { container: 'w-10 h-10', icon: 'w-5 h-5', text: 'text-sm' },
    md: { container: 'w-16 h-16', icon: 'w-8 h-8', text: 'text-base' },
    lg: { container: 'w-24 h-24', icon: 'w-12 h-12', text: 'text-xl' },
    xl: { container: 'w-32 h-32', icon: 'w-16 h-16', text: 'text-2xl' }
  };

  const currentSize = sizes[size] || sizes.md;

  // Icon-only variant (for favicons, small avatars)
  if (variant === 'icon') {
    return (
      <div className={`relative ${currentSize.container} ${className}`}>
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-emerald-500 rounded-2xl shadow-lg shadow-blue-500/25 dark:shadow-blue-900/50 animate-gradient" />
        
        {/* Glassmorphism overlay */}
        <div className="absolute inset-0 bg-white/10 dark:bg-white/5 rounded-2xl backdrop-blur-sm" />
        
        {/* Inner content */}
        <div className="relative w-full h-full flex items-center justify-center">
          <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            className={`${currentSize.icon} text-white`}
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            {/* Shield outline */}
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" className="opacity-80" />
            {/* Digital circuit lines */}
            <path d="M12 8v4l3 3" className="opacity-100" />
            <circle cx="12" cy="12" r="2" className="fill-white opacity-100" />
            <path d="M8 12h2M14 12h2M12 8V6" className="opacity-60" />
          </svg>
        </div>

        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-emerald-500 rounded-2xl blur-lg opacity-30 dark:opacity-40 -z-10 animate-pulse" />
      </div>
    );
  }

  // Compact variant (icon + UAF text)
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <Logo size={size} variant="icon" />
        <div className="flex flex-col">
          <span className={`font-bold tracking-tight text-slate-900 dark:text-white ${currentSize.text}`}>
            UAF
          </span>
          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Digital
          </span>
        </div>
      </div>
    );
  }

  // Full variant (icon + full text)
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Logo Mark */}
      <div className={`relative ${currentSize.container} shrink-0`}>
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-emerald-500 rounded-2xl shadow-xl shadow-blue-500/20 dark:shadow-blue-900/40" />
        
        {/* Animated shine effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent rounded-2xl animate-shine" />
        
        {/* Icon composition */}
        <div className="relative w-full h-full flex items-center justify-center p-3">
          <div className="relative w-full h-full">
            {/* Shield background */}
            <Shield className="absolute inset-0 w-full h-full text-white/20" strokeWidth={1.5} />
            
            {/* Central graduation cap */}
            <div className="absolute inset-0 flex items-center justify-center">
              <GraduationCap className="w-3/5 h-3/5 text-white drop-shadow-md" strokeWidth={2} />
            </div>
            
            {/* Digital elements */}
            <div className="absolute bottom-1 right-1 w-1/3 h-1/3 bg-emerald-400 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle className="w-2/3 h-2/3 text-white" strokeWidth={3} />
            </div>
            
            {/* Circuit lines */}
            <svg className="absolute inset-0 w-full h-full text-white/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M4 12h2M18 12h2M12 4v2M12 18v2" strokeDasharray="2 2" />
            </svg>
          </div>
        </div>

        {/* Outer glow */}
        <div className="absolute -inset-2 bg-gradient-to-r from-blue-600/30 via-indigo-600/30 to-emerald-500/30 rounded-3xl blur-xl -z-10 dark:opacity-60" />
      </div>

      {/* Text Mark */}
      <div className="flex flex-col">
        <div className="flex items-baseline gap-2">
          <span className={`font-black tracking-tight text-slate-900 dark:text-white ${currentSize.text} leading-none`}>
            UAF
          </span>
          <span className={`font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500 ${currentSize.text} leading-none`}>
            DIGITAL
          </span>
        </div>
        <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 tracking-wide uppercase mt-1">
          Enrollment System
        </span>
        
        {/* Status indicator */}
        <div className="flex items-center gap-1.5 mt-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
            System Online
          </span>
        </div>
      </div>
    </div>
  );
}

// Animated version for loading states
export function LogoAnimated({ className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-indigo-600 to-emerald-500 rounded-2xl animate-pulse shadow-lg shadow-blue-500/30" />
      <div className="absolute inset-0 flex items-center justify-center">
        <GraduationCap className="w-8 h-8 text-white animate-bounce" />
      </div>
    </div>
  );
}

// Minimal version for tight spaces
export function LogoMinimal({ className = '' }) {
  return (
    <div className={`relative w-10 h-10 ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-emerald-500 rounded-xl" />
      <div className="absolute inset-0 flex items-center justify-center">
        <Database className="w-5 h-5 text-white" />
      </div>
      <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
        <Lock className="w-2 h-2 text-white" />
      </div>
    </div>
  );
}
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock, Home, Shield, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Unauthorized() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    };
    fetchUser();
  }, []);

  const roleInfo = {
    admin: {
      icon: Shield,
      color: 'from-violet-600 to-purple-600',
      bgColor: 'bg-violet-100 dark:bg-violet-900/30',
      textColor: 'text-violet-700 dark:text-violet-400',
      borderColor: 'border-violet-200 dark:border-violet-800',
    },
    'dg-office': {
      icon: Shield,
      color: 'from-blue-600 to-cyan-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      textColor: 'text-blue-700 dark:text-blue-400',
      borderColor: 'border-blue-200 dark:border-blue-800',
    },
    'fee-office': {
      icon: Shield,
      color: 'from-emerald-600 to-teal-600',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
      textColor: 'text-emerald-700 dark:text-emerald-400',
      borderColor: 'border-emerald-200 dark:border-emerald-800',
    },
    manager: {
      icon: Shield,
      color: 'from-amber-600 to-orange-600',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
      textColor: 'text-amber-700 dark:text-amber-400',
      borderColor: 'border-amber-200 dark:border-amber-800',
    },
    tutor: {
      icon: Shield,
      color: 'from-rose-600 to-pink-600',
      bgColor: 'bg-rose-100 dark:bg-rose-900/30',
      textColor: 'text-rose-700 dark:text-rose-400',
      borderColor: 'border-rose-200 dark:border-rose-800',
    },
    student: {
      icon: Shield,
      color: 'from-cyan-600 to-blue-600',
      bgColor: 'bg-cyan-100 dark:bg-cyan-900/30',
      textColor: 'text-cyan-700 dark:text-cyan-400',
      borderColor: 'border-cyan-200 dark:border-cyan-800',
    },
  };

  const roleStyle = user?.role ? roleInfo[user.role] : roleInfo.student;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          {/* Lock Icon Animation */}
          <div className="flex justify-center mb-6">
            <motion.div
              animate={{ rotate: [-5, 5, -5] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className={`w-16 h-16 rounded-full ${roleStyle.bgColor} flex items-center justify-center`}
            >
              <Lock className={`w-8 h-8 ${roleStyle.textColor}`} />
            </motion.div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
            Access Denied
          </h1>

          {/* Description */}
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
            You don't have permission to access this resource. Your current role doesn't grant you access to this page.
          </p>

          {/* User Info Card */}
          {user && (
            <motion.div
              animate={{ opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 3, repeat: Infinity }}
              className={`mb-6 p-4 ${roleStyle.bgColor} rounded-lg border ${roleStyle.borderColor}`}
            >
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    Current Role
                  </p>
                  <p className={`font-bold capitalize ${roleStyle.textColor}`}>
                    {user.role?.replace('-', ' ')}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    User
                  </p>
                  <p className={`font-semibold ${roleStyle.textColor} truncate`}>
                    {user.name || user.email}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Help Section */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
              Need help?
            </p>
            <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1">
              <li>• Make sure you're using the correct account</li>
              <li>• Contact your administrator to request access</li>
              <li>• Check if you need to upgrade your account</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-semibold rounded-lg transition-all"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Link>

            <Link
              href="/contact"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-lg transition-all"
            >
              <Mail className="w-4 h-4" />
              Contact Support
            </Link>
          </div>
        </div>
      </motion.div>
    </main>
  );
}

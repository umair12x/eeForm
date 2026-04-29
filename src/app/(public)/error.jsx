'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AlertTriangle, Home, RefreshCw, Mail } from 'lucide-react';

export default function OpenError({ error, reset }) {
  useEffect(() => {
    console.error('Page Error:', error);
  }, [error]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 flex items-center justify-center"
            >
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </motion.div>
          </div>

          {/* Error Title */}
          <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
            Something Went Wrong
          </h1>

          {/* Error Message */}
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
            {error?.message || 'An unexpected error occurred. Our team has been notified.'}
          </p>

          {/* Error Details (in development) */}
          {process.env.NODE_ENV === 'development' && error?.message && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-xs font-mono text-red-700 dark:text-red-300 overflow-auto max-h-20">
                {error.message}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => reset()}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold rounded-lg transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </motion.button>

            <Link
              href="/"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-lg transition-all"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Link>
          </div>

          {/* Support Contact */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Need help?{' '}
              <Link
                href="/contact"
                className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
              >
                Get in touch
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </main>
  );
}

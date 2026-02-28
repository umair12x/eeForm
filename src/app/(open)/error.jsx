"use client";

import { useEffect } from "react";
import Link from "next/link";
import { 
  FaExclamationCircle, 
  FaSyncAlt, 
  FaHome, 
  FaEnvelope,
  FaGraduationCap
} from "react-icons/fa";

export default function Error({
  error,
  reset,
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-red-100">
          {/* Error Header */}
          <div className="bg-gradient-to-r from-red-600 to-orange-600 p-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="p-4 bg-white/20 rounded-full">
                <FaExclamationCircle className="text-4xl text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">System Error</h1>
                <p className="text-red-100">Something went wrong!</p>
              </div>
            </div>
          </div>

          {/* Error Content */}
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                We&apos;ve encountered an issue
              </h2>
              <p className="text-gray-600 mb-6">
                The system encountered an unexpected error. Our technical team has been notified.
              </p>
              
              {/* Error Details (Collapsible for users, helpful for debugging) */}
              <details className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <summary className="font-medium text-gray-700 cursor-pointer hover:text-gray-900">
                  Technical Details
                </summary>
                <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                  <code className="text-sm text-red-600 break-all">
                    {error.message || "Unknown error occurred"}
                  </code>
                  {error.digest && (
                    <div className="mt-2 text-sm text-gray-500">
                      Error ID: {error.digest}
                    </div>
                  )}
                </div>
              </details>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <button
                onClick={reset}
                className="group flex flex-col items-center justify-center p-6 bg-blue-50 border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:bg-blue-100 transition-all"
              >
                <div className="p-3 bg-blue-100 rounded-full text-blue-600 mb-3 group-hover:scale-110 transition-transform">
                  <FaSyncAlt className="text-2xl" />
                </div>
                <h3 className="font-bold text-gray-800 mb-1">Try Again</h3>
                <p className="text-sm text-gray-600 text-center">
                  Reload the page and try your action again
                </p>
              </button>

              <Link
                href="/"
                className="group flex flex-col items-center justify-center p-6 bg-green-50 border-2 border-green-200 rounded-xl hover:border-green-400 hover:bg-green-100 transition-all"
              >
                <div className="p-3 bg-green-100 rounded-full text-green-600 mb-3 group-hover:scale-110 transition-transform">
                  <FaHome className="text-2xl" />
                </div>
                <h3 className="font-bold text-gray-800 mb-1">Go Home</h3>
                <p className="text-sm text-gray-600 text-center">
                  Return to the main dashboard
                </p>
              </Link>

              <Link
                href="/contact"
                className="group flex flex-col items-center justify-center p-6 bg-purple-50 border-2 border-purple-200 rounded-xl hover:border-purple-400 hover:bg-purple-100 transition-all"
              >
                <div className="p-3 bg-purple-100 rounded-full text-purple-600 mb-3 group-hover:scale-110 transition-transform">
                  <FaEnvelope className="text-2xl" />
                </div>
                <h3 className="font-bold text-gray-800 mb-1">Contact Support</h3>
                <p className="text-sm text-gray-600 text-center">
                  Get help from our technical team
                </p>
              </Link>
            </div>

            {/* Status Information */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <FaGraduationCap className="text-blue-600" /> System Status
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3">
                  <div className="text-sm text-gray-600">Student Portal</div>
                  <div className="text-xl font-bold text-green-600">✓ Online</div>
                </div>
                <div className="text-center p-3">
                  <div className="text-sm text-gray-600">Form System</div>
                  <div className="text-xl font-bold text-green-600">✓ Online</div>
                </div>
                <div className="text-center p-3">
                  <div className="text-sm text-gray-600">Database</div>
                  <div className="text-xl font-bold text-green-600">✓ Online</div>
                </div>
                <div className="text-center p-3">
                  <div className="text-sm text-gray-600">Authentication</div>
                  <div className="text-xl font-bold text-green-600">✓ Online</div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="border-t pt-6">
              <h3 className="font-bold text-gray-800 mb-3">Quick Access</h3>
              <div className="flex flex-wrap gap-2">
                <Link href="/guide" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                  Student Guide
                </Link>
                <Link href="/ugform" className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200">
                  UG Form
                </Link>
                <Link href="/gsform" className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200">
                  GS-10 Form
                </Link>
                <Link href="/admin" className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200">
                  Admin Panel
                </Link>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-800 p-6">
            <div className="text-center">
              <p className="text-gray-300 text-sm mb-2">
                University of Agriculture, Faisalabad • Academic Management System
              </p>
              <p className="text-gray-400 text-xs">
                Error occurred at: {new Date().toLocaleString()} • Error ID: {error.digest || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Activity,
  CreditCard,
  FileText,
  BookOpen,
  User,
  Calendar,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";



export default function page() {
  const [user, setUser] = useState(null);
  const [feeInfo, setFeeInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchDashboard = async (silent = false) => {
    try {
      if (silent) setRefreshing(true);
      else setLoading(true);

      const [meRes, feeRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/student/fee/latest-approved"),
      ]);

      if (meRes.ok) {
        const meData = await meRes.json();
        setUser(meData.user);
      } else {
        setUser(null);
      }

      if (feeRes.ok) {
        const feeData = await feeRes.json();
        setFeeInfo(feeData);
      } else {
        setFeeInfo(null);
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      toast.error("Unable to load dashboard data. Refresh to retry.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(() => fetchDashboard(true), 30000);
    return () => clearInterval(interval);
  }, []);

  const feeStatus = feeInfo?.found ? "Approved" : "Pending";
  const feeAmount = feeInfo?.found ? feeInfo.data.feeAmount : "-";
  const feeLast = feeInfo?.found
    ? new Date(feeInfo.data.approvedAt).toLocaleString()
    : "Not available";
  // Memoize formatted dates to prevent unnecessary recalculation
  const formattedLastUpdate = useMemo(
    () => lastUpdated ? lastUpdated.toLocaleTimeString() : "-",
    [lastUpdated]
  );

  const formattedFeeDate = useMemo(
    () => feeInfo?.found ? new Date(feeInfo.data.approvedAt).toLocaleString() : "Not available",
    [feeInfo?.found, feeInfo?.data?.approvedAt]
  );

  if (loading) {
    return (
      <div className="p-6 space-y-4 max-w-6xl mx-auto">
        <div className="h-8 w-72 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        <div className="h-36 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-32 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <Toaster position="top-right" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Student Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-300 mt-1 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            {user ? `Welcome back, ${user.name}` : "Welcome, student"}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Updated: {formattedLastUpdate}
          </p>
        </div>

        <button
          onClick={() => fetchDashboard()}
          disabled={refreshing}
          className="inline-flex items-center gap-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-3 py-2 rounded-lg text-sm transition-all hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-blue-600 dark:text-blue-300" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">My Profile</h3>
          </div>
          <div className="mt-3 text-sm text-slate-700 dark:text-slate-300 space-y-1">
            <p>
              <strong>Name:</strong> {user?.name ?? "Not logged in"}
            </p>
            <p>
              <strong>Reg. No:</strong> {user?.registrationNumber ?? "-"}
            </p>
            <p>
              <strong>Degree:</strong> {user?.degreeProgram || user?.degree || "Not set"}
            </p>
            <p>
              <strong>Department:</strong> {user?.department || "Not set"}
            </p>
          </div>
         
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-emerald-600 dark:text-emerald-300" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Fee Verification</h3>
          </div>
          <div className="mt-3 text-sm text-slate-700 dark:text-slate-300 space-y-1">
            <p>
              <strong>Status:</strong>
              <span className={`ml-2 font-semibold ${feeStatus === "Approved" ? "text-emerald-600" : "text-amber-500"}`}>
                {feeStatus}
              </span>
            </p>
            <p>
              <strong>Approved Amount:</strong> {feeAmount !== "-" ? `₹ ${feeAmount}` : "N/A"}
            </p>
            <p>
              <strong>Last Activity:</strong> {formattedFeeDate}
            </p>
          </div>
          <div className="mt-3">
            <Link href="/student/fee" className="text-sm text-emerald-600 dark:text-emerald-300 font-medium hover:underline">
              Manage fee submission
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-violet-600 dark:text-violet-300" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Course Registration</h3>
          </div>
          <div className="mt-3 text-sm text-slate-700 dark:text-slate-300">
            <p>Submit and monitor your UG-1 / GS-10 forms.</p>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Start with fee verification first, then complete form submission.
            </p>
          </div>
          <div className="mt-3 grid gap-2">
            <Link
              href="/student/form/ug1"
              className="inline-flex items-center gap-2 justify-center rounded-lg border border-violet-200 dark:border-violet-700 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-200 px-3 py-2 text-sm font-medium hover:bg-violet-100 dark:hover:bg-violet-800 transition"
            >
              <BookOpen className="w-4 h-4" /> UG-1 Form
            </Link>
            <Link
              href="/student/form/gs10"
              className="inline-flex items-center gap-2 justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              <Calendar className="w-4 h-4" /> GS-10 Form
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Quick Actions</h2>
          {!user && <AlertCircle className="w-4 h-4 text-amber-500" />}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          <Link href="/student/fee" className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              <CreditCard className="w-4 h-4" /> Check fee status
            </div>
          </Link>
          <Link href="/student/form/ug1" className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              <FileText className="w-4 h-4" /> Submit UG-1 form
            </div>
          </Link>
          <Link href="/student/form/gs10" className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              <BookOpen className="w-4 h-4" /> Submit GS-10 form
            </div>
          </Link>
          <Link href="/contact" className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              <AlertCircle className="w-4 h-4" /> Get help
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

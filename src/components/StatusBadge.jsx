"use client";

import React from "react";
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

export default function StatusBadge({
  status = "pending",
  timestamp,
  isDark = false,
  size = "md",
}) {
  const getStatusConfig = () => {
    switch (status) {
      case "approved":
        return {
          icon: CheckCircle2,
          bgLight: "bg-emerald-50",
          bgDark: "dark:bg-emerald-900/30",
          textLight: "text-emerald-700",
          textDark: "dark:text-emerald-300",
          borderLight: "border-emerald-200",
          borderDark: "dark:border-emerald-700/50",
        };
      case "rejected":
        return {
          icon: XCircle,
          bgLight: "bg-red-50",
          bgDark: "dark:bg-red-900/30",
          textLight: "text-red-700",
          textDark: "dark:text-red-300",
          borderLight: "border-red-200",
          borderDark: "dark:border-red-700/50",
        };
      case "processing":
        return {
          icon: AlertCircle,
          bgLight: "bg-blue-50",
          bgDark: "dark:bg-blue-900/30",
          textLight: "text-blue-700",
          textDark: "dark:text-blue-300",
          borderLight: "border-blue-200",
          borderDark: "dark:border-blue-700/50",
        };
      default: // pending
        return {
          icon: Clock,
          bgLight: "bg-amber-50",
          bgDark: "dark:bg-amber-900/30",
          textLight: "text-amber-700",
          textDark: "dark:text-amber-300",
          borderLight: "border-amber-200",
          borderDark: "dark:border-amber-700/50",
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const sizeConfig = {
    sm: "px-2.5 py-1 text-xs",
    md: "px-3 py-2 text-sm",
    lg: "px-4 py-3 text-base",
  };

  const statusLabel = {
    approved: "Approved",
    rejected: "Rejected",
    processing: "Processing",
    pending: "Pending",
  };

  const formatDate = (date) => {
    if (!date) return null;
    try {
      const d = new Date(date);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return null;
    }
  };

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-lg border ${sizeConfig[size]} ${config.bgLight} ${config.bgDark} ${config.borderLight} ${config.borderDark} border`}
    >
      <Icon className={`w-4 h-4 ${config.textLight} ${config.textDark}`} />
      <div className="flex flex-col">
        <span
          className={`font-medium leading-none ${config.textLight} ${config.textDark}`}
        >
          {statusLabel[status]}
        </span>
        {timestamp && (
          <span
            className={`text-xs mt-1 ${config.textLight} ${config.textDark} opacity-75`}
          >
            {formatDate(timestamp)}
          </span>
        )}
      </div>
    </div>
  );
}

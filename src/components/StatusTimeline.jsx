"use client";

import React from "react";
import { CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";

export default function StatusTimeline({
  status = "pending",
  requestId,
  submittedAt,
  processedAt,
  isDark = false,
}) {
  const stages = [
    { key: "submitted", label: "Submitted", icon: "check" },
    { key: "processing", label: "Under Review", icon: "clock" },
    {
      key: "final",
      label: status === "rejected" ? "Rejected" : "Approved",
      icon: status === "rejected" ? "error" : "check",
    },
  ];

  const getActiveIndex = () => {
    if (status === "pending") return 0;
    if (status === "processing") return 1;
    if (status === "approved" || status === "rejected") return 2;
    return 0;
  };

  const getStatusColor = (index) => {
    const activeIndex = getActiveIndex();
    if (index <= activeIndex) {
      if (status === "rejected") return "text-red-600 dark:text-red-400";
      return "text-emerald-600 dark:text-emerald-400";
    }
    return isDark ? "text-slate-500" : "text-slate-400";
  };

  const getStatusBgColor = (index) => {
    const activeIndex = getActiveIndex();
    if (index <= activeIndex) {
      if (status === "rejected") return "bg-red-100 dark:bg-red-900/30";
      return "bg-emerald-100 dark:bg-emerald-900/30";
    }
    return isDark ? "bg-slate-700" : "bg-slate-100";
  };

  const getIconComponent = (stage, index) => {
    const activeIndex = getActiveIndex();
    const isActive = index <= activeIndex;
    const commonProps = { className: `w-6 h-6 ${getStatusColor(index)}` };

    if (stage.icon === "check") {
      return <CheckCircle2 {...commonProps} />;
    } else if (stage.icon === "clock") {
      return <Clock {...commonProps} />;
    } else if (stage.icon === "error") {
      return <XCircle {...commonProps} />;
    }
    return null;
  };

  const formatDate = (date) => {
    if (!date) return null;
    try {
      return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return null;
    }
  };

  const activeIndex = getActiveIndex();

  return (
    <div
      className={`w-full p-6 rounded-lg border ${
        isDark
          ? "bg-slate-800 border-slate-700"
          : "bg-white border-slate-200"
      }`}
    >
      {/* Request ID Badge */}
      {requestId && (
        <div className="mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
          <p className={`text-xs font-medium mb-2 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
            Request ID
          </p>
          <div
            className={`px-3 py-2 rounded font-mono text-sm break-all ${
              isDark
                ? "bg-slate-700 text-emerald-400"
                : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {requestId}
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-6">
        {stages.map((stage, index) => (
          <div key={stage.key} className="flex items-start gap-4">
            {/* Icon */}
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getStatusBgColor(index)}`}
            >
              {getIconComponent(stage, index)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-1">
              <h4
                className={`text-sm font-semibold ${
                  index <= activeIndex
                    ? isDark
                      ? "text-white"
                      : "text-slate-900"
                    : isDark
                    ? "text-slate-400"
                    : "text-slate-500"
                }`}
              >
                {stage.label}
              </h4>

              {/* Timestamps */}
              {index === 0 && submittedAt && (
                <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  {formatDate(submittedAt)}
                </p>
              )}
              {index === 2 && processedAt && (
                <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  {formatDate(processedAt)}
                </p>
              )}
            </div>

            {/* Connector Line */}
            {index < stages.length - 1 && (
              <div className="absolute left-[30px] top-[calc(100%+2px)] w-0.5 h-12"
                style={{
                  background: activeIndex > index
                    ? "linear-gradient(to bottom, currentColor, currentColor)"
                    : isDark
                    ? "rgb(100, 116, 139)"
                    : "rgb(203, 213, 225)",
                  color: activeIndex > index
                    ? status === "rejected" ? "#dc2626" : "#16a34a"
                    : "inherit",
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Status Summary */}
      <div
        className={`mt-6 pt-4 border-t ${isDark ? "border-slate-700" : "border-slate-200"}`}
      >
        <div className="flex items-center gap-2">
          {status === "approved" ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                Your fee request has been approved!
              </p>
            </>
          ) : status === "rejected" ? (
            <>
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <p className="text-sm font-medium text-red-700 dark:text-red-300">
                Your fee request was rejected. Please contact the fee section.
              </p>
            </>
          ) : status === "processing" ? (
            <>
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Your request is being reviewed. Please check back soon.
              </p>
            </>
          ) : (
            <>
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                Your request has been submitted and is waiting for review.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle, X } from "lucide-react";

export default function ConfirmationModal({
  isOpen = false,
  title,
  description,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDanger = false,
  isDark = false,
  isLoading = false,
}) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  const handleConfirm = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onConfirm?.();
    }, 150);
  };

  const handleCancel = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onCancel?.();
    }, 150);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-200 ${
          isAnimating ? "opacity-100" : "opacity-0 pointer-events-none"
        } ${isDark ? "bg-slate-950/60" : "bg-black/50"}`}
        onClick={handleCancel}
      />

      {/* Modal */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none ${
          isAnimating ? "pointer-events-auto" : ""
        }`}
      >
        <div
          className={`transform transition-all duration-200 ${
            isAnimating
              ? "opacity-100 scale-100"
              : "opacity-0 scale-95"
          } max-w-md w-full ${
            isDark
              ? "bg-slate-900 border border-slate-700"
              : "bg-white border border-slate-200"
          } rounded-lg shadow-xl`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className={`flex items-start justify-between p-6 border-b ${
              isDark ? "border-slate-700" : "border-slate-200"
            }`}
          >
            <div className="flex items-start gap-3 flex-1">
              {isDanger && (
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <h2
                  className={`text-lg font-semibold ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  {title}
                </h2>
              </div>
            </div>
            <button
              onClick={handleCancel}
              className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0`}
              aria-label="Close"
            >
              <X className={`w-5 h-5 ${isDark ? "text-slate-400" : "text-slate-500"}`} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className={isDark ? "text-slate-300" : "text-slate-600"}>
              {description}
            </p>
          </div>

          {/* Footer */}
          <div
            className={`flex gap-3 p-6 border-t ${
              isDark ? "border-slate-700" : "border-slate-200"
            }`}
          >
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className={`flex-1 px-4 py-2 rounded font-medium transition-colors ${
                isDark
                  ? "bg-slate-700 hover:bg-slate-600 text-white disabled:opacity-50"
                  : "bg-slate-200 hover:bg-slate-300 text-slate-900 disabled:opacity-50"
              }`}
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className={`flex-1 px-4 py-2 rounded font-medium transition-colors flex items-center justify-center gap-2 ${
                isDanger
                  ? "bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
              }`}
            >
              {isLoading && (
                <svg
                  className="animate-spin h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              )}
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

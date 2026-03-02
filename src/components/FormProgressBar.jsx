"use client";

import React, { useMemo } from "react";
import { CheckCircle2, Circle } from "lucide-react";

export default function FormProgressBar({
  currentStep,
  totalSteps,
  isDark = false,
  sections = [],
}) {
  const progressPercentage = useMemo(() => {
    return Math.min(((currentStep - 1) / (totalSteps - 1)) * 100, 100);
  }, [currentStep, totalSteps]);

  return (
    <div
      className={`w-full px-4 py-6 rounded-lg border ${
        isDark
          ? "bg-slate-800 border-slate-700"
          : "bg-white border-slate-200"
      }`}
    >
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
            Form Progress
          </h3>
          <span className={`text-xs font-medium ${isDark ? "text-slate-300" : "text-slate-600"}`}>
            {currentStep} of {totalSteps}
          </span>
        </div>

        {/* Progress Bar Track */}
        <div
          className={`h-2 rounded-full overflow-hidden ${
            isDark ? "bg-slate-700" : "bg-slate-200"
          }`}
        >
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Section Steps */}
      {sections.length > 0 && (
        <div className="space-y-2">
          {sections.map((section, index) => {
            const isCompleted = index < currentStep - 1;
            const isActive = index === currentStep - 1;

            return (
              <div key={`section-${index}`} className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <Circle
                      className={`w-5 h-5 ${
                        isActive
                          ? "text-blue-500 fill-blue-500"
                          : isDark
                          ? "text-slate-600"
                          : "text-slate-300"
                      }`}
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      isActive || isCompleted
                        ? isDark
                          ? "text-white"
                          : "text-slate-900"
                        : isDark
                        ? "text-slate-400"
                        : "text-slate-500"
                    }`}
                  >
                    {section}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

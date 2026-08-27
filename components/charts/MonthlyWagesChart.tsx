"use client";

import React, { useState } from "react";
import { formatMoney } from "@/lib/money";

export interface MonthDataPoint {
  monthKey: string; // "2026-08"
  label: string; // "Aug"
  fullLabel: string; // "August 2026"
  incomeCents: number;
  expensesCents: number;
  netCents: number;
  bookingCount?: number;
}

interface MonthlyWagesChartProps {
  data: MonthDataPoint[];
  currentMonthKey?: string;
  onSelectMonth?: (monthKey: string) => void;
}

export default function MonthlyWagesChart({
  data,
  currentMonthKey,
  onSelectMonth,
}: MonthlyWagesChartProps) {
  const [hoveredMonth, setHoveredMonth] = useState<MonthDataPoint | null>(null);

  // Find max value for proportional heights
  const maxVal = Math.max(
    ...data.flatMap((d) => [d.incomeCents, d.expensesCents, Math.abs(d.netCents)]),
    100000 // minimum scale (RM 1,000)
  );

  return (
    <div className="bg-[#131C2E] border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4 shadow-md w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="font-header text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Financial Trends
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Income vs Expenses (last {data.length} months)
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.4)]" />
            <span className="text-slate-200 font-medium text-2xs sm:text-xs">Income</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-400 shadow-[0_0_6px_rgba(251,113,133,0.4)]" />
            <span className="text-slate-200 font-medium text-2xs sm:text-xs">Expenses</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.4)]" />
            <span className="text-slate-200 font-medium text-2xs sm:text-xs">Net</span>
          </div>
        </div>
      </div>

      {/* Interactive Tooltip Card when hovering */}
      <div className="min-h-[44px] flex items-center justify-between px-3.5 py-2 bg-[#0B0F17] border border-slate-700/80 rounded-lg flex-wrap gap-2">
        {hoveredMonth ? (
          <>
            <span className="text-xs font-semibold text-white">
              {hoveredMonth.fullLabel}:
            </span>
            <div className="flex items-center gap-2 sm:gap-4 text-xs font-mono flex-wrap">
              <span className="text-emerald-400 font-medium">
                +{formatMoney(hoveredMonth.incomeCents)}
              </span>
              <span className="text-rose-400 font-medium">
                −{formatMoney(hoveredMonth.expensesCents)}
              </span>
              <span className={`font-semibold ${hoveredMonth.netCents >= 0 ? "text-amber-400" : "text-rose-400"}`}>
                Net: {formatMoney(hoveredMonth.netCents)}
              </span>
            </div>
          </>
        ) : (
          <span className="text-xs text-slate-400">
            Tap or hover over any bar to inspect financial details
          </span>
        )}
      </div>

      {/* Bar graph container */}
      <div className="h-44 flex items-end justify-between gap-1.5 sm:gap-4 pt-6 pb-1 border-b border-slate-800">
        {data.map((item) => {
          const isSelected = item.monthKey === currentMonthKey;
          const isHovered = hoveredMonth?.monthKey === item.monthKey;

          const incomeHeight = Math.max((item.incomeCents / maxVal) * 100, 4);
          const expenseHeight = Math.max((item.expensesCents / maxVal) * 100, item.expensesCents > 0 ? 4 : 0);
          const netHeight = Math.max((Math.abs(item.netCents) / maxVal) * 100, 4);

          return (
            <div
              key={item.monthKey}
              onMouseEnter={() => setHoveredMonth(item)}
              onMouseLeave={() => setHoveredMonth(null)}
              onClick={() => onSelectMonth?.(item.monthKey)}
              className={`flex-1 flex flex-col items-center h-full justify-end group cursor-pointer transition-all ${
                isSelected ? "opacity-100" : isHovered ? "opacity-100" : "opacity-85 hover:opacity-100"
              }`}
            >
              {/* Bars cluster */}
              <div className="w-full flex items-end justify-center gap-0.5 sm:gap-1.5 h-32 relative">
                {/* Income bar */}
                <div
                  style={{ height: `${incomeHeight}%` }}
                  className={`w-2 sm:w-3.5 rounded-t transition-all duration-200 ${
                    isHovered ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" : "bg-emerald-500/90 group-hover:bg-emerald-400"
                  }`}
                  title={`Income: ${formatMoney(item.incomeCents)}`}
                />

                {/* Expense bar */}
                <div
                  style={{ height: `${expenseHeight}%` }}
                  className={`w-2 sm:w-3.5 rounded-t transition-all duration-200 ${
                    isHovered ? "bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.5)]" : "bg-rose-500/90 group-hover:bg-rose-400"
                  }`}
                  title={`Expenses: ${formatMoney(item.expensesCents)}`}
                />

                {/* Net bar */}
                <div
                  style={{ height: `${netHeight}%` }}
                  className={`w-2 sm:w-3.5 rounded-t transition-all duration-200 ${
                    item.netCents >= 0
                      ? isHovered
                        ? "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                        : "bg-amber-500/90 group-hover:bg-amber-400"
                      : "bg-rose-500"
                  }`}
                  title={`Net: ${formatMoney(item.netCents)}`}
                />
              </div>

              {/* Month label */}
              <div className="mt-2 text-center">
                <span
                  className={`font-mono text-2xs block transition-colors ${
                    isSelected
                      ? "text-amber-400 font-bold"
                      : isHovered
                      ? "text-white"
                      : "text-slate-400"
                  }`}
                >
                  {item.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
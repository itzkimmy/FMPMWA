"use client";

import React, { useState } from "react";
import { formatMoney, formatMoneyCompact } from "@/lib/money";

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
    <div className="bg-studio-panel border border-studio-border rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-header text-xs font-semibold text-studio-text-muted uppercase tracking-wider">
            Financial Trends
          </h2>
          <p className="text-xs text-studio-text-faint mt-0.5">
            Income vs Expenses (last {data.length} months)
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-2xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-studio-sage" />
            <span className="text-studio-text-muted">Income</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-studio-clay" />
            <span className="text-studio-text-muted">Expenses</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-studio-amber" />
            <span className="text-studio-text-muted">Net</span>
          </div>
        </div>
      </div>

      {/* Interactive Tooltip Card when hovering */}
      <div className="min-h-[44px] flex items-center justify-between px-3.5 py-2 bg-studio-bg/60 border border-studio-border/60 rounded-lg">
        {hoveredMonth ? (
          <>
            <span className="text-xs font-medium text-studio-text">
              {hoveredMonth.fullLabel}:
            </span>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-studio-sage">
                +{formatMoney(hoveredMonth.incomeCents)}
              </span>
              <span className="text-studio-clay">
                −{formatMoney(hoveredMonth.expensesCents)}
              </span>
              <span className={`font-semibold ${hoveredMonth.netCents >= 0 ? "text-studio-amber" : "text-studio-clay"}`}>
                Net: {formatMoney(hoveredMonth.netCents)}
              </span>
            </div>
          </>
        ) : (
          <span className="text-xs text-studio-text-faint">
            Hover over any bar to inspect monthly financial details
          </span>
        )}
      </div>

      {/* Bar graph container */}
      <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 pt-6 pb-1">
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
              <div className="w-full flex items-end justify-center gap-1 h-32 relative">
                {/* Income bar */}
                <div
                  style={{ height: `${incomeHeight}%` }}
                  className={`w-2.5 sm:w-3.5 rounded-t transition-all duration-300 ${
                    isHovered ? "bg-studio-sage brightness-110 shadow-[0_0_8px_rgba(111,168,138,0.4)]" : "bg-studio-sage/80 group-hover:bg-studio-sage"
                  }`}
                  title={`Income: ${formatMoney(item.incomeCents)}`}
                />

                {/* Expense bar */}
                <div
                  style={{ height: `${expenseHeight}%` }}
                  className={`w-2.5 sm:w-3.5 rounded-t transition-all duration-300 ${
                    isHovered ? "bg-studio-clay brightness-110 shadow-[0_0_8px_rgba(193,91,74,0.4)]" : "bg-studio-clay/80 group-hover:bg-studio-clay"
                  }`}
                  title={`Expenses: ${formatMoney(item.expensesCents)}`}
                />

                {/* Net bar */}
                <div
                  style={{ height: `${netHeight}%` }}
                  className={`w-2.5 sm:w-3.5 rounded-t transition-all duration-300 ${
                    item.netCents >= 0
                      ? isHovered
                        ? "bg-studio-amber brightness-110 shadow-[0_0_8px_rgba(232,163,61,0.4)]"
                        : "bg-studio-amber/80 group-hover:bg-studio-amber"
                      : "bg-studio-clay"
                  }`}
                  title={`Net: ${formatMoney(item.netCents)}`}
                />
              </div>

              {/* Month label */}
              <div className="mt-2 text-center">
                <span
                  className={`font-mono text-2xs block transition-colors ${
                    isSelected
                      ? "text-studio-amber font-semibold"
                      : isHovered
                      ? "text-studio-text font-medium"
                      : "text-studio-text-muted"
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

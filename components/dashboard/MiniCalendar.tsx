"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { formatMoneyCompact } from "@/lib/money";
import { BookingStatusPill, DeliveryStatusPill } from "@/components/ui/StatusPill";
import type { BookingStatus, DeliveryStatus } from "@prisma/client";

export interface CalendarBookingItem {
  id: string;
  clientName: string;
  eventType: string;
  eventDate: string;
  location: string | null;
  feeCents: number;
  paidCents: number;
  status: BookingStatus;
  deliveryStatus: DeliveryStatus;
}

interface MiniCalendarProps {
  bookedDays: CalendarBookingItem[];
}

export default function MiniCalendar({ bookedDays }: MiniCalendarProps) {
  const [activeDay, setActiveDay] = useState<number | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = now.getDate();

  const monthName = new Date(year, month).toLocaleDateString("en-MY", {
    month: "long",
    year: "numeric",
  });

  // Group bookings by day of month (in Manila timezone)
  const bookingsByDay = new Map<number, CalendarBookingItem[]>();
  bookedDays.forEach((b) => {
    const d = new Date(b.eventDate);
    const dayInManila = parseInt(
      d.toLocaleDateString("en-MY", { day: "numeric", timeZone: "Asia/Manila" })
    );
    const mCheck = parseInt(
      d.toLocaleDateString("en-MY", { month: "numeric", timeZone: "Asia/Manila" })
    );
    if (mCheck === month + 1) {
      if (!bookingsByDay.has(dayInManila)) {
        bookingsByDay.set(dayInManila, []);
      }
      bookingsByDay.get(dayInManila)!.push(b);
    }
  });

  const dayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function handleMouseEnter(day: number) {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    if (bookingsByDay.has(day)) {
      setActiveDay(day);
    }
  }

  function handleMouseLeave() {
    closeTimeoutRef.current = setTimeout(() => {
      setActiveDay(null);
    }, 180);
  }

  return (
    <div className="relative select-none" onMouseLeave={handleMouseLeave}>
      <p className="text-xs font-semibold text-slate-300 mb-3 text-center">
        {monthName}
      </p>

      <div className="grid grid-cols-7 gap-1 text-center">
        {dayLabels.map((l) => (
          <div
            key={l}
            className="text-[9px] font-semibold text-slate-500 uppercase py-1"
          >
            {l}
          </div>
        ))}

        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} className="w-full aspect-square" />;
          }

          const isToday = day === today;
          const dayBookings = bookingsByDay.get(day);
          const hasBooking = dayBookings && dayBookings.length > 0;
          const primaryStatus = dayBookings?.[0]?.status;
          const colIndex = i % 7;
          const isBottomRows = day > 18;
          const isSelected = activeDay === day;

          // Position popup intelligently relative to day's location in grid
          let positionClasses = "left-1/2 -translate-x-1/2";
          if (colIndex <= 1) positionClasses = "left-0";
          else if (colIndex >= 5) positionClasses = "right-0";

          const verticalPosition = isBottomRows
            ? "bottom-full mb-2"
            : "top-full mt-2";

          return (
            <div
              key={day}
              className="relative"
              onMouseEnter={() => handleMouseEnter(day)}
              onClick={() => {
                if (hasBooking) setActiveDay(activeDay === day ? null : day);
              }}
            >
              <div
                className={`w-full aspect-square flex flex-col items-center justify-center rounded-lg text-xs font-mono font-medium transition-all duration-150 cursor-pointer ${
                  isToday
                    ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                    : isSelected
                    ? "bg-slate-700 text-white ring-2 ring-amber-400"
                    : hasBooking
                    ? "bg-slate-800 text-white hover:bg-slate-700"
                    : "text-slate-500 hover:bg-slate-800/40 hover:text-slate-300"
                }`}
              >
                <span>{day}</span>
                {hasBooking && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                      isToday
                        ? "bg-slate-950"
                        : primaryStatus === "CONFIRMED"
                        ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"
                        : primaryStatus === "COMPLETED"
                        ? "bg-blue-400"
                        : "bg-slate-400"
                    }`}
                  />
                )}
              </div>

              {/* Hover/Tap Popup Card with Full Booking Details */}
              {isSelected && dayBookings && (
                <div
                  className={`absolute ${verticalPosition} ${positionClasses} w-64 sm:w-72 bg-[#0F172A] border border-slate-700/90 rounded-xl p-3.5 shadow-2xl z-50 animate-fade-in text-left pointer-events-auto backdrop-blur-xl`}
                  onMouseEnter={() => {
                    if (closeTimeoutRef.current) {
                      clearTimeout(closeTimeoutRef.current);
                      closeTimeoutRef.current = null;
                    }
                  }}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-800">
                    <span className="text-[11px] font-bold text-slate-300">
                      {new Date(year, month, day).toLocaleDateString("en-MY", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span className="text-2xs font-mono font-semibold text-amber-400">
                      {dayBookings.length} shoot{dayBookings.length > 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="space-y-2.5 max-h-60 overflow-y-auto no-scrollbar">
                    {dayBookings.map((b) => {
                      const unpaidCents = b.feeCents - b.paidCents;
                      return (
                        <Link
                          key={b.id}
                          href={`/bookings/${b.id}`}
                          className="block bg-[#131C2E] hover:bg-[#1A253C] border border-slate-800 hover:border-slate-700 p-2.5 rounded-lg transition-all group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors truncate">
                              {b.clientName}
                            </p>
                            <BookingStatusPill status={b.status} />
                          </div>

                          <p className="text-2xs text-slate-400 mt-1 truncate">
                            {b.eventType}
                            {b.location ? ` · ${b.location}` : ""}
                          </p>

                          <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-800/80">
                            <span className="font-mono text-xs font-bold text-white">
                              {formatMoneyCompact(b.feeCents)}
                            </span>
                            {unpaidCents > 0 ? (
                              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
                                {formatMoneyCompact(unpaidCents)} due
                              </span>
                            ) : (
                              <DeliveryStatusPill status={b.deliveryStatus} />
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3 mt-3 justify-center">
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.8)]" />
          <span className="text-[9px] text-slate-400">Confirmed</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          <span className="text-[9px] text-slate-400">Inquiry</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          <span className="text-[9px] text-slate-400">Done</span>
        </div>
      </div>
    </div>
  );
}
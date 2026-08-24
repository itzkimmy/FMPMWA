"use client";

import { useState } from "react";
import Link from "next/link";
import { formatMoneyCompact } from "@/lib/money";
import type { BookingStatus } from "@prisma/client";

interface BookingChip {
  id: string;
  clientName: string;
  eventType: string;
  eventDate: string;
  status: BookingStatus;
  location: string | null;
  feeCents: number;
}

interface CalendarViewProps {
  bookings: BookingChip[];
  year: number;
  month: number; // 1-indexed
}

const STATUS_COLORS: Record<BookingStatus, string> = {
  INQUIRY: "bg-studio-border text-studio-text-muted hover:border-studio-border-hover",
  CONFIRMED: "bg-studio-sage-subtle text-studio-sage border border-studio-sage/30 hover:border-studio-sage/60",
  COMPLETED: "bg-studio-sage-subtle/50 text-studio-sage-dim border border-studio-sage-dim/20",
  CANCELLED: "bg-studio-border-subtle text-studio-text-faint line-through",
};

export default function CalendarView({ bookings, year, month }: CalendarViewProps) {
  const [selectedBooking, setSelectedBooking] = useState<BookingChip | null>(null);

  // Build calendar grid
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const startDow = firstDay.getDay(); // 0 = Sunday
  const daysInMonth = lastDay.getDate();

  // Group bookings by Manila date string (YYYY-MM-DD)
  const bookingsByDate = new Map<string, BookingChip[]>();
  for (const booking of bookings) {
    const dateStr = new Date(booking.eventDate).toLocaleDateString("en-CA", {
      timeZone: "Asia/Manila",
    });
    if (!bookingsByDate.has(dateStr)) bookingsByDate.set(dateStr, []);
    bookingsByDate.get(dateStr)!.push(booking);
  }

  // Navigation
  const prevMonth = month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
  const nextMonth = month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthNum = now.getMonth() + 1;

  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString("en-MY", {
    month: "long",
    year: "numeric",
  });

  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });

  // Detect same-day conflicts
  const conflictDates = new Set<string>();
  for (const [dateStr, dayBookings] of bookingsByDate.entries()) {
    const confirmed = dayBookings.filter((b) => b.status === "CONFIRMED");
    if (confirmed.length > 1) conflictDates.add(dateStr);
  }

  return (
    <div className="space-y-4">
      {/* Month nav & quick actions */}
      <div className="flex items-center justify-between bg-studio-panel border border-studio-border rounded-xl px-5 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <Link
            href={`/calendar?year=${prevMonth.year}&month=${prevMonth.month}`}
            className="p-2 text-studio-text-muted hover:text-studio-text hover:bg-studio-panel-hover rounded-lg transition-all"
            title="Previous month"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <Link
            href={`/calendar?year=${currentYear}&month=${currentMonthNum}`}
            className="px-2.5 py-1 text-2xs font-semibold rounded bg-studio-bg border border-studio-border text-studio-text-muted hover:text-studio-amber transition-colors"
          >
            Today
          </Link>
        </div>

        <h2 className="font-header text-base font-semibold text-studio-text">{monthLabel}</h2>

        <div className="flex items-center gap-2">
          <Link
            href={`/calendar?year=${nextMonth.year}&month=${nextMonth.month}`}
            className="p-2 text-studio-text-muted hover:text-studio-text hover:bg-studio-panel-hover rounded-lg transition-all"
            title="Next month"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Conflict banner if any */}
      {conflictDates.size > 0 && (
        <div className="flex items-center gap-3 p-3.5 bg-studio-clay-subtle border border-studio-clay/30 rounded-xl text-xs text-studio-clay">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4 flex-shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <span>
            <strong>Schedule Conflict:</strong> {conflictDates.size} date{conflictDates.size > 1 ? "s" : ""} in {monthLabel} have multiple confirmed bookings scheduled on the same day.
          </span>
        </div>
      )}

      {/* Calendar grid */}
      <div className="bg-studio-panel border border-studio-border rounded-xl overflow-hidden shadow-sm">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-studio-border bg-studio-bg/30">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="py-2.5 text-center text-2xs font-semibold text-studio-text-muted uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {/* Empty cells for start of month */}
          {Array.from({ length: startDow }, (_, i) => (
            <div key={`empty-${i}`} className="min-h-[90px] border-b border-r border-studio-border bg-studio-bg/10" />
          ))}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayBookings = bookingsByDate.get(dateStr) ?? [];
            const isToday = dateStr === today;
            const hasConflict = conflictDates.has(dateStr);
            const col = (startDow + i) % 7;
            const isLastCol = col === 6;

            return (
              <div
                key={day}
                className={`min-h-[90px] p-2 border-b border-studio-border ${!isLastCol ? "border-r" : ""} ${
                  isToday ? "bg-studio-amber-subtle/20" : "hover:bg-studio-panel-hover/50"
                } transition-colors group relative`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-xs font-mono font-semibold w-6 h-6 flex items-center justify-center rounded-full transition-all ${
                      isToday
                        ? "bg-studio-amber text-studio-bg shadow-sm"
                        : "text-studio-text-muted group-hover:text-studio-text"
                    }`}
                  >
                    {day}
                  </span>
                  <div className="flex items-center gap-1">
                    {hasConflict && (
                      <span className="text-2xs text-studio-clay font-bold" title="Double booking conflict">
                        ⚠
                      </span>
                    )}
                    <Link
                      href={`/bookings/new?eventDate=${dateStr}`}
                      title={`Add booking on ${dateStr}`}
                      className="opacity-0 group-hover:opacity-100 text-studio-text-muted hover:text-studio-amber p-0.5 text-xs transition-opacity"
                    >
                      +
                    </Link>
                  </div>
                </div>

                <div className="space-y-1">
                  {dayBookings.slice(0, 3).map((booking) => (
                    <button
                      key={booking.id}
                      onClick={() => setSelectedBooking(booking)}
                      className={`w-full text-left text-2xs px-2 py-1 rounded truncate shadow-2xs ${
                        STATUS_COLORS[booking.status]
                      } transition-all`}
                    >
                      <span className="font-medium">{booking.clientName}</span>
                    </button>
                  ))}
                  {dayBookings.length > 3 && (
                    <p className="text-2xs text-studio-text-faint pl-1 font-mono">
                      +{dayBookings.length - 3} more
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {/* Trailing empty cells */}
          {Array.from(
            { length: (7 - ((startDow + daysInMonth) % 7)) % 7 },
            (_, i) => (
              <div
                key={`trail-${i}`}
                className={`min-h-[90px] border-b border-studio-border bg-studio-bg/10 ${i < 6 ? "border-r" : ""}`}
              />
            )
          )}
        </div>
      </div>

      {/* Interactive Booking detail popover modal */}
      {selectedBooking && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs"
            onClick={() => setSelectedBooking(null)}
          />
          <div className="fixed bottom-6 right-6 z-50 w-80 bg-studio-panel border border-studio-border rounded-xl shadow-2xl p-5 animate-slide-up space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-sm text-studio-text">{selectedBooking.clientName}</p>
                <p className="text-xs text-studio-text-muted">{selectedBooking.eventType}</p>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-studio-text-faint hover:text-studio-text p-1 rounded hover:bg-studio-bg"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {selectedBooking.location && (
              <div className="text-xs text-studio-text-muted flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5 text-studio-amber">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <span className="line-clamp-1">{selectedBooking.location}</span>
              </div>
            )}

            <div className="pt-2 border-t border-studio-border flex items-center justify-between">
              <span className="font-mono text-sm font-semibold text-studio-amber">
                {formatMoneyCompact(selectedBooking.feeCents)}
              </span>
              <Link
                href={`/bookings/${selectedBooking.id}`}
                className="px-3 py-1.5 rounded-lg bg-studio-amber text-studio-bg text-xs font-semibold hover:bg-studio-amber-dim transition-colors"
              >
                View booking →
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

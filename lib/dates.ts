/**
 * Date utilities for FlowMotion.
 * Per AGENTS.md: store UTC, display in Asia/Manila.
 * Never do date math on formatted strings.
 */

export const DISPLAY_TIMEZONE = "Asia/Manila";

/** Format a Date (UTC) for display in Asia/Manila timezone */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: DISPLAY_TIMEZONE,
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

/** Format date + time for display */
export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: DISPLAY_TIMEZONE,
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

/** Format just the month and year, e.g. "August 2026" */
export function formatMonthYear(date: Date): string {
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: DISPLAY_TIMEZONE,
    year: "numeric",
    month: "long",
  }).format(date);
}

/**
 * Get the start and end of the current calendar month in UTC.
 * Used for dashboard "this month" calculations.
 */
export function getCurrentMonthRange(): { start: Date; end: Date } {
  const now = new Date();
  // Get current month in Manila time
  const manilaFormatter = new Intl.DateTimeFormat("en-PH", {
    timeZone: DISPLAY_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = manilaFormatter.formatToParts(now);
  const year = parseInt(parts.find((p) => p.type === "year")!.value);
  const month = parseInt(parts.find((p) => p.type === "month")!.value);

  // Start of month in Manila = UTC offset -8h → Manila midnight is UTC-8
  // Using Date constructor in UTC to avoid DST issues
  const start = new Date(Date.UTC(year, month - 1, 1, -8, 0, 0));
  const end = new Date(Date.UTC(year, month, 0, 15, 59, 59)); // last day of month at 23:59:59 Manila

  return { start, end };
}

/**
 * Get month range for a specific year/month (1-indexed month).
 */
export function getMonthRange(
  year: number,
  month: number
): { start: Date; end: Date } {
  const start = new Date(Date.UTC(year, month - 1, 1, -8, 0, 0));
  const end = new Date(Date.UTC(year, month, 0, 15, 59, 59));
  return { start, end };
}

/** Today's date at midnight Manila time, returned as UTC Date */
export function todayManilaAsUtc(): Date {
  const now = new Date();
  const manilaDateStr = now.toLocaleDateString("en-CA", {
    timeZone: DISPLAY_TIMEZONE,
  });
  return new Date(manilaDateStr + "T00:00:00+08:00");
}

/** Convert a Manila date string (YYYY-MM-DD) to a UTC Date for DB storage */
export function manilaDateToUtc(dateStr: string): Date {
  return new Date(dateStr + "T00:00:00+08:00");
}

/** Get YYYY-MM-DD string in Manila timezone from a UTC date */
export function toManilaDateString(date: Date): string {
  return date.toLocaleDateString("en-CA", { timeZone: DISPLAY_TIMEZONE });
}

/** How many days ago was a date (from today, in Manila time) */
export function daysAgo(date: Date): number {
  const today = todayManilaAsUtc();
  const diff = today.getTime() - date.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/** Is a date in the past (before today Manila) */
export function isInPast(date: Date): boolean {
  return date < todayManilaAsUtc();
}

/** Is a date within N days from now */
export function isWithinDays(date: Date, days: number): boolean {
  const now = new Date();
  const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return date >= now && date <= future;
}

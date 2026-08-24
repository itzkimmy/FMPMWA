import type { Booking } from "@prisma/client";
import { toManilaDateString } from "./dates";

/**
 * Booking conflict detection logic.
 * Per SKILLS.md §Booking Conflict Detection:
 * - Flag (don't block) same-day CONFIRMED bookings
 * - Flag CONFIRMED booking within 24h of a full-day booking not yet DELIVERED
 *
 * These are pure functions — testable without DB.
 */

export const FULL_DAY_EVENT_TYPES = ["Wedding", "Debut", "Corporate", "Event"];

export type ConflictType = "SAME_DAY" | "EDITING_SQUEEZE";

export interface BookingConflict {
  type: ConflictType;
  bookingA: Pick<Booking, "id" | "eventType" | "eventDate" | "status">;
  bookingB: Pick<Booking, "id" | "eventType" | "eventDate" | "status">;
  message: string;
}

type BookingForConflict = Pick<
  Booking,
  "id" | "eventType" | "eventDate" | "status" | "deliveryStatus"
>;

/**
 * Detect conflicts in a list of bookings.
 * Returns all unique conflict pairs found.
 */
export function detectConflicts(
  bookings: BookingForConflict[]
): BookingConflict[] {
  const confirmed = bookings.filter((b) => b.status === "CONFIRMED");
  const conflicts: BookingConflict[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < confirmed.length; i++) {
    for (let j = i + 1; j < confirmed.length; j++) {
      const a = confirmed[i];
      const b = confirmed[j];
      const pairKey = [a.id, b.id].sort().join(":");
      if (seen.has(pairKey)) continue;

      const dateA = new Date(a.eventDate);
      const dateB = new Date(b.eventDate);
      const diffHours =
        Math.abs(dateA.getTime() - dateB.getTime()) / (1000 * 60 * 60);

      // Same calendar day in Manila timezone
      const sameDayA = toManilaDateString(dateA);
      const sameDayB = toManilaDateString(dateB);

      if (sameDayA === sameDayB) {
        conflicts.push({
          type: "SAME_DAY",
          bookingA: a,
          bookingB: b,
          message: `Two confirmed bookings on the same day (${sameDayA})`,
        });
        seen.add(pairKey);
        continue;
      }

      // Editing squeeze: within 24h and one is a full-day event not yet delivered
      if (diffHours <= 24) {
        const aIsFullDay = FULL_DAY_EVENT_TYPES.includes(a.eventType);
        const bIsFullDay = FULL_DAY_EVENT_TYPES.includes(b.eventType);
        const aNotDelivered = a.deliveryStatus !== "DELIVERED";
        const bNotDelivered = b.deliveryStatus !== "DELIVERED";

        if ((aIsFullDay && aNotDelivered) || (bIsFullDay && bNotDelivered)) {
          conflicts.push({
            type: "EDITING_SQUEEZE",
            bookingA: a,
            bookingB: b,
            message: `Bookings within 24 hours — editing turnaround may be tight`,
          });
          seen.add(pairKey);
        }
      }
    }
  }

  return conflicts;
}

/** Check if a specific booking is involved in any conflicts */
export function getBookingConflicts(
  bookingId: string,
  allConflicts: BookingConflict[]
): BookingConflict[] {
  return allConflicts.filter(
    (c) => c.bookingA.id === bookingId || c.bookingB.id === bookingId
  );
}

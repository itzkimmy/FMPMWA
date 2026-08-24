import type { Booking, Client, Transaction } from "@prisma/client";
import { isInPast, isWithinDays } from "./dates";

/**
 * Payment Watch logic — per SKILLS.md §Payment Watch Logic.
 * A booking appears in Payment Watch when:
 * - status = CONFIRMED AND total linked INCOME transactions < feeCents, AND
 * - eventDate is in the past, OR eventDate is within 7 days and deposit is unpaid.
 */

export type BookingWithTransactions = Booking & {
  client: Client;
  transactions: Transaction[];
};

export interface PaymentWatchItem {
  booking: BookingWithTransactions;
  paidCents: number;
  dueCents: number;
  daysOverdue: number;
}

/** Calculate total paid (sum of INCOME transactions) for a booking */
export function getPaidCents(booking: BookingWithTransactions): number {
  return booking.transactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amountCents, 0);
}

/** Returns true if this booking should appear on the Payment Watch list */
export function isOnPaymentWatch(booking: BookingWithTransactions): boolean {
  if (booking.status !== "CONFIRMED") return false;

  const paidCents = getPaidCents(booking);
  if (paidCents >= booking.feeCents) return false; // fully paid

  const eventDate = new Date(booking.eventDate);
  const depositUnpaid = booking.depositCents > 0 && paidCents === 0;

  return isInPast(eventDate) || (isWithinDays(eventDate, 7) && depositUnpaid);
}

/** Build the payment watch list from a set of bookings, sorted by most overdue */
export function buildPaymentWatchList(
  bookings: BookingWithTransactions[]
): PaymentWatchItem[] {
  return bookings
    .filter(isOnPaymentWatch)
    .map((booking) => {
      const paidCents = getPaidCents(booking);
      const dueCents = booking.feeCents - paidCents;
      const eventDate = new Date(booking.eventDate);
      const daysOverdue = isInPast(eventDate)
        ? Math.floor(
            (Date.now() - eventDate.getTime()) / (1000 * 60 * 60 * 24)
          )
        : 0;
      return { booking, paidCents, dueCents, daysOverdue };
    })
    .sort((a, b) => b.daysOverdue - a.daysOverdue || a.dueCents - b.dueCents);
}

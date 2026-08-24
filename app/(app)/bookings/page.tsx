export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/lib/db";
import BookingsClientList, { type BookingListItem } from "./BookingsClientList";

export default async function BookingsPage() {
  const rawBookings = await db.booking.findMany({
    include: { client: true, transactions: { where: { type: "INCOME" } } },
    orderBy: { eventDate: "desc" },
  });

  const formattedBookings: BookingListItem[] = rawBookings.map((b) => ({
    id: b.id,
    eventType: b.eventType,
    eventDate: b.eventDate.toISOString(),
    location: b.location,
    feeCents: b.feeCents,
    depositCents: b.depositCents,
    status: b.status,
    deliveryStatus: b.deliveryStatus,
    notes: b.notes,
    client: {
      id: b.client.id,
      name: b.client.name,
      contact: b.client.contact,
    },
    paidCents: b.transactions.reduce((sum, t) => sum + t.amountCents, 0),
  }));

  return (
    <div className="max-w-6xl space-y-5 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-header text-xl font-bold text-white">
            Bookings
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your photoshoot schedule, deliverables, and balances
          </p>
        </div>
        <Link
          href="/bookings/new"
          className="btn-primary flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg shadow-sm"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New booking
        </Link>
      </div>

      {/* Interactive List */}
      <BookingsClientList initialBookings={formattedBookings} />
    </div>
  );
}
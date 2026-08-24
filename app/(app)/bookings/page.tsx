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
    <div className="max-w-6xl space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-header text-xl font-semibold text-studio-text">
            Bookings
          </h1>
          <p className="text-sm text-studio-text-muted mt-0.5">
            Manage your photoshoot schedule, client deliverables, and payments
          </p>
        </div>
        <Link
          href="/bookings/new"
          className="flex items-center gap-2 px-4 py-2 bg-studio-amber text-studio-bg text-sm font-semibold rounded-lg hover:bg-studio-amber-dim shadow-sm transition-all"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
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

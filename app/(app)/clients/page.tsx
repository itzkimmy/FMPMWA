export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/lib/db";
import ClientsClientList, { type ClientListItem } from "./ClientsClientList";

export default async function ClientsPage() {
  const clients = await db.client.findMany({
    include: {
      bookings: {
        include: {
          transactions: { where: { type: "INCOME" } },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  const formattedClients: ClientListItem[] = clients.map((client) => {
    const validBookings = client.bookings.filter((b) => b.status !== "CANCELLED");
    const totalSpentCents = validBookings
      .flatMap((b) => b.transactions)
      .reduce((sum, t) => sum + t.amountCents, 0);
    const lastBooking = validBookings.sort(
      (a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
    )[0];

    return {
      id: client.id,
      name: client.name,
      contact: client.contact,
      source: client.source,
      notes: client.notes,
      totalJobs: validBookings.length,
      totalSpentCents,
      lastBookingDate: lastBooking ? lastBooking.eventDate.toISOString() : null,
    };
  });

  return (
    <div className="max-w-5xl space-y-5 animate-fade-in pb-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-header text-xl font-bold text-white">Clients</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Client directory, shoot history, and revenue tracking
          </p>
        </div>
        <Link
          href="/clients/new"
          className="btn-primary flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg shadow-sm"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New client
        </Link>
      </div>

      <ClientsClientList initialClients={formattedClients} />
    </div>
  );
}
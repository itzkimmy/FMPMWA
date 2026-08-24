export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatMoney, formatMoneyCompact } from "@/lib/money";
import { formatDate } from "@/lib/dates";
import { BookingStatusPill } from "@/components/ui/StatusPill";
import DeleteClientButton from "./DeleteClientButton";

interface ClientDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  const { id } = await params;

  const client = await db.client.findUnique({
    where: { id },
    include: {
      bookings: {
        include: { transactions: { where: { type: "INCOME" } } },
        orderBy: { eventDate: "desc" },
      },
    },
  });

  if (!client) notFound();

  const activeBookings = client.bookings.filter((b) => b.status !== "CANCELLED");
  const totalSpentCents = activeBookings
    .flatMap((b) => b.transactions)
    .reduce((sum, t) => sum + t.amountCents, 0);

  return (
    <div className="max-w-4xl space-y-6 animate-fade-in pb-10">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/clients" className="text-slate-400 hover:text-white text-xs transition-colors font-medium">Clients</Link>
            <span className="text-slate-600">/</span>
            <span className="text-xs text-slate-300 font-medium">{client.name}</span>
          </div>
          <h1 className="font-header text-xl font-bold text-white">{client.name}</h1>
          {client.contact && <p className="text-xs text-slate-400 mt-0.5">{client.contact}</p>}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/clients/${id}/edit`}
            className="px-3.5 py-1.5 bg-[#131C2E] border border-slate-700 text-slate-200 hover:text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-all shadow-sm"
          >
            Edit
          </Link>
          <DeleteClientButton clientId={id} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#131C2E] border border-slate-800 rounded-xl p-4 shadow-md">
          <p className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Bookings</p>
          <p className="font-mono text-2xl font-bold text-white">{activeBookings.length}</p>
        </div>
        <div className="bg-[#131C2E] border border-slate-800 rounded-xl p-4 shadow-md">
          <p className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Paid</p>
          <p className="font-mono text-2xl font-bold text-emerald-400">{formatMoneyCompact(totalSpentCents)}</p>
        </div>
        <div className="bg-[#131C2E] border border-slate-800 rounded-xl p-4 shadow-md">
          <p className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Source</p>
          <p className="text-xs font-semibold text-white mt-1">{client.source ?? "—"}</p>
        </div>
      </div>

      {client.notes && (
        <div className="bg-[#131C2E] border border-slate-800 rounded-xl p-5 shadow-md">
          <p className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Client Notes</p>
          <p className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">{client.notes}</p>
        </div>
      )}

      <div className="bg-[#131C2E] border border-slate-800 rounded-xl shadow-md overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#0F172A]/75">
          <h2 className="font-header text-sm font-semibold text-white">Booking History</h2>
          <Link
            href={`/bookings/new?clientName=${encodeURIComponent(client.name)}`}
            className="text-xs text-amber-400 font-semibold hover:underline"
          >
            + New booking
          </Link>
        </div>
        {client.bookings.length === 0 ? (
          <p className="px-5 py-6 text-xs text-slate-400 text-center">No bookings recorded yet</p>
        ) : (
          <ul className="divide-y divide-slate-800">
            {client.bookings.map((booking) => {
              const paidCents = booking.transactions.reduce((sum, t) => sum + t.amountCents, 0);
              return (
                <li key={booking.id}>
                  <Link
                    href={`/bookings/${booking.id}`}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#182338] transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white group-hover:text-amber-400 transition-colors">
                        {booking.eventType}
                        {booking.location ? ` · ${booking.location}` : ""}
                      </p>
                      <p className="font-mono text-2xs text-slate-400 mt-0.5">
                        {formatDate(new Date(booking.eventDate))}
                      </p>
                    </div>
                    <BookingStatusPill status={booking.status} />
                    <div className="text-right">
                      <p className="font-mono text-xs font-bold text-white">{formatMoneyCompact(booking.feeCents)}</p>
                      <p className={`font-mono text-2xs font-semibold ${paidCents >= booking.feeCents ? "text-emerald-400" : "text-rose-400"}`}>
                        {formatMoney(paidCents)} paid
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
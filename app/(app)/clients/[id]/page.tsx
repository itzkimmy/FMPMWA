export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatMoneyCompact } from "@/lib/money";
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

  const validBookings = client.bookings.filter((b) => b.status !== "CANCELLED");
  const totalRevenueCents = validBookings
    .flatMap((b) => b.transactions)
    .reduce((sum, t) => sum + t.amountCents, 0);

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in pb-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link href="/clients" className="text-xs text-slate-400 hover:text-amber-400 font-medium transition-colors mb-1 inline-block">
            ← Back to Clients
          </Link>
          <h1 className="font-header text-xl font-bold text-white">{client.name}</h1>
          <p className="text-xs text-slate-400 mt-0.5">{validBookings.length} booking{validBookings.length !== 1 ? "s" : ""} · {formatMoneyCompact(totalRevenueCents)} total revenue</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/clients/${id}/edit`} className="btn-primary px-3 py-1.5 text-xs font-bold rounded-lg">Edit</Link>
          <DeleteClientButton id={id} />
        </div>
      </div>

      <div className="bg-[#131C2E] border border-slate-800 rounded-xl p-5 shadow-md">
        <h2 className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Contact Info</h2>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-xs">
          <div>
            <dt className="text-slate-400 font-medium">Name</dt>
            <dd className="text-white font-semibold mt-0.5">{client.name}</dd>
          </div>
          <div>
            <dt className="text-slate-400 font-medium">Contact</dt>
            <dd className="text-white font-semibold mt-0.5">{client.contact || "—"}</dd>
          </div>
          <div>
            <dt className="text-slate-400 font-medium">Source</dt>
            <dd className="text-white font-semibold mt-0.5">{client.source || "—"}</dd>
          </div>
          <div>
            <dt className="text-slate-400 font-medium">Added</dt>
            <dd className="text-white font-semibold mt-0.5">{formatDate(client.createdAt)}</dd>
          </div>
        </dl>
        {client.notes && (
          <div className="mt-3">
            <dt className="text-slate-400 font-medium text-xs mb-1">Notes</dt>
            <dd className="text-xs text-slate-300 bg-[#0F172A] border border-slate-700 rounded-lg p-3 whitespace-pre-wrap">{client.notes}</dd>
          </div>
        )}
      </div>

      {client.bookings.length > 0 && (
        <div className="bg-[#131C2E] border border-slate-800 rounded-xl shadow-md overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800 bg-[#0F172A]/75">
            <h2 className="font-header text-sm font-semibold text-white">Booking History</h2>
          </div>
          <ul className="divide-y divide-slate-800">
            {client.bookings.map((b) => (
              <li key={b.id}>
                <Link href={`/bookings/${b.id}`} className="flex items-center gap-4 px-5 py-3 hover:bg-[#182338] transition-colors group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-white group-hover:text-amber-400 transition-colors">{b.eventType}</p>
                      <BookingStatusPill status={b.status} />
                    </div>
                    <p className="text-2xs text-slate-400 mt-0.5">{formatDate(b.eventDate)}{b.location ? ` · ${b.location}` : ""}</p>
                  </div>
                  <p className="font-mono text-xs font-bold text-white">{formatMoneyCompact(b.feeCents)}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
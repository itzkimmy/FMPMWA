export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatMoney, formatMoneyCompact } from "@/lib/money";
import { formatDate } from "@/lib/dates";
import { BookingStatusPill, DeliveryStatusPill } from "@/components/ui/StatusPill";
import DeleteBookingButton from "./DeleteBookingButton";
import AddTransactionInline from "./AddTransactionInline";

interface BookingDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function BookingDetailPage({ params }: BookingDetailPageProps) {
  const { id } = await params;

  const booking = await db.booking.findUnique({
    where: { id },
    include: {
      client: true,
      transactions: { orderBy: { date: "desc" } },
    },
  });

  if (!booking) notFound();

  const paidCents = booking.transactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amountCents, 0);
  const balanceCents = booking.feeCents - paidCents;
  const paymentPercent = booking.feeCents > 0 ? Math.min(100, Math.round((paidCents / booking.feeCents) * 100)) : 0;

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link href="/bookings" className="text-xs text-slate-400 hover:text-amber-400 font-medium transition-colors mb-1 inline-block">
            ← Back to Bookings
          </Link>
          <h1 className="font-header text-xl font-bold text-white">
            {booking.client.name}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {booking.eventType} · {formatDate(new Date(booking.eventDate))}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/bookings/${id}/edit`}
            className="btn-primary px-3 py-1.5 text-xs font-bold rounded-lg"
          >
            Edit
          </Link>
          <DeleteBookingButton id={id} />
        </div>
      </div>

      {/* Status + Payment Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[#131C2E] border border-slate-800 rounded-xl p-5 shadow-md space-y-3">
          <h2 className="text-2xs font-semibold text-slate-400 uppercase tracking-wider">Status</h2>
          <div className="flex items-center gap-2">
            <BookingStatusPill status={booking.status} />
            <DeliveryStatusPill status={booking.deliveryStatus} />
          </div>
        </div>

        <div className="bg-[#131C2E] border border-slate-800 rounded-xl p-5 shadow-md space-y-3">
          <h2 className="text-2xs font-semibold text-slate-400 uppercase tracking-wider">Payment</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-lg font-bold text-white">{formatMoneyCompact(paidCents)}</p>
              <p className="text-2xs text-slate-400">of {formatMoney(booking.feeCents)}</p>
            </div>
            <div className={`font-mono text-sm font-bold ${balanceCents > 0 ? "text-rose-400" : "text-emerald-400"}`}>
              {balanceCents > 0 ? `${formatMoneyCompact(balanceCents)} due` : "Paid ✓"}
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${balanceCents <= 0 ? "bg-emerald-400" : "bg-amber-500"}`}
              style={{ width: `${paymentPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Details Card */}
      <div className="bg-[#131C2E] border border-slate-800 rounded-xl p-5 shadow-md space-y-4">
        <h2 className="text-2xs font-semibold text-slate-400 uppercase tracking-wider">Details</h2>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-xs">
          <div>
            <dt className="text-slate-400 font-medium">Client</dt>
            <dd className="text-white font-semibold mt-0.5">{booking.client.name}</dd>
          </div>
          <div>
            <dt className="text-slate-400 font-medium">Contact</dt>
            <dd className="text-white font-semibold mt-0.5">{booking.client.contact || "—"}</dd>
          </div>
          <div>
            <dt className="text-slate-400 font-medium">Event Type</dt>
            <dd className="text-white font-semibold mt-0.5">{booking.eventType}</dd>
          </div>
          <div>
            <dt className="text-slate-400 font-medium">Date</dt>
            <dd className="text-white font-semibold mt-0.5">{formatDate(new Date(booking.eventDate))}</dd>
          </div>
          <div>
            <dt className="text-slate-400 font-medium">Location</dt>
            <dd className="text-white font-semibold mt-0.5">{booking.location || "—"}</dd>
          </div>
          <div>
            <dt className="text-slate-400 font-medium">Deposit</dt>
            <dd className="text-white font-semibold mt-0.5">{formatMoney(booking.depositCents)}</dd>
          </div>
        </dl>
        {booking.notes && (
          <div>
            <dt className="text-slate-400 font-medium text-xs mb-1">Notes</dt>
            <dd className="text-xs text-slate-300 bg-[#0F172A] border border-slate-700 rounded-lg p-3 whitespace-pre-wrap">
              {booking.notes}
            </dd>
          </div>
        )}
      </div>

      {/* Add Payment */}
      <AddTransactionInline bookingId={id} clientName={booking.client.name} />

      {/* Transaction History */}
      {booking.transactions.length > 0 && (
        <div className="bg-[#131C2E] border border-slate-800 rounded-xl shadow-md overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800 bg-[#0F172A]/75">
            <h2 className="font-header text-sm font-semibold text-white">Transaction History</h2>
          </div>
          <ul className="divide-y divide-slate-800">
            {booking.transactions.map((tx) => (
              <li key={tx.id} className="flex items-center gap-4 px-5 py-3">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${tx.type === "INCOME" ? "bg-emerald-400" : "bg-rose-400"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{tx.description}</p>
                  <p className="text-2xs text-slate-400 mt-0.5">
                    {tx.category || "—"} · {formatDate(new Date(tx.date))}
                  </p>
                </div>
                <span className={`font-mono text-xs font-bold ${tx.type === "INCOME" ? "text-emerald-400" : "text-rose-400"}`}>
                  {tx.type === "INCOME" ? "+" : "−"}{formatMoneyCompact(tx.amountCents)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
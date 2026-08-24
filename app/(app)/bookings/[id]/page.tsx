export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatMoney, formatMoneyCompact } from "@/lib/money";
import { formatDate, formatDateTime } from "@/lib/dates";
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

  const incomeCents = booking.transactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amountCents, 0);

  const expensesCents = booking.transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amountCents, 0);

  const balanceCents = booking.feeCents - incomeCents;
  const isPaid = incomeCents >= booking.feeCents;

  return (
    <div className="max-w-4xl space-y-6 animate-fade-in pb-10">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/bookings" className="text-slate-400 hover:text-white text-xs transition-colors font-medium">
              Bookings
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-xs text-slate-300 font-medium">{booking.client.name}</span>
          </div>
          <h1 className="font-header text-xl font-bold text-white">
            {booking.eventType} — {booking.client.name}
          </h1>
          <p className="font-mono text-xs text-slate-400 mt-0.5">
            {formatDate(new Date(booking.eventDate))}
            {booking.location ? ` · ${booking.location}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/bookings/${id}/edit`}
            className="px-3.5 py-1.5 bg-[#131C2E] border border-slate-700 text-slate-200 hover:text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-all shadow-sm"
          >
            Edit
          </Link>
          <DeleteBookingButton bookingId={id} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#131C2E] border border-slate-800 rounded-xl p-4 shadow-md">
          <p className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Booking Status</p>
          <BookingStatusPill status={booking.status} />
        </div>
        <div className="bg-[#131C2E] border border-slate-800 rounded-xl p-4 shadow-md">
          <p className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Delivery Status</p>
          <DeliveryStatusPill status={booking.deliveryStatus} />
        </div>
        <div className="bg-[#131C2E] border border-slate-800 rounded-xl p-4 shadow-md">
          <p className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Payment Status</p>
          <p className={`font-mono text-lg font-bold ${isPaid ? "text-emerald-400" : "text-rose-400"}`}>
            {isPaid ? "Paid in full" : `${formatMoney(balanceCents)} due`}
          </p>
          <p className="font-mono text-2xs text-slate-400 mt-0.5">
            {formatMoney(incomeCents)} of {formatMoneyCompact(booking.feeCents)}
          </p>
        </div>
      </div>

      <div className="bg-[#131C2E] border border-slate-800 rounded-xl p-5 shadow-md">
        <h2 className="font-header text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Shoot Details
        </h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
          <div>
            <dt className="text-xs text-slate-400 font-medium">Client</dt>
            <dd className="mt-0.5">
              <Link href={`/clients/${booking.clientId}`} className="text-xs text-amber-400 font-semibold hover:underline">
                {booking.client.name}
              </Link>
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400 font-medium">Total Fee</dt>
            <dd className="font-mono text-xs font-bold text-white mt-0.5">{formatMoney(booking.feeCents)}</dd>
          </div>
          {booking.depositCents > 0 && (
            <div>
              <dt className="text-xs text-slate-400 font-medium">Deposit Required</dt>
              <dd className="font-mono text-xs font-semibold text-white mt-0.5">{formatMoney(booking.depositCents)}</dd>
            </div>
          )}
          <div>
            <dt className="text-xs text-slate-400 font-medium">Created</dt>
            <dd className="font-mono text-xs text-slate-400 mt-0.5">{formatDateTime(new Date(booking.createdAt))}</dd>
          </div>
          {booking.notes && (
            <div className="sm:col-span-2">
              <dt className="text-xs text-slate-400 font-medium mb-1">Notes</dt>
              <dd className="text-xs text-slate-200 whitespace-pre-wrap bg-[#0F172A] border border-slate-800 rounded-lg p-3">
                {booking.notes}
              </dd>
            </div>
          )}
        </dl>
      </div>

      <div className="bg-[#131C2E] border border-slate-800 rounded-xl shadow-md overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#0F172A]/75">
          <h2 className="font-header text-sm font-semibold text-white">Transactions</h2>
          <div className="flex gap-4 text-xs font-mono">
            <span className="text-emerald-400 font-bold">+{formatMoneyCompact(incomeCents)}</span>
            {expensesCents > 0 && (
              <span className="text-rose-400 font-bold">−{formatMoneyCompact(expensesCents)}</span>
            )}
          </div>
        </div>

        {booking.transactions.length === 0 ? (
          <p className="px-5 py-6 text-xs text-slate-400 text-center">
            No transactions linked to this booking yet
          </p>
        ) : (
          <ul className="divide-y divide-slate-800">
            {booking.transactions.map((tx) => (
              <li key={tx.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#182338] transition-colors">
                <div className={`flex-shrink-0 w-2 h-2 rounded-full ${tx.type === "INCOME" ? "bg-emerald-400" : "bg-rose-400"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white">{tx.description}</p>
                  <p className="text-2xs text-slate-400">
                    {tx.category && `${tx.category} · `}
                    {formatDate(new Date(tx.date))}
                  </p>
                </div>
                <span className={`font-mono text-xs font-bold ${tx.type === "INCOME" ? "text-emerald-400" : "text-rose-400"}`}>
                  {tx.type === "INCOME" ? "+" : "−"}{formatMoney(tx.amountCents)}
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="border-t border-slate-800 px-5 py-4 bg-[#0F172A]/30">
          <AddTransactionInline bookingId={id} />
        </div>
      </div>
    </div>
  );
}
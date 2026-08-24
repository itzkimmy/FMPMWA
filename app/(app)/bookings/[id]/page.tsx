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
    <div className="max-w-4xl space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/bookings" className="text-studio-text-muted hover:text-studio-text text-sm transition-colors">
              Bookings
            </Link>
            <span className="text-studio-text-faint">/</span>
            <span className="text-sm text-studio-text">{booking.client.name}</span>
          </div>
          <h1 className="font-header text-xl font-semibold text-studio-text">
            {booking.eventType} · {booking.client.name}
          </h1>
          <p className="font-mono text-sm text-studio-text-muted mt-0.5">
            {formatDate(new Date(booking.eventDate))}
            {booking.location ? ` · ${booking.location}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/bookings/${id}/edit`}
            className="px-3 py-2 bg-studio-panel border border-studio-border text-studio-text-muted text-sm font-medium rounded-lg hover:text-studio-text hover:bg-studio-panel-hover transition-all"
          >
            Edit
          </Link>
          <DeleteBookingButton bookingId={id} />
        </div>
      </div>

      {/* Status + financials */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-studio-panel border border-studio-border rounded-xl p-4">
          <p className="text-2xs text-studio-text-muted uppercase tracking-wider mb-2">Booking status</p>
          <BookingStatusPill status={booking.status} />
        </div>
        <div className="bg-studio-panel border border-studio-border rounded-xl p-4">
          <p className="text-2xs text-studio-text-muted uppercase tracking-wider mb-2">Delivery status</p>
          <DeliveryStatusPill status={booking.deliveryStatus} />
        </div>
        <div className="bg-studio-panel border border-studio-border rounded-xl p-4">
          <p className="text-2xs text-studio-text-muted uppercase tracking-wider mb-2">Payment</p>
          <p className={`font-mono text-lg font-semibold ${isPaid ? "text-studio-sage" : "text-studio-clay"}`}>
            {isPaid ? "Paid in full" : formatMoney(balanceCents) + " due"}
          </p>
          <p className="font-mono text-xs text-studio-text-muted mt-0.5">
            {formatMoney(incomeCents)} of {formatMoneyCompact(booking.feeCents)}
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="bg-studio-panel border border-studio-border rounded-xl p-5">
        <h2 className="font-header text-xs font-semibold text-studio-text-muted uppercase tracking-wider mb-4">
          Details
        </h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
          <div>
            <dt className="text-xs text-studio-text-muted">Client</dt>
            <dd>
              <Link href={`/clients/${booking.clientId}`} className="text-sm text-studio-amber hover:underline">
                {booking.client.name}
              </Link>
            </dd>
          </div>
          <div>
            <dt className="text-xs text-studio-text-muted">Total fee</dt>
            <dd className="font-mono text-sm text-studio-text">{formatMoney(booking.feeCents)}</dd>
          </div>
          {booking.depositCents > 0 && (
            <div>
              <dt className="text-xs text-studio-text-muted">Deposit required</dt>
              <dd className="font-mono text-sm text-studio-text">{formatMoney(booking.depositCents)}</dd>
            </div>
          )}
          <div>
            <dt className="text-xs text-studio-text-muted">Created</dt>
            <dd className="font-mono text-sm text-studio-text-muted">{formatDateTime(new Date(booking.createdAt))}</dd>
          </div>
          {booking.notes && (
            <div className="sm:col-span-2">
              <dt className="text-xs text-studio-text-muted mb-1">Notes</dt>
              <dd className="text-sm text-studio-text whitespace-pre-wrap bg-studio-bg border border-studio-border rounded-lg p-3">
                {booking.notes}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Transactions */}
      <div className="bg-studio-panel border border-studio-border rounded-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-studio-border">
          <h2 className="font-header text-sm font-semibold text-studio-text">Transactions</h2>
          <div className="flex gap-4 text-xs font-mono">
            <span className="text-studio-sage">+{formatMoneyCompact(incomeCents)}</span>
            {expensesCents > 0 && (
              <span className="text-studio-clay">−{formatMoneyCompact(expensesCents)}</span>
            )}
          </div>
        </div>

        {booking.transactions.length === 0 ? (
          <p className="px-5 py-6 text-sm text-studio-text-muted text-center">
            No transactions linked yet
          </p>
        ) : (
          <ul className="divide-y divide-studio-border">
            {booking.transactions.map((tx) => (
              <li key={tx.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className={`flex-shrink-0 w-2 h-2 rounded-full ${tx.type === "INCOME" ? "bg-studio-sage" : "bg-studio-clay"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-studio-text">{tx.description}</p>
                  <p className="text-xs text-studio-text-muted">
                    {tx.category && `${tx.category} · `}
                    {formatDate(new Date(tx.date))}
                  </p>
                </div>
                <span className={`font-mono text-sm font-semibold ${tx.type === "INCOME" ? "text-studio-sage" : "text-studio-clay"}`}>
                  {tx.type === "INCOME" ? "+" : "−"}{formatMoney(tx.amountCents)}
                </span>
              </li>
            ))}
          </ul>
        )}

        {/* Inline add transaction */}
        <div className="border-t border-studio-border px-5 py-4">
          <AddTransactionInline bookingId={id} />
        </div>
      </div>
    </div>
  );
}

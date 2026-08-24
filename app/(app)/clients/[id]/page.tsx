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
    <div className="max-w-4xl space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/clients" className="text-studio-text-muted hover:text-studio-text text-sm transition-colors">Clients</Link>
            <span className="text-studio-text-faint">/</span>
            <span className="text-sm text-studio-text">{client.name}</span>
          </div>
          <h1 className="font-header text-xl font-semibold text-studio-text">{client.name}</h1>
          {client.contact && <p className="text-sm text-studio-text-muted mt-0.5">{client.contact}</p>}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/clients/${id}/edit`}
            className="px-3 py-2 bg-studio-panel border border-studio-border text-studio-text-muted text-sm font-medium rounded-lg hover:text-studio-text hover:bg-studio-panel-hover transition-all"
          >
            Edit
          </Link>
          <DeleteClientButton clientId={id} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-studio-panel border border-studio-border rounded-xl p-4">
          <p className="text-2xs text-studio-text-muted uppercase tracking-wider mb-1">Total jobs</p>
          <p className="font-mono text-2xl font-semibold text-studio-text">{activeBookings.length}</p>
        </div>
        <div className="bg-studio-panel border border-studio-border rounded-xl p-4">
          <p className="text-2xs text-studio-text-muted uppercase tracking-wider mb-1">Total paid</p>
          <p className="font-mono text-xl font-semibold text-studio-sage">{formatMoneyCompact(totalSpentCents)}</p>
        </div>
        <div className="bg-studio-panel border border-studio-border rounded-xl p-4">
          <p className="text-2xs text-studio-text-muted uppercase tracking-wider mb-1">Source</p>
          <p className="text-sm text-studio-text">{client.source ?? "—"}</p>
        </div>
      </div>

      {/* Notes */}
      {client.notes && (
        <div className="bg-studio-panel border border-studio-border rounded-xl p-5">
          <p className="text-xs text-studio-text-muted mb-2">Notes</p>
          <p className="text-sm text-studio-text whitespace-pre-wrap">{client.notes}</p>
        </div>
      )}

      {/* Booking history */}
      <div className="bg-studio-panel border border-studio-border rounded-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-studio-border">
          <h2 className="font-header text-sm font-semibold text-studio-text">Booking history</h2>
          <Link
            href={`/bookings/new`}
            className="text-xs text-studio-amber hover:underline"
          >
            New booking
          </Link>
        </div>
        {client.bookings.length === 0 ? (
          <p className="px-5 py-6 text-sm text-studio-text-muted text-center">No bookings yet</p>
        ) : (
          <ul className="divide-y divide-studio-border">
            {client.bookings.map((booking) => {
              const paidCents = booking.transactions.reduce((sum, t) => sum + t.amountCents, 0);
              return (
                <li key={booking.id}>
                  <Link
                    href={`/bookings/${booking.id}`}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-studio-panel-hover transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-studio-text group-hover:text-studio-amber transition-colors">
                        {booking.eventType}
                        {booking.location ? ` · ${booking.location}` : ""}
                      </p>
                      <p className="font-mono text-xs text-studio-text-muted">
                        {formatDate(new Date(booking.eventDate))}
                      </p>
                    </div>
                    <BookingStatusPill status={booking.status} />
                    <div className="text-right">
                      <p className="font-mono text-sm text-studio-text">{formatMoneyCompact(booking.feeCents)}</p>
                      <p className={`font-mono text-xs ${paidCents >= booking.feeCents ? "text-studio-sage" : "text-studio-clay"}`}>
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

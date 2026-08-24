import Link from "next/link";
import { db } from "@/lib/db";
import { formatMoneyCompact, formatMoney } from "@/lib/money";
import { formatDate, getCurrentMonthRange, todayManilaAsUtc } from "@/lib/dates";
import { buildPaymentWatchList } from "@/lib/payment-watch";
import { detectConflicts } from "@/lib/conflicts";
import { DeliveryStatusPill } from "@/components/ui/StatusPill";
import QuickActionBar from "@/components/dashboard/QuickActionBar";
import PaymentWatchClient from "@/components/dashboard/PaymentWatchClient";

/**
 * Dashboard page — server component, all data fetched at request time.
 * Interactive real-time metrics, quick actions, payment watch with 1-click reminder copy.
 */
export default async function DashboardPage() {
  const { start: monthStart, end: monthEnd } = getCurrentMonthRange();
  const today = todayManilaAsUtc();
  const nextMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 31);

  // Fetch all data needed for the dashboard in parallel
  const [
    monthIncomeAgg,
    monthExpenseAgg,
    confirmedBookings,
    inEditingCount,
    upcomingBookings,
    recentTransactions,
  ] = await Promise.all([
    // This month's income
    db.transaction.aggregate({
      where: {
        type: "INCOME",
        date: { gte: monthStart, lte: monthEnd },
      },
      _sum: { amountCents: true },
    }),
    // This month's expenses
    db.transaction.aggregate({
      where: {
        type: "EXPENSE",
        date: { gte: monthStart, lte: monthEnd },
      },
      _sum: { amountCents: true },
    }),
    // All CONFIRMED bookings (for payment watch + conflict detection)
    db.booking.findMany({
      where: { status: "CONFIRMED" },
      include: { client: true, transactions: true },
      orderBy: { eventDate: "asc" },
    }),
    // In editing count
    db.booking.count({ where: { deliveryStatus: "EDITING" } }),
    // Upcoming bookings (next 30 days, confirmed)
    db.booking.findMany({
      where: {
        status: "CONFIRMED",
        eventDate: { gte: today, lte: nextMonthEnd },
      },
      include: { client: true },
      orderBy: { eventDate: "asc" },
      take: 8,
    }),
    // Recent transactions
    db.transaction.findMany({
      orderBy: { date: "desc" },
      take: 5,
      include: { booking: { include: { client: true } } },
    }),
  ]);

  const thisMonthIncome = monthIncomeAgg._sum.amountCents ?? 0;
  const thisMonthExpenses = monthExpenseAgg._sum.amountCents ?? 0;
  const thisMonthNet = thisMonthIncome - thisMonthExpenses;

  // Payment watch formatted for interactive client component
  const rawPaymentWatch = buildPaymentWatchList(confirmedBookings).slice(0, 5);
  const paymentWatchItems = rawPaymentWatch.map((item) => ({
    booking: {
      id: item.booking.id,
      eventType: item.booking.eventType,
      eventDate: item.booking.eventDate.toISOString(),
      client: {
        name: item.booking.client.name,
        contact: item.booking.client.contact,
      },
    },
    dueCents: item.dueCents,
    daysOverdue: item.daysOverdue,
  }));

  const pendingPaymentsTotal = paymentWatchItems.reduce(
    (sum, item) => sum + item.dueCents,
    0
  );

  // Upcoming shoots count (this month)
  const upcomingThisMonth = confirmedBookings.filter(
    (b) => new Date(b.eventDate) >= today && new Date(b.eventDate) <= monthEnd
  ).length;

  // Conflict detection
  const conflicts = detectConflicts(confirmedBookings);

  return (
    <div className="space-y-6 max-w-7xl animate-fade-in">
      {/* Quick Action Bar */}
      <QuickActionBar />

      {/* Conflict warnings */}
      {conflicts.length > 0 && (
        <div className="bg-studio-clay-subtle border border-studio-clay/30 rounded-xl p-4 shadow-sm animate-slide-up">
          <div className="flex items-start gap-3">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="w-5 h-5 text-studio-clay flex-shrink-0 mt-0.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
            <div>
              <p className="text-sm font-semibold text-studio-clay mb-1">
                {conflicts.length} scheduling conflict{conflicts.length > 1 ? "s" : ""} detected
              </p>
              <ul className="space-y-1">
                {conflicts.slice(0, 3).map((c, i) => (
                  <li key={i} className="text-xs text-studio-clay/80">
                    {c.message}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Stat cards */}
      <section>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="This month's income"
            value={formatMoneyCompact(thisMonthIncome)}
            sub={`Net: ${formatMoneyCompact(thisMonthNet)}`}
            subColor={thisMonthNet >= 0 ? "sage" : "clay"}
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
              </svg>
            }
            accent="amber"
          />
          <StatCard
            label="Pending payments"
            value={formatMoneyCompact(pendingPaymentsTotal)}
            sub={`${paymentWatchItems.length} booking${paymentWatchItems.length !== 1 ? "s" : ""}`}
            subColor={paymentWatchItems.length > 0 ? "clay" : "muted"}
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            accent="clay"
          />
          <StatCard
            label="Upcoming shoots"
            value={upcomingThisMonth.toString()}
            sub="This month"
            subColor="muted"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            }
            accent="sage"
          />
          <StatCard
            label="In editing"
            value={inEditingCount.toString()}
            sub={inEditingCount > 0 ? "Jobs pending delivery" : "All caught up"}
            subColor={inEditingCount > 0 ? "amber" : "muted"}
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            }
            accent="amber"
          />
        </div>
      </section>

      {/* Two-column: upcoming bookings + interactive payment watch */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming bookings */}
        <section className="bg-studio-panel border border-studio-border rounded-xl shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-studio-border">
            <h2 className="font-header text-sm font-semibold text-studio-text">
              Upcoming bookings
            </h2>
            <Link href="/bookings" className="text-xs text-studio-amber hover:underline">
              View all
            </Link>
          </div>
          {upcomingBookings.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-studio-text-muted">No upcoming bookings</p>
              <Link href="/bookings/new" className="text-xs text-studio-amber hover:underline mt-1 inline-block">
                Add one →
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-studio-border">
              {upcomingBookings.map((booking) => (
                <li key={booking.id}>
                  <Link
                    href={`/bookings/${booking.id}`}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-studio-panel-hover transition-colors group"
                  >
                    <div className="flex-shrink-0 w-10 text-center">
                      <p className="font-mono text-xs text-studio-text-muted leading-tight">
                        {new Date(booking.eventDate).toLocaleDateString("en-MY", {
                          month: "short",
                          timeZone: "Asia/Manila",
                        })}
                      </p>
                      <p className="font-mono text-lg font-semibold text-studio-amber leading-tight">
                        {new Date(booking.eventDate).toLocaleDateString("en-MY", {
                          day: "numeric",
                          timeZone: "Asia/Manila",
                        })}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-studio-text truncate group-hover:text-studio-amber transition-colors">
                        {booking.client.name}
                      </p>
                      <p className="text-xs text-studio-text-muted truncate">
                        {booking.eventType}
                        {booking.location ? ` · ${booking.location}` : ""}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="font-mono text-sm text-studio-text">
                        {formatMoneyCompact(booking.feeCents)}
                      </p>
                      <DeliveryStatusPill status={booking.deliveryStatus} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Interactive Payment watch */}
        <section className="bg-studio-panel border border-studio-border rounded-xl shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-studio-border">
            <div className="flex items-center gap-2">
              <h2 className="font-header text-sm font-semibold text-studio-text">
                Payment watch
              </h2>
              {paymentWatchItems.length > 0 && (
                <span className="text-2xs font-mono font-semibold px-2 py-0.5 rounded-full bg-studio-clay-subtle text-studio-clay border border-studio-clay/20">
                  {paymentWatchItems.length} action{paymentWatchItems.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
            <Link href="/wages" className="text-xs text-studio-amber hover:underline">
              View wages
            </Link>
          </div>
          <PaymentWatchClient items={paymentWatchItems} />
        </section>
      </div>

      {/* Recent transactions */}
      {recentTransactions.length > 0 && (
        <section className="bg-studio-panel border border-studio-border rounded-xl shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-studio-border">
            <h2 className="font-header text-sm font-semibold text-studio-text">
              Recent transactions
            </h2>
            <Link href="/wages" className="text-xs text-studio-amber hover:underline">
              View all
            </Link>
          </div>
          <ul className="divide-y divide-studio-border">
            {recentTransactions.map((tx) => (
              <li key={tx.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-studio-panel-hover transition-colors">
                <div
                  className={`flex-shrink-0 w-2.5 h-2.5 rounded-full ${
                    tx.type === "INCOME" ? "bg-studio-sage" : "bg-studio-clay"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-studio-text font-medium truncate">{tx.description}</p>
                  <p className="text-xs text-studio-text-muted">
                    {tx.category}
                    {tx.booking ? ` · ${tx.booking.client.name}` : ""}
                    {" · "}{formatDate(new Date(tx.date))}
                  </p>
                </div>
                <span
                  className={`font-mono text-sm font-semibold ${
                    tx.type === "INCOME" ? "text-studio-sage" : "text-studio-clay"
                  }`}
                >
                  {tx.type === "INCOME" ? "+" : "−"}{formatMoneyCompact(tx.amountCents)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────────────

type AccentColor = "amber" | "sage" | "clay";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  subColor?: AccentColor | "muted";
  icon: React.ReactNode;
  accent: AccentColor;
}

function StatCard({ label, value, sub, subColor = "muted", icon, accent }: StatCardProps) {
  const accentMap = {
    amber: "text-studio-amber bg-studio-amber-subtle border-studio-amber/20",
    sage: "text-studio-sage bg-studio-sage-subtle border-studio-sage/20",
    clay: "text-studio-clay bg-studio-clay-subtle border-studio-clay/20",
  };
  const subColorMap = {
    amber: "text-studio-amber",
    sage: "text-studio-sage",
    clay: "text-studio-clay",
    muted: "text-studio-text-muted",
  };

  return (
    <div className="bg-studio-panel border border-studio-border rounded-xl p-4 shadow-sm hover:border-studio-amber/30 hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all">
      <div className={`inline-flex items-center justify-center w-9 h-9 rounded-lg border ${accentMap[accent]} mb-3`}>
        {icon}
      </div>
      <p className="text-2xs font-semibold text-studio-text-muted uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="font-mono text-2xl font-semibold text-studio-text leading-tight">
        {value}
      </p>
      {sub && (
        <p className={`text-xs mt-0.5 font-medium ${subColorMap[subColor]}`}>{sub}</p>
      )}
    </div>
  );
}

import Link from "next/link";
import { db } from "@/lib/db";
import { formatMoneyCompact, formatMoney } from "@/lib/money";
import { formatDate, getCurrentMonthRange, todayManilaAsUtc } from "@/lib/dates";
import { buildPaymentWatchList } from "@/lib/payment-watch";
import { detectConflicts } from "@/lib/conflicts";
import { DeliveryStatusPill } from "@/components/ui/StatusPill";
import QuickActionBar from "@/components/dashboard/QuickActionBar";
import PaymentWatchClient from "@/components/dashboard/PaymentWatchClient";

export default async function DashboardPage() {
  const { start: monthStart, end: monthEnd } = getCurrentMonthRange();
  const today = todayManilaAsUtc();
  const nextMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 31);

  const [
    monthIncomeAgg,
    monthExpenseAgg,
    confirmedBookings,
    inEditingCount,
    upcomingBookings,
    recentTransactions,
  ] = await Promise.all([
    db.transaction.aggregate({
      where: { type: "INCOME", date: { gte: monthStart, lte: monthEnd } },
      _sum: { amountCents: true },
    }),
    db.transaction.aggregate({
      where: { type: "EXPENSE", date: { gte: monthStart, lte: monthEnd } },
      _sum: { amountCents: true },
    }),
    db.booking.findMany({
      where: { status: "CONFIRMED" },
      include: { client: true, transactions: true },
      orderBy: { eventDate: "asc" },
    }),
    db.booking.count({ where: { deliveryStatus: "EDITING" } }),
    db.booking.findMany({
      where: {
        status: "CONFIRMED",
        eventDate: { gte: today, lte: nextMonthEnd },
      },
      include: { client: true },
      orderBy: { eventDate: "asc" },
      take: 8,
    }),
    db.transaction.findMany({
      orderBy: { date: "desc" },
      take: 5,
      include: { booking: { include: { client: true } } },
    }),
  ]);

  const thisMonthIncome = monthIncomeAgg._sum.amountCents ?? 0;
  const thisMonthExpenses = monthExpenseAgg._sum.amountCents ?? 0;
  const thisMonthNet = thisMonthIncome - thisMonthExpenses;

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

  const upcomingThisMonth = confirmedBookings.filter(
    (b) => new Date(b.eventDate) >= today && new Date(b.eventDate) <= monthEnd
  ).length;

  const conflicts = detectConflicts(confirmedBookings);

  return (
    <div className="space-y-6 max-w-7xl animate-fade-in pb-10">
      <QuickActionBar />

      {conflicts.length > 0 && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 shadow-md animate-slide-up">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-300 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-rose-300 mb-1">
                {conflicts.length} Schedule Conflict{conflicts.length > 1 ? "s" : ""} Detected
              </p>
              <ul className="space-y-0.5">
                {conflicts.slice(0, 3).map((c, i) => (
                  <li key={i} className="text-xs text-rose-200 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-rose-400" />
                    <span>{c.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <section>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Month Revenue"
            value={formatMoneyCompact(thisMonthIncome)}
            sub={`Net: ${formatMoneyCompact(thisMonthNet)}`}
            subColor={thisMonthNet >= 0 ? "emerald" : "rose"}
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-4 h-4 text-emerald-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
              </svg>
            }
            iconBg="bg-emerald-500/10 border-emerald-500/20"
          />
          <StatCard
            label="Pending Invoices"
            value={formatMoneyCompact(pendingPaymentsTotal)}
            sub={`${paymentWatchItems.length} booking${paymentWatchItems.length !== 1 ? "s" : ""}`}
            subColor={paymentWatchItems.length > 0 ? "rose" : "slate"}
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-4 h-4 text-rose-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            iconBg="bg-rose-500/10 border-rose-500/20"
          />
          <StatCard
            label="Shoots This Month"
            value={upcomingThisMonth.toString()}
            sub="Confirmed schedule"
            subColor="slate"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-4 h-4 text-sky-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            }
            iconBg="bg-sky-500/10 border-sky-500/20"
          />
          <StatCard
            label="In Post-Production"
            value={inEditingCount.toString()}
            sub={inEditingCount > 0 ? "Editing queue active" : "All deliverables clear"}
            subColor={inEditingCount > 0 ? "amber" : "slate"}
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-4 h-4 text-amber-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            }
            iconBg="bg-amber-500/10 border-amber-500/20"
          />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-[#131C2E] rounded-xl border border-slate-800 shadow-md overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#0F172A]/75">
            <div className="flex items-center gap-2">
              <h2 className="font-header text-sm font-semibold text-white">
                Upcoming Shoots
              </h2>
              <span className="text-2xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                {upcomingBookings.length}
              </span>
            </div>
            <Link
              href="/bookings"
              className="text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors"
            >
              View all →
            </Link>
          </div>

          {upcomingBookings.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-sm font-medium text-slate-400">No upcoming bookings scheduled</p>
              <Link href="/bookings/new" className="text-xs text-amber-400 font-semibold underline mt-1.5 inline-block">
                + Schedule a shoot
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-slate-800">
              {upcomingBookings.map((booking) => (
                <li key={booking.id}>
                  <Link
                    href={`/bookings/${booking.id}`}
                    className="flex items-center gap-4 px-5 py-3 hover:bg-[#182338] transition-colors group"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-slate-800/80 border border-slate-700 flex flex-col items-center justify-center group-hover:border-slate-600 transition-colors">
                      <p className="font-mono text-[9px] uppercase text-slate-300 leading-none">
                        {new Date(booking.eventDate).toLocaleDateString("en-MY", {
                          month: "short",
                          timeZone: "Asia/Manila",
                        })}
                      </p>
                      <p className="font-mono text-sm font-bold text-white leading-tight mt-0.5">
                        {new Date(booking.eventDate).toLocaleDateString("en-MY", {
                          day: "numeric",
                          timeZone: "Asia/Manila",
                        })}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate group-hover:text-amber-400 transition-colors">
                        {booking.client.name}
                      </p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {booking.eventType}
                        {booking.location ? ` · ${booking.location}` : ""}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right space-y-1">
                      <p className="font-mono text-xs font-bold text-white">
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

        <section className="bg-[#131C2E] rounded-xl border border-slate-800 shadow-md overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#0F172A]/75">
            <div className="flex items-center gap-2">
              <h2 className="font-header text-sm font-semibold text-white">
                Payment Watch
              </h2>
              {paymentWatchItems.length > 0 && (
                <span className="text-2xs font-mono font-semibold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
                  {paymentWatchItems.length} action{paymentWatchItems.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
            <Link
              href="/wages"
              className="text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors"
            >
              View ledger →
            </Link>
          </div>
          <PaymentWatchClient items={paymentWatchItems} />
        </section>
      </div>

      {recentTransactions.length > 0 && (
        <section className="bg-[#131C2E] rounded-xl border border-slate-800 shadow-md overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#0F172A]/75">
            <h2 className="font-header text-sm font-semibold text-white">
              Recent Ledger Activity
            </h2>
            <Link href="/wages" className="text-xs text-amber-400 hover:text-amber-300 font-medium">
              Full Ledger →
            </Link>
          </div>
          <ul className="divide-y divide-slate-800">
            {recentTransactions.map((tx) => (
              <li key={tx.id} className="flex items-center gap-4 px-5 py-3 hover:bg-[#182338] transition-colors">
                <div
                  className={`flex-shrink-0 w-2 h-2 rounded-full ${
                    tx.type === "INCOME" ? "bg-emerald-400" : "bg-rose-400"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{tx.description}</p>
                  <p className="text-2xs text-slate-400 mt-0.5">
                    {tx.category}
                    {tx.booking ? ` · ${tx.booking.client.name}` : ""}
                    {" · "}{formatDate(new Date(tx.date))}
                  </p>
                </div>
                <span
                  className={`font-mono text-xs font-bold ${
                    tx.type === "INCOME" ? "text-emerald-400" : "text-rose-400"
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

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  subColor?: "emerald" | "rose" | "amber" | "slate";
  icon: React.ReactNode;
  iconBg: string;
}

function StatCard({ label, value, sub, subColor = "slate", icon, iconBg }: StatCardProps) {
  const subColorMap = {
    emerald: "text-emerald-400",
    rose: "text-rose-400",
    amber: "text-amber-400",
    slate: "text-slate-400",
  };

  return (
    <div className="bg-[#131C2E] rounded-xl p-4 border border-slate-800 shadow-md hover:border-slate-700 transition-colors">
      <div className="flex items-center justify-between mb-2.5">
        <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
      </div>
      <p className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
        {label}
      </p>
      <p className="font-mono text-xl font-bold text-white leading-tight">
        {value}
      </p>
      {sub && (
        <p className={`text-2xs mt-1 font-semibold ${subColorMap[subColor]}`}>{sub}</p>
      )}
    </div>
  );
}
export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/lib/db";
import { formatMoneyCompact, formatMoney } from "@/lib/money";
import { formatDate, getCurrentMonthRange, todayManilaAsUtc } from "@/lib/dates";
import { BookingStatusPill, DeliveryStatusPill } from "@/components/ui/StatusPill";
import MiniCalendar from "@/components/dashboard/MiniCalendar";

export default async function DashboardPage() {
  const { start: monthStart, end: monthEnd } = getCurrentMonthRange();
  const today = todayManilaAsUtc();

  const [
    activeBookings,
    upcomingBookings,
    monthIncome,
    monthExpenses,
    calendarBookings,
  ] = await Promise.all([
    db.booking.count({
      where: { status: { in: ["INQUIRY", "CONFIRMED"] } },
    }),
    db.booking.findMany({
      where: {
        eventDate: { gte: today },
        status: { in: ["INQUIRY", "CONFIRMED"] },
      },
      include: {
        client: true,
        transactions: { where: { type: "INCOME" } },
      },
      orderBy: { eventDate: "asc" },
      take: 8,
    }),
    db.transaction.aggregate({
      _sum: { amountCents: true },
      where: { type: "INCOME", date: { gte: monthStart, lte: monthEnd } },
    }),
    db.transaction.aggregate({
      _sum: { amountCents: true },
      where: { type: "EXPENSE", date: { gte: monthStart, lte: monthEnd } },
    }),
    // Mini-calendar data: all bookings this month
    db.booking.findMany({
      where: { eventDate: { gte: monthStart, lte: monthEnd } },
      select: { eventDate: true, status: true },
    }),
  ]);

  const incomeCents = monthIncome._sum.amountCents ?? 0;
  const expenseCents = monthExpenses._sum.amountCents ?? 0;
  const netCents = incomeCents - expenseCents;

  // Calendar chips: which days have bookings
  const bookedDays = calendarBookings.map((b) => ({
    date: b.eventDate.toISOString(),
    status: b.status,
  }));

  return (
    <div className="max-w-5xl space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-header text-xl font-bold text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Studio overview</p>
        </div>
        <Link
          href="/bookings/new"
          className="btn-primary flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg shadow-sm"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New booking
        </Link>
      </div>

      {/* Stat Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Active Shoots"
          value={String(activeBookings)}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-4 h-4 text-amber-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
            </svg>
          }
          iconBg="bg-amber-500/10 border-amber-500/20"
        />
        <StatCard
          label="This Month"
          value={formatMoneyCompact(incomeCents)}
          sub="income"
          subColor="emerald"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-4 h-4 text-emerald-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
            </svg>
          }
          iconBg="bg-emerald-500/10 border-emerald-500/20"
        />
        <StatCard
          label="Expenses"
          value={formatMoneyCompact(expenseCents)}
          sub="this month"
          subColor="rose"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-4 h-4 text-rose-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181" />
            </svg>
          }
          iconBg="bg-rose-500/10 border-rose-500/20"
        />
        <StatCard
          label="Net Profit"
          value={formatMoneyCompact(netCents)}
          sub={incomeCents > 0 ? `${Math.round((netCents / incomeCents) * 100)}% margin` : undefined}
          subColor={netCents >= 0 ? "emerald" : "rose"}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-4 h-4 text-amber-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.070.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          iconBg="bg-amber-500/10 border-amber-500/20"
        />
      </section>

      {/* Upcoming Shoots + Mini Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Shoots — takes 2/3 width */}
        <section className="lg:col-span-2 bg-[#131C2E] rounded-xl border border-slate-800 shadow-md overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#0F172A]/75">
            <div className="flex items-center gap-2">
              <h2 className="font-header text-sm font-semibold text-white">
                Upcoming Shoots
              </h2>
              {upcomingBookings.length > 0 && (
                <span className="text-2xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                  {upcomingBookings.length}
                </span>
              )}
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
              {upcomingBookings.map((booking) => {
                const paidCents = booking.transactions.reduce((sum, t) => sum + t.amountCents, 0);
                const unpaidCents = booking.feeCents - paidCents;
                return (
                  <li key={booking.id}>
                    <Link
                      href={`/bookings/${booking.id}`}
                      className="flex items-center gap-4 px-5 py-3 hover:bg-[#182338] transition-colors group"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-slate-800/80 border border-slate-700 flex flex-col items-center justify-center group-hover:border-slate-600 transition-colors">
                        <p className="font-mono text-[9px] uppercase text-slate-300 leading-none">
                          {new Date(booking.eventDate).toLocaleDateString("en-MY", { month: "short", timeZone: "Asia/Manila" })}
                        </p>
                        <p className="font-mono text-sm font-bold text-white leading-tight mt-0.5">
                          {new Date(booking.eventDate).toLocaleDateString("en-MY", { day: "numeric", timeZone: "Asia/Manila" })}
                        </p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-white truncate group-hover:text-amber-400 transition-colors">
                            {booking.client.name}
                          </p>
                          <BookingStatusPill status={booking.status} />
                        </div>
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {booking.eventType}
                          {booking.location ? ` · ${booking.location}` : ""}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-right space-y-1">
                        <p className="font-mono text-xs font-bold text-white">
                          {formatMoneyCompact(booking.feeCents)}
                        </p>
                        {unpaidCents > 0 ? (
                          <span className="text-2xs font-mono font-semibold px-1.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
                            {formatMoneyCompact(unpaidCents)} due
                          </span>
                        ) : (
                          <DeliveryStatusPill status={booking.deliveryStatus} />
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Mini Calendar — takes 1/3 width */}
        <section className="bg-[#131C2E] rounded-xl border border-slate-800 shadow-md overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800 bg-[#0F172A]/75">
            <h2 className="font-header text-sm font-semibold text-white">This Month</h2>
          </div>
          <div className="p-4">
            <MiniCalendar bookedDays={bookedDays} />
          </div>
        </section>
      </div>
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
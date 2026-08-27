export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/lib/db";
import { formatMoney, formatMoneyCompact } from "@/lib/money";
import { formatDate } from "@/lib/dates";
import { BookingStatusPill, DeliveryStatusPill } from "@/components/ui/StatusPill";
import ReportActions from "./ReportActions";

interface ReportsPageProps {
  searchParams: Promise<{ period?: string }>;
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const { period = "this_year" } = await searchParams;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed

  let startDate: Date | undefined;
  let endDate: Date | undefined;
  let periodLabel = "All Time";

  if (period === "this_month") {
    startDate = new Date(Date.UTC(currentYear, currentMonth, 1, -8, 0, 0));
    endDate = new Date(Date.UTC(currentYear, currentMonth + 1, 0, 15, 59, 59));
    periodLabel = now.toLocaleDateString("en-MY", { month: "long", year: "numeric", timeZone: "Asia/Manila" });
  } else if (period === "last_month") {
    startDate = new Date(Date.UTC(currentYear, currentMonth - 1, 1, -8, 0, 0));
    endDate = new Date(Date.UTC(currentYear, currentMonth, 0, 15, 59, 59));
    const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
    periodLabel = lastMonthDate.toLocaleDateString("en-MY", { month: "long", year: "numeric", timeZone: "Asia/Manila" });
  } else if (period === "this_quarter") {
    const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
    startDate = new Date(Date.UTC(currentYear, quarterStartMonth, 1, -8, 0, 0));
    endDate = new Date(Date.UTC(currentYear, quarterStartMonth + 3, 0, 15, 59, 59));
    const qNum = Math.floor(currentMonth / 3) + 1;
    periodLabel = `Q${qNum} ${currentYear}`;
  } else if (period === "this_year") {
    startDate = new Date(Date.UTC(currentYear, 0, 1, -8, 0, 0));
    endDate = new Date(Date.UTC(currentYear, 12, 0, 15, 59, 59));
    periodLabel = `Full Year ${currentYear}`;
  }

  const dateFilter = startDate && endDate ? { gte: startDate, lte: endDate } : undefined;

  // Fetch transactions and bookings for the specified period
  const [transactions, bookings] = await Promise.all([
    db.transaction.findMany({
      where: dateFilter ? { date: dateFilter } : {},
      orderBy: { date: "desc" },
      include: { booking: { include: { client: true } } },
    }),
    db.booking.findMany({
      where: dateFilter ? { eventDate: dateFilter } : {},
      orderBy: { eventDate: "desc" },
      include: {
        client: true,
        transactions: { where: { type: "INCOME" } },
      },
    }),
  ]);

  // Financial aggregates
  const incomeCents = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amountCents, 0);

  const expenseCents = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amountCents, 0);

  const netProfitCents = incomeCents - expenseCents;
  const profitMargin = incomeCents > 0 ? Math.round((netProfitCents / incomeCents) * 100) : 0;

  // Booking KPIs
  const totalBookingsCount = bookings.length;
  const completedBookingsCount = bookings.filter((b) => b.status === "COMPLETED").length;
  const confirmedBookingsCount = bookings.filter((b) => b.status === "CONFIRMED").length;

  const totalContractedFeeCents = bookings
    .filter((b) => b.status !== "CANCELLED")
    .reduce((sum, b) => sum + b.feeCents, 0);

  const totalCollectedCents = bookings
    .filter((b) => b.status !== "CANCELLED")
    .flatMap((b) => b.transactions)
    .reduce((sum, t) => sum + t.amountCents, 0);

  const totalOutstandingCents = Math.max(0, totalContractedFeeCents - totalCollectedCents);
  const averageBookingValueCents =
    totalBookingsCount > 0 ? Math.round(totalContractedFeeCents / totalBookingsCount) : 0;

  // Breakdown by Event Type
  const revenueByEventType = new Map<string, { count: number; feeCents: number }>();
  bookings.forEach((b) => {
    if (b.status !== "CANCELLED") {
      const cur = revenueByEventType.get(b.eventType) || { count: 0, feeCents: 0 };
      cur.count += 1;
      cur.feeCents += b.feeCents;
      revenueByEventType.set(b.eventType, cur);
    }
  });

  const eventTypeBreakdown = Array.from(revenueByEventType.entries())
    .map(([type, data]) => ({
      type,
      count: data.count,
      feeCents: data.feeCents,
      percent: totalContractedFeeCents > 0 ? Math.round((data.feeCents / totalContractedFeeCents) * 100) : 0,
    }))
    .sort((a, b) => b.feeCents - a.feeCents);

  // Breakdown by Client Acquisition Source
  const clientSourceBreakdown = new Map<string, { count: number; totalFee: number }>();
  bookings.forEach((b) => {
    const src = b.client.source || "Direct / Unspecified";
    const cur = clientSourceBreakdown.get(src) || { count: 0, totalFee: 0 };
    cur.count += 1;
    cur.totalFee += b.feeCents;
    clientSourceBreakdown.set(src, cur);
  });

  const sourceList = Array.from(clientSourceBreakdown.entries())
    .map(([source, data]) => ({ source, ...data }))
    .sort((a, b) => b.totalFee - a.totalFee);

  // Delivery status breakdown
  const deliveryCounts = {
    DELIVERED: bookings.filter((b) => b.deliveryStatus === "DELIVERED").length,
    READY: bookings.filter((b) => b.deliveryStatus === "READY").length,
    EDITING: bookings.filter((b) => b.deliveryStatus === "EDITING").length,
    NOT_STARTED: bookings.filter((b) => b.deliveryStatus === "NOT_STARTED").length,
  };

  const periodOptions = [
    { key: "this_month", label: "This Month" },
    { key: "last_month", label: "Last Month" },
    { key: "this_quarter", label: "This Quarter" },
    { key: "this_year", label: "Year to Date (2026)" },
    { key: "all_time", label: "All Time" },
  ];

  return (
    <div className="max-w-6xl space-y-6 animate-fade-in pb-12 print:space-y-4 print:pb-0">
      {/* Header & Export Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-header text-xl sm:text-2xl font-bold text-white tracking-tight">
              Studio Reports & Analytics
            </h1>
            <span className="hidden print:inline text-xs font-mono text-slate-400">
              Generated: {new Date().toLocaleDateString("en-MY", { timeZone: "Asia/Manila" })}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Executive performance metrics, financial breakdowns, and data exports ·{" "}
            <span className="text-amber-400 font-semibold">{periodLabel}</span>
          </p>
        </div>
        <ReportActions />
      </div>

      {/* Period Filter Tabs */}
      <div className="flex gap-1.5 bg-[#0F172A] border border-slate-800 p-1.5 rounded-xl w-fit flex-wrap print:hidden">
        {periodOptions.map((opt) => {
          const isActive = period === opt.key;
          return (
            <Link
              key={opt.key}
              href={`/reports?period=${opt.key}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? "bg-amber-500 text-slate-950 shadow-sm font-bold"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {opt.label}
            </Link>
          );
        })}
      </div>

      {/* 6 Executive KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {/* Gross Income */}
        <div className="bg-[#131C2E] border border-slate-800 rounded-xl p-4 sm:p-5 shadow-md">
          <p className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Gross Income (Collected)
          </p>
          <p className="font-mono text-xl sm:text-2xl font-bold text-emerald-400">
            {formatMoneyCompact(incomeCents)}
          </p>
          <p className="text-2xs text-slate-400 mt-1 font-medium">{periodLabel}</p>
        </div>

        {/* Operating Expenses */}
        <div className="bg-[#131C2E] border border-slate-800 rounded-xl p-4 sm:p-5 shadow-md">
          <p className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Total Expenses
          </p>
          <p className="font-mono text-xl sm:text-2xl font-bold text-rose-400">
            {formatMoneyCompact(expenseCents)}
          </p>
          <p className="text-2xs text-slate-400 mt-1 font-medium">{transactions.filter(t => t.type === "EXPENSE").length} expense logs</p>
        </div>

        {/* Net Profit & Margin */}
        <div className="bg-[#131C2E] border border-slate-800 rounded-xl p-4 sm:p-5 shadow-md">
          <p className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Net Profit (Margin)
          </p>
          <p className={`font-mono text-xl sm:text-2xl font-bold ${netProfitCents >= 0 ? "text-white" : "text-rose-400"}`}>
            {formatMoneyCompact(netProfitCents)}
          </p>
          <p className={`text-2xs mt-1 font-semibold ${profitMargin >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {profitMargin}% net profit margin
          </p>
        </div>

        {/* Booking Volume */}
        <div className="bg-[#131C2E] border border-slate-800 rounded-xl p-4 sm:p-5 shadow-md">
          <p className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Shoots Volume
          </p>
          <p className="font-mono text-xl sm:text-2xl font-bold text-white">
            {totalBookingsCount}
          </p>
          <p className="text-2xs text-slate-400 mt-1 font-medium">
            {completedBookingsCount} completed · {confirmedBookingsCount} confirmed
          </p>
        </div>

        {/* Average Order Value */}
        <div className="bg-[#131C2E] border border-slate-800 rounded-xl p-4 sm:p-5 shadow-md">
          <p className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Avg. Fee Per Shoot
          </p>
          <p className="font-mono text-xl sm:text-2xl font-bold text-amber-400">
            {formatMoneyCompact(averageBookingValueCents)}
          </p>
          <p className="text-2xs text-slate-400 mt-1 font-medium">Across all booked shoots</p>
        </div>

        {/* Outstanding Receivables */}
        <div className="bg-[#131C2E] border border-slate-800 rounded-xl p-4 sm:p-5 shadow-md">
          <p className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Unpaid Receivables
          </p>
          <p className={`font-mono text-xl sm:text-2xl font-bold ${totalOutstandingCents > 0 ? "text-rose-300" : "text-emerald-400"}`}>
            {formatMoneyCompact(totalOutstandingCents)}
          </p>
          <p className="text-2xs text-slate-400 mt-1 font-medium">
            {totalOutstandingCents > 0 ? "Pending client collection" : "All shoots paid in full ✓"}
          </p>
        </div>
      </div>

      {/* Visual Analytics & Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Revenue by Event Type */}
        <div className="bg-[#131C2E] border border-slate-800 rounded-xl p-5 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-header text-sm font-bold text-white">
              Revenue by Event Type
            </h2>
            <span className="text-2xs font-mono text-slate-400 font-semibold">
              Total: {formatMoneyCompact(totalContractedFeeCents)}
            </span>
          </div>

          {eventTypeBreakdown.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No shoot bookings in this period.</p>
          ) : (
            <div className="space-y-3">
              {eventTypeBreakdown.map((item) => (
                <div key={item.type} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">
                      {item.type}{" "}
                      <span className="text-2xs font-mono text-slate-500 font-normal">
                        ({item.count} shoot{item.count !== 1 ? "s" : ""})
                      </span>
                    </span>
                    <span className="font-mono font-bold text-white">
                      {formatMoneyCompact(item.feeCents)}{" "}
                      <span className="text-2xs font-normal text-slate-400">({item.percent}%)</span>
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-[#0F172A] rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-300"
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Client Sources & Delivery Health */}
        <div className="space-y-5">
          {/* Client Acquisition Sources */}
          <div className="bg-[#131C2E] border border-slate-800 rounded-xl p-5 shadow-md space-y-3">
            <h2 className="font-header text-sm font-bold text-white">
              Client Acquisition Channels
            </h2>
            {sourceList.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">No data for this period.</p>
            ) : (
              <div className="space-y-2">
                {sourceList.map((src) => (
                  <div key={src.source} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60 last:border-0">
                    <span className="text-slate-300 font-medium">{src.source}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-2xs font-mono text-slate-400">{src.count} client{src.count !== 1 ? "s" : ""}</span>
                      <span className="font-mono font-bold text-white">{formatMoneyCompact(src.totalFee)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Deliverables Pipeline Health */}
          <div className="bg-[#131C2E] border border-slate-800 rounded-xl p-5 shadow-md">
            <h2 className="font-header text-sm font-bold text-white mb-3">
              Deliverables Pipeline Status
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="bg-[#0F172A] border border-slate-800 p-2.5 rounded-lg">
                <p className="text-2xs font-semibold text-slate-400 uppercase">Delivered</p>
                <p className="font-mono text-base font-bold text-emerald-400 mt-0.5">{deliveryCounts.DELIVERED}</p>
              </div>
              <div className="bg-[#0F172A] border border-slate-800 p-2.5 rounded-lg">
                <p className="text-2xs font-semibold text-slate-400 uppercase">Ready</p>
                <p className="font-mono text-base font-bold text-blue-400 mt-0.5">{deliveryCounts.READY}</p>
              </div>
              <div className="bg-[#0F172A] border border-slate-800 p-2.5 rounded-lg">
                <p className="text-2xs font-semibold text-slate-400 uppercase">Editing</p>
                <p className="font-mono text-base font-bold text-amber-400 mt-0.5">{deliveryCounts.EDITING}</p>
              </div>
              <div className="bg-[#0F172A] border border-slate-800 p-2.5 rounded-lg">
                <p className="text-2xs font-semibold text-slate-400 uppercase">Not Started</p>
                <p className="font-mono text-base font-bold text-slate-400 mt-0.5">{deliveryCounts.NOT_STARTED}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bookings Master Ledger Table */}
      <div className="bg-[#131C2E] border border-slate-800 rounded-xl overflow-hidden shadow-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#0F172A]/75">
          <div className="flex items-center gap-2">
            <h2 className="font-header text-sm font-bold text-white">
              Shoots & Bookings in Period
            </h2>
            <span className="text-2xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">
              {bookings.length}
            </span>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No bookings recorded for {periodLabel}.
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full min-w-[650px] text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-[#0F172A]/50 text-slate-300">
                  <th className="px-5 py-3 text-left font-semibold uppercase tracking-wider text-2xs">Client & Event</th>
                  <th className="px-5 py-3 text-left font-semibold uppercase tracking-wider text-2xs">Date</th>
                  <th className="px-5 py-3 text-left font-semibold uppercase tracking-wider text-2xs">Status</th>
                  <th className="px-5 py-3 text-right font-semibold uppercase tracking-wider text-2xs">Fee</th>
                  <th className="px-5 py-3 text-right font-semibold uppercase tracking-wider text-2xs">Paid</th>
                  <th className="px-5 py-3 text-right font-semibold uppercase tracking-wider text-2xs">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {bookings.map((b) => {
                  const paid = b.transactions.reduce((sum, t) => sum + t.amountCents, 0);
                  const balance = b.feeCents - paid;
                  return (
                    <tr key={b.id} className="hover:bg-[#182338] transition-colors">
                      <td className="px-5 py-3.5">
                        <Link href={`/bookings/${b.id}`} className="font-semibold text-white hover:text-amber-400 transition-colors">
                          {b.client.name}
                        </Link>
                        <p className="text-2xs text-slate-400 mt-0.5">{b.eventType}{b.location ? ` · ${b.location}` : ""}</p>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap font-mono text-slate-300">
                        {formatDate(new Date(b.eventDate))}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <BookingStatusPill status={b.status} />
                          <DeliveryStatusPill status={b.deliveryStatus} />
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono font-bold text-white whitespace-nowrap">
                        {formatMoney(b.feeCents)}
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono text-emerald-400 whitespace-nowrap">
                        {formatMoney(paid)}
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono whitespace-nowrap">
                        {balance > 0 ? (
                          <span className="text-rose-400 font-bold">{formatMoney(balance)} due</span>
                        ) : (
                          <span className="text-emerald-400">Paid ✓</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
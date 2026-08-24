import { db } from "@/lib/db";
import { formatMoney, formatMoneyCompact } from "@/lib/money";
import { formatDate, getMonthRange } from "@/lib/dates";
import EmptyState from "@/components/ui/EmptyState";
import AddTransactionButton from "./AddTransactionButton";
import MonthSelect from "./MonthSelect";
import MonthlyWagesChart, { type MonthDataPoint } from "@/components/charts/MonthlyWagesChart";
import Link from "next/link";

interface WagesPageProps {
  searchParams: Promise<{ month?: string; type?: string }>;
}

export default async function WagesPage({ searchParams }: WagesPageProps) {
  const { month: monthParam, type: typeParam } = await searchParams;

  // Default to current month
  const now = new Date();
  const currentMonthStr =
    monthParam ??
    `${now.toLocaleDateString("en-CA", { timeZone: "Asia/Manila" }).slice(0, 7)}`;

  const [year, monthNum] = currentMonthStr.split("-").map(Number);
  const { start, end } = getMonthRange(year, monthNum);

  const validTypes = ["INCOME", "EXPENSE"] as const;
  type ValidType = (typeof validTypes)[number];
  const typeFilter = validTypes.includes(typeParam as ValidType)
    ? (typeParam as ValidType)
    : undefined;

  // Current month transactions
  const transactions = await db.transaction.findMany({
    where: {
      date: { gte: start, lte: end },
      ...(typeFilter ? { type: typeFilter } : {}),
    },
    include: { booking: { include: { client: true } } },
    orderBy: { date: "desc" },
  });

  // Monthly rollup
  const [incomeAgg, expenseAgg] = await Promise.all([
    db.transaction.aggregate({
      where: { type: "INCOME", date: { gte: start, lte: end } },
      _sum: { amountCents: true },
    }),
    db.transaction.aggregate({
      where: { type: "EXPENSE", date: { gte: start, lte: end } },
      _sum: { amountCents: true },
    }),
  ]);

  const incomeCents = incomeAgg._sum.amountCents ?? 0;
  const expensesCents = expenseAgg._sum.amountCents ?? 0;
  const netCents = incomeCents - expensesCents;

  // Build month navigation (last 12 months)
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return {
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleDateString("en-MY", { month: "long", year: "numeric" }),
    };
  });

  const monthLabel =
    months.find((m) => m.value === currentMonthStr)?.label ?? `${currentMonthStr}`;

  // Fetch past 6 months data for the interactive chart
  const past6MonthsKeys = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return {
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleDateString("en-MY", { month: "short" }),
      fullLabel: d.toLocaleDateString("en-MY", { month: "long", year: "numeric" }),
      year: d.getFullYear(),
      month: d.getMonth() + 1,
    };
  });

  const chartData: MonthDataPoint[] = await Promise.all(
    past6MonthsKeys.map(async (m) => {
      const { start: mStart, end: mEnd } = getMonthRange(m.year, m.month);
      const [inc, exp] = await Promise.all([
        db.transaction.aggregate({
          where: { type: "INCOME", date: { gte: mStart, lte: mEnd } },
          _sum: { amountCents: true },
        }),
        db.transaction.aggregate({
          where: { type: "EXPENSE", date: { gte: mStart, lte: mEnd } },
          _sum: { amountCents: true },
        }),
      ]);
      const incCents = inc._sum.amountCents ?? 0;
      const expCents = exp._sum.amountCents ?? 0;
      return {
        monthKey: m.key,
        label: m.label,
        fullLabel: m.fullLabel,
        incomeCents: incCents,
        expensesCents: expCents,
        netCents: incCents - expCents,
      };
    })
  );

  return (
    <div className="max-w-5xl space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-header text-xl font-semibold text-studio-text">Wages & Income</h1>
          <p className="text-sm text-studio-text-muted mt-0.5">{monthLabel}</p>
        </div>
        <div className="flex items-center gap-3">
          <MonthSelect currentMonth={currentMonthStr} months={months} />
          <AddTransactionButton />
        </div>
      </div>

      {/* Interactive Chart */}
      <MonthlyWagesChart
        data={chartData}
        currentMonthKey={currentMonthStr}
      />

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-studio-panel border border-studio-border rounded-xl p-4 shadow-sm hover:border-studio-sage/40 transition-all">
          <p className="text-2xs text-studio-text-muted uppercase tracking-wider mb-1">Gross income</p>
          <p className="font-mono text-2xl font-semibold text-studio-sage">{formatMoneyCompact(incomeCents)}</p>
          <p className="text-2xs text-studio-text-faint mt-1">{monthLabel}</p>
        </div>
        <div className="bg-studio-panel border border-studio-border rounded-xl p-4 shadow-sm hover:border-studio-clay/40 transition-all">
          <p className="text-2xs text-studio-text-muted uppercase tracking-wider mb-1">Expenses</p>
          <p className="font-mono text-2xl font-semibold text-studio-clay">{formatMoneyCompact(expensesCents)}</p>
          <p className="text-2xs text-studio-text-faint mt-1">{monthLabel}</p>
        </div>
        <div className="bg-studio-panel border border-studio-border rounded-xl p-4 shadow-sm hover:border-studio-amber/40 transition-all">
          <p className="text-2xs text-studio-text-muted uppercase tracking-wider mb-1">Net profit</p>
          <p className={`font-mono text-2xl font-semibold ${netCents >= 0 ? "text-studio-amber" : "text-studio-clay"}`}>
            {formatMoneyCompact(netCents)}
          </p>
          <p className="text-2xs text-studio-text-faint mt-1">
            Margin: {incomeCents > 0 ? `${Math.round((netCents / incomeCents) * 100)}%` : "0%"}
          </p>
        </div>
      </div>

      {/* Type filter */}
      <div className="flex gap-1.5 bg-studio-panel border border-studio-border rounded-lg p-1 w-fit">
        {[
          { label: "All", value: undefined },
          { label: "Income", value: "INCOME" },
          { label: "Expenses", value: "EXPENSE" },
        ].map((tab) => {
          const isActive = tab.value === typeFilter;
          const href = tab.value
            ? `/wages?month=${currentMonthStr}&type=${tab.value}`
            : `/wages?month=${currentMonthStr}`;
          return (
            <Link
              key={tab.label}
              href={href}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                isActive
                  ? "bg-studio-amber text-studio-bg shadow-sm"
                  : "text-studio-text-muted hover:text-studio-text hover:bg-studio-panel-hover"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Transaction list */}
      {transactions.length === 0 ? (
        <EmptyState
          title="No transactions recorded for this period"
          description="Log booking payments or studio expenses to keep your ledger accurate."
          action={{ label: "Add transaction", href: "#" }}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
          }
        />
      ) : (
        <div className="bg-studio-panel border border-studio-border rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-studio-border bg-studio-bg/30">
                  <th className="px-5 py-3 text-left text-2xs font-semibold text-studio-text-muted uppercase tracking-wider">Date</th>
                  <th className="px-5 py-3 text-left text-2xs font-semibold text-studio-text-muted uppercase tracking-wider">Description</th>
                  <th className="px-5 py-3 text-left text-2xs font-semibold text-studio-text-muted uppercase tracking-wider hidden sm:table-cell">Category</th>
                  <th className="px-5 py-3 text-left text-2xs font-semibold text-studio-text-muted uppercase tracking-wider hidden md:table-cell">Booking Link</th>
                  <th className="px-5 py-3 text-right text-2xs font-semibold text-studio-text-muted uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-studio-border">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-studio-panel-hover transition-colors group">
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs text-studio-text-muted">{formatDate(new Date(tx.date))}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${tx.type === "INCOME" ? "bg-studio-sage" : "bg-studio-clay"}`} />
                        <span className="text-sm text-studio-text font-medium">{tx.description}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      {tx.category ? (
                        <span className="px-2 py-0.5 rounded bg-studio-bg border border-studio-border text-2xs text-studio-text-muted">
                          {tx.category}
                        </span>
                      ) : (
                        <span className="text-2xs text-studio-text-faint">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      {tx.booking ? (
                        <Link
                          href={`/bookings/${tx.booking.id}`}
                          className="text-xs text-studio-amber hover:underline inline-flex items-center gap-1"
                        >
                          <span>{tx.booking.client.name}</span>
                          <span className="text-studio-text-faint">({tx.booking.eventType})</span>
                        </Link>
                      ) : (
                        <span className="text-xs text-studio-text-faint">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className={`font-mono text-sm font-semibold ${tx.type === "INCOME" ? "text-studio-sage" : "text-studio-clay"}`}>
                        {tx.type === "INCOME" ? "+" : "−"}{formatMoney(tx.amountCents)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

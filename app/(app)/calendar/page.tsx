import { db } from "@/lib/db";
import { getMonthRange } from "@/lib/dates";
import CalendarView from "./CalendarView";

interface CalendarPageProps {
  searchParams: Promise<{ year?: string; month?: string }>;
}

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const { year: yearParam, month: monthParam } = await searchParams;

  const now = new Date();
  const year = yearParam ? parseInt(yearParam, 10) : now.getFullYear();
  const month = monthParam ? parseInt(monthParam, 10) : now.getMonth() + 1;

  const { start, end } = getMonthRange(year, month);

  const bookings = await db.booking.findMany({
    where: {
      eventDate: {
        gte: start,
        lte: end,
      },
    },
    include: { client: true },
    orderBy: { eventDate: "asc" },
  });

  const chips = bookings.map((b) => ({
    id: b.id,
    clientName: b.client.name,
    eventType: b.eventType,
    eventDate: b.eventDate.toISOString(),
    status: b.status,
    location: b.location,
    feeCents: b.feeCents,
  }));

  return (
    <div className="max-w-5xl space-y-5 animate-fade-in pb-10">
      <div>
        <h1 className="font-header text-xl font-bold text-white">Calendar</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Photoshoot dates, day schedules, and availability
        </p>
      </div>

      <CalendarView bookings={chips} year={year} month={month} />
    </div>
  );
}
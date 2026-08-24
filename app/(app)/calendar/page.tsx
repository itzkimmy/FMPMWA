import { db } from "@/lib/db";
import CalendarView from "./CalendarView";

interface CalendarPageProps {
  searchParams: Promise<{ year?: string; month?: string }>;
}

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const params = await searchParams;
  const now = new Date();
  const year = params.year ? parseInt(params.year) : now.getFullYear();
  const month = params.month ? parseInt(params.month) : now.getMonth() + 1;

  // Fetch bookings for this month and adjacent months (for context)
  const start = new Date(Date.UTC(year, month - 2, 1));
  const end = new Date(Date.UTC(year, month + 1, 0));

  const bookings = await db.booking.findMany({
    where: {
      eventDate: { gte: start, lte: end },
      status: { in: ["INQUIRY", "CONFIRMED", "COMPLETED"] },
    },
    include: { client: true },
    orderBy: { eventDate: "asc" },
  });

  return (
    <div className="max-w-6xl animate-fade-in">
      <div className="mb-6">
        <h1 className="font-header text-xl font-semibold text-studio-text">Calendar</h1>
        <p className="text-sm text-studio-text-muted mt-0.5">Visualize your shoot schedule</p>
      </div>
      <CalendarView
        bookings={bookings.map((b) => ({
          id: b.id,
          clientName: b.client.name,
          eventType: b.eventType,
          eventDate: b.eventDate.toISOString(),
          status: b.status,
          location: b.location,
          feeCents: b.feeCents,
        }))}
        year={year}
        month={month}
      />
    </div>
  );
}

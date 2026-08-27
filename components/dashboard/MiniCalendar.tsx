"use client";

interface MiniCalendarProps {
  bookedDays: { date: string; status: string }[];
}

export default function MiniCalendar({ bookedDays }: MiniCalendarProps) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = now.getDate();

  const monthName = new Date(year, month).toLocaleDateString("en-MY", { month: "long", year: "numeric" });

  // Map booked days to day numbers
  const bookedDaySet = new Map<number, string>();
  bookedDays.forEach((b) => {
    const d = new Date(b.date);
    const dayInManila = parseInt(
      d.toLocaleDateString("en-MY", { day: "numeric", timeZone: "Asia/Manila" })
    );
    const mCheck = parseInt(
      d.toLocaleDateString("en-MY", { month: "numeric", timeZone: "Asia/Manila" })
    );
    if (mCheck === month + 1) {
      bookedDaySet.set(dayInManila, b.status);
    }
  });

  const dayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      <p className="text-xs font-semibold text-slate-300 mb-3 text-center">{monthName}</p>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {dayLabels.map((l) => (
          <div key={l} className="text-[9px] font-semibold text-slate-500 uppercase py-1">
            {l}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} />;
          }
          const isToday = day === today;
          const status = bookedDaySet.get(day);
          const hasBooking = !!status;

          return (
            <div
              key={day}
              className={`relative w-full aspect-square flex items-center justify-center rounded-md text-[11px] font-mono font-medium transition-colors ${
                isToday
                  ? "bg-amber-500 text-slate-950 font-bold"
                  : hasBooking
                  ? "bg-slate-800 text-white"
                  : "text-slate-500 hover:bg-slate-800/50"
              }`}
            >
              {day}
              {hasBooking && !isToday && (
                <span className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${
                  status === "CONFIRMED" ? "bg-emerald-400" : status === "COMPLETED" ? "bg-blue-400" : "bg-slate-400"
                }`} />
              )}
              {hasBooking && isToday && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-slate-950" />
              )}
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-3 mt-3 justify-center">
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-[9px] text-slate-400">Confirmed</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          <span className="text-[9px] text-slate-400">Inquiry</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          <span className="text-[9px] text-slate-400">Done</span>
        </div>
      </div>
    </div>
  );
}
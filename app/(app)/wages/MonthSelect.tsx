"use client";

import { useRouter } from "next/navigation";

interface MonthSelectProps {
  currentMonth: string;
  months: { value: string; label: string }[];
}

export default function MonthSelect({ currentMonth, months }: MonthSelectProps) {
  const router = useRouter();

  return (
    <select
      value={currentMonth}
      onChange={(e) => {
        router.push(`/wages?month=${e.target.value}`);
      }}
      className="bg-[#131C2E] border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-semibold text-white focus:border-amber-500 transition-colors shadow-sm cursor-pointer"
    >
      {months.map((m) => (
        <option key={m.value} value={m.value}>
          {m.label}
        </option>
      ))}
    </select>
  );
}
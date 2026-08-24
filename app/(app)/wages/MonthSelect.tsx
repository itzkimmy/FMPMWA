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
      className="bg-studio-panel border border-studio-border rounded-lg px-3 py-2 text-sm text-studio-text focus:border-studio-amber focus:ring-1 focus:ring-studio-amber transition-colors"
    >
      {months.map((m) => (
        <option key={m.value} value={m.value}>
          {m.label}
        </option>
      ))}
    </select>
  );
}

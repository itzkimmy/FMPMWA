"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/dates";
import { useToast } from "@/components/ui/ToastProvider";

export interface PaymentWatchItem {
  booking: {
    id: string;
    eventType: string;
    eventDate: string;
    client: {
      name: string;
      contact: string | null;
    };
  };
  dueCents: number;
  daysOverdue: number;
}

interface PaymentWatchClientProps {
  items: PaymentWatchItem[];
}

export default function PaymentWatchClient({ items }: PaymentWatchClientProps) {
  const { showToast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function handleCopyReminder(e: React.MouseEvent, item: PaymentWatchItem) {
    e.preventDefault();
    e.stopPropagation();

    const formattedDate = formatDate(new Date(item.booking.eventDate));
    const amount = formatMoney(item.dueCents);
    const message = `Hi ${item.booking.client.name}, gentle reminder regarding the outstanding balance of ${amount} for your ${item.booking.eventType} photoshoot (${formattedDate}). Please let me know once transferred. Thank you!`;

    navigator.clipboard.writeText(message);
    setCopiedId(item.booking.id);
    showToast(`Copied payment reminder for ${item.booking.client.name}!`, "success");
    setTimeout(() => setCopiedId(null), 2500);
  }

  if (items.length === 0) {
    return (
      <div className="px-5 py-8 text-center bg-[#131C2E]">
        <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-2 text-emerald-400">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <p className="text-sm text-white font-medium">All payments up to date</p>
        <p className="text-xs text-slate-400 mt-0.5">No pending or overdue invoices</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-slate-800 bg-[#131C2E]">
      {items.map(({ booking, dueCents, daysOverdue }) => {
        const isCopied = copiedId === booking.id;
        return (
          <li key={booking.id} className="hover:bg-[#182338] transition-colors group">
            <div className="flex items-center justify-between gap-4 px-5 py-3.5">
              <Link href={`/bookings/${booking.id}`} className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate group-hover:text-amber-400 transition-colors">
                  {booking.client.name}
                </p>
                <p className="text-xs text-slate-400 truncate mt-0.5">
                  {booking.eventType} · {formatDate(new Date(booking.eventDate))}
                </p>
              </Link>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="font-mono text-sm font-bold text-rose-400">
                    {formatMoney(dueCents)}
                  </p>
                  <p className="text-2xs text-rose-400 font-semibold">
                    {daysOverdue > 0 ? `${daysOverdue}d overdue` : "Deposit due"}
                  </p>
                </div>

                <button
                  onClick={(e) => handleCopyReminder(e, { booking, dueCents, daysOverdue })}
                  title="Copy ready-to-send payment reminder text"
                  className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 text-slate-200 hover:text-white hover:bg-slate-700 transition-all text-xs inline-flex items-center gap-1.5 flex-shrink-0 shadow-sm"
                >
                  {isCopied ? (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 text-emerald-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      <span className="text-2xs text-emerald-400 font-semibold">Copied</span>
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-3.5 h-3.5 text-slate-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                      </svg>
                      <span className="text-2xs font-medium">Copy reminder</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
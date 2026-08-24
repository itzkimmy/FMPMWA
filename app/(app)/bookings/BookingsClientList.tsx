"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { formatMoney, formatMoneyCompact } from "@/lib/money";
import { formatDate } from "@/lib/dates";
import { BookingStatusPill, DeliveryStatusPill } from "@/components/ui/StatusPill";
import EmptyState from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/ToastProvider";
import type { BookingStatus, DeliveryStatus } from "@prisma/client";

export interface BookingListItem {
  id: string;
  eventType: string;
  eventDate: string; // ISO string
  location: string | null;
  feeCents: number;
  depositCents: number;
  status: BookingStatus;
  deliveryStatus: DeliveryStatus;
  notes: string | null;
  client: {
    id: string;
    name: string;
    contact: string | null;
  };
  paidCents: number;
}

interface BookingsClientListProps {
  initialBookings: BookingListItem[];
}

export default function BookingsClientList({ initialBookings }: BookingsClientListProps) {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "fee-desc" | "fee-asc" | "client-asc">("date-desc");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Status counts
  const counts = useMemo(() => {
    return {
      ALL: initialBookings.length,
      INQUIRY: initialBookings.filter((b) => b.status === "INQUIRY").length,
      CONFIRMED: initialBookings.filter((b) => b.status === "CONFIRMED").length,
      COMPLETED: initialBookings.filter((b) => b.status === "COMPLETED").length,
      CANCELLED: initialBookings.filter((b) => b.status === "CANCELLED").length,
    };
  }, [initialBookings]);

  // Filtered & sorted bookings
  const filteredBookings = useMemo(() => {
    return initialBookings
      .filter((b) => {
        if (selectedStatus !== "ALL" && b.status !== selectedStatus) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchClient = b.client.name.toLowerCase().includes(q);
          const matchType = b.eventType.toLowerCase().includes(q);
          const matchLocation = b.location?.toLowerCase().includes(q) ?? false;
          const matchNotes = b.notes?.toLowerCase().includes(q) ?? false;
          if (!matchClient && !matchType && !matchLocation && !matchNotes) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "date-desc") {
          return new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime();
        }
        if (sortBy === "date-asc") {
          return new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime();
        }
        if (sortBy === "fee-desc") {
          return b.feeCents - a.feeCents;
        }
        if (sortBy === "fee-asc") {
          return a.feeCents - b.feeCents;
        }
        if (sortBy === "client-asc") {
          return a.client.name.localeCompare(b.client.name);
        }
        return 0;
      });
  }, [initialBookings, selectedStatus, searchQuery, sortBy]);

  function handleCopySummary(e: React.MouseEvent, booking: BookingListItem) {
    e.preventDefault();
    e.stopPropagation();
    const summary = `${booking.client.name} — ${booking.eventType} (${formatDate(new Date(booking.eventDate))}) · Fee: ${formatMoney(booking.feeCents)} · Location: ${booking.location || "TBD"}`;
    navigator.clipboard.writeText(summary);
    setCopiedId(booking.id);
    showToast("Booking summary copied to clipboard!", "success");
    setTimeout(() => setCopiedId(null), 2000);
  }

  const TABS = [
    { label: "All", value: "ALL", count: counts.ALL },
    { label: "Inquiry", value: "INQUIRY", count: counts.INQUIRY },
    { label: "Confirmed", value: "CONFIRMED", count: counts.CONFIRMED },
    { label: "Completed", value: "COMPLETED", count: counts.COMPLETED },
    { label: "Cancelled", value: "CANCELLED", count: counts.CANCELLED },
  ];

  return (
    <div className="space-y-4">
      {/* Controls bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Live search */}
        <div className="relative flex-1 max-w-md">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by client, event type, location..."
            className="w-full bg-[#131C2E] border border-slate-700 rounded-lg pl-9 pr-8 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Sort dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-2xs text-slate-400 font-medium whitespace-nowrap">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="bg-[#131C2E] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="date-desc">Date (Newest first)</option>
            <option value="date-asc">Date (Oldest first)</option>
            <option value="fee-desc">Fee (High to Low)</option>
            <option value="fee-asc">Fee (Low to High)</option>
            <option value="client-asc">Client Name (A–Z)</option>
          </select>
        </div>
      </div>

      {/* Filter tabs with live counters */}
      <div className="flex gap-1 bg-[#0F172A] border border-slate-800 p-1 rounded-lg overflow-x-auto">
        {TABS.map((tab) => {
          const isActive = tab.value === selectedStatus;
          return (
            <button
              key={tab.value}
              onClick={() => setSelectedStatus(tab.value)}
              className={`flex items-center gap-1.5 flex-shrink-0 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                isActive
                  ? "bg-amber-500 text-slate-950 shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/80"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  isActive
                    ? "bg-slate-950/20 text-slate-950"
                    : "bg-slate-800 text-slate-300"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table / Results */}
      {filteredBookings.length === 0 ? (
        <EmptyState
          title={searchQuery ? "No matching bookings found" : "No bookings in this category"}
          description={
            searchQuery
              ? `No bookings matched "${searchQuery}". Try a different keyword or clear filters.`
              : "Create a new booking to start tracking shoots and client schedules."
          }
          action={
            searchQuery
              ? { label: "Clear search", href: "#", onClick: () => setSearchQuery("") }
              : { label: "Add booking", href: "/bookings/new" }
          }
        />
      ) : (
        <div className="bg-[#131C2E] border border-slate-800 rounded-xl overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800 bg-[#0F172A]/75">
                  <th className="px-5 py-3 text-left text-2xs font-semibold text-slate-300 uppercase tracking-wider">Date</th>
                  <th className="px-5 py-3 text-left text-2xs font-semibold text-slate-300 uppercase tracking-wider">Client & Shoot</th>
                  <th className="px-5 py-3 text-left text-2xs font-semibold text-slate-300 uppercase tracking-wider hidden sm:table-cell">Location</th>
                  <th className="px-5 py-3 text-left text-2xs font-semibold text-slate-300 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-left text-2xs font-semibold text-slate-300 uppercase tracking-wider hidden md:table-cell">Delivery</th>
                  <th className="px-5 py-3 text-right text-2xs font-semibold text-slate-300 uppercase tracking-wider">Fee / Paid</th>
                  <th className="px-4 py-3 text-right text-2xs font-semibold text-slate-300 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredBookings.map((booking) => {
                  const isPaid = booking.paidCents >= booking.feeCents;
                  const isCopied = copiedId === booking.id;

                  return (
                    <tr
                      key={booking.id}
                      className="hover:bg-[#182338] transition-colors group"
                    >
                      <td className="px-5 py-3.5">
                        <Link href={`/bookings/${booking.id}`} className="block">
                          <span className="font-mono text-xs text-slate-300 group-hover:text-amber-400 transition-colors">
                            {formatDate(new Date(booking.eventDate))}
                          </span>
                        </Link>
                      </td>
                      <td className="px-5 py-3.5">
                        <Link href={`/bookings/${booking.id}`} className="block">
                          <span className="text-xs font-semibold text-white block group-hover:text-amber-400 transition-colors">
                            {booking.client.name}
                          </span>
                          <span className="text-2xs text-slate-400">
                            {booking.eventType}
                          </span>
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 hidden sm:table-cell">
                        <span className="text-xs text-slate-400 line-clamp-1">
                          {booking.location || "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <BookingStatusPill status={booking.status} />
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <DeliveryStatusPill status={booking.deliveryStatus} />
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className="font-mono text-xs font-bold text-white block">
                          {formatMoneyCompact(booking.feeCents)}
                        </span>
                        <span className={`font-mono text-2xs font-semibold ${isPaid ? "text-emerald-400" : "text-rose-400"}`}>
                          {formatMoney(booking.paidCents)} paid
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={(e) => handleCopySummary(e, booking)}
                          title="Copy summary to clipboard"
                          className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-all text-xs inline-flex items-center gap-1 shadow-sm"
                        >
                          {isCopied ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 text-emerald-400">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-3.5 h-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                            </svg>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
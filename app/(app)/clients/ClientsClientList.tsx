"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { formatMoneyCompact } from "@/lib/money";
import { formatDate } from "@/lib/dates";
import EmptyState from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/ToastProvider";

export interface ClientListItem {
  id: string;
  name: string;
  contact: string | null;
  source: string | null;
  notes: string | null;
  totalJobs: number;
  totalSpentCents: number;
  lastBookingDate: string | null; // ISO string
}

interface ClientsClientListProps {
  initialClients: ClientListItem[];
}

export default function ClientsClientList({ initialClients }: ClientsClientListProps) {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name-asc" | "spent-desc" | "jobs-desc" | "recent-desc">("name-asc");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Aggregated stats
  const totalRevenue = useMemo(
    () => initialClients.reduce((sum, c) => sum + c.totalSpentCents, 0),
    [initialClients]
  );
  const totalJobs = useMemo(
    () => initialClients.reduce((sum, c) => sum + c.totalJobs, 0),
    [initialClients]
  );
  const avgSpend = initialClients.length > 0 ? Math.round(totalRevenue / initialClients.length) : 0;

  // Filtered & sorted
  const filteredClients = useMemo(() => {
    return initialClients
      .filter((c) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        const matchName = c.name.toLowerCase().includes(q);
        const matchContact = c.contact?.toLowerCase().includes(q) ?? false;
        const matchSource = c.source?.toLowerCase().includes(q) ?? false;
        const matchNotes = c.notes?.toLowerCase().includes(q) ?? false;
        return matchName || matchContact || matchSource || matchNotes;
      })
      .sort((a, b) => {
        if (sortBy === "name-asc") {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === "spent-desc") {
          return b.totalSpentCents - a.totalSpentCents;
        }
        if (sortBy === "jobs-desc") {
          return b.totalJobs - a.totalJobs;
        }
        if (sortBy === "recent-desc") {
          const aTime = a.lastBookingDate ? new Date(a.lastBookingDate).getTime() : 0;
          const bTime = b.lastBookingDate ? new Date(b.lastBookingDate).getTime() : 0;
          return bTime - aTime;
        }
        return 0;
      });
  }, [initialClients, searchQuery, sortBy]);

  function handleCopyContact(e: React.MouseEvent, client: ClientListItem) {
    e.preventDefault();
    e.stopPropagation();
    if (!client.contact) return;
    navigator.clipboard.writeText(client.contact);
    setCopiedId(client.id);
    showToast(`Copied contact for ${client.name}!`, "success");
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="space-y-5">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-studio-panel border border-studio-border rounded-xl p-4">
          <p className="text-2xs text-studio-text-muted uppercase tracking-wider mb-1">Total Clients</p>
          <p className="font-mono text-2xl font-semibold text-studio-text">{initialClients.length}</p>
        </div>
        <div className="bg-studio-panel border border-studio-border rounded-xl p-4">
          <p className="text-2xs text-studio-text-muted uppercase tracking-wider mb-1">Lifetime Revenue</p>
          <p className="font-mono text-2xl font-semibold text-studio-sage">{formatMoneyCompact(totalRevenue)}</p>
        </div>
        <div className="bg-studio-panel border border-studio-border rounded-xl p-4">
          <p className="text-2xs text-studio-text-muted uppercase tracking-wider mb-1">Avg Revenue / Client</p>
          <p className="font-mono text-2xl font-semibold text-studio-amber">{formatMoneyCompact(avgSpend)}</p>
        </div>
      </div>

      {/* Search and Sort controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="w-4 h-4 text-studio-text-muted absolute left-3 top-1/2 -translate-y-1/2"
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
            placeholder="Search by name, contact, referral source…"
            className="w-full bg-studio-panel border border-studio-border rounded-lg pl-9 pr-8 py-2 text-xs text-studio-text placeholder:text-studio-text-faint focus:outline-none focus:border-studio-amber/50 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-studio-text-muted hover:text-studio-text p-1 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-2xs text-studio-text-muted font-medium whitespace-nowrap">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="bg-studio-panel border border-studio-border rounded-lg px-2.5 py-1.5 text-xs text-studio-text focus:outline-none focus:border-studio-amber/50"
          >
            <option value="name-asc">Name (A–Z)</option>
            <option value="spent-desc">Highest Revenue</option>
            <option value="jobs-desc">Most Bookings</option>
            <option value="recent-desc">Most Recent Shoot</option>
          </select>
        </div>
      </div>

      {/* Client table */}
      {filteredClients.length === 0 ? (
        <EmptyState
          title={searchQuery ? "No matching clients found" : "No clients yet"}
          description={
            searchQuery
              ? `No clients matched "${searchQuery}". Try clearing search.`
              : "Add your first client to track bookings, contact info, and revenue."
          }
          action={
            searchQuery
              ? { label: "Clear search", href: "#", onClick: () => setSearchQuery("") }
              : { label: "Add client", href: "/clients/new" }
          }
        />
      ) : (
        <div className="bg-studio-panel border border-studio-border rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-studio-border bg-studio-bg/30">
                  <th className="px-5 py-3 text-left text-2xs font-semibold text-studio-text-muted uppercase tracking-wider">Client Name</th>
                  <th className="px-5 py-3 text-left text-2xs font-semibold text-studio-text-muted uppercase tracking-wider hidden sm:table-cell">Contact</th>
                  <th className="px-5 py-3 text-left text-2xs font-semibold text-studio-text-muted uppercase tracking-wider hidden md:table-cell">Source</th>
                  <th className="px-5 py-3 text-right text-2xs font-semibold text-studio-text-muted uppercase tracking-wider">Jobs</th>
                  <th className="px-5 py-3 text-right text-2xs font-semibold text-studio-text-muted uppercase tracking-wider hidden sm:table-cell">Total Paid</th>
                  <th className="px-5 py-3 text-right text-2xs font-semibold text-studio-text-muted uppercase tracking-wider hidden lg:table-cell">Last Shoot</th>
                  <th className="px-4 py-3 text-right text-2xs font-semibold text-studio-text-muted uppercase tracking-wider">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-studio-border">
                {filteredClients.map((client) => {
                  const isCopied = copiedId === client.id;
                  return (
                    <tr key={client.id} className="hover:bg-studio-panel-hover transition-colors group">
                      <td className="px-5 py-3.5">
                        <Link href={`/clients/${client.id}`} className="block">
                          <span className="text-sm font-medium text-studio-text group-hover:text-studio-amber transition-colors">
                            {client.name}
                          </span>
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 hidden sm:table-cell">
                        <span className="text-sm text-studio-text-muted">{client.contact ?? "—"}</span>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        {client.source ? (
                          <span className="px-2 py-0.5 rounded-full bg-studio-bg border border-studio-border text-2xs text-studio-text-muted">
                            {client.source}
                          </span>
                        ) : (
                          <span className="text-sm text-studio-text-faint">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className="font-mono text-sm text-studio-text">{client.totalJobs}</span>
                      </td>
                      <td className="px-5 py-3.5 text-right hidden sm:table-cell">
                        <span className="font-mono text-sm text-studio-sage font-medium">
                          {formatMoneyCompact(client.totalSpentCents)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right hidden lg:table-cell">
                        <span className="font-mono text-xs text-studio-text-muted">
                          {client.lastBookingDate ? formatDate(new Date(client.lastBookingDate)) : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {client.contact ? (
                          <button
                            onClick={(e) => handleCopyContact(e, client)}
                            title="Copy contact details"
                            className="p-1.5 rounded-lg border border-studio-border bg-studio-bg text-studio-text-muted hover:text-studio-amber hover:border-studio-amber/40 transition-all text-xs inline-flex items-center gap-1 opacity-80 group-hover:opacity-100"
                          >
                            {isCopied ? (
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 text-studio-sage">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                            ) : (
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v2.25A2.25 2.25 0 0113.5 21.75h-7.5A2.25 2.25 0 013.75 19.5V7.5a2.25 2.25 0 012.25-2.25h2.25m4.5 0h4.5a2.25 2.25 0 012.25 2.25v12a2.25 2.25 0 01-2.25 2.25h-4.5a2.25 2.25 0 01-2.25-2.25V7.5a2.25 2.25 0 012.25-2.25z" />
                              </svg>
                            )}
                          </button>
                        ) : (
                          <span className="text-2xs text-studio-text-faint">—</span>
                        )}
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

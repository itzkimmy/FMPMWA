"use client";

import React from "react";
import Link from "next/link";

export default function QuickActionBar() {
  const actions = [
    {
      label: "New Booking",
      href: "/bookings/new",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-studio-amber">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      ),
      description: "Schedule shoot",
    },
    {
      label: "Add Client",
      href: "/clients/new",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-studio-sage">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
        </svg>
      ),
      description: "New client profile",
    },
    {
      label: "Record Wage",
      href: "/wages",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-studio-amber">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      description: "Log income / expense",
    },
    {
      label: "Calendar",
      href: "/calendar",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-studio-text-muted">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      ),
      description: "Shoot schedule",
    },
  ];

  return (
    <div className="bg-studio-panel border border-studio-border rounded-xl p-3.5 shadow-sm">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {actions.map((act) => (
          <Link
            key={act.label}
            href={act.href}
            className="flex items-center gap-3 p-2.5 rounded-lg bg-studio-bg/60 border border-studio-border/60 hover:border-studio-amber/40 hover:bg-studio-panel-hover transition-all group"
          >
            <div className="p-2 rounded-lg bg-studio-panel border border-studio-border group-hover:border-studio-amber/30 transition-colors">
              {act.icon}
            </div>
            <div>
              <p className="text-xs font-semibold text-studio-text group-hover:text-studio-amber transition-colors">
                {act.label}
              </p>
              <p className="text-[10px] text-studio-text-faint">
                {act.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

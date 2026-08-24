"use client";

import Link from "next/link";

export default function QuickActionBar() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <Link
        href="/bookings/new"
        className="glass-card hover:bg-[#182338] border border-slate-800 rounded-xl p-4 flex items-center gap-3 transition-all duration-200 group hover:-translate-y-0.5"
      >
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </div>
        <div>
          <p className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
            New Shoot
          </p>
          <p className="text-2xs text-slate-400 font-medium">Book event date</p>
        </div>
      </Link>

      <Link
        href="/wages"
        className="glass-card hover:bg-[#182338] border border-slate-800 rounded-xl p-4 flex items-center gap-3 transition-all duration-200 group hover:-translate-y-0.5"
      >
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.070.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
            Log Payment
          </p>
          <p className="text-2xs text-slate-400 font-medium">Record income/cost</p>
        </div>
      </Link>

      <Link
        href="/clients"
        className="glass-card hover:bg-[#182338] border border-slate-800 rounded-xl p-4 flex items-center gap-3 transition-all duration-200 group hover:-translate-y-0.5"
      >
        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.765z" />
          </svg>
        </div>
        <div>
          <p className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">
            Add Client
          </p>
          <p className="text-2xs text-slate-400 font-medium">Contact details</p>
        </div>
      </Link>

      <Link
        href="/calendar"
        className="glass-card hover:bg-[#182338] border border-slate-800 rounded-xl p-4 flex items-center gap-3 transition-all duration-200 group hover:-translate-y-0.5"
      >
        <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
        </div>
        <div>
          <p className="text-xs font-bold text-white group-hover:text-sky-400 transition-colors">
            Calendar
          </p>
          <p className="text-2xs text-slate-400 font-medium">Schedule overview</p>
        </div>
      </Link>
    </div>
  );
}
"use client";

import { usePathname } from "next/navigation";

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/bookings": "Bookings & Shoots",
  "/bookings/new": "New Booking",
  "/clients": "Client Roster",
  "/clients/new": "New Client",
  "/wages": "Wages & Financial Ledger",
  "/calendar": "Shoot Calendar",
  "/settings": "Studio Settings",
};

function getTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith("/bookings/") && pathname.endsWith("/edit"))
    return "Edit Booking";
  if (pathname.startsWith("/bookings/")) return "Booking Details";
  if (pathname.startsWith("/clients/") && pathname.endsWith("/edit"))
    return "Edit Client";
  if (pathname.startsWith("/clients/")) return "Client Details";
  return "FlowMotion";
}

export default function TopBar() {
  const pathname = usePathname();
  const title = getTitle(pathname);

  return (
    <header className="flex items-center justify-between h-14 px-4 md:px-6 border-b border-slate-800 bg-[#0F172A]/85 backdrop-blur-md flex-shrink-0 z-10">
      <div className="flex items-center gap-3">
        <div className="w-9 md:hidden" />
        <h2 className="font-header text-sm font-semibold text-white tracking-tight">
          {title}
        </h2>
      </div>

      <div className="flex items-center gap-2 text-2xs font-mono text-slate-300">
        <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
        <span className="hidden sm:inline font-medium">FlowMotion · MYR (RM)</span>
      </div>
    </header>
  );
}
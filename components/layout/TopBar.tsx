"use client";

import { usePathname } from "next/navigation";

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/bookings": "Bookings",
  "/bookings/new": "New Booking",
  "/clients": "Clients",
  "/clients/new": "New Client",
  "/wages": "Wages & Income",
  "/calendar": "Calendar",
  "/ai": "AI Assist",
  "/settings": "Settings",
};

function getTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  // Handle nested paths like /bookings/[id]/edit
  if (pathname.startsWith("/bookings/") && pathname.endsWith("/edit"))
    return "Edit Booking";
  if (pathname.startsWith("/bookings/")) return "Booking Details";
  if (pathname.startsWith("/clients/") && pathname.endsWith("/edit"))
    return "Edit Client";
  if (pathname.startsWith("/clients/")) return "Client Details";
  return "StudioLedger";
}

export default function TopBar() {
  const pathname = usePathname();
  const title = getTitle(pathname);

  return (
    <header className="flex items-center h-14 px-4 md:px-6 border-b border-studio-border bg-studio-panel/50 backdrop-blur-sm flex-shrink-0 md:pl-6">
      {/* Mobile spacer for hamburger button */}
      <div className="w-10 md:hidden" />
      <h2 className="font-header text-sm font-semibold text-studio-text tracking-wide">
        {title}
      </h2>
    </header>
  );
}

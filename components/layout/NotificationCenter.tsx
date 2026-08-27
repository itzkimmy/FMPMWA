"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import type { StudioNotification } from "@/lib/notifications";

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<StudioNotification[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<string>("All");
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load read notifications from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("flowmotion_read_notifications");
      if (stored) {
        setReadIds(new Set(JSON.parse(stored)));
      }
    } catch {
      // ignore
    }
  }, []);

  // Fetch real-time studio notifications
  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await fetch("/api/notifications");
        const data = await res.json();
        if (data.ok && Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
        }
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      } finally {
        setLoading(false);
      }
    }

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // refresh every min
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  function markAsRead(id: string) {
    const next = new Set(readIds);
    next.add(id);
    setReadIds(next);
    try {
      localStorage.setItem("flowmotion_read_notifications", JSON.stringify(Array.from(next)));
    } catch {
      // ignore
    }
  }

  function markAllAsRead() {
    const next = new Set(notifications.map((n) => n.id));
    setReadIds(next);
    try {
      localStorage.setItem("flowmotion_read_notifications", JSON.stringify(Array.from(next)));
    } catch {
      // ignore
    }
  }

  function dismissNotification(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    e.preventDefault();
    markAsRead(id);
  }

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "All") return true;
    return n.category === filter;
  });

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-700"
        title="Studio Notifications"
        aria-label="Open notifications"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          className="w-4 h-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>

        {/* Unread badge / indicator dot */}
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.9)]" />
          </span>
        )}
      </button>

      {/* Floating Notification Popover */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-[#0F172A] border border-slate-700/90 rounded-2xl p-4 shadow-2xl z-50 animate-fade-in backdrop-blur-2xl">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <h3 className="font-header text-sm font-bold text-white">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-2xs font-mono font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-2xs text-slate-400 hover:text-amber-400 font-medium transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1 my-3 overflow-x-auto no-scrollbar py-0.5">
            {["All", "Shoots", "Payments", "Deliveries"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-2.5 py-1 rounded-lg text-2xs font-semibold transition-all whitespace-nowrap ${
                  filter === tab
                    ? "bg-amber-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Notification List */}
          <div className="space-y-2 max-h-80 overflow-y-auto no-scrollbar pr-0.5">
            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400 animate-pulse">
                Loading studio notifications...
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-white">All caught up!</p>
                <p className="text-2xs text-slate-400">No active alerts at the moment.</p>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const isRead = readIds.has(notif.id);
                return (
                  <Link
                    key={notif.id}
                    href={notif.link}
                    onClick={() => {
                      markAsRead(notif.id);
                      setIsOpen(false);
                    }}
                    className={`block p-3 rounded-xl border transition-all relative group ${
                      isRead
                        ? "bg-[#131C2E]/60 border-slate-800/80 opacity-75 hover:opacity-100 hover:bg-[#182338]"
                        : "bg-[#131C2E] border-slate-700/80 hover:border-amber-500/40 shadow-sm"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Type Icon */}
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          notif.type === "PAYMENT_DUE"
                            ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                            : notif.type === "UPCOMING_SHOOT"
                            ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                            : notif.type === "DELIVERY_PENDING"
                            ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30"
                            : notif.type === "CONFLICT"
                            ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                            : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        }`}
                      >
                        {notif.type === "PAYMENT_DUE" ? (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.070.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : notif.type === "UPCOMING_SHOOT" ? (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                          </svg>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors truncate">
                            {notif.title}
                          </p>
                          {!isRead && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-2xs text-slate-300 mt-0.5 leading-relaxed line-clamp-2">
                          {notif.message}
                        </p>
                      </div>

                      {/* Dismiss button */}
                      <button
                        onClick={(e) => dismissNotification(e, notif.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-slate-300 text-xs p-1 transition-opacity"
                        title="Dismiss"
                      >
                        ✕
                      </button>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
import type { BookingStatus, DeliveryStatus } from "@prisma/client";

const BOOKING_STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; classes: string }
> = {
  INQUIRY: {
    label: "Inquiry",
    classes: "bg-slate-800 text-slate-200 border border-slate-700",
  },
  CONFIRMED: {
    label: "Confirmed",
    classes: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
  },
  COMPLETED: {
    label: "Completed",
    classes: "bg-blue-500/15 text-blue-300 border border-blue-500/30",
  },
  CANCELLED: {
    label: "Cancelled",
    classes: "bg-rose-500/15 text-rose-300 border border-rose-500/30",
  },
};

const DELIVERY_STATUS_CONFIG: Record<
  DeliveryStatus,
  { label: string; classes: string }
> = {
  NOT_STARTED: {
    label: "Not started",
    classes: "bg-slate-800 text-slate-300 border border-slate-700",
  },
  EDITING: {
    label: "Editing",
    classes: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
  },
  READY: {
    label: "Ready",
    classes: "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30",
  },
  DELIVERED: {
    label: "Delivered",
    classes: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
  },
};

interface BookingStatusPillProps {
  status: BookingStatus;
}

export function BookingStatusPill({ status }: BookingStatusPillProps) {
  const config = BOOKING_STATUS_CONFIG[status];
  return (
    <span className={`status-pill ${config.classes}`}>{config.label}</span>
  );
}

interface DeliveryStatusPillProps {
  status: DeliveryStatus;
}

export function DeliveryStatusPill({ status }: DeliveryStatusPillProps) {
  const config = DELIVERY_STATUS_CONFIG[status];
  return (
    <span className={`status-pill ${config.classes}`}>{config.label}</span>
  );
}
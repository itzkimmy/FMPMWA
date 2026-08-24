import type { BookingStatus, DeliveryStatus } from "@prisma/client";

/**
 * Status pill component — pill-shaped, uppercase, letter-spaced.
 * Per SKILLS.md §Visual System.
 */

const BOOKING_STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; classes: string }
> = {
  INQUIRY: {
    label: "Inquiry",
    classes: "bg-studio-border text-studio-text-muted",
  },
  CONFIRMED: {
    label: "Confirmed",
    classes: "bg-studio-sage-subtle text-studio-sage border border-studio-sage/20",
  },
  COMPLETED: {
    label: "Completed",
    classes: "bg-studio-sage-subtle/50 text-studio-sage-dim border border-studio-sage-dim/20",
  },
  CANCELLED: {
    label: "Cancelled",
    classes: "bg-studio-border-subtle text-studio-text-faint",
  },
};

const DELIVERY_STATUS_CONFIG: Record<
  DeliveryStatus,
  { label: string; classes: string }
> = {
  NOT_STARTED: {
    label: "Not started",
    classes: "bg-studio-border text-studio-text-faint",
  },
  EDITING: {
    label: "Editing",
    classes: "bg-studio-amber-subtle text-studio-amber border border-studio-amber/20",
  },
  READY: {
    label: "Ready",
    classes: "bg-studio-amber-subtle/50 text-studio-amber-dim border border-studio-amber-dim/20",
  },
  DELIVERED: {
    label: "Delivered",
    classes: "bg-studio-sage-subtle text-studio-sage border border-studio-sage/20",
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

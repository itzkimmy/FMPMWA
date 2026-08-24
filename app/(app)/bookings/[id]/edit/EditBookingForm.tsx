"use client";

import { useState, useTransition, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { updateBookingAction } from "../../actions";
import { EVENT_TYPES, BOOKING_STATUS_VALUES, DELIVERY_STATUS_VALUES } from "@/lib/validation";
import { toManilaDateString } from "@/lib/dates";
import type { Booking, Client } from "@prisma/client";

interface EditBookingFormProps {
  booking: Booking & { client: Client };
  clients: Client[];
}

export default function EditBookingForm({ booking, clients }: EditBookingFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Convert cents to display string for form defaults
  const feeDisplay = (booking.feeCents / 100).toFixed(2);
  const depositDisplay = booking.depositCents > 0 ? (booking.depositCents / 100).toFixed(2) : "";
  const eventDateStr = toManilaDateString(new Date(booking.eventDate));

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateBookingAction(booking.id, formData);
      if (!result.ok) {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="px-4 py-3 bg-studio-clay-subtle border border-studio-clay/30 rounded-lg text-sm text-studio-clay">
          {error}
        </div>
      )}

      <div className="bg-studio-panel border border-studio-border rounded-xl p-6 space-y-5">
        <h2 className="font-header text-xs font-semibold text-studio-text-muted uppercase tracking-wider">
          Booking details
        </h2>

        <div>
          <label htmlFor="clientId" className="block text-xs font-medium text-studio-text-muted mb-1.5">
            Client <span className="text-studio-clay">*</span>
          </label>
          <select
            id="clientId"
            name="clientId"
            required
            defaultValue={booking.clientId}
            className="w-full bg-studio-bg border border-studio-border rounded-lg px-3 py-2.5 text-sm text-studio-text"
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="eventType" className="block text-xs font-medium text-studio-text-muted mb-1.5">
              Event type <span className="text-studio-clay">*</span>
            </label>
            <input
              id="eventType"
              name="eventType"
              list="event-type-list"
              required
              defaultValue={booking.eventType}
              className="w-full bg-studio-bg border border-studio-border rounded-lg px-3 py-2.5 text-sm text-studio-text"
            />
            <datalist id="event-type-list">
              {EVENT_TYPES.map((t) => <option key={t} value={t} />)}
            </datalist>
          </div>
          <div>
            <label htmlFor="eventDate" className="block text-xs font-medium text-studio-text-muted mb-1.5">
              Event date <span className="text-studio-clay">*</span>
            </label>
            <input
              id="eventDate"
              name="eventDate"
              type="date"
              required
              defaultValue={eventDateStr}
              className="w-full bg-studio-bg border border-studio-border rounded-lg px-3 py-2.5 text-sm text-studio-text font-mono"
            />
          </div>
        </div>

        <div>
          <label htmlFor="location" className="block text-xs font-medium text-studio-text-muted mb-1.5">Location</label>
          <input
            id="location"
            name="location"
            defaultValue={booking.location ?? ""}
            className="w-full bg-studio-bg border border-studio-border rounded-lg px-3 py-2.5 text-sm text-studio-text"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="feeInput" className="block text-xs font-medium text-studio-text-muted mb-1.5">
              Total fee (RM) <span className="text-studio-clay">*</span>
            </label>
            <input
              id="feeInput"
              name="feeInput"
              required
              defaultValue={feeDisplay}
              className="w-full bg-studio-bg border border-studio-border rounded-lg px-3 py-2.5 text-sm text-studio-text font-mono"
            />
          </div>
          <div>
            <label htmlFor="depositInput" className="block text-xs font-medium text-studio-text-muted mb-1.5">Deposit (RM)</label>
            <input
              id="depositInput"
              name="depositInput"
              defaultValue={depositDisplay}
              className="w-full bg-studio-bg border border-studio-border rounded-lg px-3 py-2.5 text-sm text-studio-text font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="status" className="block text-xs font-medium text-studio-text-muted mb-1.5">Booking status</label>
            <select
              id="status"
              name="status"
              defaultValue={booking.status}
              className="w-full bg-studio-bg border border-studio-border rounded-lg px-3 py-2.5 text-sm text-studio-text"
            >
              {BOOKING_STATUS_VALUES.map((s) => (
                <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="deliveryStatus" className="block text-xs font-medium text-studio-text-muted mb-1.5">Delivery status</label>
            <select
              id="deliveryStatus"
              name="deliveryStatus"
              defaultValue={booking.deliveryStatus}
              className="w-full bg-studio-bg border border-studio-border rounded-lg px-3 py-2.5 text-sm text-studio-text"
            >
              {DELIVERY_STATUS_VALUES.map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, " ").charAt(0) + s.replace(/_/g, " ").slice(1).toLowerCase()}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="block text-xs font-medium text-studio-text-muted mb-1.5">Notes</label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            defaultValue={booking.notes ?? ""}
            className="w-full bg-studio-bg border border-studio-border rounded-lg px-3 py-2.5 text-sm text-studio-text resize-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2.5 bg-studio-amber text-studio-bg text-sm font-semibold rounded-lg hover:bg-studio-amber-dim transition-colors disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 bg-studio-panel border border-studio-border text-studio-text-muted text-sm font-medium rounded-lg hover:text-studio-text hover:bg-studio-panel-hover transition-all"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

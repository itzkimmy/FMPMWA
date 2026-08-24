"use client";

import { useState, useTransition, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBookingAction } from "../actions";
import { EVENT_TYPES, BOOKING_STATUS_VALUES, DELIVERY_STATUS_VALUES } from "@/lib/validation";
import type { Client } from "@prisma/client";

interface NewBookingFormProps {
  clients: Client[];
  prefilledData?: {
    clientName?: string;
    eventType?: string;
    suggestedDate?: string;
    location?: string;
  };
}

export default function NewBookingForm({ clients, prefilledData }: NewBookingFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createBookingAction(formData);
      if (!result.ok) {
        setError(result.error);
      }
      // On success, createBookingAction redirects
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="px-4 py-3 bg-studio-clay-subtle border border-studio-clay/30 rounded-lg text-sm text-studio-clay animate-fade-in">
          {error}
        </div>
      )}

      <div className="bg-studio-panel border border-studio-border rounded-xl p-6 space-y-5">
        <h2 className="font-header text-sm font-semibold text-studio-text-muted uppercase tracking-wider">
          Booking details
        </h2>

        {/* Client */}
        <div>
          <label htmlFor="clientId" className="block text-xs font-medium text-studio-text-muted mb-1.5">
            Client <span className="text-studio-clay">*</span>
          </label>
          <select
            id="clientId"
            name="clientId"
            required
            className="w-full bg-studio-bg border border-studio-border rounded-lg px-3 py-2.5 text-sm text-studio-text"
          >
            <option value="">Select a client…</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {clients.length === 0 && (
            <p className="text-xs text-studio-clay mt-1">
              No clients yet.{" "}
              <Link href="/clients/new" className="underline">Add one first</Link>.
            </p>
          )}
        </div>

        {/* Event type + date */}
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
              defaultValue={prefilledData?.eventType ?? ""}
              placeholder="Wedding, Portrait…"
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
              defaultValue={prefilledData?.suggestedDate ?? ""}
              className="w-full bg-studio-bg border border-studio-border rounded-lg px-3 py-2.5 text-sm text-studio-text font-mono"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-xs font-medium text-studio-text-muted mb-1.5">
            Location
          </label>
          <input
            id="location"
            name="location"
            defaultValue={prefilledData?.location ?? ""}
            placeholder="Venue or city"
            className="w-full bg-studio-bg border border-studio-border rounded-lg px-3 py-2.5 text-sm text-studio-text"
          />
        </div>

        {/* Fee + deposit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="feeInput" className="block text-xs font-medium text-studio-text-muted mb-1.5">
              Total fee (RM) <span className="text-studio-clay">*</span>
            </label>
            <input
              id="feeInput"
              name="feeInput"
              required
              placeholder="0.00"
              className="w-full bg-studio-bg border border-studio-border rounded-lg px-3 py-2.5 text-sm text-studio-text font-mono"
            />
          </div>
          <div>
            <label htmlFor="depositInput" className="block text-xs font-medium text-studio-text-muted mb-1.5">
              Deposit required (RM)
            </label>
            <input
              id="depositInput"
              name="depositInput"
              placeholder="0.00"
              className="w-full bg-studio-bg border border-studio-border rounded-lg px-3 py-2.5 text-sm text-studio-text font-mono"
            />
          </div>
        </div>

        {/* Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="status" className="block text-xs font-medium text-studio-text-muted mb-1.5">
              Booking status
            </label>
            <select
              id="status"
              name="status"
              defaultValue="INQUIRY"
              className="w-full bg-studio-bg border border-studio-border rounded-lg px-3 py-2.5 text-sm text-studio-text"
            >
              {BOOKING_STATUS_VALUES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="deliveryStatus" className="block text-xs font-medium text-studio-text-muted mb-1.5">
              Delivery status
            </label>
            <select
              id="deliveryStatus"
              name="deliveryStatus"
              defaultValue="NOT_STARTED"
              className="w-full bg-studio-bg border border-studio-border rounded-lg px-3 py-2.5 text-sm text-studio-text"
            >
              {DELIVERY_STATUS_VALUES.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, " ").charAt(0) + s.replace(/_/g, " ").slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-xs font-medium text-studio-text-muted mb-1.5">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            placeholder="Shot list, special requirements, client preferences…"
            className="w-full bg-studio-bg border border-studio-border rounded-lg px-3 py-2.5 text-sm text-studio-text resize-none"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2.5 bg-studio-amber text-studio-bg text-sm font-semibold rounded-lg hover:bg-studio-amber-dim transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Saving…" : "Create booking"}
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

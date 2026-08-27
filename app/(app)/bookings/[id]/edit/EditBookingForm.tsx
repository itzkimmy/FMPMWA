"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { updateBookingAction } from "../../actions";
import { BOOKING_STATUS_VALUES, DELIVERY_STATUS_VALUES, EVENT_TYPES } from "@/lib/validation";

interface BookingData {
  id: string;
  clientName: string;
  eventType: string;
  eventDate: string;
  location: string;
  feeDisplay: string;
  depositDisplay: string;
  status: string;
  deliveryStatus: string;
  notes: string;
}

interface EditBookingFormProps {
  booking: BookingData;
  clients: { id: string; name: string }[];
}

export default function EditBookingForm({ booking, clients }: EditBookingFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

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
        <div className="px-4 py-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-xs text-rose-300 animate-fade-in font-medium">
          {error}
        </div>
      )}

      <div className="bg-[#131C2E] border border-slate-800 rounded-xl p-6 space-y-5 shadow-md">
        <h2 className="font-header text-2xs font-semibold text-slate-400 uppercase tracking-wider">
          Booking Details
        </h2>

        {/* Client Name text box with autocomplete */}
        <div>
          <label htmlFor="clientName" className="block text-2xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Client Name <span className="text-rose-400">*</span>
          </label>
          <input
            id="clientName"
            name="clientName"
            list="client-name-list"
            required
            autoComplete="off"
            defaultValue={booking.clientName}
            placeholder="Type a custom client name"
            className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
          />
          <datalist id="client-name-list">
            {clients.map((c) => (
              <option key={c.id} value={c.name} />
            ))}
          </datalist>
          <p className="text-2xs text-slate-500 mt-1">
            Type any custom name or pick from existing suggestions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="eventType" className="block text-2xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Event type <span className="text-rose-400">*</span>
            </label>
            <input
              id="eventType"
              name="eventType"
              list="event-type-list"
              required
              defaultValue={booking.eventType}
              className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
            />
            <datalist id="event-type-list">
              {EVENT_TYPES.map((t) => <option key={t} value={t} />)}
            </datalist>
          </div>
          <div>
            <label htmlFor="eventDate" className="block text-2xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Event date <span className="text-rose-400">*</span>
            </label>
            <input
              id="eventDate"
              name="eventDate"
              type="date"
              required
              defaultValue={booking.eventDate}
              className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label htmlFor="location" className="block text-2xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Location
          </label>
          <input
            id="location"
            name="location"
            defaultValue={booking.location}
            className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="feeInput" className="block text-2xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Total fee (RM) <span className="text-rose-400">*</span>
            </label>
            <input
              id="feeInput"
              name="feeInput"
              required
              defaultValue={booking.feeDisplay}
              className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
          <div>
            <label htmlFor="depositInput" className="block text-2xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Deposit (RM)
            </label>
            <input
              id="depositInput"
              name="depositInput"
              defaultValue={booking.depositDisplay}
              className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="status" className="block text-2xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Booking status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={booking.status}
              className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
            >
              {BOOKING_STATUS_VALUES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="deliveryStatus" className="block text-2xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Delivery status
            </label>
            <select
              id="deliveryStatus"
              name="deliveryStatus"
              defaultValue={booking.deliveryStatus}
              className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
            >
              {DELIVERY_STATUS_VALUES.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, " ").charAt(0) + s.replace(/_/g, " ").slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="block text-2xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            defaultValue={booking.notes}
            className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white resize-none focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="btn-primary px-4 py-2 text-xs font-bold rounded-lg shadow-sm disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Update booking"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
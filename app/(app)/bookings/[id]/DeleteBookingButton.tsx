"use client";

import { useState, useTransition } from "react";
import { deleteBookingAction } from "../actions";

export default function DeleteBookingButton({ bookingId }: { bookingId: string }) {
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  function handleDelete() {
    startTransition(async () => {
      await deleteBookingAction(bookingId);
    });
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-rose-400 font-semibold">Delete booking?</span>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="px-3 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-500 transition-colors disabled:opacity-50 shadow-sm"
        >
          {isPending ? "Deleting..." : "Yes, delete"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="px-3.5 py-1.5 bg-[#131C2E] border border-slate-700 text-rose-400 hover:bg-rose-500/15 text-xs font-semibold rounded-lg transition-colors shadow-sm"
    >
      Delete
    </button>
  );
}
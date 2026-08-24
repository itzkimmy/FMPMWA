"use client";

import { useState, useTransition } from "react";
import { deleteBookingAction } from "../actions";

export default function DeleteBookingButton({ bookingId }: { bookingId: string }) {
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteBookingAction(bookingId);
      if (!result?.ok) {
        // deleteBookingAction redirects on success
      }
    });
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-studio-clay">Delete?</span>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="px-3 py-2 bg-studio-clay text-white text-sm font-medium rounded-lg hover:bg-studio-clay-dim transition-colors disabled:opacity-50"
        >
          {isPending ? "Deleting…" : "Yes, delete"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-3 py-2 bg-studio-panel border border-studio-border text-studio-text-muted text-sm rounded-lg hover:text-studio-text transition-all"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="px-3 py-2 bg-studio-panel border border-studio-border text-studio-clay text-sm font-medium rounded-lg hover:bg-studio-clay-subtle transition-all"
    >
      Delete
    </button>
  );
}

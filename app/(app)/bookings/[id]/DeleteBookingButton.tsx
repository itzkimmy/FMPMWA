"use client";

import { useState, useTransition } from "react";
import { deleteBookingAction } from "../actions";

export default function DeleteBookingButton({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="px-3 py-1.5 bg-slate-800 hover:bg-rose-500/15 border border-slate-700 hover:border-rose-500/30 text-slate-300 hover:text-rose-300 text-xs font-medium rounded-lg transition-colors"
      >
        Delete
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => {
          startTransition(async () => {
            await deleteBookingAction(id);
          });
        }}
        disabled={isPending}
        className="px-3 py-1.5 bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold rounded-lg hover:bg-rose-500/25 transition-colors disabled:opacity-50"
      >
        {isPending ? "Deleting..." : "Confirm delete"}
      </button>
      <button
        onClick={() => setConfirming(false)}
        className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs font-medium rounded-lg hover:bg-slate-700 transition-colors"
      >
        Cancel
      </button>
    </div>
  );
}
"use client";

import { useState, useTransition } from "react";
import { deleteClientAction } from "../actions";

export default function DeleteClientButton({ clientId }: { clientId: string }) {
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteClientAction(clientId);
      if (!result.ok) {
        setError(result.error);
        setConfirming(false);
      }
    });
  }

  if (error) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-studio-clay">{error}</span>
        <button onClick={() => setError(null)} className="text-xs text-studio-text-muted hover:text-studio-text">Dismiss</button>
      </div>
    );
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-studio-clay">Delete client?</span>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="px-3 py-2 bg-studio-clay text-white text-sm font-medium rounded-lg hover:bg-studio-clay-dim transition-colors disabled:opacity-50"
        >
          {isPending ? "Deleting…" : "Yes, delete"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-3 py-2 bg-studio-panel border border-studio-border text-studio-text-muted text-sm rounded-lg"
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

"use client";

import { useState, useTransition, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { TRANSACTION_CATEGORIES } from "@/lib/validation";

interface AddTransactionInlineProps {
  bookingId: string;
}

export default function AddTransactionInline({ bookingId }: AddTransactionInlineProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          type: formData.get("type"),
          amountInput: formData.get("amountInput"),
          category: formData.get("category"),
          description: formData.get("description"),
          date: formData.get("date"),
        }),
      });
      const data = await res.json() as { ok: boolean; error?: string };
      if (data.ok) {
        setOpen(false);
        router.refresh();
      } else {
        setError(data.error ?? "Failed to add transaction");
      }
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-xs text-studio-text-muted hover:text-studio-amber transition-colors"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Add transaction
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 animate-slide-up">
      {error && (
        <p className="text-xs text-studio-clay">{error}</p>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <select
          name="type"
          defaultValue="INCOME"
          className="bg-studio-bg border border-studio-border rounded-lg px-3 py-2 text-sm text-studio-text"
        >
          <option value="INCOME">Income</option>
          <option value="EXPENSE">Expense</option>
        </select>
        <input
          name="amountInput"
          required
          placeholder="Amount (RM)"
          className="bg-studio-bg border border-studio-border rounded-lg px-3 py-2 text-sm text-studio-text font-mono"
        />
        <input
          name="description"
          required
          placeholder="Description"
          className="bg-studio-bg border border-studio-border rounded-lg px-3 py-2 text-sm text-studio-text sm:col-span-2"
        />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <input
          name="date"
          type="date"
          required
          defaultValue={new Date().toLocaleDateString("en-CA")}
          className="bg-studio-bg border border-studio-border rounded-lg px-3 py-2 text-sm text-studio-text font-mono"
        />
        <select
          name="category"
          className="bg-studio-bg border border-studio-border rounded-lg px-3 py-2 text-sm text-studio-text"
        >
          <option value="">Category (optional)</option>
          {TRANSACTION_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 bg-studio-amber text-studio-bg text-xs font-semibold rounded-lg py-2 hover:bg-studio-amber-dim transition-colors disabled:opacity-50"
          >
            {isPending ? "Saving…" : "Add"}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-3 py-2 bg-studio-panel border border-studio-border text-studio-text-muted text-xs rounded-lg hover:text-studio-text transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}

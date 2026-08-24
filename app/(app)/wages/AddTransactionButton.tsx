"use client";

import { useState, useTransition, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { TRANSACTION_CATEGORIES } from "@/lib/validation";

export default function AddTransactionButton() {
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
        body: JSON.stringify(Object.fromEntries(formData.entries())),
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

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-studio-amber text-studio-bg text-sm font-semibold rounded-lg hover:bg-studio-amber-dim transition-colors"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Add transaction
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-lg mx-auto bg-studio-panel border border-studio-border rounded-xl shadow-panel-lg p-6 animate-slide-up">
            <h3 className="font-header text-sm font-semibold text-studio-text mb-5">Add transaction</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <p className="text-sm text-studio-clay">{error}</p>}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-studio-text-muted mb-1.5">Type</label>
                  <select name="type" defaultValue="INCOME" className="w-full bg-studio-bg border border-studio-border rounded-lg px-3 py-2.5 text-sm text-studio-text">
                    <option value="INCOME">Income</option>
                    <option value="EXPENSE">Expense</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-studio-text-muted mb-1.5">Amount (RM)</label>
                  <input name="amountInput" required placeholder="0.00" className="w-full bg-studio-bg border border-studio-border rounded-lg px-3 py-2.5 text-sm text-studio-text font-mono" />
                </div>
              </div>

              <div>
                <label className="block text-xs text-studio-text-muted mb-1.5">Description</label>
                <input name="description" required className="w-full bg-studio-bg border border-studio-border rounded-lg px-3 py-2.5 text-sm text-studio-text" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-studio-text-muted mb-1.5">Category</label>
                  <select name="category" className="w-full bg-studio-bg border border-studio-border rounded-lg px-3 py-2.5 text-sm text-studio-text">
                    <option value="">None</option>
                    {TRANSACTION_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-studio-text-muted mb-1.5">Date</label>
                  <input name="date" type="date" required defaultValue={new Date().toLocaleDateString("en-CA")} className="w-full bg-studio-bg border border-studio-border rounded-lg px-3 py-2.5 text-sm text-studio-text font-mono" />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={isPending} className="flex-1 bg-studio-amber text-studio-bg text-sm font-semibold py-2.5 rounded-lg hover:bg-studio-amber-dim transition-colors disabled:opacity-50">
                  {isPending ? "Saving…" : "Add"}
                </button>
                <button type="button" onClick={() => setOpen(false)} className="px-4 py-2.5 bg-studio-bg border border-studio-border text-studio-text-muted text-sm rounded-lg hover:text-studio-text transition-all">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </>
  );
}

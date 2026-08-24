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
      const data = (await res.json()) as { ok: boolean; error?: string };
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
        className="btn-primary flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg shadow-sm"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="w-3.5 h-3.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Add transaction
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-md mx-auto bg-[#131C2E] border border-slate-700 rounded-xl shadow-2xl p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h3 className="font-header text-sm font-bold text-white">Add Transaction</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-2.5 bg-rose-500/15 border border-rose-500/30 rounded-lg text-xs text-rose-300 font-medium">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-2xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Type</label>
                  <select name="type" defaultValue="INCOME" className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white">
                    <option value="INCOME">Income</option>
                    <option value="EXPENSE">Expense</option>
                  </select>
                </div>
                <div>
                  <label className="block text-2xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Amount (RM)</label>
                  <input name="amountInput" required placeholder="0.00" className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono" />
                </div>
              </div>

              <div>
                <label className="block text-2xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Description</label>
                <input name="description" required placeholder="e.g. Studio deposit, Film roll..." className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-2xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Category</label>
                  <select name="category" className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white">
                    <option value="">None</option>
                    {TRANSACTION_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-2xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Date</label>
                  <input name="date" type="date" required defaultValue={new Date().toLocaleDateString("en-CA")} className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono" />
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button type="submit" disabled={isPending} className="flex-1 btn-primary text-xs font-bold py-2 rounded-lg disabled:opacity-50">
                  {isPending ? "Saving..." : "Add Transaction"}
                </button>
                <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors">
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
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TRANSACTION_CATEGORIES } from "@/lib/validation";

export default function AddTransactionInline({ bookingId, clientName }: { bookingId: string; clientName: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const body = {
      bookingId,
      type: formData.get("type") as string,
      amountInput: formData.get("amountInput") as string,
      category: formData.get("category") as string,
      description: formData.get("description") as string,
      date: formData.get("date") as string,
    };

    startTransition(async () => {
      try {
        const res = await fetch("/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          setError(data.error || "Failed to save transaction");
        } else {
          setOpen(false);
          router.refresh();
        }
      } catch {
        setError("Network error");
      }
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full bg-[#131C2E] border border-dashed border-slate-700 rounded-xl p-4 text-xs text-slate-400 hover:text-amber-400 hover:border-amber-500/30 transition-colors font-medium flex items-center justify-center gap-2"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Record a payment
      </button>
    );
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="bg-[#131C2E] border border-slate-800 rounded-xl p-5 shadow-md space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-white">Record Payment</h3>
        <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white text-xs">✕</button>
      </div>

      {error && (
        <div className="px-3 py-2 bg-rose-500/15 border border-rose-500/30 rounded-lg text-xs text-rose-300 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
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

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-2xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Category</label>
            <select name="category" defaultValue="Booking payment" className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white">
              {TRANSACTION_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-2xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Date</label>
            <input name="date" type="date" defaultValue={today} required className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono" />
          </div>
        </div>

        <div>
          <label className="block text-2xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Description</label>
          <input name="description" required defaultValue={`Payment from ${clientName}`} className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white" />
        </div>

        <button type="submit" disabled={isPending} className="btn-primary px-4 py-2 text-xs font-bold rounded-lg disabled:opacity-50 w-full">
          {isPending ? "Saving..." : "Save Transaction"}
        </button>
      </form>
    </div>
  );
}
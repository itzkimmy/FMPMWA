"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { resetAllDataAction } from "./actions";

export default function ResetDataSection() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleReset() {
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const result = await resetAllDataAction();
      if (!result.ok) {
        setError(result.error);
        setConfirming(false);
      } else {
        setSuccess(true);
        setConfirming(false);
        router.refresh();
        setTimeout(() => setSuccess(false), 5000);
      }
    });
  }

  return (
    <div className="bg-[#131C2E] border border-rose-500/20 rounded-xl p-5 shadow-md space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="font-header text-2xs font-semibold text-rose-300 uppercase tracking-wider">
          Danger Zone
        </h2>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed">
        Reset your studio data to a completely fresh slate. This will permanently delete all bookings, clients, and transaction records. Your studio preferences will be kept.
      </p>

      {success && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 font-medium flex items-center gap-1.5 animate-fade-in">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-emerald-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          <span>All studio data has been successfully reset!</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-xs text-rose-300 font-medium flex items-center gap-1.5 animate-fade-in">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-rose-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {!confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
          <span>Reset All Studio Data</span>
        </button>
      ) : (
        <div className="p-4 bg-rose-950/40 border border-rose-500/40 rounded-xl space-y-3 animate-fade-in">
          <p className="text-xs font-semibold text-rose-200">
            ⚠️ Are you sure you want to delete all bookings, clients, and financial logs?
          </p>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              disabled={isPending}
              onClick={handleReset}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              {isPending ? "Resetting database..." : "Yes, Permanently Delete All Data"}
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => setConfirming(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
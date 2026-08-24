"use client";

import { useState, useTransition } from "react";
import { saveSettings } from "./actions";

interface Props {
  settings: Record<string, string>;
}

export default function SettingsForm({ settings }: Props) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currency, setCurrency] = useState(settings.currency ?? "MYR");
  const [depositPercent, setDepositPercent] = useState(
    settings.defaultDepositPercent ?? "30"
  );
  const [defaultDueDays, setDefaultDueDays] = useState(
    settings.defaultDueDays ?? "14"
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    startTransition(async () => {
      try {
        await saveSettings({
          currency,
          defaultDepositPercent: depositPercent,
          defaultDueDays,
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to save settings");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {saved && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 font-medium flex items-center gap-1.5 animate-fade-in">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-emerald-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          <span>Settings saved successfully</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-xs text-rose-300 font-medium animate-fade-in flex items-center gap-1.5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 flex-shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className="bg-[#131C2E] border border-slate-800 rounded-xl p-5 shadow-md space-y-4">
        <h2 className="font-header text-2xs font-semibold text-slate-400 uppercase tracking-wider">
          Studio Preferences
        </h2>

        <div>
          <label className="block text-2xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Display Currency
          </label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
          >
            <option value="MYR">MYR — Malaysian Ringgit (RM)</option>
            <option value="PHP">PHP — Philippine Peso (₱)</option>
            <option value="USD">USD — US Dollar ($)</option>
            <option value="SGD">SGD — Singapore Dollar (S$)</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-2xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Default Deposit %
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={depositPercent}
              onChange={(e) => setDepositPercent(e.target.value)}
              className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-2xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Invoice Due (Days)
            </label>
            <input
              type="number"
              min="1"
              max="90"
              value={defaultDueDays}
              onChange={(e) => setDefaultDueDays(e.target.value)}
              className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="btn-primary px-4 py-2 text-xs font-bold rounded-lg transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isPending ? "Saving changes..." : "Save Preferences"}
          </button>
        </div>
      </div>
    </form>
  );
}
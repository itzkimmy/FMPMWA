"use client";

import { useState, useTransition, FormEvent } from "react";
import { useRouter } from "next/navigation";

interface SettingsFormProps {
  settings: Record<string, string>;
}

export default function SettingsForm({ settings }: SettingsFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(formData.entries())),
      });
      const data = await res.json() as { ok: boolean; error?: string };
      if (data.ok) {
        setSaved(true);
        router.refresh();
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(data.error ?? "Failed to save");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="bg-studio-panel border border-studio-border rounded-xl p-5 space-y-5">
      <h2 className="font-header text-xs font-semibold text-studio-text-muted uppercase tracking-wider">
        Studio profile
      </h2>

      {error && <p className="text-sm text-studio-clay">{error}</p>}
      {saved && <p className="text-sm text-studio-sage">Settings saved ✓</p>}

      <div>
        <label htmlFor="studioName" className="block text-xs font-medium text-studio-text-muted mb-1.5">Studio / Business name</label>
        <input
          id="studioName"
          name="studioName"
          defaultValue={settings.studioName ?? ""}
          placeholder="e.g. Maria Santos Photography"
          className="w-full bg-studio-bg border border-studio-border rounded-lg px-3 py-2.5 text-sm text-studio-text"
        />
      </div>

      <div>
        <label htmlFor="ownerName" className="block text-xs font-medium text-studio-text-muted mb-1.5">Your name</label>
        <input
          id="ownerName"
          name="ownerName"
          defaultValue={settings.ownerName ?? ""}
          placeholder="e.g. Maria"
          className="w-full bg-studio-bg border border-studio-border rounded-lg px-3 py-2.5 text-sm text-studio-text"
        />
      </div>

      <div>
        <label htmlFor="defaultDepositPct" className="block text-xs font-medium text-studio-text-muted mb-1.5">
          Default deposit % <span className="text-studio-text-faint">(for booking proposals)</span>
        </label>
        <input
          id="defaultDepositPct"
          name="defaultDepositPct"
          type="number"
          min="0"
          max="100"
          defaultValue={settings.defaultDepositPct ?? "30"}
          className="w-full bg-studio-bg border border-studio-border rounded-lg px-3 py-2.5 text-sm text-studio-text font-mono"
        />
      </div>

      <div>
        <label htmlFor="paymentTermDays" className="block text-xs font-medium text-studio-text-muted mb-1.5">
          Payment term (days after shoot)
        </label>
        <input
          id="paymentTermDays"
          name="paymentTermDays"
          type="number"
          min="0"
          max="90"
          defaultValue={settings.paymentTermDays ?? "7"}
          className="w-full bg-studio-bg border border-studio-border rounded-lg px-3 py-2.5 text-sm text-studio-text font-mono"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="px-5 py-2.5 bg-studio-amber text-studio-bg text-sm font-semibold rounded-lg hover:bg-studio-amber-dim transition-colors disabled:opacity-50"
      >
        {isPending ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}

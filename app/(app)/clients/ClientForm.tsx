"use client";

import { useState, useTransition, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClientAction, updateClientAction } from "./actions";
import type { Client } from "@prisma/client";

interface ClientFormProps {
  client?: Client;
}

export default function ClientForm({ client }: ClientFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const isEdit = !!client;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = isEdit
        ? await updateClientAction(client.id, formData)
        : await createClientAction(formData);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="px-4 py-3 bg-studio-clay-subtle border border-studio-clay/30 rounded-lg text-sm text-studio-clay">
          {error}
        </div>
      )}

      <div className="bg-studio-panel border border-studio-border rounded-xl p-6 space-y-5">
        <div>
          <label htmlFor="name" className="block text-xs font-medium text-studio-text-muted mb-1.5">
            Full name <span className="text-studio-clay">*</span>
          </label>
          <input
            id="name"
            name="name"
            required
            defaultValue={client?.name ?? ""}
            placeholder="e.g. Maria Santos"
            className="w-full bg-studio-bg border border-studio-border rounded-lg px-3 py-2.5 text-sm text-studio-text"
          />
        </div>

        <div>
          <label htmlFor="contact" className="block text-xs font-medium text-studio-text-muted mb-1.5">
            Contact (phone / email / social)
          </label>
          <input
            id="contact"
            name="contact"
            defaultValue={client?.contact ?? ""}
            placeholder="e.g. +63 912 345 6789 or @instagram"
            className="w-full bg-studio-bg border border-studio-border rounded-lg px-3 py-2.5 text-sm text-studio-text"
          />
        </div>

        <div>
          <label htmlFor="source" className="block text-xs font-medium text-studio-text-muted mb-1.5">
            How they found you
          </label>
          <input
            id="source"
            name="source"
            list="source-list"
            defaultValue={client?.source ?? ""}
            placeholder="e.g. Instagram, Referral"
            className="w-full bg-studio-bg border border-studio-border rounded-lg px-3 py-2.5 text-sm text-studio-text"
          />
          <datalist id="source-list">
            {["Instagram", "Referral", "Facebook", "Word of mouth", "Repeat client", "Google", "Other"].map(
              (s) => <option key={s} value={s} />
            )}
          </datalist>
        </div>

        <div>
          <label htmlFor="notes" className="block text-xs font-medium text-studio-text-muted mb-1.5">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            defaultValue={client?.notes ?? ""}
            placeholder="Preferences, personality notes, special requirements…"
            className="w-full bg-studio-bg border border-studio-border rounded-lg px-3 py-2.5 text-sm text-studio-text resize-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2.5 bg-studio-amber text-studio-bg text-sm font-semibold rounded-lg hover:bg-studio-amber-dim transition-colors disabled:opacity-50"
        >
          {isPending ? "Saving…" : isEdit ? "Save changes" : "Create client"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 bg-studio-panel border border-studio-border text-studio-text-muted text-sm font-medium rounded-lg hover:text-studio-text hover:bg-studio-panel-hover transition-all"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

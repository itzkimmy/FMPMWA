"use client";

import { useState, useTransition, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClientAction, updateClientAction } from "./actions";
import type { Client } from "@prisma/client";

interface ClientFormProps {
  client?: Client;
  mode?: "create" | "edit";
  clientId?: string;
  defaultValues?: {
    name: string;
    contact: string;
    source: string;
    notes: string;
  };
}

export default function ClientForm({ client, mode, clientId, defaultValues }: ClientFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const isEdit = mode === "edit" || !!client;
  const editId = clientId || client?.id;

  const defaults = defaultValues || {
    name: client?.name ?? "",
    contact: client?.contact ?? "",
    source: client?.source ?? "",
    notes: client?.notes ?? "",
  };

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = isEdit && editId
        ? await updateClientAction(editId, formData)
        : await createClientAction(formData);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl pb-10">
      {error && (
        <div className="px-4 py-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-xs text-rose-300 font-medium">
          {error}
        </div>
      )}

      <div className="bg-[#131C2E] border border-slate-800 rounded-xl p-6 space-y-4 shadow-md">
        <div>
          <label htmlFor="name" className="block text-2xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Full name <span className="text-rose-400">*</span>
          </label>
          <input
            id="name"
            name="name"
            required
            defaultValue={defaults.name}
            placeholder="e.g. Maya Abdullah"
            className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
          />
        </div>

        <div>
          <label htmlFor="contact" className="block text-2xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Contact (phone / email / Instagram)
          </label>
          <input
            id="contact"
            name="contact"
            defaultValue={defaults.contact}
            placeholder="e.g. +60 12-345 6789 or @studio.client"
            className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
          />
        </div>

        <div>
          <label htmlFor="source" className="block text-2xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Referral Source
          </label>
          <input
            id="source"
            name="source"
            list="source-list"
            defaultValue={defaults.source}
            placeholder="e.g. Instagram, Word of mouth, Referral"
            className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
          />
          <datalist id="source-list">
            {["Instagram", "Referral", "Facebook", "Word of mouth", "Repeat client", "Google", "Other"].map(
              (s) => <option key={s} value={s} />
            )}
          </datalist>
        </div>

        <div>
          <label htmlFor="notes" className="block text-2xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Client Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            defaultValue={defaults.notes}
            placeholder="Preferences, shoot style, special requests..."
            className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white resize-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="btn-primary px-4 py-2 text-xs font-bold rounded-lg shadow-sm disabled:opacity-50"
        >
          {isPending ? "Saving..." : isEdit ? "Save changes" : "Create client"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
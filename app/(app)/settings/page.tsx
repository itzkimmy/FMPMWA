export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import SettingsForm from "./SettingsForm";
import { logout } from "@/lib/session";

async function getSettings(): Promise<Record<string, string>> {
  const rows = await db.settings.findMany();
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div className="max-w-xl space-y-6 animate-fade-in pb-10">
      <div>
        <h1 className="font-header text-xl font-bold text-white tracking-tight">
          Settings & Preferences
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          FlowMotion studio defaults, deposit rules, and authentication
        </p>
      </div>

      <SettingsForm settings={settings} />

      <div className="bg-[#131C2E] border border-slate-800 rounded-xl p-5 shadow-md space-y-3">
        <h2 className="font-header text-2xs font-semibold text-slate-400 uppercase tracking-wider">
          Authentication & Access
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          FlowMotion uses a single secure shared passphrase to protect your studio database. Change it by updating{" "}
          <code className="font-mono text-2xs bg-[#0F172A] border border-slate-700 px-1.5 py-0.5 rounded text-amber-400">
            AUTH_PASSPHRASE
          </code>{" "}
          or running <code className="font-mono text-2xs bg-[#0F172A] border border-slate-700 px-1.5 py-0.5 rounded text-amber-400">scripts/hash-passphrase.mjs</code>.
        </p>
        <form
          action={async () => {
            "use server";
            await logout();
          }}
        >
          <button
            type="submit"
            className="px-3.5 py-2 bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-500/25 text-xs font-semibold rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            <span>Sign Out of Studio</span>
          </button>
        </form>
      </div>

      <div className="bg-[#131C2E] border border-slate-800 rounded-xl p-5 shadow-md">
        <h2 className="font-header text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          About FlowMotion
        </h2>
        <dl className="space-y-2.5 text-xs">
          <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
            <dt className="text-slate-400">Application</dt>
            <dd className="text-white font-mono font-medium">FlowMotion Suite</dd>
          </div>
          <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
            <dt className="text-slate-400">Currency System</dt>
            <dd className="text-amber-400 font-mono font-medium">Malaysian Ringgit (RM / MYR)</dd>
          </div>
          <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
            <dt className="text-slate-400">Version</dt>
            <dd className="text-white font-mono">1.0.0 (Production)</dd>
          </div>
          <div className="flex justify-between items-center py-1.5">
            <dt className="text-slate-400">Database Engine</dt>
            <dd className="text-white font-mono">SQLite (Prisma ORM)</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
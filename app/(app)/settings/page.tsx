export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import SettingsForm from "./SettingsForm";

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
          Settings
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Studio defaults and preferences
        </p>
      </div>

      <SettingsForm settings={settings} />

      <div className="bg-[#131C2E] border border-slate-800 rounded-xl p-5 shadow-md space-y-3">
        <h2 className="font-header text-2xs font-semibold text-slate-400 uppercase tracking-wider">
          Authentication
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          FlowMotion uses a shared passphrase to protect your studio data. Change it by updating{" "}
          <code className="font-mono text-2xs bg-[#0F172A] border border-slate-700 px-1.5 py-0.5 rounded text-amber-400">
            AUTH_PASSPHRASE
          </code>{" "}
          in your environment variables.
        </p>
      </div>
    </div>
  );
}
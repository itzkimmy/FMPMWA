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
    <div className="max-w-xl space-y-6 animate-fade-in">
      <div>
        <h1 className="font-header text-xl font-semibold text-studio-text">Settings</h1>
        <p className="text-sm text-studio-text-muted mt-0.5">Personal studio configuration</p>
      </div>

      <SettingsForm settings={settings} />

      {/* Auth section */}
      <div className="bg-studio-panel border border-studio-border rounded-xl p-5">
        <h2 className="font-header text-xs font-semibold text-studio-text-muted uppercase tracking-wider mb-3">
          Authentication
        </h2>
        <p className="text-sm text-studio-text-muted mb-4">
          StudioLedger uses a single shared passphrase to protect your data. Change it by updating{" "}
          <code className="font-mono text-xs bg-studio-bg border border-studio-border px-1.5 py-0.5 rounded">AUTH_PASSPHRASE</code>{" "}
          in your <code className="font-mono text-xs bg-studio-bg border border-studio-border px-1.5 py-0.5 rounded">.env.local</code>.
        </p>
        <form action={async () => {
          "use server";
          await logout();
        }}>
          <button
            type="submit"
            className="px-4 py-2 bg-studio-panel border border-studio-border text-studio-clay text-sm font-medium rounded-lg hover:bg-studio-clay-subtle transition-all"
          >
            Sign out
          </button>
        </form>
      </div>

      {/* About */}
      <div className="bg-studio-panel border border-studio-border rounded-xl p-5">
        <h2 className="font-header text-xs font-semibold text-studio-text-muted uppercase tracking-wider mb-3">About</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-studio-text-muted">App</dt>
            <dd className="text-studio-text font-mono">StudioLedger</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-studio-text-muted">Version</dt>
            <dd className="text-studio-text font-mono">0.1.0</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-studio-text-muted">Database</dt>
            <dd className="text-studio-text font-mono">SQLite via Prisma</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

/**
 * Login page — single shared passphrase gate.
 * Per AGENTS.md: personal use does not mean no protection.
 */
export default function LoginPage() {
  const router = useRouter();
  const [passphrase, setPassphrase] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passphrase }),
      });
      const data = await res.json() as { ok: boolean; error?: string };

      if (data.ok) {
        router.push("/");
        router.refresh();
      } else {
        setError(data.error ?? "Login failed");
      }
    } catch {
      setError("Network error — check your connection");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-studio-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-slide-up">
        {/* Logo / brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-studio-amber-subtle border border-studio-amber/20 mb-4">
            <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-studio-amber" stroke="currentColor" strokeWidth={1.5}>
              <path d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="font-header text-xl font-semibold text-studio-text">
            StudioLedger
          </h1>
          <p className="text-sm text-studio-text-muted mt-1">
            Your private studio manager
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-studio-panel border border-studio-border rounded-xl p-6 shadow-panel-lg">
          <div className="mb-5">
            <label htmlFor="passphrase" className="block text-xs font-medium text-studio-text-muted uppercase tracking-wider mb-2">
              Passphrase
            </label>
            <input
              id="passphrase"
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder="Enter your passphrase"
              autoComplete="current-password"
              autoFocus
              disabled={loading}
              className="w-full bg-studio-bg border border-studio-border rounded-lg px-3 py-2.5 text-sm text-studio-text placeholder:text-studio-text-faint focus:outline-none focus:border-studio-amber focus:ring-2 focus:ring-studio-amber/10 transition-all"
            />
          </div>

          {error && (
            <div className="mb-4 px-3 py-2.5 bg-studio-clay-subtle border border-studio-clay/30 rounded-lg text-sm text-studio-clay animate-fade-in">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !passphrase}
            className="w-full bg-studio-amber text-studio-bg font-semibold text-sm py-2.5 rounded-lg hover:bg-studio-amber-dim transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-center text-xs text-studio-text-faint mt-4">
          Private — not a public service
        </p>
      </div>
    </div>
  );
}

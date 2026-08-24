"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [passphrase, setPassphrase] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      const data = (await res.json()) as { ok: boolean; error?: string };

      if (data.ok) {
        router.push("/");
        router.refresh();
      } else {
        setError(data.error ?? "Invalid passphrase");
      }
    } catch {
      setError("Network error — please check your connection");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 mb-3.5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m9-9H3m14.5 6.5l-13-13m13 0l-13 13" />
            </svg>
          </div>
          <h1 className="font-header text-xl font-bold text-white tracking-tight">
            FlowMotion
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">
            Personal Studio & Shoot Management
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[#131C2E] rounded-2xl p-6 border border-slate-800 shadow-2xl space-y-4"
        >
          <div>
            <label
              htmlFor="passphrase"
              className="block text-2xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
            >
              Studio Passphrase
            </label>
            <div className="relative">
              <input
                id="passphrase"
                type={showPassword ? "text" : "password"}
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="Enter studio passphrase"
                autoComplete="current-password"
                autoFocus
                disabled={loading}
                className="w-full pr-10 bg-[#0F172A] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 transition-colors text-xs"
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-xs text-rose-300 animate-fade-in flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 flex-shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !passphrase}
            className="w-full btn-primary py-2.5 px-4 text-xs font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Unlock Studio</span>
            )}
          </button>
        </form>

        <p className="text-center text-2xs text-slate-500 mt-5 font-mono">
          FlowMotion Private Studio Suite · Authorized Access Only
        </p>
      </div>
    </div>
  );
}
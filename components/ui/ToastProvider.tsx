"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface Toast {
  id: string;
  message: string;
  type?: "success" | "info" | "error";
}

interface ToastContextValue {
  showToast: (message: string, type?: "success" | "info" | "error") => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: "success" | "info" | "error" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-lg bg-white text-xs font-medium animate-slide-up transition-all ${
              toast.type === "success"
                ? "border-emerald-200 text-slate-900"
                : toast.type === "error"
                ? "border-rose-200 text-slate-900"
                : "border-slate-200 text-slate-900"
            }`}
          >
            {toast.type === "success" ? (
              <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center flex-shrink-0 text-emerald-600">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3 h-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
            ) : toast.type === "error" ? (
              <div className="w-5 h-5 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center flex-shrink-0 text-rose-600">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3 h-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 text-slate-700">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3 h-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
            )}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
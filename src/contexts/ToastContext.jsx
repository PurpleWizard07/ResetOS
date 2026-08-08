"use client";
import React, { createContext, useCallback, useContext, useState } from "react";
import { Toast } from "@/ui/primitives";

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const notify = useCallback((msg, kind = "info") => {
    setToast({ msg, kind, key: Date.now() });
  }, []);

  const notifyError = useCallback(
    (fallback, error) => {
      // Supabase errors carry a human-readable .message; anything else falls
      // back to a fixed string rather than printing "[object Object]".
      const detail = error?.message || (typeof error === "string" ? error : "");
      notify(detail ? `${fallback}: ${detail}` : fallback, "error");
    },
    [notify]
  );

  const dismiss = useCallback(() => setToast(null), []);

  return (
    <ToastCtx.Provider value={{ notify, notifyError }}>
      {children}
      <Toast toast={toast} onDismiss={dismiss} />
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

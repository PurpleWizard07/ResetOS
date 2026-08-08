"use client";
import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import { ToastStack } from "@/ui/primitives";

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const notify = useCallback((msg, kind = "info") => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, msg, kind }]);
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

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastCtx.Provider value={{ notify, notifyError }}>
      {children}
      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

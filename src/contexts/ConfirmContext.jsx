"use client";
import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import { Modal, Btn } from "@/ui/primitives";

const ConfirmCtx = createContext(null);

/**
 * Promise-based replacement for window.confirm(). Native confirm() blocks the
 * main thread and is unstyleable; this renders the app's own Modal and
 * resolves true/false when the user answers.
 */
export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null); // { message, confirmLabel, danger }
  const resolver = useRef(null);

  const confirm = useCallback((message, opts = {}) => {
    return new Promise((resolve) => {
      // A prior confirm() that hasn't been answered yet would otherwise be
      // silently clobbered (its promise never resolving) — settle it as
      // cancelled first so it never leaks.
      if (resolver.current) resolver.current(false);
      resolver.current = resolve;
      setState({
        message,
        confirmLabel: opts.confirmLabel || "Confirm",
        danger: opts.danger !== false,
      });
    });
  }, []);

  const settle = useCallback((result) => {
    resolver.current?.(result);
    resolver.current = null;
    setState(null);
  }, []);

  return (
    <ConfirmCtx.Provider value={confirm}>
      {children}
      {state && (
        <Modal title="Please confirm" onClose={() => settle(false)}>
          <div style={{ display: "grid", gap: "16px" }}>
            <div style={{ fontSize: "13px", lineHeight: 1.6 }}>{state.message}</div>
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <Btn variant="ghost" onClick={() => settle(false)}>
                Cancel
              </Btn>
              <Btn variant={state.danger ? "danger" : "primary"} onClick={() => settle(true)}>
                {state.confirmLabel}
              </Btn>
            </div>
          </div>
        </Modal>
      )}
    </ConfirmCtx.Provider>
  );
}

/** Returns an async confirm(message, opts) => Promise<boolean>. */
export function useConfirm() {
  const ctx = useContext(ConfirmCtx);
  if (!ctx) throw new Error("useConfirm must be used within a ConfirmProvider");
  return ctx;
}

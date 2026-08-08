"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { C } from "@/ui/theme";
import { Btn, Field, Input } from "@/ui/primitives";

export default function Login() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          // Use wherever the app is actually running (localhost in dev, the
          // real domain once deployed) instead of a hardcoded localhost URL
          // that would strand a deployed user's magic link.
          emailRedirectTo:
            typeof window !== "undefined" ? window.location.origin : undefined,
        },
      });
      if (error) throw error;
      setMessage("Check your email for the magic link.");
      setEmail("");
    } catch (error) {
      setIsError(true);
      setMessage(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        fontFamily: "var(--font-plus-jakarta), -apple-system, system-ui, sans-serif",
        background: C.bg,
        color: C.text,
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: C.surf,
          border: `1px solid ${C.bord}`,
          borderRadius: "16px",
          padding: "40px",
          width: "100%",
          maxWidth: "420px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "32px",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              background: C.acc,
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              color: "#fff",
              fontSize: "20px",
            }}
          >
            L
          </div>
          <span style={{ fontWeight: 800, fontSize: "24px", letterSpacing: "-0.03em" }}>
            LifeOS
          </span>
        </div>

        <h1 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px", textAlign: "center" }}>
          Welcome back
        </h1>
        <p style={{ color: C.mut, fontSize: "14px", marginBottom: "28px", textAlign: "center" }}>
          Sign in with your email to continue
        </p>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "16px" }}>
            <Field label="Email address" htmlFor="login-email">
              <Input
                id="login-email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="you@example.com"
                disabled={loading}
              />
            </Field>
          </div>

          <Btn type="submit" full disabled={loading || !email.trim()}>
            {loading ? "Sending…" : "Send magic link"}
          </Btn>
        </form>

        {message && (
          <div
            role="status"
            style={{
              marginTop: "20px",
              padding: "12px 16px",
              background: isError ? C.danBg : C.accBg,
              border: `1px solid ${isError ? "rgba(255,94,94,0.3)" : C.accBord}`,
              borderRadius: "10px",
              color: isError ? C.dan : C.acc,
              fontSize: "13px",
              textAlign: "center",
              lineHeight: 1.5,
            }}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

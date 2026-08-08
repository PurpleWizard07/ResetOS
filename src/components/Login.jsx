"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mail, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { C, RADIUS, SHADOW, SPRING_SOFT } from "@/ui/theme";
import { Btn, Field, Input } from "@/ui/primitives";
import { AmbientBackground } from "@/ui/AmbientBackground";

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
        color: C.text,
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <AmbientBackground />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={SPRING_SOFT}
        style={{
          position: "relative",
          zIndex: 1,
          background: C.glass,
          backdropFilter: "blur(24px)",
          border: `1px solid ${C.bord}`,
          borderRadius: RADIUS.xl,
          padding: "42px",
          width: "100%",
          maxWidth: "420px",
          boxShadow: SHADOW.lg,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "34px",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              background: C.accGrad,
              borderRadius: RADIUS.sm,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              color: C.onAccent,
              fontSize: "20px",
              boxShadow: SHADOW.glow,
            }}
          >
            L
          </div>
          <span style={{ fontFamily: "var(--font-fraunces)", fontWeight: 500, fontSize: "25px", letterSpacing: "-0.01em" }}>
            LifeOS
          </span>
        </div>

        <div
          aria-hidden="true"
          style={{
            width: "46px",
            height: "46px",
            margin: "0 auto 18px",
            borderRadius: "50%",
            background: C.accBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: C.acc,
          }}
        >
          <Mail size={20} />
        </div>

        <h1
          style={{
            fontFamily: "var(--font-fraunces)",
            fontSize: "23px",
            fontWeight: 500,
            marginBottom: "8px",
            textAlign: "center",
            color: C.text,
          }}
        >
          Welcome back
        </h1>
        <p style={{ color: C.mut, fontSize: "14px", marginBottom: "30px", textAlign: "center" }}>
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

          <Btn type="submit" full loading={loading} disabled={!email.trim()}>
            {loading ? "Sending…" : "Send magic link"}
          </Btn>
        </form>

        <AnimatePresence>
          {message && (
            <motion.div
              role="status"
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 20 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={SPRING_SOFT}
              style={{ overflow: "hidden" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  padding: "12px 16px",
                  background: isError ? C.danBg : C.accBg,
                  border: `1px solid ${isError ? "rgba(226,104,90,0.3)" : C.accBord}`,
                  borderRadius: RADIUS.md,
                  color: isError ? C.dan : C.acc,
                  fontSize: "13px",
                  lineHeight: 1.5,
                }}
              >
                <span aria-hidden="true" style={{ flexShrink: 0, display: "flex", marginTop: "1px" }}>
                  {isError ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                </span>
                <span>{message}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

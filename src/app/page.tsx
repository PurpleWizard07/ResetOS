"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Loader2 } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { C, RADIUS, SHADOW } from "@/ui/theme";
import { AmbientBackground } from "@/ui/AmbientBackground";
import LifeOS from "@/components/LifeOS";
import Login from "@/components/Login";

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // getSession() rejects on a network failure or bad Supabase config.
    // Previously that left the page stuck on "Loading…" forever, since
    // setLoading(false) only ran inside the success branch. Falling through
    // to the login screen on error at least gives the user something to
    // retry instead of a page that never resolves.
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);
      })
      .catch((error) => {
        console.error("Could not load auth session:", error);
        setSession(null);
      })
      .finally(() => setLoading(false));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "18px",
          minHeight: "100vh",
          color: C.text,
          fontFamily:
            "var(--font-plus-jakarta), -apple-system, system-ui, sans-serif",
        }}
      >
        <AmbientBackground />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            position: "relative",
            zIndex: 1,
            width: "42px",
            height: "42px",
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
        </motion.div>
        <motion.span
          aria-hidden="true"
          style={{ position: "relative", zIndex: 1, display: "inline-flex", color: C.mut }}
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 size={20} />
        </motion.span>
      </div>
    );
  }

  return session ? <LifeOS /> : <Login />;
}

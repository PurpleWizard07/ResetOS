"use client";

import { useState, useEffect } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
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
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "#09090E",
          color: "#E2E2F0",
          fontFamily:
            "var(--font-plus-jakarta), -apple-system, system-ui, sans-serif",
        }}
      >
        Loading...
      </div>
    );
  }

  return session ? <LifeOS /> : <Login />;
}

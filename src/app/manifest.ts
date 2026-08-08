import type { MetadataRoute } from "next";

/**
 * Makes the app installable ("Add to Home Screen" / desktop install prompt).
 * This is installability only — no service worker, no offline caching. Real
 * offline support for a Supabase-backed app means a local cache + sync layer
 * for every table, which is a materially bigger and riskier undertaking than
 * this; skipped deliberately rather than half-built.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LifeOS",
    short_name: "LifeOS",
    description: "Operating system for your life",
    start_url: "/",
    display: "standalone",
    background_color: "#0A0908",
    theme_color: "#0A0908",
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/icon-512", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}

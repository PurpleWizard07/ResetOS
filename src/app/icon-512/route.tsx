import { ImageResponse } from "next/og";

/** Dedicated 512x512 icon for the web app manifest (install/home-screen use) — Chrome's installability check wants an icon at this size, which icon.tsx/apple-icon.tsx don't cover. */
export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #FFC875 0%, #F0A548 55%, #E2703D 100%)",
          color: "#241C12",
          fontSize: 310,
          fontWeight: 700,
          fontFamily: "sans-serif",
        }}
      >
        L
      </div>
    ),
    { width: 512, height: 512 }
  );
}

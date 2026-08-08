import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** iOS "add to home screen" icon — same mark as icon.tsx, larger and unrounded (iOS masks its own corners). */
export default function AppleIcon() {
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
          fontSize: 110,
          fontWeight: 700,
          fontFamily: "sans-serif",
        }}
      >
        L
      </div>
    ),
    { ...size }
  );
}

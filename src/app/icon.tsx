import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Browser-tab icon — the same Ember "L" mark used everywhere else in the app. */
export default function Icon() {
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
          borderRadius: "8px",
          color: "#241C12",
          fontSize: 20,
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

import { ImageResponse } from "next/og";

import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";

export const alt = APP_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #1f9d69 0%, #0d9488 100%)",
          color: "white",
          padding: "80px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 120, marginBottom: 20 }}>📖</div>
        <div
          style={{
            fontSize: 80,
            fontWeight: 700,
            marginBottom: 30,
            lineHeight: 1.1,
          }}
        >
          {APP_NAME}
        </div>
        <div style={{ fontSize: 36, opacity: 0.95, maxWidth: 900 }}>
          {APP_DESCRIPTION}
        </div>
      </div>
    ),
    size
  );
}
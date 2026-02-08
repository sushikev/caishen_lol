"use client";

import { CSSProperties } from "react";

export default function FuSymbol({
  size = 48,
  style = {},
}: {
  size?: number;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #DC143C 0%, #A91030 100%)",
        borderRadius: 6,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: "rotate(180deg)",
        border: "2px solid #FFD700",
        boxShadow: "0 2px 8px rgba(220,20,60,0.25)",
        ...style,
      }}
    >
      <span
        style={{
          fontSize: size * 0.55,
          color: "#FFD700",
          fontWeight: 800,
          transform: "rotate(180deg)",
        }}
      >
        福
      </span>
    </div>
  );
}

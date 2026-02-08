"use client";

import { PALETTE } from "@/lib/constants";
import { formatMON } from "@/lib/game-logic";
import GoldIngot from "./GoldIngot";

export default function PoolDisplay({ pool }: { pool: number }) {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #FFF8F0 0%, #FFF0E0 100%)",
        border: `1.5px solid ${PALETTE.goldPale}`,
        borderRadius: 16,
        padding: "20px 24px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: 10, left: 14, opacity: 0.15 }}>
        <GoldIngot size={28} />
      </div>
      <div style={{ position: "absolute", top: 10, right: 14, opacity: 0.15 }}>
        <GoldIngot size={28} />
      </div>
      <div
        style={{
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: 2,
          color: PALETTE.textMuted,
          fontWeight: 600,
          marginBottom: 4,
        }}
      >
        🏮 Celestial Prize Pool 🏮
      </div>
      <div
        style={{
          fontSize: 38,
          fontWeight: 800,
          background: "linear-gradient(135deg, #DAA520, #FFD700, #DAA520)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: -1,
          lineHeight: 1.1,
        }}
      >
        {formatMON(pool)} <span style={{ fontSize: 18 }}>$MON</span>
      </div>
      <div style={{ fontSize: 12, color: PALETTE.textLight, marginTop: 4 }}>
        Growing with every offering
      </div>
    </div>
  );
}

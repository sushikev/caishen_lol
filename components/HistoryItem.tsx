"use client";

import { OUTCOMES, PALETTE } from "@/lib/constants";
import { formatMON } from "@/lib/game-logic";

export interface HistoryEntry {
  sender: string;
  amount: number;
  outcome: number;
  payout: number;
  time: number;
  txHash?: string;
  explorerUrl?: string;
  returnTxHash?: string;
}

export default function HistoryItem({ entry }: { entry: HistoryEntry }) {
  const o = OUTCOMES[entry.outcome];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 14px",
        borderRadius: 10,
        background: PALETTE.card,
        border: `1px solid ${PALETTE.border}`,
        marginBottom: 8,
        fontSize: 13,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 20 }}>{o.emoji}</span>
        <div>
          <div style={{ fontWeight: 600, color: PALETTE.text }}>{o.label}</div>
          <div style={{ color: PALETTE.textMuted, fontSize: 11 }}>
            Sent {entry.amount} MON
          </div>
        </div>
      </div>
      <div
        style={{
          fontWeight: 700,
          color: entry.payout > 0 ? "#27AE60" : PALETTE.textMuted,
        }}
      >
        {entry.payout > 0 ? `+${formatMON(entry.payout)}` : "—"}
      </div>
    </div>
  );
}

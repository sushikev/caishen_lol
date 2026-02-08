"use client";

import { useState, useEffect } from "react";
import { OUTCOMES } from "@/lib/constants";
import { formatMON } from "@/lib/game-logic";

export default function EnvelopeReveal({
  outcome,
  payout,
  onDone,
}: {
  outcome: number;
  payout: number;
  onDone: () => void;
}) {
  const [phase, setPhase] = useState(0); // 0=envelope, 1=opening, 2=revealed

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 800);
    const t2 = setTimeout(() => setPhase(2), 2200);
    const t3 = setTimeout(onDone, 3800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const o = OUTCOMES[outcome];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(8px)",
        animation: "fadeIn 0.3s ease-out",
      }}
    >
      <div style={{ textAlign: "center" }}>
        {phase < 2 ? (
          <div
            style={{
              width: 180,
              height: 240,
              background:
                "linear-gradient(180deg, #DC143C 0%, #A91030 100%)",
              borderRadius: 16,
              border: "3px solid #FFD700",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              boxShadow:
                "0 20px 60px rgba(220,20,60,0.4), 0 0 40px rgba(255,215,0,0.15)",
              animation:
                phase === 1
                  ? "envelopeShake 0.5s ease-in-out infinite"
                  : "envelopePulse 1.5s ease-in-out infinite",
              position: "relative",
            }}
          >
            <div style={{ fontSize: 42, marginBottom: 8 }}>🧧</div>
            <div style={{ color: "#FFD700", fontSize: 28, fontWeight: 800 }}>
              福
            </div>
            <div
              style={{
                color: "rgba(255,215,0,0.7)",
                fontSize: 11,
                marginTop: 6,
                letterSpacing: 1,
              }}
            >
              {phase === 0 ? "CAISHEN DECIDES..." : "OPENING..."}
            </div>
            {/* Gold seal */}
            <div
              style={{
                position: "absolute",
                top: -14,
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #FFD700, #DAA520)",
                border: "2px solid #B8860B",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                boxShadow: "0 4px 12px rgba(218,165,32,0.4)",
              }}
            >
              ☯
            </div>
          </div>
        ) : (
          <div
            style={{
              animation: "popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            <div style={{ fontSize: 72, marginBottom: 12 }}>{o.emoji}</div>
            <div
              style={{
                color: o.color,
                fontSize: 26,
                fontWeight: 800,
                textShadow: "0 2px 20px rgba(0,0,0,0.3)",
              }}
            >
              {o.label}
            </div>
            {payout > 0 && (
              <div
                style={{
                  color: "#FFD700",
                  fontSize: 20,
                  fontWeight: 700,
                  marginTop: 8,
                }}
              >
                +{formatMON(payout)} MON
              </div>
            )}
            {payout === 0 && (
              <div
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: 14,
                  marginTop: 8,
                }}
              >
                Better luck next time...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

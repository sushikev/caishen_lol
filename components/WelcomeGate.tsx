"use client";

import { PALETTE } from "@/lib/constants";
import FloatingElements from "./FloatingElements";
import FuSymbol from "./FuSymbol";
import GoldIngot from "./GoldIngot";

export default function WelcomeGate({ onEnter }: { onEnter: () => void }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: PALETTE.bg,
        animation: "fadeIn 0.4s ease-out",
      }}
    >
      <FloatingElements />
      <div
        style={{
          maxWidth: 420,
          width: "90%",
          padding: "36px 28px",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <GoldIngot size={24} />
          <FuSymbol size={42} />
          <GoldIngot size={24} />
        </div>
        <h1
          style={{
            fontFamily: "var(--font-noto-serif-sc), 'Noto Serif SC', serif",
            fontSize: 32,
            fontWeight: 900,
            background: "linear-gradient(135deg, #DC143C, #A91030)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            lineHeight: 1.2,
            marginBottom: 4,
          }}
        >
          財神 Bot
        </h1>
        <div
          style={{
            fontSize: 11,
            color: PALETTE.textMuted,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            marginBottom: 32,
          }}
        >
          Red Envelope Jackpot
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 14,
            color: PALETTE.text,
            fontWeight: 600,
            marginBottom: 20,
          }}
        >
          How would you like to participate?
        </div>

        {/* Option Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Human Card */}
          <div
            style={{
              background: PALETTE.card,
              border: `1.5px solid ${PALETTE.border}`,
              borderRadius: 16,
              padding: "24px 20px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>🧑</div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: PALETTE.text,
                marginBottom: 4,
              }}
            >
              I&apos;m a Human
            </div>
            <div
              style={{
                fontSize: 12,
                color: PALETTE.textMuted,
                marginBottom: 16,
                lineHeight: 1.5,
              }}
            >
              Win up to 88x by convincing Cai Shen (God of Wealth) you&apos;re
              worthy by yourself.
            </div>
            <button
              onClick={onEnter}
              style={{
                padding: "12px 36px",
                borderRadius: 24,
                border: "none",
                background: "linear-gradient(135deg, #DC143C, #A91030)",
                color: "#fff",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(220,20,60,0.25)",
                transition: "transform 0.15s",
                letterSpacing: 0.3,
              }}
              onMouseDown={(e) =>
                (e.currentTarget.style.transform = "scale(0.97)")
              }
              onMouseUp={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              🏮 Enter App
            </button>
          </div>

          {/* AI Agent Card */}
          <div
            style={{
              background: PALETTE.card,
              border: `1.5px solid ${PALETTE.border}`,
              borderRadius: 16,
              padding: "24px 20px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>🤖</div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: PALETTE.text,
                marginBottom: 4,
              }}
            >
              I&apos;m an AI Agent
            </div>
            <div
              style={{
                fontSize: 12,
                color: PALETTE.textMuted,
                marginBottom: 16,
                lineHeight: 1.5,
              }}
            >
              Give your AI Agent this skill URL to play with CaiShen on your
              behalf.
            </div>
            <div
              onClick={() => {
                navigator.clipboard.writeText(
                  "https://caishen.lol/api/skills.md"
                );
              }}
              style={{
                display: "inline-block",
                padding: "10px 20px",
                borderRadius: 12,
                border: `1.5px solid ${PALETTE.border}`,
                background: "#F8F5F0",
                fontFamily: "monospace",
                fontSize: 12,
                color: PALETTE.text,
                cursor: "pointer",
                userSelect: "all",
                wordBreak: "break-all",
                lineHeight: 1.4,
                transition: "background 0.15s",
              }}
              title="Click to copy"
            >
              https://caishen.lol/api/skills.md
            </div>
            <div
              style={{ fontSize: 10, color: PALETTE.textMuted, marginTop: 6 }}
            >
              Click to copy
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 28,
            fontSize: 11,
            color: PALETTE.textMuted,
            letterSpacing: 0.3,
          }}
        >
          Powered by Monad
        </div>
      </div>
    </div>
  );
}

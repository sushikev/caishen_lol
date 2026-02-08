"use client";

import { PALETTE } from "@/lib/constants";

const tabs = [
  { id: "play", label: "Play", icon: "🧧" },
  { id: "history", label: "History", icon: "📜" },
  { id: "rules", label: "Rules", icon: "📖" },
] as const;

export type TabId = (typeof tabs)[number]["id"];

export default function TabBar({
  active,
  onChange,
}: {
  active: string;
  onChange: (id: TabId) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        background: PALETTE.card,
        borderRadius: 12,
        padding: 4,
        border: `1px solid ${PALETTE.border}`,
        marginBottom: 16,
      }}
    >
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{
            flex: 1,
            padding: "8px 0",
            border: "none",
            borderRadius: 8,
            background:
              active === t.id
                ? "linear-gradient(135deg, #DC143C, #A91030)"
                : "transparent",
            color: active === t.id ? "#fff" : PALETTE.textMuted,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
          }}
        >
          <span style={{ fontSize: 14 }}>{t.icon}</span> {t.label}
        </button>
      ))}
    </div>
  );
}

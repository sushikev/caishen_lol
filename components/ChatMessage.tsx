"use client";

import { PALETTE } from "@/lib/constants";

export default function ChatMessage({
  message,
  isBot,
}: {
  message: string;
  isBot: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: isBot ? "flex-start" : "flex-end",
        marginBottom: 12,
        animation: "fadeSlideUp 0.4s ease-out",
      }}
    >
      {isBot && (
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #DC143C, #A91030)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 8,
            flexShrink: 0,
            fontSize: 16,
            boxShadow: "0 2px 8px rgba(220,20,60,0.2)",
          }}
        >
          🧧
        </div>
      )}
      <div
        style={{
          maxWidth: "80%",
          padding: "12px 16px",
          borderRadius: isBot
            ? "4px 16px 16px 16px"
            : "16px 4px 16px 16px",
          background: isBot
            ? PALETTE.card
            : "linear-gradient(135deg, #DC143C, #A91030)",
          color: isBot ? PALETTE.text : "#fff",
          fontSize: 14,
          lineHeight: 1.55,
          border: isBot ? `1px solid ${PALETTE.border}` : "none",
          boxShadow: isBot
            ? "0 1px 4px rgba(0,0,0,0.04)"
            : "0 2px 8px rgba(220,20,60,0.2)",
        }}
      >
        {message}
      </div>
    </div>
  );
}

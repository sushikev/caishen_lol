"use client";

import { useMemo } from "react";

export default function FloatingElements() {
  const items = ["🧧", "💰", "🏮", "✨", "🎆"];

  const elements = useMemo(
    () =>
      Array.from({ length: 8 }).map((_, i) => ({
        fontSize: `${14 + Math.random() * 18}px`,
        opacity: 0.08 + Math.random() * 0.06,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDuration: `${12 + Math.random() * 10}s`,
        animationDelay: `${-Math.random() * 15}s`,
        emoji: items[i % items.length],
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 0,
      }}
    >
      {elements.map((el, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            fontSize: el.fontSize,
            opacity: el.opacity,
            left: el.left,
            top: el.top,
            animation: `floatY ${el.animationDuration} ease-in-out infinite`,
            animationDelay: el.animationDelay,
          }}
        >
          {el.emoji}
        </div>
      ))}
    </div>
  );
}

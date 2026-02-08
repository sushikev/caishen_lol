"use client";

import { useMemo } from "react";

export default function FloatingElements() {
  const items = ["🧧", "💰", "🏮", "✨", "🎆", "🐉", "🎊", "🪙", "🔮", "🐷", "🧨", "🎐", "🍊", "福", "🐴"];

  const elements = useMemo(
    () =>
      Array.from({ length: 24 }).map((_, i) => {
        const sizeGroup = Math.random();
        const fontSize = sizeGroup < 0.3
          ? 10 + Math.random() * 8    // small: 10-18px
          : sizeGroup < 0.7
          ? 18 + Math.random() * 14   // medium: 18-32px
          : 32 + Math.random() * 20;  // large: 32-52px
        return {
          fontSize: `${fontSize}px`,
          opacity: sizeGroup < 0.3
            ? 0.1 + Math.random() * 0.1    // small: 0.10-0.20
            : sizeGroup < 0.7
            ? 0.12 + Math.random() * 0.12  // medium: 0.12-0.24
            : 0.08 + Math.random() * 0.1,  // large: 0.08-0.18
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDuration: `${sizeGroup < 0.3
            ? 4 + Math.random() * 4      // small: fast (4-8s)
            : sizeGroup < 0.7
            ? 6 + Math.random() * 5      // medium: moderate (6-11s)
            : 8 + Math.random() * 6}s`,  // large: slow (8-14s)
          animationDelay: `${-Math.random() * 20}s`,
          emoji: items[Math.floor(Math.random() * items.length)],
        };
      }),
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

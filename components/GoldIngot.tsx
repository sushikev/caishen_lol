"use client";

import { CSSProperties } from "react";

export default function GoldIngot({
  size = 32,
  style = {},
}: {
  size?: number;
  style?: CSSProperties;
}) {
  return (
    <svg width={size} height={size * 0.65} viewBox="0 0 80 52" style={style}>
      <defs>
        <linearGradient id="ingotGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFE066" />
          <stop offset="40%" stopColor="#FFD700" />
          <stop offset="70%" stopColor="#DAA520" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>
        <linearGradient id="ingotTop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF3B0" />
          <stop offset="100%" stopColor="#FFD700" />
        </linearGradient>
      </defs>
      <path
        d="M10 38 Q0 38 2 28 L18 12 Q20 10 24 10 L56 10 Q60 10 62 12 L78 28 Q80 38 70 38 Z"
        fill="url(#ingotGrad)"
        stroke="#B8860B"
        strokeWidth="1.5"
      />
      <path
        d="M18 12 Q20 10 24 10 L56 10 Q60 10 62 12 L54 22 Q52 24 48 24 L32 24 Q28 24 26 22 Z"
        fill="url(#ingotTop)"
        stroke="#B8860B"
        strokeWidth="1"
      />
      <ellipse cx="40" cy="16" rx="8" ry="3" fill="#FFF8DC" opacity="0.5" />
    </svg>
  );
}

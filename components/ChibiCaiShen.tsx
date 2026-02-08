"use client";

export default function ChibiCaiShen() {
  return (
    <div
      className="chibi-caishen"
      style={{
        position: "fixed",
        right: 40,
        bottom: 40,
        zIndex: 10,
        animation: "chibiFloat 3s ease-in-out infinite",
        filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.12))",
        pointerEvents: "none",
      }}
    >
      <svg width="120" height="168" viewBox="0 0 160 224">
        {/* === BODY (red ball, behind face) === */}
        <ellipse cx="80" cy="168" rx="54" ry="50" fill="#C0392B" />

        {/* === ARMS (small round bumps) === */}
        <ellipse cx="22" cy="152" rx="14" ry="12" fill="#C0392B" />
        <ellipse cx="138" cy="152" rx="14" ry="12" fill="#C0392B" />

        {/* === FACE === */}
        <circle cx="80" cy="84" r="38" fill="#FCEBD5" />

        {/* === HAT === */}
        <rect x="40" y="10" width="80" height="30" rx="4" fill="#CC3333" />
        <circle
          cx="80"
          cy="17"
          r="11"
          fill="#B22222"
          stroke="#DAA520"
          strokeWidth="2"
        />
        <text
          x="80"
          y="21.5"
          textAnchor="middle"
          fill="#DAA520"
          fontSize="11"
          fontWeight="bold"
          fontFamily="'Noto Serif SC', serif"
        >
          財
        </text>
        <circle cx="50" cy="28" r="3" fill="#DAA520" />
        <circle cx="110" cy="28" r="3" fill="#DAA520" />
        <rect x="28" y="38" width="104" height="16" rx="2" fill="#CC3333" />
        <rect x="28" y="43" width="104" height="11" rx="1" fill="#DAA520" />
        <circle cx="44" cy="48" r="3.5" fill="#CC3333" />
        <circle cx="62" cy="48" r="3.5" fill="#CC3333" />
        <circle cx="80" cy="48" r="4" fill="#2E8B57" />
        <circle cx="98" cy="48" r="3.5" fill="#CC3333" />
        <circle cx="116" cy="48" r="3.5" fill="#CC3333" />

        {/* === EYES (closed happy ^_^) === */}
        <path
          d="M60 80 Q66 71 72 80"
          fill="none"
          stroke="#3E2723"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        <path
          d="M88 80 Q94 71 100 80"
          fill="none"
          stroke="#3E2723"
          strokeWidth="2.8"
          strokeLinecap="round"
        />

        {/* === ROSY CHEEKS === */}
        <circle cx="54" cy="90" r="8" fill="#E8A0A0" opacity="0.5" />
        <circle cx="106" cy="90" r="8" fill="#E8A0A0" opacity="0.5" />

        {/* === MUSTACHE === */}
        <path
          d="M70 96 Q62 89 52 93"
          fill="none"
          stroke="#3E2723"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M90 96 Q98 89 108 93"
          fill="none"
          stroke="#3E2723"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        {/* === BEARD (dark oval) === */}
        <ellipse cx="80" cy="104" rx="14" ry="12" fill="#4E2C17" />

        {/* === GOLD SCEPTER BAR === */}
        <rect x="34" y="132" width="92" height="9" rx="4.5" fill="#DAA520" />
        <circle cx="80" cy="136.5" r="5.5" fill="#2E8B57" />

        {/* === ROBE RING DECORATIONS === */}
        <circle
          cx="60"
          cy="182"
          r="7"
          fill="none"
          stroke="#DAA520"
          strokeWidth="2.5"
        />
        <circle
          cx="100"
          cy="182"
          r="7"
          fill="none"
          stroke="#DAA520"
          strokeWidth="2.5"
        />

        {/* === FLOATING GOLD INGOTS === */}
        <ellipse
          cx="16"
          cy="30"
          rx="10"
          ry="4.5"
          fill="#DAA520"
          transform="rotate(-25 16 30)"
        >
          <animate
            attributeName="opacity"
            values="0.5;1;0.5"
            dur="2.5s"
            repeatCount="indefinite"
          />
        </ellipse>
        <ellipse
          cx="144"
          cy="30"
          rx="10"
          ry="4.5"
          fill="#DAA520"
          transform="rotate(25 144 30)"
        >
          <animate
            attributeName="opacity"
            values="0.5;1;0.5"
            dur="2.5s"
            begin="0.8s"
            repeatCount="indefinite"
          />
        </ellipse>
      </svg>
    </div>
  );
}

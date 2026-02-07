import { useState, useEffect, useRef, useCallback } from "react";

// ─── Constants ───────────────────────────────────────────────────────
const OUTCOMES = [
  { emoji: "🥟", label: "IOU Dumplings", chance: 50, multiplier: 0, color: "#8B7355" },
  { emoji: "🔄", label: "Luck Recycled", chance: 24.9, multiplier: 0, color: "#9B59B6" },
  { emoji: "💰", label: "Small Win", chance: 15, multiplier: 1.5, color: "#27AE60" },
  { emoji: "🐷", label: "Golden Pig", chance: 8, multiplier: 3, color: "#F39C12" },
  { emoji: "🧧", label: "JACKPOT", chance: 2, multiplier: -1, color: "#DC143C" },
  { emoji: "🎰", label: "SUPER JACKPOT", chance: 0.1, multiplier: 88, color: "#FFD700" },
];

const SUGGESTED_AMOUNTS = [8, 18, 28, 88, 188, 888];

const PALETTE = {
  bg: "#FFFAF5",
  card: "#FFFFFF",
  red: "#DC143C",
  redDark: "#A91030",
  gold: "#DAA520",
  goldLight: "#FFD700",
  goldPale: "#F4E1C1",
  text: "#2B2D42",
  textMuted: "#6B7280",
  textLight: "#9CA3AF",
  border: "#F0E6D8",
  cream: "#FFF8F0",
};

// ─── Helpers ─────────────────────────────────────────────────────────
function hasEight(val) {
  return String(val).includes("8");
}

function isDeathNumber(val) {
  const s = String(val).replace(/[^0-9]/g, "");
  return (s.match(/4/g) || []).length >= 2;
}

function rollOutcome(isTuesday) {
  const rand = Math.random() * 100;
  const probs = isTuesday
    ? [62.4, 24.9, 7.5, 4, 1, 0.2]
    : [50, 24.9, 15, 8, 2, 0.1];
  let cumulative = 0;
  for (let i = 0; i < probs.length; i++) {
    cumulative += probs[i];
    if (rand < cumulative) return i;
  }
  return 0;
}

function formatMON(n) {
  return Number(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function isForbiddenDay() {
  const d = new Date().getDate();
  return d === 4 || d === 14 || d === 24;
}

function isGhostHour() {
  const h = new Date().getHours();
  const m = new Date().getMinutes();
  return (h === 4 || h === 16) && m >= 44 && m <= 44;
}

function isTuesday() {
  return new Date().getDay() === 2;
}

// ─── Floating elements component ─────────────────────────────────────
function FloatingElements() {
  const items = ["🧧", "💰", "🏮", "✨", "🎆"];
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            fontSize: `${14 + Math.random() * 18}px`,
            opacity: 0.08 + Math.random() * 0.06,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `floatY ${12 + Math.random() * 10}s ease-in-out infinite`,
            animationDelay: `${-Math.random() * 15}s`,
          }}
        >
          {items[i % items.length]}
        </div>
      ))}
    </div>
  );
}

// ─── Fu Symbol ──────────────────────────────────────────────────────
function FuSymbol({ size = 48, style = {} }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #DC143C 0%, #A91030 100%)",
        borderRadius: 6,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: "rotate(180deg)",
        border: "2px solid #FFD700",
        boxShadow: "0 2px 8px rgba(220,20,60,0.25)",
        ...style,
      }}
    >
      <span style={{ fontSize: size * 0.55, color: "#FFD700", fontWeight: 800, transform: "rotate(180deg)" }}>
        福
      </span>
    </div>
  );
}

// ─── Gold Ingot SVG ─────────────────────────────────────────────────
function GoldIngot({ size = 32, style = {} }) {
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
      <path d="M10 38 Q0 38 2 28 L18 12 Q20 10 24 10 L56 10 Q60 10 62 12 L78 28 Q80 38 70 38 Z" fill="url(#ingotGrad)" stroke="#B8860B" strokeWidth="1.5" />
      <path d="M18 12 Q20 10 24 10 L56 10 Q60 10 62 12 L54 22 Q52 24 48 24 L32 24 Q28 24 26 22 Z" fill="url(#ingotTop)" stroke="#B8860B" strokeWidth="1" />
      <ellipse cx="40" cy="16" rx="8" ry="3" fill="#FFF8DC" opacity="0.5" />
    </svg>
  );
}

// ─── Pool Display ───────────────────────────────────────────────────
function PoolDisplay({ pool }) {
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
      <div style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: 3, color: PALETTE.textMuted, fontWeight: 600, marginBottom: 4 }}>
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
      <div style={{ fontSize: 14, color: PALETTE.textLight, marginTop: 4 }}>
        Growing with every offering
      </div>
    </div>
  );
}

// ─── Chat message ───────────────────────────────────────────────────
function ChatMessage({ message, isBot }) {
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
          borderRadius: isBot ? "4px 16px 16px 16px" : "16px 4px 16px 16px",
          background: isBot
            ? PALETTE.card
            : "linear-gradient(135deg, #DC143C, #A91030)",
          color: isBot ? PALETTE.text : "#fff",
          fontSize: 16,
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

// ─── Envelope animation ─────────────────────────────────────────────
function EnvelopeReveal({ outcome, payout, onDone }) {
  const [phase, setPhase] = useState(0); // 0=envelope, 1=opening, 2=revealed

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 800);
    const t2 = setTimeout(() => setPhase(2), 2200);
    const t3 = setTimeout(onDone, 3800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
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
              background: "linear-gradient(180deg, #DC143C 0%, #A91030 100%)",
              borderRadius: 16,
              border: "3px solid #FFD700",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 20px 60px rgba(220,20,60,0.4), 0 0 40px rgba(255,215,0,0.15)",
              animation: phase === 1 ? "envelopeShake 0.5s ease-in-out infinite" : "envelopePulse 1.5s ease-in-out infinite",
              position: "relative",
            }}
          >
            <div style={{ fontSize: 42, marginBottom: 8 }}>🧧</div>
            <div style={{ color: "#FFD700", fontSize: 28, fontWeight: 800 }}>福</div>
            <div style={{ color: "rgba(255,215,0,0.7)", fontSize: 11, marginTop: 6, letterSpacing: 2, fontFamily: "'Press Start 2P', monospace" }}>
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
          <div style={{ animation: "popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)" }}>
            <div style={{ fontSize: 72, marginBottom: 12 }}>{o.emoji}</div>
            <div style={{ color: o.color, fontSize: 26, fontWeight: 800, textShadow: "0 2px 20px rgba(0,0,0,0.3)" }}>
              {o.label}
            </div>
            {payout > 0 && (
              <div style={{ color: "#FFD700", fontSize: 20, fontWeight: 700, marginTop: 8 }}>
                +{formatMON(payout)} MON
              </div>
            )}
            {payout === 0 && (
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, marginTop: 8 }}>
                Better luck next time...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── History Item ───────────────────────────────────────────────────
function HistoryItem({ entry }) {
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
        fontSize: 15,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 20 }}>{o.emoji}</span>
        <div>
          <div style={{ fontWeight: 600, color: PALETTE.text }}>{o.label}</div>
          <div style={{ color: PALETTE.textMuted, fontSize: 13 }}>Sent {entry.amount} MON</div>
        </div>
      </div>
      <div style={{ fontWeight: 700, color: entry.payout > 0 ? "#27AE60" : PALETTE.textMuted }}>
        {entry.payout > 0 ? `+${formatMON(entry.payout)}` : "—"}
      </div>
    </div>
  );
}

// ─── Tab Bar ────────────────────────────────────────────────────────
function TabBar({ active, onChange }) {
  const tabs = [
    { id: "play", label: "Play", icon: "🧧" },
    { id: "history", label: "History", icon: "📜" },
    { id: "rules", label: "Rules", icon: "📖" },
  ];
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
            background: active === t.id ? "linear-gradient(135deg, #DC143C, #A91030)" : "transparent",
            color: active === t.id ? "#fff" : PALETTE.textMuted,
            fontSize: 15,
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

// ─── Rules Panel ────────────────────────────────────────────────────
function RulesPanel() {
  const sectionStyle = {
    background: PALETTE.card,
    border: `1px solid ${PALETTE.border}`,
    borderRadius: 12,
    padding: "16px 18px",
    marginBottom: 12,
  };
  const titleStyle = { fontSize: 17, fontWeight: 700, color: PALETTE.text, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 };
  const textStyle = { fontSize: 15, color: PALETTE.textMuted, lineHeight: 1.6 };

  return (
    <div>
      <div style={sectionStyle}>
        <div style={titleStyle}>🎯 How to Play</div>
        <div style={textStyle}>
          Send a minimum of <strong>8 $MON</strong> to CáiShén. Your offering must contain the digit "8" somewhere in the amount. CáiShén will reveal your red envelope's contents with one of six possible outcomes.
        </div>
      </div>
      <div style={sectionStyle}>
        <div style={titleStyle}>🎲 Outcomes</div>
        <div style={{ display: "grid", gap: 6 }}>
          {OUTCOMES.map((o) => (
            <div key={o.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 15, padding: "6px 0", borderBottom: `1px solid ${PALETTE.border}` }}>
              <span>
                {o.emoji} <strong>{o.label}</strong>
              </span>
              <span style={{ color: PALETTE.textMuted }}>
                {o.chance}% — {o.multiplier === 0 ? "No payout" : o.multiplier === -1 ? "Entire Pool" : `${o.multiplier}x`}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div style={sectionStyle}>
        <div style={titleStyle}>⚠️ Superstitions & Forbidden Times</div>
        <div style={textStyle}>
          <strong>Death Numbers:</strong> Amounts with multiple 4s trigger a block — CáiShén goes offline.
          <br /><br />
          <strong>Forbidden Days:</strong> 4th, 14th, 24th of any month — No operations.
          <br /><br />
          <strong>Ghost Hour:</strong> 4:44 AM/PM — No transactions.
          <br /><br />
          <strong>Tuesday Penalty:</strong> All win probabilities are halved on Tuesdays.
        </div>
      </div>
      <div style={sectionStyle}>
        <div style={titleStyle}>🏮 Cultural Notes</div>
        <div style={textStyle}>
          <strong>8 (八 bā)</strong> — Sounds like "prosperity" (發 fā). Extremely lucky.
          <br />
          <strong>4 (四 sì)</strong> — Sounds like "death" (死 sǐ). Extremely unlucky.
          <br />
          <strong>紅包</strong> — Traditional red envelopes containing money.
          <br />
          <strong>恭喜發財</strong> — "Wishing you prosperity" — traditional CNY greeting.
        </div>
      </div>
    </div>
  );
}

// ─── Chibi Cai Shen (Desktop only) ─────────────────────────────────
function ChibiCaiShen() {
  return (
    <div
      className="chibi-caishen"
      style={{
        position: "fixed",
        right: 40,
        bottom: 40,
        zIndex: 10,
        animation: "chibiFloat 3s ease-in-out infinite",
        filter: "drop-shadow(0 0 24px rgba(255,215,0,0.3))",
        pointerEvents: "none",
      }}
    >
      <svg width="130" height="190" viewBox="0 0 130 190" fill="none">
        <defs>
          <radialGradient id="caiGlow">
            <stop offset="0%" stopColor="#FFD740" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <linearGradient id="robeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF1744" />
            <stop offset="100%" stopColor="#B71C1C" />
          </linearGradient>
          <linearGradient id="hatGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2C2C2C" />
            <stop offset="100%" stopColor="#1A1A1A" />
          </linearGradient>
          <linearGradient id="ingotGradC" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFEA00" />
            <stop offset="100%" stopColor="#FFA000" />
          </linearGradient>
        </defs>

        {/* Soft glow behind character */}
        <circle cx="65" cy="95" r="60" fill="url(#caiGlow)" opacity="0.12" />

        {/* === HAT (官帽) === */}
        <rect x="30" y="12" width="70" height="10" rx="2" fill="url(#hatGrad)" stroke="#FFD740" strokeWidth="1.2" />
        <rect x="42" y="3" width="46" height="13" rx="3" fill="url(#hatGrad)" stroke="#FFD740" strokeWidth="1.2" />
        {/* Hat ornament */}
        <circle cx="65" cy="9" r="4" fill="#FF1744" />
        <circle cx="65" cy="9" r="2" fill="#FFEA00" />
        {/* Hat wings */}
        <ellipse cx="25" cy="16" rx="8" ry="3" fill="#1A1A1A" stroke="#FFD740" strokeWidth="0.8" />
        <ellipse cx="105" cy="16" rx="8" ry="3" fill="#1A1A1A" stroke="#FFD740" strokeWidth="0.8" />

        {/* === FACE === */}
        <circle cx="65" cy="46" r="28" fill="#FFDAB9" />
        {/* Eyebrows */}
        <path d="M48 35 Q53 31 58 35" fill="none" stroke="#5D4037" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M72 35 Q77 31 82 35" fill="none" stroke="#5D4037" strokeWidth="1.8" strokeLinecap="round" />
        {/* Eyes - large cute chibi style */}
        <ellipse cx="53" cy="42" rx="4" ry="4.5" fill="#1A1A1A" />
        <ellipse cx="77" cy="42" rx="4" ry="4.5" fill="#1A1A1A" />
        <circle cx="54.5" cy="40.5" r="1.5" fill="#FFF" />
        <circle cx="78.5" cy="40.5" r="1.5" fill="#FFF" />
        <circle cx="52" cy="43.5" r="0.8" fill="#FFF" opacity="0.6" />
        <circle cx="76" cy="43.5" r="0.8" fill="#FFF" opacity="0.6" />
        {/* Blush */}
        <circle cx="44" cy="49" r="5" fill="#FF8A80" opacity="0.45" />
        <circle cx="86" cy="49" r="5" fill="#FF8A80" opacity="0.45" />
        {/* Happy smile */}
        <path d="M56 52 Q65 60 74 52" fill="none" stroke="#5D4037" strokeWidth="2" strokeLinecap="round" />
        {/* Small open mouth */}
        <ellipse cx="65" cy="54" rx="3" ry="2" fill="#C62828" />

        {/* === BEARD === */}
        <path d="M50 60 Q45 75 40 88" fill="none" stroke="#E0E0E0" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M57 63 Q55 78 52 90" fill="none" stroke="#E0E0E0" strokeWidth="2" strokeLinecap="round" />
        <path d="M65 64 Q65 80 65 92" fill="none" stroke="#E0E0E0" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M73 63 Q75 78 78 90" fill="none" stroke="#E0E0E0" strokeWidth="2" strokeLinecap="round" />
        <path d="M80 60 Q85 75 90 88" fill="none" stroke="#E0E0E0" strokeWidth="2.5" strokeLinecap="round" />

        {/* === BODY / ROBE === */}
        <path d="M36 70 Q28 82 24 125 Q24 142 65 146 Q106 142 106 125 Q102 82 94 70" fill="url(#robeGrad)" stroke="#FFD740" strokeWidth="1.5" />
        {/* Robe collar */}
        <path d="M50 70 L65 86 L80 70" fill="none" stroke="#FFD740" strokeWidth="2" />
        {/* Center seam */}
        <line x1="65" y1="86" x2="65" y2="143" stroke="#FFD740" strokeWidth="1.2" opacity="0.6" />
        {/* Robe trim */}
        <path d="M30 125 Q65 135 100 125" fill="none" stroke="#FFD740" strokeWidth="1" opacity="0.5" />
        {/* 福 character on belly */}
        <rect x="51" y="98" width="28" height="28" rx="3" fill="#B71C1C" stroke="#FFD740" strokeWidth="1" />
        <text x="65" y="119" textAnchor="middle" fill="#FFD740" fontSize="18" fontWeight="bold" fontFamily="'Noto Serif SC', serif">福</text>

        {/* === LEFT ARM (waving coin) === */}
        <path d="M32 85 Q16 95 12 108" fill="none" stroke="#FF1744" strokeWidth="12" strokeLinecap="round" />
        <path d="M32 85 Q16 95 12 108" fill="none" stroke="#B71C1C" strokeWidth="10" strokeLinecap="round" />
        <g style={{ animation: "coinWave 2s ease-in-out infinite" }}>
          <circle cx="12" cy="114" r="10" fill="#FFD740" stroke="#FFA000" strokeWidth="1.5" />
          <circle cx="12" cy="114" r="6" fill="none" stroke="#FFA000" strokeWidth="0.8" />
          <rect x="10" y="110" width="4" height="8" rx="1" fill="#FFA000" opacity="0.5" />
        </g>

        {/* === RIGHT ARM (holding gold ingot) === */}
        <path d="M98 85 Q114 95 118 108" fill="none" stroke="#FF1744" strokeWidth="12" strokeLinecap="round" />
        <path d="M98 85 Q114 95 118 108" fill="none" stroke="#B71C1C" strokeWidth="10" strokeLinecap="round" />
        {/* Gold ingot */}
        <path d="M105 110 Q103 115 104 118 L118 118 L132 118 Q133 115 131 110 Z" fill="url(#ingotGradC)" stroke="#FFA000" strokeWidth="1" />
        <path d="M110 110 L114 105 L122 105 L126 110" fill="#FFEA00" stroke="#FFA000" strokeWidth="0.8" />

        {/* === FEET === */}
        <ellipse cx="52" cy="149" rx="11" ry="5" fill="#1A1A1A" stroke="#333" strokeWidth="0.5" />
        <ellipse cx="78" cy="149" rx="11" ry="5" fill="#1A1A1A" stroke="#333" strokeWidth="0.5" />

        {/* === SPARKLE EFFECTS === */}
        <g>
          <path d="M8 28 L10 22 L12 28 L10 34 Z" fill="#FFD740">
            <animate attributeName="opacity" values="0.2;1;0.2" dur="2s" repeatCount="indefinite" />
          </path>
          <path d="M115 24 L117 18 L119 24 L117 30 Z" fill="#FFD740">
            <animate attributeName="opacity" values="0.2;1;0.2" dur="2s" begin="0.7s" repeatCount="indefinite" />
          </path>
          <path d="M4 120 L6 114 L8 120 L6 126 Z" fill="#FFD740">
            <animate attributeName="opacity" values="0.2;1;0.2" dur="2s" begin="1.4s" repeatCount="indefinite" />
          </path>
          <path d="M122 70 L124 65 L126 70 L124 75 Z" fill="#FFEA00">
            <animate attributeName="opacity" values="0.3;0.9;0.3" dur="1.8s" begin="0.3s" repeatCount="indefinite" />
          </path>
        </g>
      </svg>
    </div>
  );
}

// ─── Main App ───────────────────────────────────────────────────────
export default function CaishenApp() {
  const [wallet, setWallet] = useState(null);
  const [pool, setPool] = useState(888.88);
  const [amount, setAmount] = useState("");
  const [wish, setWish] = useState("");
  const [messages, setMessages] = useState([
    { text: "恭喜發財! I am CáiShén, God of Wealth. Send me an offering with the sacred number 8 and I shall reveal your fortune... 🧧", bot: true },
  ]);
  const [history, setHistory] = useState([]);
  const [tab, setTab] = useState("play");
  const [revealing, setRevealing] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const addMessage = useCallback((text, bot = true) => {
    setMessages((prev) => [...prev, { text, bot }]);
  }, []);

  const connectWallet = () => {
    // Simulated wallet connection
    setWallet("0x8888...cny8");
    addMessage("A new seeker of fortune approaches... Your wallet is connected. The Celestial Pool awaits your offering. Remember: the number 8 is sacred. 🏮");
  };

  const handleSubmit = () => {
    if (isProcessing || !wallet) return;

    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      addMessage("You offer me... nothing? Even the dumplings laugh at you.", true);
      return;
    }

    // Add user message
    addMessage(`${val} MON offering${wish ? ` — "${wish}"` : ""}`, false);

    // Forbidden day check
    if (isForbiddenDay()) {
      addMessage(`You dare approach on the ${new Date().getDate()}th? The number of death haunts this day. CáiShén does not operate today. Return on a more auspicious date.`);
      return;
    }

    // Ghost hour
    if (isGhostHour()) {
      addMessage("4:44... The Ghost Hour. Even gods rest during this cursed minute. Return later.");
      return;
    }

    // Death number
    if (isDeathNumber(val)) {
      addMessage("... I pretend I did not see this. *CáiShén has gone offline for 4 minutes* ☠️");
      setAmount("");
      setWish("");
      return;
    }

    // Below minimum
    if (val < 8) {
      addMessage(`${val} MON? The minimum offering is 8 MON. You insult me with pocket change? Return when you are serious about prosperity.`);
      setAmount("");
      return;
    }

    // No 8
    if (!hasEight(val)) {
      addMessage(`${val} MON? Not a single 8 in sight. Do you come to the God of Wealth with this energy? Payment returned minus 0.04 MON rudeness fee. The 4 is intentional. 😤`);
      setPool((p) => p + 0.04);
      setAmount("");
      return;
    }

    // Valid! Process
    setIsProcessing(true);
    const eightCount = (String(val).match(/8/g) || []).length;
    const eightComment =
      eightCount >= 4
        ? `${eightCount} 8s?! You understand the assignment!`
        : eightCount >= 3
        ? "Triple prosperity! The ancestors smile!"
        : eightCount >= 2
        ? "Double 8s! Twice the luck!"
        : "The sacred 8 is present. Acceptable.";

    addMessage(`${val} MON received. ${eightComment} Let us see what the universe owes you... 🧧`);

    // Determine outcome after dramatic pause
    setTimeout(() => {
      const outcomeIdx = rollOutcome(isTuesday());
      const outcome = OUTCOMES[outcomeIdx];
      let payout = 0;

      if (outcomeIdx === 0) {
        // Dumplings - 70% to pool
        setPool((p) => p + val * 0.7);
        payout = 0;
      } else if (outcomeIdx === 1) {
        // Recycled - 100% to pool
        setPool((p) => p + val);
        payout = 0;
      } else if (outcomeIdx === 2) {
        // Small win
        payout = val * 1.5;
      } else if (outcomeIdx === 3) {
        // Golden Pig
        payout = val * 3;
      } else if (outcomeIdx === 4) {
        // Jackpot
        payout = pool;
        setPool(88.88); // Reset
      } else if (outcomeIdx === 5) {
        // Super Jackpot
        payout = Math.min(val * 88, pool * 0.5);
        setPool((p) => p - payout);
      }

      setRevealing({ outcome: outcomeIdx, payout });
      setHistory((h) => [{ amount: val, outcome: outcomeIdx, payout, time: Date.now() }, ...h]);
      setAmount("");
      setWish("");
    }, 1500);
  };

  const handleRevealDone = () => {
    const r = revealing;
    const o = OUTCOMES[r.outcome];

    const responses = [
      `The universe owes you nothing today. These dumplings are redeemable... never. 🥟 Try again, perhaps with more 8s.`,
      `Your luck has been... recycled. Added to the Celestial Pool (now ${formatMON(pool)} MON). Your sacrifice feeds future fortunes. 🔄`,
      `Minor Blessing Detected! ${formatMON(r.payout)} MON returned. The universe acknowledges you. Nothing more, nothing less. 💰`,
      `THE GOLDEN PIG APPEARS! 🐷 ${formatMON(r.payout)} MON rushing to your wallet! Your ancestors are smiling. Your enemies are confused.`,
      `🧧🧧🧧 圣! STOP EVERYTHING! THE CELESTIAL ENVELOPE HAS CHOSEN YOU! Pool of ${formatMON(r.payout)} MON transferred! Your ancestors are WEEPING with pride! Please face Southeast and say thank you. 恭喜發財!`,
      `🎰🎰🎰 天啊! HEAVENS ABOVE! THE DOUBLE 8 FORTUNE HAS MANIFESTED! 88x DIVINE MULTIPLIER! ${formatMON(r.payout)} MON materializing! 發發發! DOUBLE PROSPERITY!`,
    ];

    addMessage(responses[r.outcome]);
    setRevealing(null);
    setIsProcessing(false);
  };

  const amountValid = (() => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return null;
    if (val < 8) return false;
    if (!hasEight(val)) return false;
    return true;
  })();

  return (
    <>
      {/* Global styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&family=Noto+Serif+SC:wght@400;700;900&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: ${PALETTE.bg}; font-family: 'VT323', monospace; color: ${PALETTE.text}; -webkit-font-smoothing: antialiased; letter-spacing: 0.8px; font-size: 18px; }

        @keyframes floatY {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes envelopePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.04); }
        }
        @keyframes envelopeShake {
          0%, 100% { transform: rotate(0deg) scale(1.05); }
          25% { transform: rotate(-3deg) scale(1.08); }
          75% { transform: rotate(3deg) scale(1.08); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes chibiFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes coinWave {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }

        input::placeholder, textarea::placeholder { color: ${PALETTE.textLight}; }
        input:focus, textarea:focus { outline: none; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${PALETTE.goldPale}; border-radius: 4px; }

        .chibi-caishen { display: block; }
        @media (max-width: 768px) {
          .chibi-caishen { display: none !important; }
        }
      `}</style>

      <FloatingElements />
      <ChibiCaiShen />

      <div
        style={{
          maxWidth: 480,
          margin: "0 auto",
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* ─── Header ──────────────────────────────────────────── */}
        <div
          style={{
            padding: "20px 20px 0",
            textAlign: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 8 }}>
            <GoldIngot size={24} />
            <FuSymbol size={36} />
            <GoldIngot size={24} />
          </div>
          <h1
            style={{
              fontFamily: "'Noto Serif SC', serif",
              fontSize: 32,
              fontWeight: 900,
              background: "linear-gradient(135deg, #DC143C, #A91030)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              lineHeight: 1.2,
            }}
          >
            財神 Bot
          </h1>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: PALETTE.textMuted, letterSpacing: 2, textTransform: "uppercase", marginTop: 6 }}>
            Red Envelope Roulette
          </div>

          {/* Wallet */}
          <div style={{ marginTop: 12 }}>
            {wallet ? (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 14px",
                  borderRadius: 20,
                  background: PALETTE.cream,
                  border: `1px solid ${PALETTE.border}`,
                  fontSize: 14,
                  color: PALETTE.textMuted,
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#27AE60" }} />
                {wallet}
              </div>
            ) : (
              <button
                onClick={connectWallet}
                style={{
                  padding: "10px 28px",
                  borderRadius: 24,
                  border: "none",
                  background: "linear-gradient(135deg, #DC143C, #A91030)",
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(220,20,60,0.25)",
                  transition: "transform 0.15s",
                }}
                onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
                onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                🏮 Connect Wallet
              </button>
            )}
          </div>
        </div>

        {/* ─── Pool Display ────────────────────────────────────── */}
        <div style={{ padding: "16px 20px 0" }}>
          <PoolDisplay pool={pool} />
        </div>

        {/* ─── Tabs ────────────────────────────────────────────── */}
        <div style={{ padding: "16px 20px 0" }}>
          <TabBar active={tab} onChange={setTab} />
        </div>

        {/* ─── Content ─────────────────────────────────────────── */}
        <div style={{ flex: 1, padding: "0 20px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {tab === "play" && (
            <>
              {/* Chat Area */}
              <div
                ref={chatRef}
                style={{
                  flex: 1,
                  overflowY: "auto",
                  paddingBottom: 8,
                  minHeight: 0,
                }}
              >
                {messages.map((m, i) => (
                  <ChatMessage key={i} message={m.text} isBot={m.bot} />
                ))}
              </div>
            </>
          )}

          {tab === "history" && (
            <div style={{ flex: 1, overflowY: "auto", paddingBottom: 16 }}>
              {history.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px 20px", color: PALETTE.textLight }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🧧</div>
                  <div style={{ fontSize: 16 }}>No offerings yet. Make your first play!</div>
                </div>
              ) : (
                history.map((e, i) => <HistoryItem key={i} entry={e} />)
              )}
            </div>
          )}

          {tab === "rules" && (
            <div style={{ flex: 1, overflowY: "auto", paddingBottom: 16 }}>
              <RulesPanel />
            </div>
          )}
        </div>

        {/* ─── Bottom Input Panel ──────────────────────────────── */}
        {tab === "play" && (
          <div
            style={{
              padding: "12px 20px 20px",
              borderTop: `1px solid ${PALETTE.border}`,
              background: PALETTE.card,
            }}
          >
            {/* Suggested amounts */}
            <div style={{ display: "flex", gap: 6, marginBottom: 10, overflowX: "auto", paddingBottom: 2 }}>
              {SUGGESTED_AMOUNTS.map((a) => (
                <button
                  key={a}
                  onClick={() => setAmount(String(a))}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 16,
                    border: `1px solid ${amount === String(a) ? PALETTE.red : PALETTE.border}`,
                    background: amount === String(a) ? "rgba(220,20,60,0.06)" : PALETTE.cream,
                    color: amount === String(a) ? PALETTE.red : PALETTE.textMuted,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.15s",
                  }}
                >
                  {a} MON
                </button>
              ))}
            </div>

            {/* Amount Input */}
            <div style={{ position: "relative", marginBottom: 8 }}>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder='Enter offering (include an 8!)'
                style={{
                  width: "100%",
                  padding: "12px 80px 12px 16px",
                  borderRadius: 12,
                  border: `1.5px solid ${amountValid === true ? PALETTE.gold : amountValid === false ? "#E74C3C" : PALETTE.border}`,
                  fontSize: 17,
                  fontWeight: 600,
                  background: amountValid === true ? "rgba(255,215,0,0.04)" : PALETTE.bg,
                  color: PALETTE.text,
                  transition: "border-color 0.2s, background 0.2s",
                  fontFamily: "'VT323', monospace",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  right: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: 14,
                  fontWeight: 600,
                  color: PALETTE.textMuted,
                }}
              >
                $MON
              </span>
              {amountValid === true && (
                <span
                  style={{
                    position: "absolute",
                    right: 56,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 14,
                  }}
                >
                  ✨
                </span>
              )}
            </div>

            {/* Wish Input */}
            <textarea
              value={wish}
              onChange={(e) => setWish(e.target.value.slice(0, 280))}
              placeholder="Add your Chinese New Year wishes too to get a better chance at hitting the jackpot!"
              rows={2}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 10,
                border: `1px solid ${PALETTE.border}`,
                fontSize: 15,
                background: PALETTE.bg,
                color: PALETTE.text,
                resize: "none",
                marginBottom: 10,
                fontFamily: "'VT323', monospace",
                lineHeight: 1.4,
              }}
            />

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!wallet || isProcessing}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: 14,
                border: "none",
                background:
                  !wallet || isProcessing
                    ? "#E0D5C5"
                    : "linear-gradient(135deg, #DC143C 0%, #A91030 50%, #DC143C 100%)",
                backgroundSize: "200% auto",
                color: !wallet || isProcessing ? "#A89F91" : "#fff",
                fontSize: 18,
                fontWeight: 700,
                cursor: !wallet || isProcessing ? "not-allowed" : "pointer",
                letterSpacing: 0.5,
                boxShadow: wallet && !isProcessing ? "0 6px 20px rgba(220,20,60,0.3)" : "none",
                transition: "all 0.2s",
                animation: wallet && !isProcessing ? "shimmer 3s linear infinite" : "none",
                fontFamily: "'VT323', monospace",
              }}
              onMouseDown={(e) => {
                if (wallet && !isProcessing) e.currentTarget.style.transform = "scale(0.98)";
              }}
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              {isProcessing ? "🧧 CáiShén is deciding..." : wallet ? "🧧 GIVE ME MY RED PACKET" : "Connect Wallet First"}
            </button>

            {isTuesday() && (
              <div style={{ textAlign: "center", fontSize: 13, color: "#E74C3C", marginTop: 6, fontWeight: 500 }}>
                ⚠️ Tuesday Penalty Active — Win probabilities halved
              </div>
            )}
          </div>
        )}
      </div>

      {/* Envelope reveal overlay */}
      {revealing && <EnvelopeReveal outcome={revealing.outcome} payout={revealing.payout} onDone={handleRevealDone} />}
    </>
  );
}

"use client";

import { PALETTE, MIN_OFFERING } from "@/lib/constants";

const sectionStyle = {
  background: PALETTE.card,
  border: `1px solid ${PALETTE.border}`,
  borderRadius: 12,
  padding: "16px 18px",
  marginBottom: 12,
};

const titleStyle = {
  fontSize: 15,
  fontWeight: 700 as const,
  color: PALETTE.text,
  marginBottom: 8,
  display: "flex" as const,
  alignItems: "center" as const,
  gap: 8,
};

const textStyle = {
  fontSize: 13,
  color: PALETTE.textMuted,
  lineHeight: 1.6,
};

export default function RulesPanel({ network = "mainnet" }: { network?: string }) {
  const minOffer = MIN_OFFERING[network] ?? 8;
  return (
    <div>
      <div style={sectionStyle}>
        <div style={titleStyle}>🎯 How to Play</div>
        <div style={textStyle}>
          Send a minimum of <strong>{minOffer} $MON</strong> to CaiShen. Your offering
          must contain the digit &quot;8&quot; somewhere in the amount. CaiShen
          will judge your wish and reveal your red envelope&apos;s contents.
        </div>
      </div>
      <div style={sectionStyle}>
        <div style={titleStyle}>🎲 Outcomes</div>
        <div style={textStyle}>
          <div style={{ marginBottom: 6 }}>
            🥟 <strong>IOU Dumplings</strong> (50%) — Nothing returned
          </div>
          <div style={{ marginBottom: 6 }}>
            🔄 <strong>Luck Recycled</strong> (24.9%) — 1x refund
          </div>
          <div style={{ marginBottom: 6 }}>
            💰 <strong>Small Win</strong> (15%) — 1.5x payout
          </div>
          <div style={{ marginBottom: 6 }}>
            🐷 <strong>Golden Pig</strong> (8%) — 3x payout
          </div>
          <div style={{ marginBottom: 6 }}>
            🧧 <strong>JACKPOT</strong> (2%) — 8x payout (max 25% of pool)
          </div>
          <div>
            🎰 <strong>SUPER JACKPOT</strong> (0.1%) — 88x payout (max 50% of pool)
          </div>
        </div>
      </div>
      <div style={sectionStyle}>
        <div style={titleStyle}>🙏 Your Wish Matters</div>
        <div style={textStyle}>
          CáiShén reads every wish! A sincere, heartfelt wish may please the God
          of Wealth and improve your fortune. A lazy or rude wish may displease
          him. Put your heart into it!
        </div>
      </div>
      <div style={sectionStyle}>
        <div style={titleStyle}>⚠️ Superstitions & Forbidden Times</div>
        <div style={textStyle}>
          <strong>Death Numbers:</strong> Amounts with multiple 4s —
          CáiShén&apos;s mood darkens.
          <br />
          <br />
          <strong>Forbidden Days:</strong> 4th, 14th, 24th of any month —
          CáiShén&apos;s mood darkens.
          <br />
          <br />
          <strong>Ghost Hour:</strong> 4:44 AM/PM — CáiShén&apos;s mood darkens.
          <br />
          <br />
          <strong>Tuesday Penalty:</strong> CáiShén&apos;s mood darkens on
          Tuesdays.
        </div>
      </div>
      <div style={sectionStyle}>
        <div style={titleStyle}>🏮 Cultural Notes</div>
        <div style={textStyle}>
          <strong>8 (八 ba)</strong> — Sounds like &quot;prosperity&quot; (發
          fa). Extremely lucky.
          <br />
          <strong>4 (四 si)</strong> — Sounds like &quot;death&quot; (死 sǐ).
          Extremely unlucky.
          <br />
          <strong>紅包</strong> — Traditional red envelopes containing money.
          <br />
          <strong>恭喜發財</strong> — &quot;Wishing you prosperity&quot; —
          traditional CNY greeting.
        </div>
      </div>
    </div>
  );
}

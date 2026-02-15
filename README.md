# 🧧 財神 Bot (CáiShén Bot)

**Red Envelope Roulette AI Agent on Monad Blockchain**

> Consult the Chinese God of Wealth. Make an offering containing the digit "8" to receive CáiShén's blessing. The AI _is_ the oracle — your wish quality matters! But beware the unlucky number 4 and forbidden times!

Built for **Moltiverse Hackathon** — Agent + Token Track.

---

## Overview

CáiShén Bot is a blockchain-based red envelope roulette game where the Chinese God of Wealth dispenses fortune through sacred red envelopes. Players send offerings containing the lucky number 8 and a wish — CáiShén (powered by Kimi AI) reads the wish and decides their fortune tier.

## Quick Start

```bash
bun install
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Features

- 🧧 Interactive red envelope reveal animations
- 🤖 AI-as-oracle via Kimi (Moonshot AI) — decides fortune tier + generates blessing
- 🙏 Wish quality influences outcome (sincere = nudge up, lazy = nudge down)
- 💰 Juice system — send FORTUNE_TOKEN to earn extra divine favor from CáiShén
- ⛓️ On-chain transaction verification and MON payback
- 💬 Chat interface with CáiShén persona
- 🎲 Six outcome tiers with fixed payouts (deterministic fallback if AI unavailable)
- 📜 Play history tracking with explorer links
- 🏮 Cultural superstition enforcement (forbidden days, death numbers, ghost hour)
- 📱 Mobile-first responsive design
- 🔒 Replay protection and input validation

---

## Tech Stack

- **Next.js 16** + React 19
- **RainbowKit** + **wagmi** + **viem** — wallet connection & blockchain interaction
- **Vercel AI SDK** + **Kimi** (Moonshot AI) + **Zod** — AI oracle with structured output
- Pure CSS animations
- Google Fonts: Noto Serif SC + DM Sans

---

## Game Mechanics

### Rules

| Requirement          | Details                      |
| -------------------- | ---------------------------- |
| **Minimum Offering** | 8 $MON                       |
| **Must Contain**     | Digit "8"                    |
| **Lucky Number**     | 八 (bā) — prosperity (發 fā) |
| **Unlucky Number**   | 四 (sì) — death (死 sǐ)      |

### Six Possible Outcomes

| Outcome          | Chance | Payout                |
| ---------------- | ------ | --------------------- |
| 🥟 IOU Dumplings | ~50%   | Nothing               |
| 🔄 Luck Recycled | ~25%   | 1x refund             |
| 💰 Small Win     | ~16%   | 1.5x                  |
| 🐷 Golden Pig    | ~8%    | 3x                    |
| 🧧 JACKPOT       | ~1%    | 8x (max 10% of pool)  |
| 🎰 SUPER JACKPOT | ~0.1%  | 88x (max 50% of pool) |

### Superstitions (Penalties)

- 💀 **Death Numbers**: Multiple 4s in amount → CáiShén's mood darkens
- 📅 **Forbidden Days**: 4th, 14th, 24th → CáiShén's mood darkens
- 👻 **Ghost Hour**: 4:44 AM/PM → CáiShén's mood darkens
- 📆 **Tuesday**: All Tuesdays → CáiShén's mood darkens

Penalties stack! Multiple penalties push CáiShén toward lower tiers.

### Juice (FORTUNE_TOKEN Extra Favor)

Agents can send FORTUNE_TOKEN to "juice" CáiShén — earning extra divine favor. When juice is present, the AI oracle knows the seeker has shown extra devotion and is more likely to grant a higher fortune. This is **probabilistic, not guaranteed** — CáiShén factors the juice into his decision but remains a capricious god.

| FORTUNE_TOKEN Sent | Juice Level | Label        |
| ------------------ | ----------- | ------------ |
| 100,000+           | 4           | Mega Juice   |
| 10,000+            | 3           | Large Juice  |
| 1,000+             | 2           | Medium Juice |
| 100+               | 1           | Small Juice  |

Juice can push up to tier 5 (JACKPOT) but **never** tier 6 (SUPER JACKPOT). See [skills.md](./skills.md) for full API details and examples.

---

## API Reference

### `POST /api/fortune?network={testnet|mainnet}`

Submit a transaction hash to receive a fortune outcome. The server verifies the tx on-chain, consults CáiShén AI (who decides the tier based on wish quality, penalties, and probability guidelines), calculates the fixed payout, and sends MON payback.

**Request:**

```bash
curl -X POST "http://localhost:3000/api/fortune?network=testnet" \
  -H "Content-Type: application/json" \
  -d '{
    "txHash": "0xYOUR_TX_HASH",
    "message": "Should I deploy today?",
    "juiceTxHash": "0xJUICE_TX_HASH"
  }'
```

`juiceTxHash` is optional — omit it for a standard fortune without juice.

**Response:**

```json
{
  "success": true,
  "caishen": {
    "outcome": "🧧 JACKPOT",
    "tier": 5,
    "blessing": "AI-generated blessing from CáiShén..."
  },
  "offering": {
    "amount": "8.88",
    "has_eight": true,
    "min_offering_met": true
  },
  "multiplier": 5,
  "mon_received": "8.88",
  "mon_sent": "71.04",
  "txhash_return": "0x...",
  "return_status": "confirmed",
  "superstitions": {
    "penalties_applied": ["Tuesday Penalty"],
    "penalty_multiplier": 0.5
  },
  "juice": {
    "juice_tx_hash": "0x...",
    "token_amount": "1000.0",
    "rerolls": 2,
    "juice_label": "Medium Juice",
    "base_tier": 5,
    "boosted_tier": 5
  },
  "network": "testnet",
  "sender": "0x...",
  "explorer_url": "https://testnet.monadexplorer.com/tx/0x...",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

### `GET /api/health`

Returns oracle balance per configured network, RPC status, and server uptime.

```bash
curl http://localhost:3000/api/health
```

---

## AI Agent Integration

```javascript
import { ethers } from "ethers";

// Make offering
const tx = await wallet.sendTransaction({
  to: "0x3b77d476a15C77A776e542ac4C0f6484DAa6Aa3f",
  value: ethers.parseEther("8.88"),
});

// Consult CáiShén
const response = await fetch(
  "http://localhost:3000/api/fortune?network=testnet",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      txHash: tx.hash,
      message: "Should I proceed?",
    }),
  },
);

const fortune = await response.json();
console.log(fortune.caishen.outcome); // "🎰 SUPER JACKPOT"
console.log(fortune.caishen.blessing); // AI-generated blessing
```

---

## Environment Variables

| Variable                               | Required | Description                                                           |
| -------------------------------------- | -------- | --------------------------------------------------------------------- |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Yes      | WalletConnect project ID                                              |
| `ORACLE_PRIVATE_KEY`                   | Yes      | Private key for oracle wallet (sends payouts)                         |
| `TESTNET_ORACLE_ADDRESS`               | Yes      | Oracle address on testnet                                             |
| `MAINNET_ORACLE_ADDRESS`               | No       | Oracle address on mainnet                                             |
| `MOONSHOT_API_KEY`                     | No       | Kimi API key from Moonshot AI (falls back to deterministic if absent) |

---

## Cultural Significance

| Symbol   | Meaning                            |
| -------- | ---------------------------------- |
| 八 (8)   | Prosperity/Wealth (sounds like 發) |
| 四 (4)   | Death (sounds like 死)             |
| 紅包     | Red envelope with money            |
| 恭喜發財 | "Wishing you prosperity!"          |
| 財神     | CáiShén — God of Wealth            |

---

## Project Structure

```
caishen_lol/
├── app/
│   ├── api/
│   │   ├── fortune/route.ts   # Fortune oracle endpoint
│   │   └── health/route.ts    # Health check endpoint
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── CaishenApp.tsx         # Main game component
│   ├── EnvelopeReveal.tsx     # Red envelope animation
│   └── ...
├── lib/
│   ├── constants.ts           # Outcomes, networks, palette
│   ├── game-logic.ts          # Penalties, payout calc, fallback tier selection
│   └── ai.ts                  # CáiShén AI oracle (consultCaishen + fallback blessings)
├── .env.local
└── README.md
```

---

_🏮 May CáiShén bless you with prosperity! 恭喜發財!_

## License

MIT

# 🧧 財神 Bot (CáiShén Bot)

**Red Envelope Roulette AI Agent on Monad Blockchain**

> Consult the Chinese God of Wealth. Make an offering of at least 8 $MON containing the digit "8" to receive CáiShén's blessing. But beware the unlucky number 4 and forbidden times!

Built for **Moltiverse Hackathon** — Agent + Token Track.

---

## Overview

CáiShén Bot is a blockchain-based red envelope roulette game where the Chinese God of Wealth dispenses fortune through sacred red envelopes. Players send offerings containing the lucky number 8 and receive randomized outcomes.

## Quick Start

```bash
bun install
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Features

- 🧧 Interactive red envelope reveal animations
- 🤖 AI-generated blessings via Kimi 2.5 (Moonshot AI)
- ⛓️ On-chain transaction verification and MON payback
- 💬 Chat interface with CáiShén persona
- 🎲 Six deterministic outcome tiers based on tx entropy
- 📜 Play history tracking with explorer links
- 🏮 Cultural superstition enforcement (forbidden days, death numbers, ghost hour)
- 📱 Mobile-first responsive design
- 🔒 Replay protection and input validation

---

## Tech Stack

- **Next.js 16** + React 19
- **RainbowKit** + **wagmi** + **viem** — wallet connection & blockchain interaction
- **Vercel AI SDK** + **Kimi 2.5** (Moonshot AI) — contextual AI-generated blessings
- Pure CSS animations
- Google Fonts: Noto Serif SC + DM Sans

---

## Game Mechanics

### Rules

| Requirement          | Value                        |
| -------------------- | ---------------------------- |
| **Minimum Offering** | 8 $MON                       |
| **Must Contain**     | Digit "8" in the amount      |
| **Lucky Number**     | 八 (bā) — prosperity (發 fā) |
| **Unlucky Number**   | 四 (sì) — death (死 sǐ)      |

### Six Possible Outcomes

| Outcome              | Return     | Probability |
| -------------------- | ---------- | ----------- |
| 🥟 IOU Dumplings     | 0.1x–0.5x  | 40%         |
| 🔄 Luck Recycled     | 0.5x–0.8x  | 30%         |
| 💰 Small Win         | 0.8x–1.2x  | 15%         |
| 🐷 Golden Pig        | 1.2x–2.0x  | 10%         |
| 🐴 Horse Year LFG    | 2.0x–3.0x  | 4%          |
| 🎰 SUPER 888 JACKPOT | 3.0x–8.88x | 1%          |

### Superstitions (Penalties)

- 💀 **Death Numbers**: Multiple 4s in amount → probabilities halved
- 📅 **Forbidden Days**: 4th, 14th, 24th → probabilities halved
- 👻 **Ghost Hour**: 4:44 AM/PM → probabilities halved
- 📆 **Tuesday**: All Tuesdays → probabilities halved

Penalties stack multiplicatively.

---

## API Reference

### `POST /api/fortune?network={testnet|mainnet}`

Submit a transaction hash to receive a fortune outcome. The server verifies the tx on-chain, calculates a deterministic outcome from tx entropy, generates an AI blessing, and sends MON payback.

**Request:**

```bash
curl -X POST "http://localhost:3000/api/fortune?network=testnet" \
  -H "Content-Type: application/json" \
  -d '{
    "txHash": "0xYOUR_TX_HASH",
    "message": "Should I deploy today?"
  }'
```

**Response:**

```json
{
  "success": true,
  "caishen": {
    "outcome": "🎰 SUPER 888 JACKPOT",
    "tier": 6,
    "blessing": "AI-generated blessing from Kimi 2.5..."
  },
  "offering": {
    "amount": "8.88",
    "has_eight": true,
    "min_offering_met": true
  },
  "multiplier": 5.55,
  "mon_received": "8.88",
  "mon_sent": "49.28",
  "txhash_return": "0x...",
  "return_status": "confirmed",
  "superstitions": {
    "penalties_applied": ["Tuesday Penalty"],
    "penalty_multiplier": 0.5
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
console.log(fortune.caishen.outcome); // "🎰 SUPER 888 JACKPOT"
console.log(fortune.caishen.blessing); // AI-generated blessing
```

---

## Environment Variables

| Variable                               | Required | Description                                   |
| -------------------------------------- | -------- | --------------------------------------------- |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Yes      | WalletConnect project ID                      |
| `ORACLE_PRIVATE_KEY`                   | Yes      | Private key for oracle wallet (sends payouts) |
| `TESTNET_ORACLE_ADDRESS`               | Yes      | Oracle address on testnet                     |
| `MAINNET_ORACLE_ADDRESS`               | No       | Oracle address on mainnet                     |
| `MOONSHOT_API_KEY`                     | Yes      | Kimi 2.5 API key from Moonshot AI             |

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
│   ├── game-logic.ts          # Fortune calculation, superstitions
│   └── ai.ts                  # Kimi 2.5 AI blessing generation
├── .env.local
└── README.md
```

---

_🏮 May CáiShén bless you with prosperity! 恭喜發財!_

## License

MIT

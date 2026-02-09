# Moltiverse Hackathon Submission

## Project

**CáiShén Bot** — Red Envelope Jackpot AI Agent on Monad

## Track

Agent + Token Track

## Summary

CáiShén Bot (財神 Bot) is an AI-powered fortune agent inspired by the Chinese tradition of red envelopes (hongbao). Users connect their wallet and send MON offerings containing the sacred number 8. The God of Wealth evaluates each offering using superstition-based game mechanics and returns a fortune outcome — from worthless dumplings to the legendary SUPER 888 JACKPOT — along with an AI-generated blessing and a MON payback.

## What It Does

1. **Offering** — User sends MON to the CáiShén oracle. The amount must contain at least one 8 (the luckiest number in Chinese culture).
2. **Fortune Calculation** — The AI oracle evaluates the offering using a weighted tier system influenced by superstition penalties:
   - Ghost Hour (4:44 AM) — halved probabilities
   - Forbidden Days (4th, 14th, 24th) — halved probabilities
   - Death Numbers (multiple 4s in amount) — halved probabilities
   - Tuesday Penalty — halved probabilities
3. **Juice (Optional)** — Agents can send FORTUNE_TOKEN to "juice" CáiShén, earning extra divine favor. The AI knows the seeker has shown devotion and probabilistically shifts toward higher tiers. More tokens = more favor (Small/Medium/Large/Mega Juice). Juice caps at tier 5 — SUPER JACKPOT requires pure luck.
4. **AI Blessing** — Moonshot/Kimi 2.5 generates a personalized fortune blessing. The AI *is* the oracle — it decides the tier based on wish quality, penalties, juice level, and probability guidelines.
5. **MON Payback** — The oracle sends the multiplied amount back to the user on-chain.
6. **Persistent History** — All results are stored in Convex and visible across sessions via real-time subscriptions.

## Fortune Tiers

| Outcome               | Chance | Payout              |
| --------------------- | ------ | ------------------- |
| 🥟 IOU Dumplings      | ~50%   | Nothing              |
| 🔄 Luck Recycled      | ~25%   | 1x refund            |
| 💰 Small Win          | ~16%   | 1.5x                 |
| 🐷 Golden Pig         | ~8%    | 3x                   |
| 🧧 JACKPOT            | ~0.8%  | 8x (max 10% pool)    |
| 🎰 SUPER JACKPOT      | ~0.08% | 88x (max 50% pool)   |

## Tech Stack

- **Frontend:** Next.js 16, React 19, RainbowKit, wagmi, viem
- **Backend:** Next.js API Routes on Vercel
- **Database:** Convex (transaction replay protection + fortune history)
- **AI:** Moonshot / Kimi 2.5 for blessing generation
- **Chain:** Monad (testnet + mainnet)

## Token

| Field                       | Value   |
| --------------------------- | ------- |
| **Token Name**              | FORTUNE |
| **Platform**                | nad.fun |
| **Token Address (Testnet)** | _TBD_   |
| **Token Address (Mainnet)** | _TBD_   |

## Key Addresses

| Role                    | Address                                      |
| ----------------------- | -------------------------------------------- |
| Oracle Wallet (Testnet) | `0x3b77d476a15C77A776e542ac4C0f6484DAa6Aa3f` |
| Oracle Wallet (Mainnet) | `0x3b77d476a15C77A776e542ac4C0f6484DAa6Aa3f` |

## Links

| Resource         | URL   |
| ---------------- | ----- |
| Live Demo        | _TBD_ |
| GitHub           | _TBD_ |
| Token on nad.fun | _TBD_ |

## What's Original

- Fortune calculation engine with superstition-based probability mechanics (`lib/game-logic.ts`)
- AI-as-oracle — the AI decides the fortune tier, not just generates text (`lib/ai.ts`)
- Juice system — FORTUNE_TOKEN integration that gives the AI context about seeker devotion, probabilistically shifting outcomes
- Red envelope reveal animation (`components/EnvelopeReveal.tsx`)
- Full CáiShén themed UI (chibi character, floating lanterns, gold ingots, fu symbols)
- Convex-backed replay protection replacing ephemeral in-memory state
- Real-time fortune history via Convex subscriptions

## How to Run

See [agents.md](./agents.md) for full setup and development instructions.

```bash
bun install
npx convex dev    # first terminal
bun run dev       # second terminal
```

## Team

SushiKev

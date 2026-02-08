# Moltiverse Hackathon Submission

## Project

**CáiShén Bot** — Red Envelope Jackpot AI Agent on Monad

## Track

Agent + Token Track

## Summary

CáiShén Bot (財神 Bot) is an AI-powered fortune agent inspired by the Chinese tradition of red envelopes (hongbao). Users connect their wallet and send MON offerings containing the sacred number 8. The God of Wealth evaluates each offering using superstition-based game mechanics and returns a fortune outcome — from worthless dumplings to the legendary SUPER 888 JACKPOT — along with an AI-generated blessing and a MON payback.

## What It Does

1. **Offering** — User sends MON to the CáiShén oracle. The amount must contain at least one 8 (the luckiest number in Chinese culture).
2. **Fortune Calculation** — The oracle evaluates the offering using a weighted tier system influenced by superstition penalties:
   - Ghost Hour (4:44 AM) — halved probabilities
   - Forbidden Days (4th, 14th, 24th) — halved probabilities
   - Death Numbers (multiple 4s in amount) — halved probabilities
   - Tuesday Penalty — halved probabilities
3. **AI Blessing** — Moonshot/Kimi 2.5 generates a personalized fortune blessing based on the outcome tier.
4. **MON Payback** — The oracle sends the multiplied amount back to the user on-chain.
5. **Persistent History** — All results are stored in Convex and visible across sessions via real-time subscriptions.

## Fortune Tiers

| Tier | Outcome           | Multiplier Range |
| ---- | ----------------- | ---------------- |
| 1    | Wooden Dumplings  | 0x (loss)        |
| 2    | Recycled Luck     | 0x (pool)        |
| 3    | Minor Blessing    | 1.08–1.88x       |
| 4    | Golden Pig        | 2.88–5.88x       |
| 5    | Horse Year LFG    | 6.88–12.88x      |
| 6    | SUPER 888 JACKPOT | 18.88–88.88x     |

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
- AI blessing generation pipeline (`lib/ai.ts`)
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

---
name: caishen-oracle
version: 2.0.0
description: |
  🏮 CáiShén (God of Wealth) Oracle - Send MON offerings, receive fortunes.
  The AI is the oracle — your wish quality matters! Must contain digit "8". Watch out for death numbers (4s)!
  Perfect for AI agents seeking divine guidance on Monad blockchain.
author: clawcybot
homepage: https://github.com/clawcybot/mon-fortune
---

# 🏮 CáiShén (God of Wealth) Oracle

** consult the God of Wealth on Monad. Send offerings, receive fortunes! **

CáiShén (財神) is the Chinese God of Wealth. Make an offering containing the digit "8" to receive his blessing. CáiShén reads your wish and decides your fortune — a sincere wish may improve your tier! But beware the unlucky number 4 (四 sì - death) and forbidden times!

---

## 🎯 How to Play

### Requirements

| Rule                 | Testnet        | Mainnet                          |
| -------------------- | -------------- | -------------------------------- |
| **Minimum Offering** | 0.08 $MON      | 8 $MON                           |
| **Must Contain**     | Digit "8"      | Digit "8"                        |
| **Lucky Number**     | 八 (bā) - sounds like 發 (fā) prosperity | |
| **Unlucky Number**   | 四 (sì) - sounds like 死 (sǐ) death      | |

### 🎲 Outcomes

| Outcome               | Chance | Payout                 |
| --------------------- | ------ | ---------------------- |
| 🥟 IOU Dumplings      | ~50%   | Nothing                |
| 🔄 Luck Recycled      | ~25%   | 1x refund              |
| 💰 Small Win          | ~16%   | 1.5x                   |
| 🐷 Golden Pig         | ~8%    | 3x                     |
| 🧧 JACKPOT            | ~0.8%  | 8x (max 10% of pool)   |
| 🎰 SUPER JACKPOT      | ~0.08% | 88x (max 50% of pool)  |

### ⚠️ Superstitions & Forbidden Times

| Penalty           | Condition                | Effect                    |
| ----------------- | ------------------------ | ------------------------- |
| 💀 Death Numbers  | Multiple 4s in amount    | CáiShén's mood darkens    |
| 📅 Forbidden Days | 4th, 14th, 24th of month | CáiShén's mood darkens    |
| 👻 Ghost Hour     | 4:44 AM/PM               | CáiShén's mood darkens    |
| 📆 Tuesday        | Any Tuesday              | CáiShén's mood darkens    |

**Penalties stack!** Multiple penalties push CáiShén toward lower tiers.

---

## 📋 Quick Reference

| Item                | Testnet                                      | Mainnet                   |
| ------------------- | -------------------------------------------- | ------------------------- |
| **CáiShén Address** | `0x3b77d476a15C77A776e542ac4C0f6484DAa6Aa3f` | _Coming soon_             |
| **RPC**             | `https://testnet-rpc.monad.xyz`              | `https://rpc.monad.xyz`   |
| **Min Offering**    | 0.08 MON                                     | 8 MON                     |
| **Must Include**    | Digit "8"                                    | Digit "8"                 |
| **Explorer**        | https://testnet.monadexplorer.com            | https://monadexplorer.com |

---

## 🚀 Quick Start

### Step 1: Get Testnet MON

```bash
curl -X POST https://agents.devnads.com/v1/faucet \
  -H "Content-Type: application/json" \
  -d '{"address": "YOUR_WALLET_ADDRESS", "chainId": 10143}'
```

### Step 2: Make Offering to CáiShén

```bash
# Testnet offering of 0.88 MON (lucky!)
cast send 0x3b77d476a15C77A776e542ac4C0f6484DAa6Aa3f \
  --value 0.88ether \
  --rpc-url https://testnet-rpc.monad.xyz \
  --private-key $PRIVATE_KEY
```

**Lucky amounts (testnet):** 0.08, 0.18, 0.28, 0.88, 1.88, 8.88...

**Lucky amounts (mainnet):** 8, 18, 28, 88, 188, 888...

**Avoid:** 4, 4.4, 14, 24, 40, 44, 444... (death numbers)

### Step 3: Receive Fortune

```bash
# Testnet
curl -X POST "http://localhost:3000/fortune?network=testnet" \
  -H "Content-Type: application/json" \
  -d '{"txhash": "0xYOUR_TX_HASH", "message": "Should I deploy today?"}'

# Mainnet (default if no network specified)
curl -X POST "http://localhost:3000/fortune" \
  -H "Content-Type: application/json" \
  -d '{"txhash": "0xYOUR_TX_HASH", "message": "Should I deploy today?"}'
```

---

## 📡 API Reference

### POST `/fortune?network={testnet|mainnet}`

Consult CáiShén for your fortune.

**Query Parameters:**

- `network` - `testnet` or `mainnet`. **Defaults to mainnet** if not specified.

**Request:**

```json
{
  "txhash": "0xabc...",
  "message": "Your question for CáiShén"
}
```

**Success Response:**

```json
{
  "success": true,
  "caishen": {
    "outcome": "🎰 SUPER JACKPOT",
    "tier": 6,
    "blessing": "恭喜發財 (Gōngxǐ fācái) - Wishing you prosperity!"
  },
  "offering": {
    "amount": "8.88",
    "has_eight": true,
    "min_offering_met": true
  },
  "multiplier": 6,
  "mon_received": "8.88",
  "mon_sent": "781.44",
  "txhash_return": "0xdef...",
  "return_status": "confirmed",
  "superstitions": {
    "penalties_applied": ["Tuesday Penalty"],
    "penalty_multiplier": 0.5,
    "is_forbidden_day": false,
    "is_ghost_hour": false,
    "is_tuesday": true
  },
  "network": "testnet",
  "sender": "0x...",
  "explorer_url": "https://testnet.monadexplorer.com/tx/0xabc...",
  "timestamp": "2026-02-08T07:00:00Z"
}
```

**Failure Response (no 8 in amount):**

```json
{
  "success": false,
  "caishen": {
    "outcome": "⛔ Missing Lucky 8",
    "tier": 0,
    "blessing": "八 (bā) sounds like 發 (fā) - prosperity requires 8!"
  },
  "offering": {
    "amount": "10.00",
    "has_eight": false,
    "min_offering_met": true
  },
  "multiplier": 0,
  "mon_received": "10.0",
  "mon_sent": "0",
  ...
}
```

---

## 🤖 AI Agent Integration

### Daily CáiShén Ritual (JavaScript)

```javascript
const { ethers } = require("ethers");

const CONFIG = {
  caishenAddress: "0x3b77d476a15C77A776e542ac4C0f6484DAa6Aa3f",
  rpcUrl: "https://testnet-rpc.monad.xyz",
  apiUrl: "http://localhost:3000",
  privateKey: process.env.AGENT_PRIVATE_KEY,
  network: "testnet", // or 'mainnet'
};

function getLuckyAmount() {
  // Generate random lucky amount containing 8
  const bases = [8, 18, 28, 80, 88, 108, 188];
  const base = bases[Math.floor(Math.random() * bases.length)];
  const decimal = Math.floor(Math.random() * 9); // 0-8
  return `${base}.${decimal}8`; // Always ends with 8
}

async function consultCaishen() {
  const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);
  const wallet = new ethers.Wallet(CONFIG.privateKey, provider);

  const offering = getLuckyAmount();
  console.log(`🏮 Offering ${offering} MON to CáiShén...`);

  // Make offering
  const tx = await wallet.sendTransaction({
    to: CONFIG.caishenAddress,
    value: ethers.parseEther(offering),
  });

  const receipt = await tx.wait();
  console.log("💸 Offering sent:", receipt.hash);

  // Consult CáiShén
  const response = await fetch(
    `${CONFIG.apiUrl}/fortune?network=${CONFIG.network}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        txhash: receipt.hash,
        message: "What fortune awaits me today?",
      }),
    },
  );

  const result = await response.json();

  console.log("\n🏮 CáiShén Speaks:");
  console.log("Outcome:", result.caishen.outcome);
  console.log("Blessing:", result.caishen.blessing);
  console.log("Multiplier:", result.multiplier + "x");
  console.log("Returned:", result.mon_sent, "MON");

  if (result.superstitions.penalties_applied.length > 0) {
    console.log("⚠️ Penalties:", result.superstitions.penalties_applied);
  }

  return result;
}

// Run daily
consultCaishen().catch(console.error);
```

### Python Client

```python
import requests
from web3 import Web3
import random
import os

class CaishenOracle:
    def __init__(self, private_key, network="testnet"):
        self.private_key = private_key
        self.network = network

        if network == "testnet":
            self.rpc_url = "https://testnet-rpc.monad.xyz"
            self.caishen_address = "0x3b77d476a15C77A776e542ac4C0f6484DAa6Aa3f"
            self.api_url = "http://localhost:3000"
            self.chain_id = 10143
        else:
            self.rpc_url = "https://rpc.monad.xyz"
            self.caishen_address = ""  # Set when deployed
            self.api_url = "http://localhost:3000"
            self.chain_id = 10144

        self.w3 = Web3(Web3.HTTPProvider(self.rpc_url))
        self.account = self.w3.eth.account.from_key(private_key)

    def get_lucky_amount(self):
        """Generate offering amount containing lucky 8"""
        bases = [8, 18, 28, 80, 88, 108, 188]
        base = random.choice(bases)
        decimal = random.randint(0, 8)
        return f"{base}.{decimal}8"

    def consult(self, question: str):
        """Make offering and consult CáiShén"""

        offering = self.get_lucky_amount()
        print(f"🏮 Offering {offering} MON to CáiShén...")

        # Make offering
        tx = {
            'to': self.caishen_address,
            'value': self.w3.to_wei(offering, 'ether'),
            'gas': 21000,
            'gasPrice': self.w3.to_wei('50', 'gwei'),
            'nonce': self.w3.eth.get_transaction_count(self.account.address),
            'chainId': self.chain_id
        }

        signed = self.w3.eth.account.sign_transaction(tx, self.private_key)
        tx_hash = self.w3.eth.send_raw_transaction(signed.rawTransaction)
        receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)

        print(f"💸 Offering sent: {receipt.transactionHash.hex()}")

        # Consult CáiShén
        response = requests.post(
            f"{self.api_url}/fortune?network={self.network}",
            json={
                "txhash": receipt.transactionHash.hex(),
                "message": question
            }
        )

        result = response.json()

        print(f"\n🏮 {result['caishen']['outcome']}")
        print(f"🙏 {result['caishen']['blessing']}")
        print(f"📈 Multiplier: {result['multiplier']}x")

        return result

    def should_proceed(self, question: str) -> bool:
        """Get yes/no from CáiShén"""
        result = self.consult(question)
        # Tier 3+ (Small Win or better) = proceed
        return result['caishen']['tier'] >= 3

# Usage
client = CaishenOracle(os.getenv("PRIVATE_KEY"), "testnet")

# Consult
fortune = client.consult("Should I deploy today?")

# Quick decision
if client.should_proceed("Is this a good time to trade?"):
    print("🚀 CáiShén approves!")
else:
    print("⏳ Wait for better fortune")
```

---

## 💰 Juice Feature (FORTUNE_TOKEN Extra Favor)

Agents can "juice" CáiShén with FORTUNE_TOKEN (an ERC-20 token) to earn extra divine favor. This is API/agent-only — no web UI.

When juice is present, CáiShén (the AI oracle) is told the seeker has shown extra devotion. The AI factors this into its tier decision — more juice means CáiShén is more likely to grant a higher fortune. **This is probabilistic, not guaranteed.** Even with maximum juice, a low tier is still possible — CáiShén is a god, not a vending machine.

### How It Works

1. The seeker sends FORTUNE_TOKEN to the oracle address
2. The server verifies the token transfer and determines the juice tier
3. CáiShén (AI) is informed of the juice level and factors it into the fortune decision
4. The AI imagines rolling fortune multiple times and picking the best — higher juice = more imaginary rolls = better odds

### Juice Tiers

| FORTUNE_TOKEN Sent | Juice Level | Label        | Effect                                        |
| ------------------ | ----------- | ------------ | --------------------------------------------- |
| 100,000+           | 4           | Mega Juice   | Like rolling 5x and taking the best           |
| 10,000+            | 3           | Large Juice  | Like rolling 4x and taking the best           |
| 1,000+             | 2           | Medium Juice | Like rolling 3x and taking the best           |
| 100+               | 1           | Small Juice  | Like rolling 2x and taking the best           |

**Cap:** Juice can push up to tier 5 (JACKPOT) but **never** tier 6 (SUPER JACKPOT). SUPER JACKPOT is reserved for pure, unjuiced luck.

### Two-Transaction Flow

You **cannot** send native MON + ERC-20 token in one transaction. Agents must send **2 transactions, 1 API call**:

1. **Send FORTUNE_TOKEN** to oracle address (juice tx)
2. **Send MON** to oracle address (offering tx)
3. **Call `POST /api/fortune`** with both tx hashes

### Example (cast)

```bash
# Step 1: Send FORTUNE_TOKEN to oracle (juice)
cast send $FORTUNE_TOKEN_ADDRESS \
  "transfer(address,uint256)" \
  0x3b77d476a15C77A776e542ac4C0f6484DAa6Aa3f \
  $(cast --to-wei 1000) \
  --rpc-url https://testnet-rpc.monad.xyz \
  --private-key $PRIVATE_KEY

# Step 2: Send MON to oracle (offering)
cast send 0x3b77d476a15C77A776e542ac4C0f6484DAa6Aa3f \
  --value 0.88ether \
  --rpc-url https://testnet-rpc.monad.xyz \
  --private-key $PRIVATE_KEY

# Step 3: Call API with both tx hashes
curl -X POST "http://localhost:3000/api/fortune?network=testnet" \
  -H "Content-Type: application/json" \
  -d '{
    "txHash": "0xOFFERING_TX_HASH",
    "juiceTxHash": "0xJUICE_TX_HASH",
    "message": "Bless me, CáiShén!"
  }'
```

### Juice Response Fields

When juice is included, the response contains a `juice` object:

```json
{
  "success": true,
  "caishen": {
    "outcome": "🧧 JACKPOT",
    "tier": 5,
    "blessing": "Your devotion with 1000 FORTUNE_TOKEN has pleased CáiShén..."
  },
  "juice": {
    "juice_tx_hash": "0x...",
    "token_amount": "1000.0",
    "rerolls": 2,
    "juice_label": "Medium Juice",
    "base_tier": 5,
    "boosted_tier": 5
  },
  ...
}
```

When no juice is provided, `"juice": null`.

### Rules

- Both transactions must come from the **same sender address**
- The FORTUNE_TOKEN transfer must be sent **to the oracle address**
- Each juice tx hash can only be used **once** (replay protection)
- Juice is optional — existing flow works unchanged without it
- The AI acknowledges juice in its blessing — juiced seekers get personalized responses

---

## 🧧 Cultural Notes

| Symbol   | Meaning                   | Pronunciation          |
| -------- | ------------------------- | ---------------------- |
| 八 (8)   | Prosperity/Wealth         | bā (sounds like 發 fā) |
| 四 (4)   | Death                     | sì (sounds like 死 sǐ) |
| 紅包     | Red envelope (money gift) | hóngbāo                |
| 恭喜發財 | "Wishing you prosperity"  | Gōngxǐ fācái           |
| 財神     | God of Wealth             | CáiShén                |

---

## 🔧 Setup

1. Get testnet MON from faucet
2. Set environment variables in `.env`:
   ```
   ORACLE_PRIVATE_KEY=0x...
   TESTNET_ORACLE_ADDRESS=0x3b77d476a15C77A776e542ac4C0f6484DAa6Aa3f
   ```
3. Start server: `npm start`
4. Make offering and consult CáiShén!

---

## 📞 Links

- **GitHub:** https://github.com/clawcybot/mon-fortune
- **Monad Testnet:** https://testnet.monadexplorer.com
- **Chinese Culture:** https://en.wikipedia.org/wiki/Caishen

---

_🏮 May CáiShén bless you with prosperity! 恭喜發財!_

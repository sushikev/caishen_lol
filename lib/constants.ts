export const OUTCOMES = [
  { emoji: "🥟", label: "IOU Dumplings", tier: 1, minMult: 0.1, maxMult: 0.5, probability: 0.40, color: "#8B7355" },
  { emoji: "🔄", label: "Luck Recycled", tier: 2, minMult: 0.5, maxMult: 0.8, probability: 0.30, color: "#9B59B6" },
  { emoji: "💰", label: "Small Win", tier: 3, minMult: 0.8, maxMult: 1.2, probability: 0.15, color: "#27AE60" },
  { emoji: "🐷", label: "Golden Pig", tier: 4, minMult: 1.2, maxMult: 2.0, probability: 0.10, color: "#F39C12" },
  { emoji: "🐴", label: "Horse Year LFG", tier: 5, minMult: 2.0, maxMult: 3.0, probability: 0.04, color: "#E67E22" },
  { emoji: "🎰", label: "SUPER 888 JACKPOT", tier: 6, minMult: 3.0, maxMult: 8.88, probability: 0.01, color: "#FFD700" },
] as const;

export const SUGGESTED_AMOUNTS = [8, 18, 28, 88, 188, 888] as const;

export const PALETTE = {
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
} as const;

export const NETWORKS = {
  testnet: {
    name: "testnet" as const,
    rpcUrl: process.env.TESTNET_RPC || "https://testnet-rpc.monad.xyz",
    oracleAddress: process.env.TESTNET_ORACLE_ADDRESS || "",
    explorer: "https://testnet.monadexplorer.com",
    chainId: 10143,
  },
  mainnet: {
    name: "mainnet" as const,
    rpcUrl: process.env.MAINNET_RPC || "https://rpc.monad.xyz",
    oracleAddress: process.env.MAINNET_ORACLE_ADDRESS || "",
    explorer: "https://monadexplorer.com",
    chainId: 10144,
  },
} as const;

export type NetworkName = keyof typeof NETWORKS;

// Oracle address used by the client — defaults to testnet oracle
export const HOUSE_WALLET_ADDRESS = (
  process.env.NEXT_PUBLIC_ORACLE_ADDRESS ||
  process.env.TESTNET_ORACLE_ADDRESS ||
  "0x3b77d476a15C77A776e542ac4C0f6484DAa6Aa3f"
) as `0x${string}`;

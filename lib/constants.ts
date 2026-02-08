export const OUTCOMES = [
  { emoji: "🥟", label: "IOU Dumplings", tier: 1, payout: "nothing",     probability: 0.50,  color: "#8B7355" },
  { emoji: "🔄", label: "Luck Recycled", tier: 2, payout: "pool",        probability: 0.249, color: "#9B59B6" },
  { emoji: "💰", label: "Small Win",     tier: 3, payout: "1.5x",        probability: 0.15,  color: "#27AE60" },
  { emoji: "🐷", label: "Golden Pig",    tier: 4, payout: "3x",          probability: 0.08,  color: "#F39C12" },
  { emoji: "🧧", label: "JACKPOT",       tier: 5, payout: "8x",          probability: 0.02,  color: "#E67E22" },
  { emoji: "🎰", label: "SUPER JACKPOT", tier: 6, payout: "88x",         probability: 0.001, color: "#FFD700" },
] as const;

export const MIN_OFFERING: Record<string, number> = {
  testnet: 0.08,
  mainnet: 8,
};

export const SUGGESTED_AMOUNTS: Record<string, readonly number[]> = {
  testnet: [0.08, 0.18, 0.28, 0.88, 1.88, 8.88],
  mainnet: [8, 18, 28, 88, 188, 888],
};

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

// Oracle addresses per network (client-side)
export const ORACLE_ADDRESSES: Record<string, `0x${string}`> = {
  testnet: (process.env.NEXT_PUBLIC_TESTNET_ORACLE_ADDRESS || "0x052d27b4b7756d9662f9c2E43F4Fa82c52eE7627") as `0x${string}`,
  mainnet: (process.env.NEXT_PUBLIC_MAINNET_ORACLE_ADDRESS || "0x052d27b4b7756d9662f9c2E43F4Fa82c52eE7627") as `0x${string}`,
};

// Default oracle address — used for sending offerings
export const HOUSE_WALLET_ADDRESS = ORACLE_ADDRESSES.testnet;

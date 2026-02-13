export const OUTCOMES = [
  { emoji: "🥟", label: "IOU Dumplings", tier: 1, payout: "nothing",     probability: 0.50,   color: "#8B7355" },
  { emoji: "🔄", label: "Luck Recycled", tier: 2, payout: "1x",          probability: 0.2512, color: "#9B59B6" },
  { emoji: "💰", label: "Small Win",     tier: 3, payout: "1.5x",        probability: 0.16,   color: "#27AE60" },
  { emoji: "🐷", label: "Golden Pig",    tier: 4, payout: "3x",          probability: 0.08,   color: "#F39C12" },
  { emoji: "🧧", label: "JACKPOT",       tier: 5, payout: "8x",          probability: 0.008,  color: "#E67E22" },
  { emoji: "🎰", label: "SUPER JACKPOT", tier: 6, payout: "88x",         probability: 0.0008, color: "#FFD700" },
] as const;

export const MIN_OFFERING: Record<string, number> = {
  testnet: 8,
  mainnet: 8,
};

export const SUGGESTED_AMOUNTS: Record<string, readonly number[]> = {
  testnet: [8, 18, 28, 88, 188, 888],
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
    oracleAddress: process.env.TESTNET_ORACLE_ADDRESS || process.env.NEXT_PUBLIC_TESTNET_ORACLE_ADDRESS || "0x0000000000000000000000000000000000000000",
    explorer: "https://testnet.monadexplorer.com",
    chainId: 10143,
  },
  mainnet: {
    name: "mainnet" as const,
    rpcUrl: process.env.MAINNET_RPC || "https://rpc.monad.xyz",
    oracleAddress: process.env.MAINNET_ORACLE_ADDRESS || process.env.NEXT_PUBLIC_MAINNET_ORACLE_ADDRESS || "0x0000000000000000000000000000000000000000",
    explorer: "https://monadexplorer.com",
    chainId: 143,
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

export const FORTUNE_TOKEN_ADDRESS: Record<string, `0x${string}`> = {
  testnet: (process.env.FORTUNE_TOKEN_ADDRESS_TESTNET || "0x0000000000000000000000000000000000000000") as `0x${string}`,
  mainnet: (process.env.FORTUNE_TOKEN_ADDRESS_MAINNET || "0x0000000000000000000000000000000000000000") as `0x${string}`,
};

// Sorted descending — match highest qualifying tier first
export const JUICE_TIERS = [
  { minTokens: 100_000, rerolls: 4, label: "Mega Juice" },
  { minTokens: 10_000,  rerolls: 3, label: "Large Juice" },
  { minTokens: 1_000,   rerolls: 2, label: "Medium Juice" },
  { minTokens: 100,     rerolls: 1, label: "Small Juice" },
];

// Cap: 5 = juice can't reach SUPER JACKPOT, 6 = no cap
export const JUICE_MAX_TIER = 5;

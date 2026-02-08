export const OUTCOMES = [
  { emoji: "🥟", label: "IOU Dumplings", chance: 50, multiplier: 0, color: "#8B7355" },
  { emoji: "🔄", label: "Luck Recycled", chance: 26.9, multiplier: 0, color: "#9B59B6" },
  { emoji: "💰", label: "Small Win", chance: 15, multiplier: 1.5, color: "#27AE60" },
  { emoji: "🐷", label: "Golden Pig", chance: 8, multiplier: 3, color: "#F39C12" },
  { emoji: "🎰", label: "SUPER JACKPOT", chance: 0.1, multiplier: 88, color: "#FFD700" },
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

// Replace with your actual house wallet address
export const HOUSE_WALLET_ADDRESS = "0x0000000000000000000000000000000000000000" as `0x${string}`;

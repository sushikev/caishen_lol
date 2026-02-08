import crypto from "crypto";
import { OUTCOMES } from "./constants";

export function hasEight(val: string | number): boolean {
  return String(val).includes("8");
}

export function isDeathNumber(val: string | number): boolean {
  const s = String(val).replace(/[^0-9]/g, "");
  return (s.match(/4/g) || []).length >= 2;
}

export function formatMON(n: number): string {
  return Number(n).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function isForbiddenDay(): boolean {
  const d = new Date().getDate();
  return d === 4 || d === 14 || d === 24;
}

export function isGhostHour(): boolean {
  const h = new Date().getHours();
  const m = new Date().getMinutes();
  return (h === 4 || h === 16) && m === 44;
}

export function isTuesday(): boolean {
  return new Date().getDay() === 2;
}

function containsEight(amountStr: string): boolean {
  return amountStr.includes("8");
}

function hasMultipleFours(amountStr: string): boolean {
  const fours = (amountStr.match(/4/g) || []).length;
  return fours >= 2;
}

export interface FortuneError {
  outcome: { emoji: string; label: string; tier: 0 };
  multiplier: 0;
  message: string;
  blessing: string;
}

export interface PenaltyResult {
  penalties: string[];
  penaltyMultiplier: number;
}

export function detectPenalties(amountWei: string): PenaltyResult {
  const amountMon = Number(amountWei) / 1e18;
  const amountStr = amountMon.toString();

  let penalty = 1.0;
  const penalties: string[] = [];

  if (hasMultipleFours(amountStr)) {
    penalty *= 0.5;
    penalties.push("Death Numbers (multiple 4s)");
  }
  if (isForbiddenDay()) {
    penalty *= 0.5;
    penalties.push("Forbidden Day (4th/14th/24th)");
  }
  if (isGhostHour()) {
    penalty *= 0.5;
    penalties.push("Ghost Hour (4:44)");
  }
  if (isTuesday()) {
    penalty *= 0.5;
    penalties.push("Tuesday Penalty");
  }

  return { penalties, penaltyMultiplier: penalty };
}

export function calculatePayout(
  tier: number,
  offeringWei: bigint,
  poolBalanceWei: bigint,
): bigint {
  switch (tier) {
    case 1:
      return BigInt(0);
    case 2:
      return offeringWei;
    case 3:
      return (offeringWei * BigInt(150)) / BigInt(100);
    case 4:
      return (offeringWei * BigInt(300)) / BigInt(100);
    case 5:
      return bigintMin((offeringWei * BigInt(800)) / BigInt(100), poolBalanceWei / BigInt(4));
    case 6:
      return bigintMin((offeringWei * BigInt(8800)) / BigInt(100), poolBalanceWei / BigInt(2));
    default:
      return BigInt(0);
  }
}

function bigintMin(a: bigint, b: bigint): bigint {
  return a < b ? a : b;
}

export function fallbackTierSelection(
  txhash: string,
  message: string,
  penaltyMultiplier: number,
): number {
  const msgHash = crypto.createHash("sha256").update(txhash + message).digest("hex");
  const entropy = parseInt(msgHash.substring(0, 8), 16) / 0xffffffff;

  const adjustedEntropy = entropy * penaltyMultiplier;

  let selectedTier = OUTCOMES[OUTCOMES.length - 1].tier;
  let cumulative = 0;
  for (const outcome of OUTCOMES) {
    cumulative += outcome.probability;
    if (adjustedEntropy <= cumulative) {
      selectedTier = outcome.tier;
      break;
    }
  }

  return selectedTier;
}

export function validateOffering(amountWei: string, minOffering: number = 8): FortuneError | null {
  const amountMon = Number(amountWei) / 1e18;
  const amountStr = amountMon.toString();

  if (amountMon < minOffering) {
    return {
      outcome: { emoji: "\u26D4", label: "Offering Too Small", tier: 0 },
      multiplier: 0,
      message: `CáiShén requires a minimum offering of ${minOffering} $MON`,
      blessing: `恭喜發財 - Wishing you prosperity (try again with ${minOffering}+ MON)`,
    };
  }

  if (!containsEight(amountStr)) {
    return {
      outcome: { emoji: "\u26D4", label: "Missing Lucky 8", tier: 0 },
      multiplier: 0,
      message: "Your offering must contain the digit '8' to please CáiShén",
      blessing: "八 (bā) sounds like 發 (fā) - prosperity requires 8!",
    };
  }

  return null;
}

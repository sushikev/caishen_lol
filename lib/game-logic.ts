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

export interface FortuneResult {
  outcome: (typeof OUTCOMES)[number];
  multiplier: number;
  penaltiesApplied: string[];
  penaltyMultiplier: number;
  blessing: string;
  hasEight: boolean;
  minOffering: boolean;
}

export interface FortuneError {
  outcome: { emoji: string; label: string; tier: 0; minMult: 0; maxMult: 0 };
  multiplier: 0;
  message: string;
  blessing: string;
}

export function calculateFortune(
  amountWei: string,
  txhash: string,
  message: string,
): FortuneResult | FortuneError {
  const amountMon = Number(amountWei) / 1e18;
  const amountStr = amountMon.toString();

  const hasEightDigit = containsEight(amountStr);
  const minOffering = amountMon >= 8;

  if (!minOffering) {
    return {
      outcome: { emoji: "⛔", label: "Offering Too Small", tier: 0, minMult: 0, maxMult: 0 },
      multiplier: 0,
      message: "CáiShén requires a minimum offering of 8 $MON",
      blessing: "恭喜發財 - Wishing you prosperity (try again with 8+ MON)",
    };
  }

  if (!hasEightDigit) {
    return {
      outcome: { emoji: "⛔", label: "Missing Lucky 8", tier: 0, minMult: 0, maxMult: 0 },
      multiplier: 0,
      message: "Your offering must contain the digit '8' to please CáiShén",
      blessing: "八 (bā) sounds like 發 (fā) - prosperity requires 8!",
    };
  }

  // Calculate base luck from txhash + message entropy
  const msgHash = crypto.createHash("sha256").update(txhash + message).digest("hex");
  const entropy = parseInt(msgHash.substring(0, 8), 16) / 0xffffffff;

  // Apply superstition penalties
  let penalty = 1.0;
  const penaltiesApplied: string[] = [];

  if (hasMultipleFours(amountStr)) {
    penalty *= 0.5;
    penaltiesApplied.push("Death Numbers (multiple 4s)");
  }
  if (isForbiddenDay()) {
    penalty *= 0.5;
    penaltiesApplied.push("Forbidden Day (4th/14th/24th)");
  }
  if (isGhostHour()) {
    penalty *= 0.5;
    penaltiesApplied.push("Ghost Hour (4:44)");
  }
  if (isTuesday()) {
    penalty *= 0.5;
    penaltiesApplied.push("Tuesday Penalty");
  }

  // Select outcome based on cumulative probability with adjusted entropy
  const adjustedEntropy = entropy * penalty;
  let selectedOutcome = OUTCOMES[OUTCOMES.length - 1];
  let cumulative = 0;
  for (const outcome of OUTCOMES) {
    cumulative += outcome.probability;
    if (adjustedEntropy <= cumulative) {
      selectedOutcome = outcome;
      break;
    }
  }

  // Calculate multiplier within tier range using secondary entropy
  const range = selectedOutcome.maxMult - selectedOutcome.minMult;
  const multEntropy = parseInt(msgHash.substring(8, 16), 16) / 0xffffffff;
  const multiplier = selectedOutcome.minMult + range * multEntropy;

  // Static blessing fallback (AI blessing is generated separately)
  const blessings = [
    "恭喜發財 (Gōngxǐ fācái) - Wishing you prosperity!",
    "紅包拿來 (Hóngbāo ná lái) - Hand over the red envelope!",
    "財源滾滾 (Cái yuán gǔn gǔn) - May wealth flow in!",
    "大吉大利 (Dàjí dàlì) - Great luck and prosperity!",
    "年年有餘 (Nián nián yǒu yú) - Abundance year after year!",
  ];
  const blessing = blessings[Math.floor(entropy * blessings.length)];

  return {
    outcome: selectedOutcome,
    multiplier,
    penaltiesApplied,
    penaltyMultiplier: penalty,
    blessing,
    hasEight: hasEightDigit,
    minOffering,
  };
}

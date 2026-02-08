export function hasEight(val: string | number): boolean {
  return String(val).includes("8");
}

export function isDeathNumber(val: string | number): boolean {
  const s = String(val).replace(/[^0-9]/g, "");
  return (s.match(/4/g) || []).length >= 2;
}

export function rollOutcome(penaltyActive: boolean): number {
  const rand = Math.random() * 100;
  const probs = penaltyActive
    ? [62.4, 25.9, 7.5, 4, 0.2]
    : [50, 26.9, 15, 8, 0.1];
  let cumulative = 0;
  for (let i = 0; i < probs.length; i++) {
    cumulative += probs[i];
    if (rand < cumulative) return i;
  }
  return 0;
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
  return (h === 4 || h === 16) && m >= 44 && m <= 44;
}

export function isTuesday(): boolean {
  return new Date().getDay() === 2;
}

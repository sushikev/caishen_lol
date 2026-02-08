import { NextResponse } from "next/server";

const OUTCOMES = [
  { emoji: "🥟", label: "IOU Dumplings", multiplier: 0 },
  { emoji: "🔄", label: "Luck Recycled", multiplier: 0 },
  { emoji: "💰", label: "Small Win", multiplier: 1.5 },
  { emoji: "🐷", label: "Golden Pig", multiplier: 3 },
  { emoji: "🎰", label: "SUPER JACKPOT", multiplier: 88 },
];

function rollOutcome(): number {
  const rand = Math.random() * 100;
  const probs = [50, 26.9, 15, 8, 0.1];
  let cumulative = 0;
  for (let i = 0; i < probs.length; i++) {
    cumulative += probs[i];
    if (rand < cumulative) return i;
  }
  return 0;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { txHash, message } = body;

    if (!txHash || typeof txHash !== "string") {
      return NextResponse.json(
        { error: "txHash is required" },
        { status: 400 }
      );
    }

    // Stub: roll an outcome
    const outcomeIdx = rollOutcome();
    const outcome = OUTCOMES[outcomeIdx];

    return NextResponse.json({
      outcome: outcomeIdx,
      emoji: outcome.emoji,
      label: outcome.label,
      multiplier: outcome.multiplier,
      message: message || null,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

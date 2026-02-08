import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  processedTxs: defineTable({
    txHash: v.string(),
    network: v.string(),
    processedAt: v.number(),
  }).index("by_txHash", ["txHash"]),

  fortuneHistory: defineTable({
    sender: v.string(),
    txHash: v.string(),
    network: v.string(),
    amount: v.string(),
    outcome: v.string(),
    tier: v.number(),
    multiplier: v.number(),
    monSent: v.string(),
    blessing: v.string(),
    returnTxHash: v.union(v.string(), v.null()),
    returnStatus: v.string(),
    penalties: v.array(v.string()),
    penaltyMultiplier: v.number(),
    explorerUrl: v.string(),
    timestamp: v.number(),
  }).index("by_sender", ["sender"]),
});

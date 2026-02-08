import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const insertResult = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("fortuneHistory", {
      ...args,
      sender: args.sender.toLowerCase(),
      txHash: args.txHash.toLowerCase(),
    });
  },
});

export const getBySender = query({
  args: { sender: v.string() },
  handler: async (ctx, { sender }) => {
    if (!/^0x[a-fA-F0-9]{40}$/.test(sender)) {
      throw new Error("Invalid Ethereum address");
    }
    const results = await ctx.db
      .query("fortuneHistory")
      .withIndex("by_sender", (q) => q.eq("sender", sender.toLowerCase()))
      .collect();
    return results.sort((a, b) => b.timestamp - a.timestamp);
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const results = await ctx.db.query("fortuneHistory").collect();
    return results.sort((a, b) => b.timestamp - a.timestamp);
  },
});

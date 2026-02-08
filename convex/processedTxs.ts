import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const isProcessed = query({
  args: { txHash: v.string() },
  handler: async (ctx, { txHash }) => {
    const existing = await ctx.db
      .query("processedTxs")
      .withIndex("by_txHash", (q) => q.eq("txHash", txHash.toLowerCase()))
      .first();
    return existing !== null;
  },
});

export const markProcessed = mutation({
  args: { txHash: v.string(), network: v.string() },
  handler: async (ctx, { txHash, network }) => {
    await ctx.db.insert("processedTxs", {
      txHash: txHash.toLowerCase(),
      network,
      processedAt: Date.now(),
    });
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("processedTxs").collect();
  },
});

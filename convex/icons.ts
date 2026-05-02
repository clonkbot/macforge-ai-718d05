import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("generatedIcons")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(20);
  },
});

export const create = mutation({
  args: {
    prompt: v.string(),
    imageBase64: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("generatedIcons", {
      userId,
      prompt: args.prompt,
      imageBase64: args.imageBase64,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("generatedIcons") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const icon = await ctx.db.get(args.id);
    if (!icon || icon.userId !== userId) throw new Error("Not found");
    await ctx.db.delete(args.id);
  },
});

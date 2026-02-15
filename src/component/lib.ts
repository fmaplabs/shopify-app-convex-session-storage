import { v } from "convex/values";
import { mutation, query } from "./_generated/server.js";
import schema from "./schema.js";
import { sessionFieldsValidator } from "./schema.js";

const sessionValidator = schema.tables.sessions.validator.extend({
  _id: v.id("sessions"),
  _creationTime: v.number(),
});

export const loadSession = query({
  args: { id: v.string() },
  returns: v.union(v.null(), sessionValidator),
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_session_id", (q) => q.eq("id", args.id))
      .collect();
    return sessions[0] ?? null;
  },
});

export const storeSession = mutation({
  args: sessionFieldsValidator,
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("sessions")
      .withIndex("by_session_id", (q) => q.eq("id", args.id))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, args);
    } else {
      await ctx.db.insert("sessions", args);
    }
    return null;
  },
});

export const deleteSession = mutation({
  args: { id: v.string() },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_session_id", (q) => q.eq("id", args.id))
      .first();
    if (!session) return false;
    await ctx.db.delete(session._id);
    return true;
  },
});

export const deleteSessions = mutation({
  args: { ids: v.array(v.string()) },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    let allFound = true;
    for (const id of args.ids) {
      const session = await ctx.db
        .query("sessions")
        .withIndex("by_session_id", (q) => q.eq("id", id))
        .first();
      if (session) {
        await ctx.db.delete(session._id);
      } else {
        allFound = false;
      }
    }
    return allFound;
  },
});

export const findSessionsByShop = query({
  args: { shop: v.string() },
  returns: v.array(sessionValidator),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sessions")
      .withIndex("by_shop", (q) => q.eq("shop", args.shop))
      .collect();
  },
});

export const getOfflineSessionByShop = query({
  args: { shop: v.string() },
  returns: v.union(v.null(), sessionValidator),
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_shop", (q) => q.eq("shop", args.shop))
      .collect();
    return sessions.find((s) => !s.isOnline) ?? null;
  },
});

export const deleteSessionsByShop = mutation({
  args: { shop: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_shop", (q) => q.eq("shop", args.shop))
      .collect();
    for (const session of sessions) {
      await ctx.db.delete(session._id);
    }
    return null;
  },
});

export const cleanupExpiredSessions = mutation({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const now = new Date().toISOString();
    const allSessions = await ctx.db.query("sessions").collect();
    let deletedCount = 0;
    for (const session of allSessions) {
      if (session.expires && session.expires < now) {
        await ctx.db.delete(session._id);
        deletedCount++;
      }
    }
    return deletedCount;
  },
});

export const updateScopes = mutation({
  args: { id: v.string(), scope: v.string() },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_session_id", (q) => q.eq("id", args.id))
      .first();
    if (!session) return false;
    await ctx.db.patch(session._id, { scope: args.scope });
    return true;
  },
});

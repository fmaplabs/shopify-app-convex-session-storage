import { mutation, query } from "./_generated/server.js";
import { components } from "./_generated/api.js";
import { ShopifySessionClient } from "@fmaplabs/shopify-app-convex-session-storage";
import { v } from "convex/values";

const sessionClient = new ShopifySessionClient(
  components.shopifyAppConvexSessionStorage,
);

export const storeSession = mutation({
  args: {
    id: v.string(),
    shop: v.string(),
    isOnline: v.boolean(),
    scope: v.optional(v.string()),
    accessToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await sessionClient.storeSession(ctx, args);
  },
});

export const loadSession = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    return await sessionClient.loadSession(ctx, args);
  },
});

export const deleteSession = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    return await sessionClient.deleteSession(ctx, args);
  },
});

export const deleteSessions = mutation({
  args: { ids: v.array(v.string()) },
  handler: async (ctx, args) => {
    return await sessionClient.deleteSessions(ctx, args);
  },
});

export const findSessionsByShop = query({
  args: { shop: v.string() },
  handler: async (ctx, args) => {
    return await sessionClient.findSessionsByShop(ctx, args);
  },
});

export const getOfflineSessionByShop = query({
  args: { shop: v.string() },
  handler: async (ctx, args) => {
    return await sessionClient.getOfflineSessionByShop(ctx, args);
  },
});

export const deleteSessionsByShop = mutation({
  args: { shop: v.string() },
  handler: async (ctx, args) => {
    return await sessionClient.deleteSessionsByShop(ctx, args);
  },
});

export const cleanupExpiredSessions = mutation({
  args: {},
  handler: async (ctx) => {
    return await sessionClient.cleanupExpiredSessions(ctx);
  },
});

import { mutation, query, MutationCtx, QueryCtx } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { sessionFields } from "./schema";

export const getSessionbyShop = query({
  args: {
    shop: v.string(),
  },
  handler: async (ctx, { shop }) => {
    const maybeSessions = await ctx.db
      .query("sessions")
      .withIndex("by_shop", (q) => q.eq("shop", shop))
      .collect();

    if (maybeSessions === null) {
      return [];
    }

    const sessions = maybeSessions.map((session) => ({
      id: session.id,
      shop: session.shop,
      state: session.state,
      isOnline: session.isOnline,
      scope: session.scope ? session.scope : false,
      expires: session.expires ? session.expires : false,
      accessToken: session.accessToken ? session.accessToken : false,
    }));
    return sessions;
  },
});

export const getSessionById = query({
  args: {
    id: v.string(),
  },
  returns: v.union(sessionFields, v.null()),
  handler: async (ctx, { id }) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_session_id", (q) => q.eq("id", id))
      .first();
    if (session === null) {
      throw new ConvexError("No session foudn");
    }
    return session;
  },
});

export const storeSession = mutation({
  args: sessionFields,
  handler: async (ctx, args) => {
    const existingSession = await ctx.db
      .query("sessions")
      .withIndex("by_session_id", (q) => q.eq("id", args.id))
      .first();

    if (existingSession) {
      // Update existing session
      await ctx.db.patch(existingSession._id, {
        ...args,
      });
      return existingSession._id;
    } else {
      // Insert new session
      return await ctx.db.insert("sessions", {
        ...args,
      });
    }
  },
});

export const clearSession = mutation({
  args: {
    id: v.string(),
  },
  handler: async (ctx, { id }) => {
    const deleted = await deleteSession(ctx, { id });
    return deleted;
  },
});

export const clearMultipleSessions = mutation({
  args: {
    ids: v.array(v.string()),
  },
  handler: async (ctx, { ids }) => {
    await Promise.all(
      ids.map(async (shopId) => await deleteSession(ctx, { id: shopId })),
    );
    return true;
  },
});

//helper functions

export async function deleteSession(ctx: MutationCtx, { id }: { id: string }) {
  const maybeSession = await ctx.db
    .query("sessions")
    .withIndex("by_session_id", (q) => q.eq("id", id))
    .first();

  if (maybeSession === null) {
    return false;
  }
  await ctx.db.delete(maybeSession._id);
  return true;
}

export async function getOfflineAccessTokenByShop(
  ctx: MutationCtx | QueryCtx,
  { shop }: { shop: string },
) {
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_shop", (q) => q.eq("shop", shop))
    .filter((q) => q.eq(q.field("isOnline"), false))
    .first();
  if (session === null) {
    throw new ConvexError("No offline token found.");
  }
  return session;
}

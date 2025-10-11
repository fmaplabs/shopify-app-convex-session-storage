import { ShopifySessionStorage } from "@fmap-labs/shopify-app-convex-session-storage";
import { components } from "./_generated/api";
import { mutation } from "./_generated/server";
import { v } from "convex/values";
const sessionStorage = new ShopifySessionStorage(components);

export const storeSession = mutation({
  args: {
    session: v.any(),
  },
  handler: async (ctx, { session }) => {
    await sessionStorage.storeSession(ctx, { ...session });
  },
});

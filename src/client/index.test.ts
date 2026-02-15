import { describe, expect, test } from "vitest";
import { ShopifySessionClient } from "./index.js";
import {
  anyApi,
  mutationGeneric,
  queryGeneric,
  type ApiFromModules,
} from "convex/server";
import { v } from "convex/values";
import { components, initConvexTest } from "./setup.test.js";

const sessionClient = new ShopifySessionClient(
  components.shopifyAppConvexSessionStorage,
);

export const storeAndLoad = queryGeneric({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    return await sessionClient.loadSession(ctx, { id: args.id });
  },
});

export const storeSession = mutationGeneric({
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

export const deleteSession = mutationGeneric({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    return await sessionClient.deleteSession(ctx, { id: args.id });
  },
});

export const findByShop = queryGeneric({
  args: { shop: v.string() },
  handler: async (ctx, args) => {
    return await sessionClient.findSessionsByShop(ctx, { shop: args.shop });
  },
});

export const getOffline = queryGeneric({
  args: { shop: v.string() },
  handler: async (ctx, args) => {
    return await sessionClient.getOfflineSessionByShop(ctx, {
      shop: args.shop,
    });
  },
});

export const updateScopes = mutationGeneric({
  args: { id: v.string(), scope: v.string() },
  handler: async (ctx, args) => {
    return await sessionClient.updateScopes(ctx, args);
  },
});

const testApi = (
  anyApi as unknown as ApiFromModules<{
    "index.test": {
      storeAndLoad: typeof storeAndLoad;
      storeSession: typeof storeSession;
      deleteSession: typeof deleteSession;
      findByShop: typeof findByShop;
      getOffline: typeof getOffline;
      updateScopes: typeof updateScopes;
    };
  }>
)["index.test"];

describe("ShopifySessionClient", () => {
  test("store and load session via client", async () => {
    const t = initConvexTest();
    await t.mutation(testApi.storeSession, {
      id: "offline_shop.myshopify.com",
      shop: "shop.myshopify.com",
      isOnline: false,
      scope: "read_products",
      accessToken: "shpat_test",
    });
    const loaded = await t.query(testApi.storeAndLoad, {
      id: "offline_shop.myshopify.com",
    });
    expect(loaded).not.toBeNull();
    expect(loaded!.id).toBe("offline_shop.myshopify.com");
    expect(loaded!.accessToken).toBe("shpat_test");
  });

  test("delete session via client", async () => {
    const t = initConvexTest();
    await t.mutation(testApi.storeSession, {
      id: "offline_shop.myshopify.com",
      shop: "shop.myshopify.com",
      isOnline: false,
    });
    const deleted = await t.mutation(testApi.deleteSession, {
      id: "offline_shop.myshopify.com",
    });
    expect(deleted).toBe(true);
    const loaded = await t.query(testApi.storeAndLoad, {
      id: "offline_shop.myshopify.com",
    });
    expect(loaded).toBeNull();
  });

  test("find sessions by shop via client", async () => {
    const t = initConvexTest();
    await t.mutation(testApi.storeSession, {
      id: "offline_shop.myshopify.com",
      shop: "shop.myshopify.com",
      isOnline: false,
    });
    await t.mutation(testApi.storeSession, {
      id: "online_shop.myshopify.com_1",
      shop: "shop.myshopify.com",
      isOnline: true,
    });
    const sessions = await t.query(testApi.findByShop, {
      shop: "shop.myshopify.com",
    });
    expect(sessions).toHaveLength(2);
  });

  test("get offline session via client", async () => {
    const t = initConvexTest();
    await t.mutation(testApi.storeSession, {
      id: "offline_shop.myshopify.com",
      shop: "shop.myshopify.com",
      isOnline: false,
    });
    await t.mutation(testApi.storeSession, {
      id: "online_shop.myshopify.com_1",
      shop: "shop.myshopify.com",
      isOnline: true,
    });
    const offline = await t.query(testApi.getOffline, {
      shop: "shop.myshopify.com",
    });
    expect(offline).not.toBeNull();
    expect(offline!.isOnline).toBe(false);
  });

  test("update scopes via client", async () => {
    const t = initConvexTest();
    await t.mutation(testApi.storeSession, {
      id: "offline_shop.myshopify.com",
      shop: "shop.myshopify.com",
      isOnline: false,
      scope: "read_products",
    });
    const updated = await t.mutation(testApi.updateScopes, {
      id: "offline_shop.myshopify.com",
      scope: "read_products,write_orders",
    });
    expect(updated).toBe(true);
    const loaded = await t.query(testApi.storeAndLoad, {
      id: "offline_shop.myshopify.com",
    });
    expect(loaded!.scope).toBe("read_products,write_orders");
  });
});

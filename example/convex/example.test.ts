import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { initConvexTest } from "./setup.test";
import { api } from "./_generated/api";

describe("example", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("store and load session", async () => {
    const t = initConvexTest();
    await t.mutation(api.example.storeSession, {
      id: "offline_shop.myshopify.com",
      shop: "shop.myshopify.com",
      isOnline: false,
      scope: "read_products",
      accessToken: "shpat_test",
    });
    const loaded = await t.query(api.example.loadSession, {
      id: "offline_shop.myshopify.com",
    });
    expect(loaded).not.toBeNull();
    expect(loaded!.id).toBe("offline_shop.myshopify.com");
    expect(loaded!.accessToken).toBe("shpat_test");
  });

  test("delete session", async () => {
    const t = initConvexTest();
    await t.mutation(api.example.storeSession, {
      id: "offline_shop.myshopify.com",
      shop: "shop.myshopify.com",
      isOnline: false,
    });
    const deleted = await t.mutation(api.example.deleteSession, {
      id: "offline_shop.myshopify.com",
    });
    expect(deleted).toBe(true);
  });

  test("find sessions by shop", async () => {
    const t = initConvexTest();
    await t.mutation(api.example.storeSession, {
      id: "offline_shop.myshopify.com",
      shop: "shop.myshopify.com",
      isOnline: false,
    });
    await t.mutation(api.example.storeSession, {
      id: "online_shop.myshopify.com_1",
      shop: "shop.myshopify.com",
      isOnline: true,
    });
    const sessions = await t.query(api.example.findSessionsByShop, {
      shop: "shop.myshopify.com",
    });
    expect(sessions).toHaveLength(2);
  });
});

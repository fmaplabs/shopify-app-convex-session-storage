/// <reference types="vite/client" />

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { api } from "./_generated/api.js";
import { initConvexTest } from "./setup.test.js";

const offlineSession = {
  id: "offline_test-shop.myshopify.com",
  shop: "test-shop.myshopify.com",
  isOnline: false,
  scope: "read_products,write_orders",
  accessToken: "shpat_abc123",
};

const onlineSession = {
  id: "online_test-shop.myshopify.com_1",
  shop: "test-shop.myshopify.com",
  isOnline: true,
  scope: "read_products",
  accessToken: "shpat_online_xyz",
  onlineAccessInfo: {
    expires_in: 86400,
    associated_user_scope: "read_products",
    associated_user: {
      id: 1,
      first_name: "Test",
      last_name: "User",
      email: "test@example.com",
      account_owner: true,
      locale: "en",
      collaborator: false,
      email_verified: true,
    },
  },
};

describe("component lib", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  test("store and load session round-trip", async () => {
    const t = initConvexTest();
    await t.mutation(api.lib.storeSession, offlineSession);
    const loaded = await t.query(api.lib.loadSession, { id: offlineSession.id });
    expect(loaded).not.toBeNull();
    expect(loaded!.id).toBe(offlineSession.id);
    expect(loaded!.shop).toBe(offlineSession.shop);
    expect(loaded!.isOnline).toBe(false);
    expect(loaded!.accessToken).toBe(offlineSession.accessToken);
  });

  test("load nonexistent session returns null", async () => {
    const t = initConvexTest();
    const loaded = await t.query(api.lib.loadSession, { id: "nonexistent" });
    expect(loaded).toBeNull();
  });

  test("store session upserts (no duplicates)", async () => {
    const t = initConvexTest();
    await t.mutation(api.lib.storeSession, offlineSession);
    await t.mutation(api.lib.storeSession, {
      ...offlineSession,
      accessToken: "shpat_updated",
    });
    const sessions = await t.query(api.lib.findSessionsByShop, {
      shop: offlineSession.shop,
    });
    expect(sessions).toHaveLength(1);
    expect(sessions[0].accessToken).toBe("shpat_updated");
  });

  test("store session with onlineAccessInfo", async () => {
    const t = initConvexTest();
    await t.mutation(api.lib.storeSession, onlineSession);
    const loaded = await t.query(api.lib.loadSession, { id: onlineSession.id });
    expect(loaded).not.toBeNull();
    expect(loaded!.onlineAccessInfo).toEqual(onlineSession.onlineAccessInfo);
  });

  test("delete session returns true when found", async () => {
    const t = initConvexTest();
    await t.mutation(api.lib.storeSession, offlineSession);
    const deleted = await t.mutation(api.lib.deleteSession, {
      id: offlineSession.id,
    });
    expect(deleted).toBe(true);
    const loaded = await t.query(api.lib.loadSession, { id: offlineSession.id });
    expect(loaded).toBeNull();
  });

  test("delete session returns false when not found", async () => {
    const t = initConvexTest();
    const deleted = await t.mutation(api.lib.deleteSession, {
      id: "nonexistent",
    });
    expect(deleted).toBe(false);
  });

  test("delete multiple sessions", async () => {
    const t = initConvexTest();
    await t.mutation(api.lib.storeSession, offlineSession);
    await t.mutation(api.lib.storeSession, onlineSession);
    const allFound = await t.mutation(api.lib.deleteSessions, {
      ids: [offlineSession.id, onlineSession.id],
    });
    expect(allFound).toBe(true);
    const loaded1 = await t.query(api.lib.loadSession, { id: offlineSession.id });
    const loaded2 = await t.query(api.lib.loadSession, { id: onlineSession.id });
    expect(loaded1).toBeNull();
    expect(loaded2).toBeNull();
  });

  test("delete multiple sessions returns false when some missing", async () => {
    const t = initConvexTest();
    await t.mutation(api.lib.storeSession, offlineSession);
    const allFound = await t.mutation(api.lib.deleteSessions, {
      ids: [offlineSession.id, "nonexistent"],
    });
    expect(allFound).toBe(false);
  });

  test("find sessions by shop", async () => {
    const t = initConvexTest();
    await t.mutation(api.lib.storeSession, offlineSession);
    await t.mutation(api.lib.storeSession, onlineSession);
    await t.mutation(api.lib.storeSession, {
      id: "offline_other-shop.myshopify.com",
      shop: "other-shop.myshopify.com",
      isOnline: false,
    });
    const sessions = await t.query(api.lib.findSessionsByShop, {
      shop: "test-shop.myshopify.com",
    });
    expect(sessions).toHaveLength(2);
    expect(sessions.map((s) => s.id).sort()).toEqual(
      [offlineSession.id, onlineSession.id].sort(),
    );
  });

  test("get offline session by shop", async () => {
    const t = initConvexTest();
    await t.mutation(api.lib.storeSession, offlineSession);
    await t.mutation(api.lib.storeSession, onlineSession);
    const offline = await t.query(api.lib.getOfflineSessionByShop, {
      shop: "test-shop.myshopify.com",
    });
    expect(offline).not.toBeNull();
    expect(offline!.id).toBe(offlineSession.id);
    expect(offline!.isOnline).toBe(false);
  });

  test("get offline session returns null when none exists", async () => {
    const t = initConvexTest();
    await t.mutation(api.lib.storeSession, onlineSession);
    const offline = await t.query(api.lib.getOfflineSessionByShop, {
      shop: "test-shop.myshopify.com",
    });
    expect(offline).toBeNull();
  });

  test("delete sessions by shop", async () => {
    const t = initConvexTest();
    await t.mutation(api.lib.storeSession, offlineSession);
    await t.mutation(api.lib.storeSession, onlineSession);
    await t.mutation(api.lib.storeSession, {
      id: "offline_other-shop.myshopify.com",
      shop: "other-shop.myshopify.com",
      isOnline: false,
    });
    await t.mutation(api.lib.deleteSessionsByShop, {
      shop: "test-shop.myshopify.com",
    });
    const remaining = await t.query(api.lib.findSessionsByShop, {
      shop: "test-shop.myshopify.com",
    });
    expect(remaining).toHaveLength(0);
    const otherShop = await t.query(api.lib.findSessionsByShop, {
      shop: "other-shop.myshopify.com",
    });
    expect(otherShop).toHaveLength(1);
  });

  test("cleanup expired sessions", async () => {
    const t = initConvexTest();
    vi.setSystemTime(new Date("2025-06-01T00:00:00Z"));
    await t.mutation(api.lib.storeSession, {
      ...offlineSession,
      id: "expired_session",
      expires: "2025-05-01T00:00:00.000Z",
    });
    await t.mutation(api.lib.storeSession, {
      ...offlineSession,
      id: "valid_session",
      expires: "2025-12-01T00:00:00.000Z",
    });
    await t.mutation(api.lib.storeSession, {
      ...offlineSession,
      id: "no_expiry_session",
    });
    const deletedCount = await t.mutation(api.lib.cleanupExpiredSessions, {});
    expect(deletedCount).toBe(1);
    const expired = await t.query(api.lib.loadSession, { id: "expired_session" });
    expect(expired).toBeNull();
    const valid = await t.query(api.lib.loadSession, { id: "valid_session" });
    expect(valid).not.toBeNull();
    const noExpiry = await t.query(api.lib.loadSession, { id: "no_expiry_session" });
    expect(noExpiry).not.toBeNull();
  });

  test("update scopes on existing session", async () => {
    const t = initConvexTest();
    await t.mutation(api.lib.storeSession, offlineSession);
    const updated = await t.mutation(api.lib.updateScopes, {
      id: offlineSession.id,
      scope: "read_products,write_orders,read_customers",
    });
    expect(updated).toBe(true);
    const loaded = await t.query(api.lib.loadSession, { id: offlineSession.id });
    expect(loaded!.scope).toBe("read_products,write_orders,read_customers");
  });

  test("update scopes returns false for nonexistent session", async () => {
    const t = initConvexTest();
    const updated = await t.mutation(api.lib.updateScopes, {
      id: "nonexistent",
      scope: "read_products",
    });
    expect(updated).toBe(false);
  });
});

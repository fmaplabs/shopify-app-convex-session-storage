import { describe, expect, test, vi } from "vitest";
import { Session } from "@shopify/shopify-api";
import {
  ConvexSessionStorage,
  type ConvexSessionClient,
} from "./session-storage.js";
import type { ShopifySession } from "./index.js";

function createMockClient() {
  return {
    query: vi.fn(),
    mutation: vi.fn(),
  } satisfies ConvexSessionClient;
}

const fns = {
  storeSession: "sessions:storeSession",
  loadSession: "sessions:loadSession",
  deleteSession: "sessions:deleteSession",
  deleteSessions: "sessions:deleteSessions",
  findSessionsByShop: "sessions:findSessionsByShop",
};

describe("ConvexSessionStorage", () => {
  test("storeSession converts Date to ISO string", async () => {
    const client = createMockClient();
    client.mutation.mockResolvedValue(null);
    const storage = new ConvexSessionStorage(client, fns);

    const expires = new Date("2025-06-01T00:00:00.000Z");
    const session = new Session({
      id: "offline_shop.myshopify.com",
      shop: "shop.myshopify.com",
      state: "abc123",
      isOnline: false,
      scope: "read_products",
      accessToken: "shpat_test",
      expires,
    });

    const result = await storage.storeSession(session);

    expect(result).toBe(true);
    expect(client.mutation).toHaveBeenCalledWith(fns.storeSession, {
      id: "offline_shop.myshopify.com",
      shop: "shop.myshopify.com",
      state: "abc123",
      isOnline: false,
      scope: "read_products",
      accessToken: "shpat_test",
      expires: "2025-06-01T00:00:00.000Z",
      onlineAccessInfo: undefined,
    });
  });

  test("storeSession maps onlineAccessInfo correctly", async () => {
    const client = createMockClient();
    client.mutation.mockResolvedValue(null);
    const storage = new ConvexSessionStorage(client, fns);

    const session = new Session({
      id: "online_shop.myshopify.com_1",
      shop: "shop.myshopify.com",
      state: "xyz",
      isOnline: true,
      onlineAccessInfo: {
        expires_in: 86400,
        associated_user_scope: "read_products",
        associated_user: {
          id: 123,
          first_name: "John",
          last_name: "Doe",
          email: "john@example.com",
          email_verified: true,
          account_owner: true,
          locale: "en",
          collaborator: false,
        },
      },
    });

    await storage.storeSession(session);

    const args = client.mutation.mock.calls[0]![1];
    expect(args.onlineAccessInfo).toEqual({
      expires_in: 86400,
      associated_user_scope: "read_products",
      associated_user: {
        id: 123,
        first_name: "John",
        last_name: "Doe",
        email: "john@example.com",
        email_verified: true,
        account_owner: true,
        locale: "en",
        collaborator: false,
      },
    });
  });

  test("loadSession converts ISO string to Date and returns Session instance", async () => {
    const client = createMockClient();
    const stored: ShopifySession = {
      _id: "conv_abc",
      _creationTime: 1234567890,
      id: "offline_shop.myshopify.com",
      shop: "shop.myshopify.com",
      state: "abc123",
      isOnline: false,
      scope: "read_products",
      accessToken: "shpat_test",
      expires: "2025-06-01T00:00:00.000Z",
    };
    client.query.mockResolvedValue(stored);
    const storage = new ConvexSessionStorage(client, fns);

    const session = await storage.loadSession("offline_shop.myshopify.com");

    expect(session).toBeInstanceOf(Session);
    expect(session!.id).toBe("offline_shop.myshopify.com");
    expect(session!.shop).toBe("shop.myshopify.com");
    expect(session!.expires).toEqual(new Date("2025-06-01T00:00:00.000Z"));
    expect(session!.accessToken).toBe("shpat_test");
  });

  test("loadSession returns undefined for missing session", async () => {
    const client = createMockClient();
    client.query.mockResolvedValue(null);
    const storage = new ConvexSessionStorage(client, fns);

    const session = await storage.loadSession("nonexistent");

    expect(session).toBeUndefined();
  });

  test("loadSession defaults state to empty string", async () => {
    const client = createMockClient();
    const stored: ShopifySession = {
      _id: "conv_abc",
      _creationTime: 1234567890,
      id: "test_id",
      shop: "shop.myshopify.com",
      isOnline: false,
      // state is undefined
    };
    client.query.mockResolvedValue(stored);
    const storage = new ConvexSessionStorage(client, fns);

    const session = await storage.loadSession("test_id");

    expect(session!.state).toBe("");
  });

  test("deleteSession passes through correctly", async () => {
    const client = createMockClient();
    client.mutation.mockResolvedValue(true);
    const storage = new ConvexSessionStorage(client, fns);

    const result = await storage.deleteSession("offline_shop.myshopify.com");

    expect(result).toBe(true);
    expect(client.mutation).toHaveBeenCalledWith(fns.deleteSession, {
      id: "offline_shop.myshopify.com",
    });
  });

  test("deleteSessions passes through correctly", async () => {
    const client = createMockClient();
    client.mutation.mockResolvedValue(true);
    const storage = new ConvexSessionStorage(client, fns);

    const result = await storage.deleteSessions(["id1", "id2"]);

    expect(result).toBe(true);
    expect(client.mutation).toHaveBeenCalledWith(fns.deleteSessions, {
      ids: ["id1", "id2"],
    });
  });

  test("findSessionsByShop converts all results to Session instances", async () => {
    const client = createMockClient();
    const stored: ShopifySession[] = [
      {
        _id: "conv_1",
        _creationTime: 1234567890,
        id: "offline_shop.myshopify.com",
        shop: "shop.myshopify.com",
        isOnline: false,
        scope: "read_products",
      },
      {
        _id: "conv_2",
        _creationTime: 1234567891,
        id: "online_shop.myshopify.com_1",
        shop: "shop.myshopify.com",
        isOnline: true,
      },
    ];
    client.query.mockResolvedValue(stored);
    const storage = new ConvexSessionStorage(client, fns);

    const sessions = await storage.findSessionsByShop("shop.myshopify.com");

    expect(sessions).toHaveLength(2);
    expect(sessions[0]).toBeInstanceOf(Session);
    expect(sessions[1]).toBeInstanceOf(Session);
    expect(sessions[0]!.id).toBe("offline_shop.myshopify.com");
    expect(sessions[1]!.id).toBe("online_shop.myshopify.com_1");
  });
});

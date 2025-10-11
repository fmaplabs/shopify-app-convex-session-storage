import { Session } from "@shopify/shopify-api";
import { SessionStorage } from "@shopify/shopify-app-session-storage";
import type {
  Expand,
  FunctionReference,
  GenericMutationCtx,
  GenericQueryCtx,
} from "convex/server";
import { GenericId } from "convex/values";

import { api } from "../component/_generated/api";

/**
 * Client-side wrapper for the Shopify Session Storage component.
 *
 * This class provides a typed interface to interact with the component
 * and implements Shopify's SessionStorage interface for easy integration.
 *
 * Usage in user's Convex functions:
 * ```typescript
 * import { components } from "./_generated/api";
 * import { ShopifySessionStorage } from "@fmaplabs/shopify-app-convex-session-storage/client";
 *
 * const sessionStorage = new ShopifySessionStorage(components.shopifySessionStorage);
 *
 * export const myMutation = mutation({
 *   handler: async (ctx, args) => {
 *     await sessionStorage.storeSession(ctx, session);
 *   }
 * });
 * ```
 */
export class ShopifySessionStorage {
  constructor(private component: UseApi<typeof api>) {}

  /**
   * Store a session in the component.
   */
  async storeSession(
    ctx: GenericMutationCtx<any>,
    session: Session
  ): Promise<boolean> {
    try {
      await ctx.runMutation(this.component.sessions.storeSession, {
        id: session.id,
        shop: session.shop,
        state: session.state,
        isOnline: session.isOnline,
        scope: session.scope,
        expires: session.expires?.getTime(),
        accessToken: session.accessToken,
        onlineAccessInfo: session.onlineAccessInfo,
      });
      return true;
    } catch (error) {
      console.error("Error storing session:", error);
      return false;
    }
  }

  /**
   * Load a session from the component by ID.
   */
  async loadSession(
    ctx: GenericQueryCtx<any>,
    id: string
  ): Promise<Session | undefined> {
    try {
      const data = await ctx.runQuery(this.component.sessions.loadSession, {
        id,
      });

      if (!data) return undefined;

      const session = new Session({
        id: data.id,
        shop: data.shop,
        state: data.state,
        isOnline: data.isOnline,
      });
      if (data.scope) session.scope = data.scope;
      if (data.expires) session.expires = new Date(data.expires);
      if (data.accessToken) session.accessToken = data.accessToken;
      if (data.onlineAccessInfo)
        session.onlineAccessInfo = data.onlineAccessInfo;

      return session;
    } catch (error) {
      console.error("Error loading session:", error);
      return undefined;
    }
  }

  /**
   * Delete a session from the component by ID.
   */
  async deleteSession(
    ctx: GenericMutationCtx<any>,
    id: string
  ): Promise<boolean> {
    try {
      return await ctx.runMutation(this.component.sessions.deleteSession, {
        id,
      });
    } catch (error) {
      console.error("Error deleting session:", error);
      return false;
    }
  }

  /**
   * Delete multiple sessions from the component.
   */
  async deleteSessions(
    ctx: GenericMutationCtx<any>,
    ids: string[]
  ): Promise<boolean> {
    try {
      return await ctx.runMutation(this.component.sessions.deleteSessions, {
        ids,
      });
    } catch (error) {
      console.error("Error deleting sessions:", error);
      return false;
    }
  }

  /**
   * Find all sessions for a given shop.
   */
  async findSessionsByShop(
    ctx: GenericQueryCtx<any>,
    shop: string
  ): Promise<Session[]> {
    try {
      const sessionsData = await ctx.runQuery(
        this.component.sessions.findSessionsByShop,
        { shop }
      );

      return sessionsData.map((data: any) => {
        const session = new Session({
          id: data.id,
          shop: data.shop,
          state: data.state,
          isOnline: data.isOnline,
        });

        if (data.scope) session.scope = data.scope;
        if (data.expires) session.expires = new Date(data.expires);
        if (data.accessToken) session.accessToken = data.accessToken;
        if (data.onlineAccessInfo)
          session.onlineAccessInfo = data.onlineAccessInfo;

        return session;
      });
    } catch (error) {
      console.error("Error finding sessions by shop:", error);
      return [];
    }
  }

  /**
   * Clean up expired sessions.
   * Call this periodically (e.g., via a cron job).
   */
  async cleanupExpiredSessions(ctx: GenericMutationCtx<any>): Promise<number> {
    try {
      const result = await ctx.runMutation(
        this.component.sessions.cleanupExpiredSessions,
        { currentTime: Date.now() }
      );
      return result.deleted;
    } catch (error) {
      console.error("Error cleaning up expired sessions:", error);
      return 0;
    }
  }
}

/**
 * Adapter that implements Shopify's SessionStorage interface
 * for use in non-Convex contexts (e.g., Express middleware).
 *
 * This uses the Convex client to call the component from outside Convex functions.
 */
export class ConvexSessionStorageAdapter implements SessionStorage {
  private client: any;
  private componentApi: any;

  constructor(convexClient: any, componentApi: any) {
    this.client = convexClient;
    this.componentApi = componentApi;
  }

  async storeSession(session: Session): Promise<boolean> {
    try {
      await this.client.mutation(this.componentApi.public.storeSession, {
        id: session.id,
        shop: session.shop,
        state: session.state,
        isOnline: session.isOnline,
        scope: session.scope,
        expires: session.expires?.getTime(),
        accessToken: session.accessToken,
        onlineAccessInfo: session.onlineAccessInfo,
      });
      return true;
    } catch (error) {
      console.error("Error storing session:", error);
      return false;
    }
  }

  async loadSession(id: string): Promise<Session | undefined> {
    try {
      const data = await this.client.query(
        this.componentApi.public.loadSession,
        { id }
      );
      if (!data) return undefined;

      const session = new Session({
        id: data.id,
        shop: data.shop,
        state: data.state,
        isOnline: data.isOnline,
      });

      if (data.scope) session.scope = data.scope;
      if (data.expires) session.expires = new Date(data.expires);
      if (data.accessToken) session.accessToken = data.accessToken;
      if (data.onlineAccessInfo)
        session.onlineAccessInfo = data.onlineAccessInfo;

      return session;
    } catch (error) {
      console.error("Error loading session:", error);
      return undefined;
    }
  }

  async deleteSession(id: string): Promise<boolean> {
    try {
      return await this.client.mutation(
        this.componentApi.public.deleteSession,
        { id }
      );
    } catch (error) {
      console.error("Error deleting session:", error);
      return false;
    }
  }

  async deleteSessions(ids: string[]): Promise<boolean> {
    try {
      return await this.client.mutation(
        this.componentApi.public.deleteSessions,
        { ids }
      );
    } catch (error) {
      console.error("Error deleting sessions:", error);
      return false;
    }
  }

  async findSessionsByShop(shop: string): Promise<Session[]> {
    try {
      const sessionsData = await this.client.query(
        this.componentApi.public.findSessionsByShop,
        { shop }
      );

      return sessionsData.map((data: any) => {
        const session = new Session({
          id: data.id,
          shop: data.shop,
          state: data.state,
          isOnline: data.isOnline,
        });

        if (data.scope) session.scope = data.scope;
        if (data.expires) session.expires = new Date(data.expires);
        if (data.accessToken) session.accessToken = data.accessToken;
        if (data.onlineAccessInfo)
          session.onlineAccessInfo = data.onlineAccessInfo;

        return session;
      });
    } catch (error) {
      console.error("Error finding sessions by shop:", error);
      return [];
    }
  }
}

export type OpaqueIds<T> =
  T extends GenericId<infer _T>
    ? string
    : T extends (infer U)[]
      ? OpaqueIds<U>[]
      : T extends object
        ? { [K in keyof T]: OpaqueIds<T[K]> }
        : T;

export type UseApi<API> = Expand<{
  [mod in keyof API]: API[mod] extends FunctionReference<
    infer FType,
    "public",
    infer FArgs,
    infer FReturnType,
    infer FComponentPath
  >
    ? FunctionReference<
        FType,
        "public",
        OpaqueIds<FArgs>,
        OpaqueIds<FReturnType>,
        FComponentPath
      >
    : UseApi<API[mod]>;
}>;

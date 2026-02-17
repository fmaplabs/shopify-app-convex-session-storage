import type {
  GenericDataModel,
  GenericMutationCtx,
  GenericQueryCtx,
} from "convex/server";
import type { ComponentApi } from "../component/_generated/component.js";

export type { ComponentApi };
export {
  ConvexSessionStorage,
  type ConvexSessionClient,
  type SessionFunctionRefs,
} from "./session-storage.js";

export type AssociatedUser = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  account_owner: boolean;
  locale: string;
  collaborator: boolean;
  email_verified: boolean;
};

export type OnlineAccessInfo = {
  expires_in: number;
  associated_user_scope: string;
  associated_user: AssociatedUser;
};

export type ShopifySession = {
  _id: string;
  _creationTime: number;
  id: string;
  shop: string;
  state?: string;
  isOnline: boolean;
  scope?: string;
  expires?: string;
  accessToken?: string;
  onlineAccessInfo?: OnlineAccessInfo;
};

export type ShopifySessionInput = {
  id: string;
  shop: string;
  state?: string;
  isOnline: boolean;
  scope?: string;
  expires?: string;
  accessToken?: string;
  onlineAccessInfo?: OnlineAccessInfo;
};

type QueryCtx = Pick<GenericQueryCtx<GenericDataModel>, "runQuery">;
type MutationCtx = Pick<
  GenericMutationCtx<GenericDataModel>,
  "runQuery" | "runMutation"
>;

export class ShopifySessionClient {
  constructor(public component: ComponentApi) {}

  async loadSession(
    ctx: QueryCtx,
    args: { id: string },
  ): Promise<ShopifySession | null> {
    return await ctx.runQuery(this.component.lib.loadSession, args);
  }

  async storeSession(
    ctx: MutationCtx,
    session: ShopifySessionInput,
  ): Promise<null> {
    return await ctx.runMutation(this.component.lib.storeSession, session);
  }

  async deleteSession(
    ctx: MutationCtx,
    args: { id: string },
  ): Promise<boolean> {
    return await ctx.runMutation(this.component.lib.deleteSession, args);
  }

  async deleteSessions(
    ctx: MutationCtx,
    args: { ids: string[] },
  ): Promise<boolean> {
    return await ctx.runMutation(this.component.lib.deleteSessions, args);
  }

  async findSessionsByShop(
    ctx: QueryCtx,
    args: { shop: string },
  ): Promise<ShopifySession[]> {
    return await ctx.runQuery(this.component.lib.findSessionsByShop, args);
  }

  async getOfflineSessionByShop(
    ctx: QueryCtx,
    args: { shop: string },
  ): Promise<ShopifySession | null> {
    return await ctx.runQuery(
      this.component.lib.getOfflineSessionByShop,
      args,
    );
  }

  async deleteSessionsByShop(
    ctx: MutationCtx,
    args: { shop: string },
  ): Promise<null> {
    return await ctx.runMutation(this.component.lib.deleteSessionsByShop, args);
  }

  async cleanupExpiredSessions(ctx: MutationCtx): Promise<number> {
    return await ctx.runMutation(this.component.lib.cleanupExpiredSessions, {});
  }

  async updateScopes(
    ctx: MutationCtx,
    args: { id: string; scope: string },
  ): Promise<boolean> {
    return await ctx.runMutation(this.component.lib.updateScopes, args);
  }
}

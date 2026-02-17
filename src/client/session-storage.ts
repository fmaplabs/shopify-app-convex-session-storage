import { Session } from "@shopify/shopify-api";
import type { SessionStorage } from "@shopify/shopify-app-session-storage";
import type { ShopifySession, ShopifySessionInput } from "./index.js";

/**
 * Minimal client contract compatible with ConvexHttpClient, fetchQuery/fetchMutation wrappers,
 * or any custom implementation.
 */
export interface ConvexSessionClient {
  query<Output>(
    name: string | { _returnType: Output },
    args: Record<string, unknown>,
  ): Promise<Output>;
  mutation<Output>(
    name: string | { _returnType: Output },
    args: Record<string, unknown>,
  ): Promise<Output>;
}

/**
 * References to the consumer's public Convex functions that wrap the component's
 * internal session CRUD operations.
 */
export interface SessionFunctionRefs {
  storeSession: string | { _returnType: unknown; _args: unknown };
  loadSession: string | { _returnType: unknown; _args: unknown };
  deleteSession: string | { _returnType: unknown; _args: unknown };
  deleteSessions: string | { _returnType: unknown; _args: unknown };
  findSessionsByShop: string | { _returnType: unknown; _args: unknown };
}

function sessionToInput(session: Session): ShopifySessionInput {
  return {
    id: session.id,
    shop: session.shop,
    state: session.state,
    isOnline: session.isOnline,
    scope: session.scope,
    expires: session.expires ? session.expires.toISOString() : undefined,
    accessToken: session.accessToken,
    onlineAccessInfo: session.onlineAccessInfo?.associated_user
      ? {
          expires_in: session.onlineAccessInfo.expires_in,
          associated_user_scope:
            session.onlineAccessInfo.associated_user_scope,
          associated_user: {
            id: session.onlineAccessInfo.associated_user.id,
            first_name: session.onlineAccessInfo.associated_user.first_name,
            last_name: session.onlineAccessInfo.associated_user.last_name,
            email: session.onlineAccessInfo.associated_user.email,
            email_verified:
              session.onlineAccessInfo.associated_user.email_verified,
            account_owner:
              session.onlineAccessInfo.associated_user.account_owner,
            locale: session.onlineAccessInfo.associated_user.locale,
            collaborator:
              session.onlineAccessInfo.associated_user.collaborator,
          },
        }
      : undefined,
  };
}

function dataToSession(data: ShopifySession): Session {
  return new Session({
    id: data.id,
    shop: data.shop,
    state: data.state ?? "",
    isOnline: data.isOnline,
    scope: data.scope,
    expires: data.expires ? new Date(data.expires) : undefined,
    accessToken: data.accessToken,
    onlineAccessInfo: data.onlineAccessInfo,
  });
}

// TODO: Implement the ConvexSessionStorage class
// See the plan description above for guidance on the 5 required SessionStorage methods.
export class ConvexSessionStorage implements SessionStorage {
  constructor(
    private client: ConvexSessionClient,
    private fns: SessionFunctionRefs,
  ) {}

  async storeSession(session: Session): Promise<boolean> {
    await this.client.mutation(this.fns.storeSession as string, sessionToInput(session));
    return true;
  }

  async loadSession(id: string): Promise<Session | undefined> {
    const data = await this.client.query<ShopifySession | null>(
      this.fns.loadSession as string,
      { id },
    );
    if (!data) return undefined;
    return dataToSession(data);
  }

  async deleteSession(id: string): Promise<boolean> {
    return await this.client.mutation<boolean>(
      this.fns.deleteSession as string,
      { id },
    );
  }

  async deleteSessions(ids: string[]): Promise<boolean> {
    return await this.client.mutation<boolean>(
      this.fns.deleteSessions as string,
      { ids },
    );
  }

  async findSessionsByShop(shop: string): Promise<Session[]> {
    const sessions = await this.client.query<ShopifySession[]>(
      this.fns.findSessionsByShop as string,
      { shop },
    );
    return sessions.map(dataToSession);
  }
}

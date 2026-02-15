/* eslint-disable */
/**
 * Generated `ComponentApi` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type { FunctionReference } from "convex/server";

type OnlineAccessInfo = {
  expires_in: number;
  associated_user_scope: string;
  associated_user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    account_owner: boolean;
    locale: string;
    collaborator: boolean;
    email_verified: boolean;
  };
};

type SessionDoc = {
  _creationTime: number;
  _id: string;
  id: string;
  shop: string;
  state?: string;
  isOnline: boolean;
  scope?: string;
  expires?: string;
  accessToken?: string;
  onlineAccessInfo?: OnlineAccessInfo;
};

type SessionInput = {
  id: string;
  shop: string;
  state?: string;
  isOnline: boolean;
  scope?: string;
  expires?: string;
  accessToken?: string;
  onlineAccessInfo?: OnlineAccessInfo;
};

/**
 * A utility for referencing a Convex component's exposed API.
 *
 * Useful when expecting a parameter like `components.myComponent`.
 * Usage:
 * ```ts
 * async function myFunction(ctx: QueryCtx, component: ComponentApi) {
 *   return ctx.runQuery(component.someFile.someQuery, { ...args });
 * }
 * ```
 */
export type ComponentApi<Name extends string | undefined = string | undefined> =
  {
    lib: {
      loadSession: FunctionReference<
        "query",
        "internal",
        { id: string },
        SessionDoc | null,
        Name
      >;
      storeSession: FunctionReference<
        "mutation",
        "internal",
        SessionInput,
        null,
        Name
      >;
      deleteSession: FunctionReference<
        "mutation",
        "internal",
        { id: string },
        boolean,
        Name
      >;
      deleteSessions: FunctionReference<
        "mutation",
        "internal",
        { ids: Array<string> },
        boolean,
        Name
      >;
      findSessionsByShop: FunctionReference<
        "query",
        "internal",
        { shop: string },
        Array<SessionDoc>,
        Name
      >;
      getOfflineSessionByShop: FunctionReference<
        "query",
        "internal",
        { shop: string },
        SessionDoc | null,
        Name
      >;
      deleteSessionsByShop: FunctionReference<
        "mutation",
        "internal",
        { shop: string },
        null,
        Name
      >;
      cleanupExpiredSessions: FunctionReference<
        "mutation",
        "internal",
        Record<string, never>,
        number,
        Name
      >;
      updateScopes: FunctionReference<
        "mutation",
        "internal",
        { id: string; scope: string },
        boolean,
        Name
      >;
    };
  };

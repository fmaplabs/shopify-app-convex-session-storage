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
      cleanupExpiredSessions: FunctionReference<
        "mutation",
        "internal",
        {},
        number,
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
      deleteSessionsByShop: FunctionReference<
        "mutation",
        "internal",
        { shop: string },
        null,
        Name
      >;
      findSessionsByShop: FunctionReference<
        "query",
        "internal",
        { shop: string },
        Array<{
          _creationTime: number;
          _id: string;
          accessToken?: string;
          expires?: string;
          id: string;
          isOnline: boolean;
          onlineAccessInfo?: {
            associated_user: {
              account_owner: boolean;
              collaborator: boolean;
              email: string;
              email_verified: boolean;
              first_name: string;
              id: number;
              last_name: string;
              locale: string;
            };
            associated_user_scope: string;
            expires_in: number;
          };
          refreshToken?: string;
          refreshTokenExpires?: string;
          scope?: string;
          shop: string;
          state?: string;
        }>,
        Name
      >;
      getOfflineSessionByShop: FunctionReference<
        "query",
        "internal",
        { shop: string },
        null | {
          _creationTime: number;
          _id: string;
          accessToken?: string;
          expires?: string;
          id: string;
          isOnline: boolean;
          onlineAccessInfo?: {
            associated_user: {
              account_owner: boolean;
              collaborator: boolean;
              email: string;
              email_verified: boolean;
              first_name: string;
              id: number;
              last_name: string;
              locale: string;
            };
            associated_user_scope: string;
            expires_in: number;
          };
          refreshToken?: string;
          refreshTokenExpires?: string;
          scope?: string;
          shop: string;
          state?: string;
        },
        Name
      >;
      loadSession: FunctionReference<
        "query",
        "internal",
        { id: string },
        null | {
          _creationTime: number;
          _id: string;
          accessToken?: string;
          expires?: string;
          id: string;
          isOnline: boolean;
          onlineAccessInfo?: {
            associated_user: {
              account_owner: boolean;
              collaborator: boolean;
              email: string;
              email_verified: boolean;
              first_name: string;
              id: number;
              last_name: string;
              locale: string;
            };
            associated_user_scope: string;
            expires_in: number;
          };
          refreshToken?: string;
          refreshTokenExpires?: string;
          scope?: string;
          shop: string;
          state?: string;
        },
        Name
      >;
      storeSession: FunctionReference<
        "mutation",
        "internal",
        {
          accessToken?: string;
          expires?: string;
          id: string;
          isOnline: boolean;
          onlineAccessInfo?: {
            associated_user: {
              account_owner: boolean;
              collaborator: boolean;
              email: string;
              email_verified: boolean;
              first_name: string;
              id: number;
              last_name: string;
              locale: string;
            };
            associated_user_scope: string;
            expires_in: number;
          };
          refreshToken?: string;
          refreshTokenExpires?: string;
          scope?: string;
          shop: string;
          state?: string;
        },
        null,
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

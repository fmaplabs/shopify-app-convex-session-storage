/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as sessions from "../sessions.js";
import type * as shopify from "../shopify.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  sessions: typeof sessions;
  shopify: typeof shopify;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {
  shopifySessionStorage: {
    sessions: {
      clearMultipleSessions: FunctionReference<
        "mutation",
        "internal",
        { ids: Array<string> },
        any
      >;
      clearSession: FunctionReference<
        "mutation",
        "internal",
        { id: string },
        any
      >;
      getSessionById: FunctionReference<
        "query",
        "internal",
        { id: string },
        {
          accessToken?: string;
          expires?: number;
          id: string;
          isOnline: boolean;
          onlineAccessInfo?: {
            associated_user?: {
              account_owner: boolean;
              collaborator: boolean;
              email: string;
              email_verified: boolean;
              first_name: string;
              id: number;
              last_name: string;
              locale: string;
            };
            associated_user_scope?: string;
            expires_in: number;
          };
          scope?: string;
          shop: string;
          state: string;
        } | null
      >;
      getSessionbyShop: FunctionReference<
        "query",
        "internal",
        { shop: string },
        any
      >;
      storeSession: FunctionReference<
        "mutation",
        "internal",
        {
          accessToken?: string;
          expires?: number;
          id: string;
          isOnline: boolean;
          onlineAccessInfo?: {
            associated_user?: {
              account_owner: boolean;
              collaborator: boolean;
              email: string;
              email_verified: boolean;
              first_name: string;
              id: number;
              last_name: string;
              locale: string;
            };
            associated_user_scope?: string;
            expires_in: number;
          };
          scope?: string;
          shop: string;
          state: string;
        },
        any
      >;
    };
  };
};

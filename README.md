# Convex Shopify Session Storage

[![npm version](https://badge.fury.io/js/@fmaplabs%2Fshopify-app-convex-session-storage.svg)](https://badge.fury.io/js/@fmaplabs%2Fshopify-app-convex-session-storage)

A [Convex component](https://docs.convex.dev/components) that provides Shopify
session storage backed by a Convex database. Drop-in session persistence for
Shopify apps built on Convex.

Found a bug? Feature request?
[File it here](https://github.com/fmaplabs/shopify-app-convex-session-storage/issues).

## Installation

```sh
npm install @fmaplabs/shopify-app-convex-session-storage
```

Register the component in your `convex/convex.config.ts`:

```ts
import { defineApp } from "convex/server";
import shopifyAppConvexSessionStorage from "@fmaplabs/shopify-app-convex-session-storage/convex.config.js";

const app = defineApp();
app.use(shopifyAppConvexSessionStorage);

export default app;
```

## Usage

This package provides two ways to interact with session storage:

- **`ShopifySessionClient`** — for use _inside_ Convex functions (server-side, via `ctx.runQuery`/`ctx.runMutation`)
- **`ConvexSessionStorage`** — for use _outside_ Convex (your web server), implementing Shopify's [`SessionStorage`](https://github.com/Shopify/shopify-app-js/tree/main/packages/apps/session-storage/shopify-app-session-storage) interface

### Step 1: Expose session functions in your Convex backend

The component's internal functions can't be called over HTTP directly. Create
public wrappers in your Convex backend using `ShopifySessionClient`:

```ts
// convex/sessions.ts
import { mutation, query } from "./_generated/server.js";
import { components } from "./_generated/api.js";
import { ShopifySessionClient } from "@fmaplabs/shopify-app-convex-session-storage";
import { v } from "convex/values";

const sessionClient = new ShopifySessionClient(
  components.shopifyAppConvexSessionStorage,
);

export const storeSession = mutation({
  args: {
    id: v.string(),
    shop: v.string(),
    state: v.optional(v.string()),
    isOnline: v.boolean(),
    scope: v.optional(v.string()),
    expires: v.optional(v.string()),
    accessToken: v.optional(v.string()),
    onlineAccessInfo: v.optional(
      v.object({
        expires_in: v.number(),
        associated_user_scope: v.string(),
        associated_user: v.object({
          id: v.number(),
          first_name: v.string(),
          last_name: v.string(),
          email: v.string(),
          email_verified: v.boolean(),
          account_owner: v.boolean(),
          locale: v.string(),
          collaborator: v.boolean(),
        }),
      }),
    ),
  },
  handler: async (ctx, args) => {
    return await sessionClient.storeSession(ctx, args);
  },
});

export const loadSession = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    return await sessionClient.loadSession(ctx, args);
  },
});

export const deleteSession = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    return await sessionClient.deleteSession(ctx, args);
  },
});

export const deleteSessions = mutation({
  args: { ids: v.array(v.string()) },
  handler: async (ctx, args) => {
    return await sessionClient.deleteSessions(ctx, args);
  },
});

export const findSessionsByShop = query({
  args: { shop: v.string() },
  handler: async (ctx, args) => {
    return await sessionClient.findSessionsByShop(ctx, args);
  },
});
```

See [example/convex/example.ts](./example/convex/example.ts) for a complete
example with additional helper functions.

### Step 2: Use `ConvexSessionStorage` in your web server

Pass `ConvexSessionStorage` to Shopify's `shopifyApp()` as the session storage
adapter. It calls the public Convex functions you created above over HTTP.

```sh
npm install @shopify/shopify-api
```

#### With `ConvexHttpClient`

```ts
import { ConvexSessionStorage } from "@fmaplabs/shopify-app-convex-session-storage";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const client = new ConvexHttpClient(process.env.CONVEX_URL!);

export const sessionStorage = new ConvexSessionStorage(client, {
  storeSession: api.sessions.storeSession,
  loadSession: api.sessions.loadSession,
  deleteSession: api.sessions.deleteSession,
  deleteSessions: api.sessions.deleteSessions,
  findSessionsByShop: api.sessions.findSessionsByShop,
});
```

#### With Next.js `fetchQuery`/`fetchMutation`

`ConvexSessionStorage` accepts any object with `query()` and `mutation()`
methods, so you can wrap Convex's Next.js helpers:

```ts
import { ConvexSessionStorage } from "@fmaplabs/shopify-app-convex-session-storage";
import { fetchQuery, fetchMutation } from "convex/nextjs";
import { api } from "../convex/_generated/api.js";

const client = {
  query: (name: any, args: any) => fetchQuery(name, args),
  mutation: (name: any, args: any) => fetchMutation(name, args),
};

export const sessionStorage = new ConvexSessionStorage(client, {
  storeSession: api.sessions.storeSession,
  loadSession: api.sessions.loadSession,
  deleteSession: api.sessions.deleteSession,
  deleteSessions: api.sessions.deleteSessions,
  findSessionsByShop: api.sessions.findSessionsByShop,
});
```

#### With `shopifyApp()`

```ts
import shopify from "@shopify/shopify-app-remix"; // or @shopify/shopify-app-express
import { sessionStorage } from "./session-storage";

const shopifyApp = shopify({
  // ...other config
  sessionStorage,
});
```

## API

### `ShopifySessionClient`

For use inside Convex functions. Wraps the component's internal queries and
mutations.

| Method                                   | Type     | Description                         |
| ---------------------------------------- | -------- | ----------------------------------- |
| `loadSession(ctx, { id })`               | query    | Load a session by ID                |
| `storeSession(ctx, session)`             | mutation | Create or update a session (upsert) |
| `deleteSession(ctx, { id })`             | mutation | Delete a session by ID              |
| `deleteSessions(ctx, { ids })`           | mutation | Delete multiple sessions by ID      |
| `findSessionsByShop(ctx, { shop })`      | query    | Find all sessions for a shop        |
| `getOfflineSessionByShop(ctx, { shop })` | query    | Get the offline session for a shop  |
| `deleteSessionsByShop(ctx, { shop })`    | mutation | Delete all sessions for a shop      |
| `cleanupExpiredSessions(ctx)`            | mutation | Delete all expired sessions         |
| `updateScopes(ctx, { id, scope })`       | mutation | Update scopes on a session          |

### `ConvexSessionStorage`

For use outside Convex (web server). Implements Shopify's `SessionStorage`
interface.

```ts
new ConvexSessionStorage(client, functionRefs);
```

- **`client`** — any object with `query(name, args)` and `mutation(name, args)` methods (e.g. `ConvexHttpClient`)
- **`functionRefs`** — references to your 5 public Convex functions: `storeSession`, `loadSession`, `deleteSession`, `deleteSessions`, `findSessionsByShop`

| Method                     | Description                              |
| -------------------------- | ---------------------------------------- |
| `storeSession(session)`    | Store a Shopify `Session` object         |
| `loadSession(id)`          | Load a session, returns `Session` or `undefined` |
| `deleteSession(id)`        | Delete a session by ID                   |
| `deleteSessions(ids)`      | Delete multiple sessions by ID           |
| `findSessionsByShop(shop)` | Find all sessions for a shop             |

### Types

```ts
import type {
  ShopifySession,
  ShopifySessionInput,
  OnlineAccessInfo,
  AssociatedUser,
  ConvexSessionClient,
  SessionFunctionRefs,
} from "@fmaplabs/shopify-app-convex-session-storage";
```

## Development

```sh
npm i
npm run dev
```

Run tests:

```sh
npm test
```

### License

MIT License

Copyright (c) 2026 fmap labs

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

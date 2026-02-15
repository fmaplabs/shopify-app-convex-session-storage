# Convex Shopify Session Storage

[![npm version](https://badge.fury.io/js/@fmaplabs%2Fshopify-app-convex-session-storage.svg)](https://badge.fury.io/js/@fmaplabs%2Fshopify-app-convex-session-storage)

A [Convex component](https://docs.convex.dev/components) that provides Shopify session storage backed by a Convex database. Drop-in session persistence for Shopify apps built on Convex.

Found a bug? Feature request? [File it here](https://github.com/fmaplabs/shopify-app-convex-session-storage/issues).

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

Create a `ShopifySessionClient` instance and use it in your Convex functions:

```ts
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
    isOnline: v.boolean(),
    scope: v.optional(v.string()),
    accessToken: v.optional(v.string()),
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
```

See [example/convex/example.ts](./example/convex/example.ts) for a complete example.

## API

### `ShopifySessionClient`

| Method | Type | Description |
|--------|------|-------------|
| `loadSession(ctx, { id })` | query | Load a session by ID |
| `storeSession(ctx, session)` | mutation | Create or update a session (upsert) |
| `deleteSession(ctx, { id })` | mutation | Delete a session by ID |
| `deleteSessions(ctx, { ids })` | mutation | Delete multiple sessions by ID |
| `findSessionsByShop(ctx, { shop })` | query | Find all sessions for a shop |
| `getOfflineSessionByShop(ctx, { shop })` | query | Get the offline session for a shop |
| `deleteSessionsByShop(ctx, { shop })` | mutation | Delete all sessions for a shop |
| `cleanupExpiredSessions(ctx)` | mutation | Delete all expired sessions |
| `updateScopes(ctx, { id, scope })` | mutation | Update scopes on a session |

### Types

```ts
import type {
  ShopifySession,
  ShopifySessionInput,
  OnlineAccessInfo,
  AssociatedUser,
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

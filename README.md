# Shopify Session Storage for Convex

[![npm version](https://badge.fury.io/js/@fmap-labs%2Fshopify-app-convex-session-storage.svg)](https://www.npmjs.com/package/@fmap-labs/shopify-app-convex-session-storage)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A [Convex component](https://docs.convex.dev/components) that implements Shopify's `SessionStorage` interface for storing OAuth sessions in your Convex database.

## Features

- Store Shopify OAuth sessions (both online and offline access tokens)
- Query sessions by shop or session ID
- Automatic session cleanup for expired tokens
- Full TypeScript support
- Works with any Shopify app framework (Remix, React Router, Express, etc.)

## Installation

```bash
npm install @fmap-labs/shopify-app-convex-session-storage
```

## Setup

### 1. Register the Component

Add the component to your Convex app configuration:

```typescript
// convex/convex.config.ts
import { defineApp } from "convex/server";
import shopifySessionStorage from "@fmap-labs/shopify-app-convex-session-storage/convex.config";

const app = defineApp();
app.use(shopifySessionStorage);
export default app;
```

After adding the component, run `npx convex dev` to generate the necessary types.

### 2. Use in Your Application

There are two ways to use this component depending on your context:

## Usage

### Option A: In Convex Functions (ShopifySessionStorage)

Use `ShopifySessionStorage` when you need to manage sessions within your Convex mutations or queries:

```typescript
// convex/shopify.ts
import { mutation, query } from "./_generated/server";
import { components } from "./_generated/api";
import { ShopifySessionStorage } from "@fmap-labs/shopify-app-convex-session-storage";
import { Session } from "@shopify/shopify-api";
import { v } from "convex/values";

const sessionStorage = new ShopifySessionStorage(components.shopifySessionStorage);

export const storeSession = mutation({
  args: {
    id: v.string(),
    shop: v.string(),
    state: v.string(),
    isOnline: v.boolean(),
    scope: v.optional(v.string()),
    expires: v.optional(v.number()),
    accessToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session = new Session({
      id: args.id,
      shop: args.shop,
      state: args.state,
      isOnline: args.isOnline,
    });

    if (args.scope) session.scope = args.scope;
    if (args.expires) session.expires = new Date(args.expires);
    if (args.accessToken) session.accessToken = args.accessToken;

    return await sessionStorage.storeSession(ctx, session);
  },
});

export const loadSession = query({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    return await sessionStorage.loadSession(ctx, id);
  },
});

export const findSessionsByShop = query({
  args: { shop: v.string() },
  handler: async (ctx, { shop }) => {
    return await sessionStorage.findSessionsByShop(ctx, shop);
  },
});

export const cleanupExpired = mutation({
  handler: async (ctx) => {
    return await sessionStorage.cleanupExpiredSessions(ctx);
  },
});
```

### Option B: In Your App Server (ConvexSessionStorageAdapter)

Use `ConvexSessionStorageAdapter` to integrate directly with Shopify's app initialization:

```typescript
// app/shopify.server.ts (Remix/React Router)
import { ApiVersion, shopifyApp } from "@shopify/shopify-app-remix";
import { ConvexSessionStorageAdapter } from "@fmap-labs/shopify-app-convex-session-storage";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const convexUrl = process.env.CONVEX_URL!;
const convex = new ConvexHttpClient(convexUrl);

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecretKey: process.env.SHOPIFY_API_SECRET!,
  appUrl: process.env.SHOPIFY_APP_URL!,
  scopes: process.env.SCOPES!.split(","),
  apiVersion: ApiVersion.October24,
  sessionStorage: new ConvexSessionStorageAdapter(
    convex,
    api.shopifySessionStorage
  ),
});

export default shopify;
```

## API Reference

### ShopifySessionStorage

For use inside Convex functions:

```typescript
class ShopifySessionStorage {
  constructor(component: UseApi<ShopifySessionStorageAPI>);

  storeSession(ctx: GenericMutationCtx, session: Session): Promise<boolean>;
  loadSession(ctx: GenericQueryCtx, id: string): Promise<Session | undefined>;
  deleteSession(ctx: GenericMutationCtx, id: string): Promise<boolean>;
  deleteSessions(ctx: GenericMutationCtx, ids: string[]): Promise<boolean>;
  findSessionsByShop(ctx: GenericQueryCtx, shop: string): Promise<Session[]>;
  cleanupExpiredSessions(ctx: GenericMutationCtx): Promise<number>;
}
```

### ConvexSessionStorageAdapter

Implements Shopify's `SessionStorage` interface for use outside Convex:

```typescript
class ConvexSessionStorageAdapter implements SessionStorage {
  constructor(
    convexClient: ConvexHttpClient,
    componentApi: UseApi<ShopifySessionStorageAPI>
  );

  storeSession(session: Session): Promise<boolean>;
  loadSession(id: string): Promise<Session | undefined>;
  deleteSession(id: string): Promise<boolean>;
  deleteSessions(ids: string[]): Promise<boolean>;
  findSessionsByShop(shop: string): Promise<Session[]>;
}
```

## Schema

The component creates a `sessions` table with the following structure:

```typescript
{
  id: string;           // Shopify session ID
  shop: string;         // Shop domain (e.g., "example.myshopify.com")
  state: string;        // OAuth state
  isOnline: boolean;    // Online vs offline access token
  scope?: string;       // Granted scopes
  expires?: number;     // Expiration timestamp
  accessToken?: string; // The access token
  onlineAccessInfo?: {  // Additional info for online tokens
    expires_in: number;
    associated_user_scope: string;
    associated_user: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      email_verified: boolean;
      account_owner: boolean;
      locale: string;
      collaborator: boolean;
    };
  };
}
```

The table includes indexes for:
- `by_session_id` - Fast lookup by session ID
- `by_shop` - Query all sessions for a shop
- `by_expires` - Cleanup expired sessions

## Important Notes

### Component IDs

Because this is a Convex component, the `_id` field returned from queries will be a string, not a typed `Id<"sessions">`. This is a current limitation of Convex components. If you need to store references to sessions in your own tables, use string fields:

```typescript
// In your schema
defineTable({
  sessionId: v.string(), // Store as string, not v.id("sessions")
  // ... other fields
})
```

### Session Cleanup

To automatically clean up expired sessions, set up a cron job:

```typescript
// convex/crons.ts
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
  "cleanup expired sessions",
  { hourUTC: 0, minuteUTC: 0 },
  internal.shopify.cleanupExpired
);

export default crons;
```

## Development

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Run type checking
npm run typecheck

# Run tests
npm test
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Related

- [Convex](https://www.convex.dev/) - The backend platform
- [@shopify/shopify-api](https://www.npmjs.com/package/@shopify/shopify-api) - Shopify API client
- [@shopify/shopify-app-session-storage](https://www.npmjs.com/package/@shopify/shopify-app-session-storage) - Session storage interface

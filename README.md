# Session Storage Adapter for Convex

This packages implements the `SessionStorage` interface that works with [Convex](https://www.convex.dev/).

There are two client classes that are exported:

- `ShopifySessionStorage` - A `convex component` that creates a `sessionsTable` under the `shopifySessionStorage` component.

- `ConvexSessionStorageAdapter` - For use in your `shopify app`.

# Usage

## ShopifySessionStorageClient in Convex

Register the convex component with your convex backend.

```typescript
/*
convex/convex.config.ts
*/

import { defineApp } from "convex/server";
import shopifySessionStorage from "@fmap-labs/shopify-app-convex-session-storage/convex.config";

const app = defineApp();
app.use(shopifySessionStorage);
export default app;
```

You can then use the component like so:

```typescript
//someRoute.ts

import { ShopifySessionStorage } from "@fmap-labs/shopify-app-convex-session-storage/convex.config";
import { components } from "./_generated/api";

const sessionStorage = new ShopifySessionStorage(components);

export const myMutation = mutation({
  args: { shopifyProductId: v.string(), session: sessionValidator },
  handler: async (ctx, { shopifyProductId, sessionId }) => {
    await sessionStorage.storeSession(session);
  },
});

export const exampleQuery = query({
  // because this is a component, you cannot reference the _id column
  // as v.id("sessions") or Id<'session'>
  // this is current limitation of Convex's component implementation.
  args: { _id: v.string() },
  handler: async (ctx, { _id }) => {
    ctx.db
      .query("someTable")
      .withIndex("by_session_id", (q) => q.eq("session_id", _id));
  },
});
```

## ConvexSessionStorageAdapter in your app

```typescript
// app/shopify.server.js
import { ApiVersion, shopifyApp } from "@shopify/shopify-app-remix"; //or @shopify/shopify-app-react-router
import { ConvexSessionStorageAdapter } from "@fmap-labs/shopify-app-convex-session-storage";
import { ConvexHttpClient } from "convex/browser";
import { api } from "convex/_generated/api";
const convexUrl = process.env.CONVEX_URL; // adjust to based on your framework
const convex = new ConvexHttpClient(convexUrl);

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecretKey: process.env.SHOPIFY_API_SECRET!,
  appUrl: process.env.SHOPIFY_APP_URL!,
  scopes: process.env.SCOPES.split(","),
  apiVersion: ApiVersion.October25,
  sessionStorage: new ConvexSessionStorageAdapter(convex, api),
});

export default shopify;
```

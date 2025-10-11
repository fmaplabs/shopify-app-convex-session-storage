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
```

## ConvexSessionStorageAdapter in your app

```typescript
import { ConvexSessionStorageAdapter } from "@fmap-labs/shopify-app-convex-session-storage";
import { ConvexHttpClient } from "convex/browser";
```

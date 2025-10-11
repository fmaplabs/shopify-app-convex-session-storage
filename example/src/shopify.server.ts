// app/shopify.server.js
// Note that you don't need to import the node adapter if you're running on a different runtime.
import "@shopify/shopify-app-remix/server/adapters/node";
// Memory storage makes it easy to set an app up, but should never be used in production.
import { ApiVersion, shopifyApp } from "@shopify/shopify-app-remix";
import { ConvexSessionStorageAdapter } from "@fmap-labs/shopify-app-convex-session-storage";
import { ConvexHttpClient } from "convex/";
import { api } from "convex/_generated/api";
const convexUrl = process.env.CONVEX_URL; // adjust to based on your framework
const convex = new ConvexHttpClient(convexUrl);

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecretKey: process.env.SHOPIFY_API_SECRET!,
  appUrl: process.env.SHOPIFY_APP_URL!,
  scopes: ["read_products"],
  apiVersion: ApiVersion.July25,
  sessionStorage: new ConvexSessionStorageAdapter(convex, api),
});
export default shopify;

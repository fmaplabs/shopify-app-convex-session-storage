import { defineApp } from "convex/server";
import shopifySessionStorage from "@fmap-labs/shopify-app-convex-session-storage/convex.config";

const app = defineApp();
app.use(shopifySessionStorage);
export default app;

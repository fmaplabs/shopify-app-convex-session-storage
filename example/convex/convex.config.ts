import { defineApp } from "convex/server";
import shopifyAppConvexSessionStorage from "@fmaplabs/shopify-app-convex-session-storage/convex.config.js";

const app = defineApp();
app.use(shopifyAppConvexSessionStorage);

export default app;

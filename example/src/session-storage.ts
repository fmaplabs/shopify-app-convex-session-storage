import { ConvexSessionStorage } from "@fmaplabs/shopify-app-convex-session-storage";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const client = new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL);

export const sessionStorage = new ConvexSessionStorage(client, {
  storeSession: api.example.storeSession,
  loadSession: api.example.loadSession,
  deleteSession: api.example.deleteSession,
  deleteSessions: api.example.deleteSessions,
  findSessionsByShop: api.example.findSessionsByShop,
});

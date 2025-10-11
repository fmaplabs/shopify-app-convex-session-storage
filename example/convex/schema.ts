import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 *
 * Schema for user specific session data
 * These fields are included when using online access tokens.
 *
 */
export const associatedUserFields = v.object({
  first_name: v.string(),
  last_name: v.string(),
  email: v.string(),
  email_verified: v.boolean(),
  account_owner: v.boolean(),
  locale: v.string(),
  collaborator: v.boolean(),
  id: v.number(),
});

/**
 *
 * Schema for online access tokens.
 * These fields are included if using online tokens.
 *
 */
export const onlineAccessInfoFields = v.object({
  expires_in: v.string(),
  associated_user_scope: v.optional(v.string()),
  associated_user: v.optional(associatedUserFields), //inlcudes the above
});

/**
 *
 * Schema for Shopify session storage.
 * This defines the structure for storing Shopify app sessions in Convex.
 */
export const sessionFields = v.object({
  shop: v.string(), //should be a subdomain URL (example.myshopify.com)
  state: v.string(),
  isOnline: v.boolean(),
  scope: v.optional(v.string()),
  expires: v.optional(v.string()),
  accessToken: v.optional(v.string()),
  id: v.string(), //use the one provided by shopfiy, the one from session storage
  onlineAccessInfo: v.optional(onlineAccessInfoFields),
});

/**
 * Schema for Shopify session storage.
 * This defines the structure for storing Shopify app sessions in Convex.
 */
export default defineSchema({
  sessions: defineTable(sessionFields)
    // Index to find session by ID
    .index("by_session_id", ["id"])
    // Index to find all sessions for a shop
    .index("by_shop", ["shop"])
    // Index to find expired sessions for cleanup
    .index("by_expires", ["expires"]),
});

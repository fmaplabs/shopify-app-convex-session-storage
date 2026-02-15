import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const associatedUserValidator = v.object({
  id: v.number(),
  first_name: v.string(),
  last_name: v.string(),
  email: v.string(),
  account_owner: v.boolean(),
  locale: v.string(),
  collaborator: v.boolean(),
  email_verified: v.boolean(),
});

export const onlineAccessInfoValidator = v.object({
  expires_in: v.number(),
  associated_user_scope: v.string(),
  associated_user: associatedUserValidator,
});

export const sessionFieldsValidator = {
  id: v.string(),
  shop: v.string(),
  state: v.optional(v.string()),
  isOnline: v.boolean(),
  scope: v.optional(v.string()),
  expires: v.optional(v.string()),
  accessToken: v.optional(v.string()),
  onlineAccessInfo: v.optional(onlineAccessInfoValidator),
};

export default defineSchema({
  sessions: defineTable(sessionFieldsValidator)
    .index("by_session_id", ["id"])
    .index("by_shop", ["shop"]),
});

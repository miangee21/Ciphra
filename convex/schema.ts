//convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    username: v.string(),
    publicKey: v.string(),
    createdAt: v.number(),
  })
    .index("by_username", ["username"])
    .index("by_publicKey", ["publicKey"]),

  folders: defineTable({
    userId: v.id("users"),
    nameEncrypted: v.string(),
    color: v.string(),
    isStarred: v.boolean(),
    isLocked: v.boolean(),
    lockPinHash: v.optional(v.string()),
    isDeleted: v.boolean(),
    deletedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_deleted", ["userId", "isDeleted"]),

  documents: defineTable({
    userId: v.id("users"),
    folderId: v.id("folders"),
    titleEncrypted: v.string(),
    contentEncrypted: v.string(),
    color: v.string(),
    isStarred: v.boolean(),
    isDeleted: v.boolean(),
    deletedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_folder", ["folderId"])
    .index("by_user", ["userId"])
    .index("by_user_deleted", ["userId", "isDeleted"]),

  files: defineTable({
    userId: v.id("users"),
    folderId: v.id("folders"),
    nameEncrypted: v.string(),
    type: v.union(v.literal("image"), v.literal("pdf")),
    mimeType: v.string(),
    storageId: v.string(),
    sizeBytes: v.number(),
    isStarred: v.boolean(),
    isDeleted: v.boolean(),
    deletedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_folder", ["folderId"])
    .index("by_user", ["userId"])
    .index("by_user_deleted", ["userId", "isDeleted"]),
});

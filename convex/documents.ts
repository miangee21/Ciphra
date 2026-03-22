//convex/documents.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all non-deleted documents in a folder
export const getDocuments = query({
  args: { folderId: v.id("folders") },
  handler: async (ctx, { folderId }) => {
    return await ctx.db
      .query("documents")
      .withIndex("by_folder", (q) => q.eq("folderId", folderId))
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .collect();
  },
});

// Get all deleted documents for a user (recycle bin)
export const getDeletedDocuments = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("documents")
      .withIndex("by_user_deleted", (q) =>
        q.eq("userId", userId).eq("isDeleted", true),
      )
      .collect();
  },
});

// Get all documents for a user (for search)
export const getAllDocuments = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .collect();
  },
});

// Get single document by ID
export const getDocument = query({
  args: { id: v.id("documents") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

// Create a new document
export const createDocument = mutation({
  args: {
    userId: v.id("users"),
    folderId: v.id("folders"),
    titleEncrypted: v.string(),
    contentEncrypted: v.string(),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("documents", {
      ...args,
      isStarred: false,
      isLocked: false,
      isDeleted: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Update document content (auto-save)
export const updateDocument = mutation({
  args: {
    id: v.id("documents"),
    titleEncrypted: v.optional(v.string()),
    contentEncrypted: v.optional(v.string()),
    color: v.optional(v.string()),
    isStarred: v.optional(v.boolean()),
    isLocked: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...updates }) => {
    await ctx.db.patch(id, { ...updates, updatedAt: Date.now() });
  },
});

// Soft delete document
export const softDeleteDocument = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, {
      isDeleted: true,
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Restore document from recycle bin
export const restoreDocument = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, {
      isDeleted: false,
      deletedAt: undefined,
      updatedAt: Date.now(),
    });
  },
});

// Permanent delete document
export const permanentDeleteDocument = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

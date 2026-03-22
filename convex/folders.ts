//convex/folders.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all non-deleted folders for a user
export const getFolders = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("folders")
      .withIndex("by_user_deleted", (q) =>
        q.eq("userId", userId).eq("isDeleted", false),
      )
      .collect();
  },
});

// Get all deleted folders (recycle bin)
export const getDeletedFolders = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("folders")
      .withIndex("by_user_deleted", (q) =>
        q.eq("userId", userId).eq("isDeleted", true),
      )
      .collect();
  },
});

// Create a new folder
export const createFolder = mutation({
  args: {
    userId: v.id("users"),
    nameEncrypted: v.string(),
    color: v.string(),
  },
  handler: async (ctx, { userId, nameEncrypted, color }) => {
    return await ctx.db.insert("folders", {
      userId,
      nameEncrypted,
      color,
      isStarred: false,
      isLocked: false,
      isDeleted: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Update folder (rename, color, star, lock)
export const updateFolder = mutation({
  args: {
    id: v.id("folders"),
    nameEncrypted: v.optional(v.string()),
    color: v.optional(v.string()),
    isStarred: v.optional(v.boolean()),
    isLocked: v.optional(v.boolean()),
    lockPinHash: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...updates }) => {
    await ctx.db.patch(id, { ...updates, updatedAt: Date.now() });
  },
});

// Soft delete — move to recycle bin
export const softDeleteFolder = mutation({
  args: { id: v.id("folders") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, {
      isDeleted: true,
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Restore from recycle bin
export const restoreFolder = mutation({
  args: { id: v.id("folders") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, {
      isDeleted: false,
      deletedAt: undefined,
      updatedAt: Date.now(),
    });
  },
});

// Permanent delete folder + all its contents
export const permanentDeleteFolder = mutation({
  args: { id: v.id("folders") },
  handler: async (ctx, { id }) => {
    // Delete all documents in folder
    const docs = await ctx.db
      .query("documents")
      .withIndex("by_folder", (q) => q.eq("folderId", id))
      .collect();
    for (const doc of docs) await ctx.db.delete(doc._id);

    // Delete all files in folder
    const files = await ctx.db
      .query("files")
      .withIndex("by_folder", (q) => q.eq("folderId", id))
      .collect();
    for (const file of files) await ctx.db.delete(file._id);

    // Delete folder
    await ctx.db.delete(id);
  },
});

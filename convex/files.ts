//convex/files.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all non-deleted files in a folder
export const getFiles = query({
  args: { folderId: v.id("folders") },
  handler: async (ctx, { folderId }) => {
    return await ctx.db
      .query("files")
      .withIndex("by_folder", (q) => q.eq("folderId", folderId))
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .collect();
  },
});

// Get all deleted files for a user (recycle bin)
export const getDeletedFiles = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("files")
      .withIndex("by_user_deleted", (q) =>
        q.eq("userId", userId).eq("isDeleted", true),
      )
      .collect();
  },
});

// Generate upload URL for Convex file storage
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Save file metadata after upload
export const saveFile = mutation({
  args: {
    userId: v.id("users"),
    folderId: v.id("folders"),
    nameEncrypted: v.string(),
    type: v.union(v.literal("image"), v.literal("pdf")),
    mimeType: v.string(),
    storageId: v.string(),
    sizeBytes: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("files", {
      ...args,
      isStarred: false,
      isLocked: false,
      isDeleted: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Get file download URL from Convex storage
export const getFileUrl = query({
  args: { storageId: v.string() },
  handler: async (ctx, { storageId }) => {
    return await ctx.storage.getUrl(storageId);
  },
});

// Update file (star, rename, lock)
export const updateFile = mutation({
  args: {
    id: v.id("files"),
    nameEncrypted: v.optional(v.string()),
    isStarred: v.optional(v.boolean()),
    isLocked: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...updates }) => {
    await ctx.db.patch(id, { ...updates, updatedAt: Date.now() });
  },
});

// Soft delete file
export const softDeleteFile = mutation({
  args: { id: v.id("files") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, {
      isDeleted: true,
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Restore file from recycle bin
export const restoreFile = mutation({
  args: { id: v.id("files") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, {
      isDeleted: false,
      deletedAt: undefined,
      updatedAt: Date.now(),
    });
  },
});

// Permanent delete file
export const permanentDeleteFile = mutation({
  args: { id: v.id("files") },
  handler: async (ctx, { id }) => {
    // 1. find record in database
    const file = await ctx.db.get(id);
    if (!file) throw new Error("File not found");

    if (file.storageId) {
      await ctx.storage.delete(file.storageId as any);
    }

    await ctx.db.delete(id);
  },
});

// Get total storage used by user
export const getStorageUsage = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const files = await ctx.db
      .query("files")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const totalBytes = files.reduce((sum, f) => sum + f.sizeBytes, 0);
    return { totalBytes, fileCount: files.length };
  },
});

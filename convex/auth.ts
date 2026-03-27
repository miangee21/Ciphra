//convex/auth.ts
/// <reference types="node" />
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Check if username is available
export const checkUsername = query({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", username))
      .first();
    return { available: !existing };
  },
});

// Create new user (called after mnemonic confirmation)
export const createUser = mutation({
  args: {
    username: v.string(),
    publicKey: v.string(),
  },
  handler: async (ctx, { username, publicKey }) => {
    // Double check username not taken
    const existing = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", username))
      .first();
    if (existing) throw new Error("Username already taken");

    return await ctx.db.insert("users", {
      username,
      publicKey,
      createdAt: Date.now(),
    });
  },
});

// Get user by public key (used during login)
export const getUserByPublicKey = query({
  args: { publicKey: v.string() },
  handler: async (ctx, { publicKey }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_publicKey", (q) => q.eq("publicKey", publicKey))
      .first();
  },
});

// Get user by ID (used after login to fetch profile)
export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db.get(userId);
  },
});

// Delete user account permanently
export const deleteAccount = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    // 1. Delete all folders
    const folders = await ctx.db
      .query("folders")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const folder of folders) {
      await ctx.db.delete(folder._id);
    }

    // 2. Delete all documents
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const doc of documents) {
      await ctx.db.delete(doc._id);
    }

    // 3. Delete all files AND Storage Bucket Data
    const files = await ctx.db
      .query("files")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const file of files) {
      if (file.storageId) {
        await ctx.storage.delete(file.storageId as any);
      }
      await ctx.db.delete(file._id);
    }

    // 4. Finally, Delete the User
    await ctx.db.delete(userId);
  },
});

// Get minimum required version from Convex Environment Variables
export const getMinRequiredVersion = query({
  args: {},
  handler: async () => {
    return process.env.MIN_REQUIRED_VERSION ?? "0.1.0";
  },
});

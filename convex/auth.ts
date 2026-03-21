//convex/auth.ts
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
    // Delete all folders
    const folders = await ctx.db
      .query("folders")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const folder of folders) {
      await ctx.db.delete(folder._id);
    }

    // Delete all documents
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const doc of documents) {
      await ctx.db.delete(doc._id);
    }

    // Delete all files
    const files = await ctx.db
      .query("files")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const file of files) {
      await ctx.db.delete(file._id);
    }

    // Delete user
    await ctx.db.delete(userId);
  },
});

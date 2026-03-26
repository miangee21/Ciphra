//convex/recycleBin.ts
import { internalMutation } from "./_generated/server";

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

// ── Internal: purge items older than 30 days (called by cron) ──
export const purgeOldItems = internalMutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - THIRTY_DAYS;

    // Purge deleted folders + contents
    const folders = await ctx.db
      .query("folders")
      .filter((q) =>
        q.and(
          q.eq(q.field("isDeleted"), true),
          q.lt(q.field("deletedAt"), cutoff),
        ),
      )
      .collect();

    for (const folder of folders) {
      const docs = await ctx.db
        .query("documents")
        .withIndex("by_folder", (q) => q.eq("folderId", folder._id))
        .collect();
      for (const doc of docs) await ctx.db.delete(doc._id);

      const files = await ctx.db
        .query("files")
        .withIndex("by_folder", (q) => q.eq("folderId", folder._id))
        .collect();
      for (const file of files) {
        await ctx.storage.delete(file.storageId as unknown as string);
        await ctx.db.delete(file._id);
      }
      await ctx.db.delete(folder._id);
    }

    // Purge deleted documents
    const docs = await ctx.db
      .query("documents")
      .filter((q) =>
        q.and(
          q.eq(q.field("isDeleted"), true),
          q.lt(q.field("deletedAt"), cutoff),
        ),
      )
      .collect();
    for (const doc of docs) await ctx.db.delete(doc._id);

    // Purge deleted files
    const files = await ctx.db
      .query("files")
      .filter((q) =>
        q.and(
          q.eq(q.field("isDeleted"), true),
          q.lt(q.field("deletedAt"), cutoff),
        ),
      )
      .collect();
    for (const file of files) {
      await ctx.storage.delete(file.storageId as unknown as string);
      await ctx.db.delete(file._id);
    }
  },
});

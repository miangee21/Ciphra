//src/features/recycle/components/RecycleItemCard.tsx
import type { RecycleItem } from "../RecycleBinPage";
import ImageThumbnail from "@/features/folder/components/ImageThumbnail";
import {
  FolderOpen,
  FileText,
  Image,
  RotateCcw,
  Trash2,
  Star,
  Lock,
} from "lucide-react";

interface RecycleItemCardProps {
  item: RecycleItem;
  onRestore: () => void;
  onDelete: () => void;
}

export default function RecycleItemCard({
  item,
  onRestore,
  onDelete,
}: RecycleItemCardProps) {
  const Icon =
    item.itemType === "folder"
      ? FolderOpen
      : item.itemType === "document"
        ? FileText
        : item.itemType === "image"
          ? Image
          : FileText;

  const iconColor =
    item.itemType === "folder"
      ? (item.color ?? "#6366f1")
      : item.itemType === "document"
        ? (item.color ?? "#6366f1")
        : item.itemType === "pdf"
          ? "#ef4444"
          : "#3b82f6";

  // Days left calculation
  const deletedAt = item.deletedAt || Date.now();
  const msDeleted = Date.now() - deletedAt;
  const daysDeleted = Math.floor(msDeleted / (1000 * 60 * 60 * 24));
  const daysLeft = Math.max(0, 30 - daysDeleted);

  return (
    <div className="group relative flex flex-col rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full">
      {/* ── PREMIUM BACKGROUND (Image Thumbnail OR Glow) ── */}
      {item.itemType === "image" && item.storageId ? (
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Thumbnail acting as background */}
          <div className="w-full h-full transform transition-transform duration-700 group-hover:scale-110 opacity-30 dark:opacity-25 blur-[1px] group-hover:blur-none">
            <ImageThumbnail
              storageId={item.storageId}
              name={item.name}
              isLocked={item.isLocked}
            />
          </div>
          {/* Gradient Overlay for text readability */}
          <div className="absolute inset-0 bg-linear-to-t from-white via-white/80 to-transparent dark:from-slate-900 dark:via-slate-900/80 dark:to-transparent" />
        </div>
      ) : (
        <div
          className="absolute top-0 left-0 w-full h-24 opacity-20 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `linear-gradient(to bottom, ${iconColor}, transparent)`,
          }}
        />
      )}

      {/* ── TOP ANIMATED LINE ── */}
      <div className="flex justify-center w-full h-1 relative z-10 shrink-0">
        <div
          className="w-28 h-full rounded-b-full transition-all duration-300 group-hover:w-full group-hover:rounded-none"
          style={{ backgroundColor: iconColor }}
        />
      </div>

      {/* Badges (Star / Lock) */}
      <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-20">
        {item.isStarred && (
          <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center backdrop-blur-md border border-amber-200/50 dark:border-amber-500/20 shadow-sm">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          </div>
        )}
        {item.isLocked && (
          <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
            <Lock className="w-3.5 h-3.5 text-slate-500" />
          </div>
        )}
      </div>

      {/* ── UNIFORM CONTENT STRUCTURE ── */}
      <div className="flex flex-col gap-3 p-4 relative z-10 flex-1 justify-between">
        <div>
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300 backdrop-blur-xl border border-white/50 dark:border-slate-700/50"
            style={{ backgroundColor: iconColor + "22" }}
          >
            <Icon className="w-5 h-5" style={{ color: iconColor }} />
          </div>

          {/* Name */}
          <div className="mt-3">
            <p className="text-[14px] font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-sky-400 transition-colors">
              {item.name}
            </p>
            <p className="text-[11px] font-semibold text-slate-400 mt-0.5 uppercase tracking-wider">
              {item.itemType}
            </p>
          </div>

          {/* Days remaining */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg w-fit text-[10px] font-bold tracking-wide uppercase mt-2 ${
              daysLeft <= 3
                ? "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50"
                : daysLeft <= 7
                  ? "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
            }`}
          >
            <span>{daysLeft} days left</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-2 pt-1">
          <button
            onClick={onRestore}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold bg-indigo-50/80 text-indigo-600 dark:bg-indigo-500/10 dark:text-sky-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors shadow-sm backdrop-blur-md"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restore
          </button>
          <button
            onClick={onDelete}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold bg-red-50/80 text-red-600 dark:bg-red-950/20 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/40 transition-colors shadow-sm backdrop-blur-md"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

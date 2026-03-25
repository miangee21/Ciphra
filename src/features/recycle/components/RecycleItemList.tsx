//src/features/recycle/components/RecycleItemList.tsx
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

interface RecycleItemListProps {
  item: RecycleItem;
  onRestore: () => void;
  onDelete: () => void;
}

export default function RecycleItemList({
  item,
  onRestore,
  onDelete,
}: RecycleItemListProps) {
  const daysLeft = item.deletedAt
    ? Math.max(0, 30 - Math.floor((Date.now() - item.deletedAt) / 86400000))
    : 30;

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

  return (
    <div className="relative overflow-hidden flex items-center gap-4 px-4 py-3 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all duration-300 group">
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-5 rounded-r-full opacity-40 group-hover:opacity-100 group-hover:h-[60%] transition-all duration-300 z-10"
        style={{ backgroundColor: iconColor }}
      />

      {item.itemType === "image" && item.storageId ? (
        <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 shadow-sm border border-slate-200 dark:border-slate-700/50">
          <div className="w-full h-full transform transition-transform duration-500 group-hover:scale-110">
            <ImageThumbnail
              storageId={item.storageId}
              name={item.name}
              isLocked={item.isLocked}
            />
          </div>
        </div>
      ) : (
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-300 border border-white/50 dark:border-slate-700/50 backdrop-blur-md"
          style={{ backgroundColor: iconColor + "22" }}
        >
          <Icon className="w-4 h-4" style={{ color: iconColor }} />
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center gap-2">
          <p className="text-[14px] font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-sky-400 transition-colors">
            {item.name}
          </p>
          {item.isStarred && (
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
          )}
          {item.isLocked && (
            <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          )}
        </div>
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
          {item.itemType}
        </p>
      </div>

      {/* Days left Badge */}
      <div
        className={`hidden sm:flex items-center justify-center px-3 py-1 rounded-lg shrink-0 text-[11px] font-bold tracking-wide uppercase border ${
          daysLeft <= 3
            ? "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/50"
            : daysLeft <= 7
              ? "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/50"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
        }`}
      >
        {daysLeft} days left
      </div>

      {/* Deleted date */}
      <div className="hidden md:flex flex-col items-end shrink-0 w-24">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Deleted On
        </span>
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
          {item.deletedAt ? new Date(item.deletedAt).toLocaleDateString() : "—"}
        </span>
      </div>

      {/* Vertical Divider */}
      <div className="hidden sm:block w-px h-8 bg-slate-200 dark:bg-slate-700 mx-1 shrink-0" />

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onRestore}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-sky-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all shadow-sm hover:scale-105"
          title="Restore"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/40 transition-all shadow-sm hover:scale-105"
          title="Permanently Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

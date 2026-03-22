// src/features/home/components/FolderContextMenu.tsx
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { ramStore } from "@/lib/storage/ram";
import { encryptData } from "@/lib/crypto/aes";
import type { DecryptedFolder } from "../HomePage";
import type { Id } from "../../../../convex/_generated/dataModel";
import VerifyPinModal from "@/components/common/VerifyPinModal";
import { toast } from "sonner";
import {
  Star,
  StarOff,
  Pencil,
  Palette,
  Trash2,
  Lock,
  Unlock,
  Check,
} from "lucide-react";

const FOLDER_COLORS = [
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#f59e0b", // amber
  "#10b981", // emerald
  "#3b82f6", // blue
  "#ef4444", // red
  "#14b8a6", // teal
];

interface FolderContextMenuProps {
  folder: DecryptedFolder;
  onClose: () => void;
}

export default function FolderContextMenu({
  folder,
  onClose,
}: FolderContextMenuProps) {
  const [view, setView] = useState<"menu" | "rename" | "color">("menu");
  const [newName, setNewName] = useState(folder.name);
  const [loading, setLoading] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);

  const updateFolder = useMutation(api.folders.updateFolder);
  const softDelete = useMutation(api.folders.softDeleteFolder);

  const handleStar = async () => {
    await updateFolder({
      id: folder._id as Id<"folders">,
      isStarred: !folder.isStarred,
    });
    toast.success(folder.isStarred ? "Unstarred" : "Starred successfully");
    onClose();
  };

  const handleLockToggle = async () => {
    if (folder.isLocked) {
      // Trying to unlock -> Show PIN Modal first
      setShowPinModal(true);
    } else {
      // Trying to lock -> Do it immediately
      await performLockToggle();
    }
  };

  const performLockToggle = async () => {
    await updateFolder({
      id: folder._id as Id<"folders">,
      isLocked: !folder.isLocked,
    });
    toast.success(
      folder.isLocked ? "Folder Unlocked" : "Folder Locked Securely",
    );
    onClose();
  };

  const handleRename = async () => {
    if (!newName.trim() || newName === folder.name) {
      onClose();
      return;
    }
    const key = ramStore.getKey();
    if (!key) return;
    setLoading(true);
    try {
      const nameEncrypted = await encryptData(newName.trim(), key);
      await updateFolder({
        id: folder._id as Id<"folders">,
        nameEncrypted,
      });
      toast.success("Renamed successfully");
      onClose();
    } catch {
      toast.error("Failed to rename");
    } finally {
      setLoading(false);
    }
  };

  const handleColorChange = async (color: string) => {
    await updateFolder({
      id: folder._id as Id<"folders">,
      color,
    });
    onClose();
  };

  const handleDelete = async () => {
    await softDelete({ id: folder._id as Id<"folders"> });
    toast.success("Moved to Trash");
    onClose();
  };

  // ── Rename View ──
  if (view === "rename") {
    return (
      <div className="flex flex-col gap-3 p-3 animate-in fade-in slide-in-from-right-2 duration-200">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
            Rename Folder
          </label>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
            autoFocus
            className="w-full px-3 py-2 rounded-xl bg-slate-100/50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800/80 text-[13px] font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder:text-slate-400"
            placeholder="Folder name..."
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView("menu")}
            className="flex-1 py-2 rounded-xl text-[12px] font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleRename}
            disabled={loading || !newName.trim()}
            className="flex-1 py-2 rounded-xl text-[12px] font-semibold bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 transition-colors shadow-sm"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    );
  }

  // ── Color View ───
  if (view === "color") {
    return (
      <div className="flex flex-col gap-3 p-3 animate-in fade-in slide-in-from-right-2 duration-200">
        <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
          Folder Color
        </label>
        <div className="grid grid-cols-4 gap-2.5 p-2 bg-slate-50/50 dark:bg-slate-950/50 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
          {FOLDER_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => handleColorChange(c)}
              className={`w-7 h-7 rounded-full transition-all duration-300 flex items-center justify-center hover:scale-110 mx-auto ${
                folder.color === c
                  ? "ring-2 ring-offset-2 dark:ring-offset-slate-900 shadow-sm"
                  : "opacity-80 hover:opacity-100"
              }`}
              style={
                {
                  backgroundColor: c,
                  "--tw-ring-color": c,
                } as React.CSSProperties
              }
            >
              {folder.color === c && (
                <Check
                  className="w-3.5 h-3.5 text-white animate-in zoom-in duration-200"
                  strokeWidth={3}
                />
              )}
            </button>
          ))}
        </div>
        <button
          onClick={() => setView("menu")}
          className="w-full py-2 rounded-xl text-[12px] font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          Back
        </button>
      </div>
    );
  }

  // ── Main Menu ──
  return (
    <>
      <div className="flex flex-col p-1.5 animate-in fade-in zoom-in-95 duration-200">
        {/* Star */}
        <MenuButton
          icon={folder.isStarred ? StarOff : Star}
          label={folder.isStarred ? "Unstar" : "Star"}
          onClick={handleStar}
        />

        {/* Lock / Unlock */}
        <MenuButton
          icon={folder.isLocked ? Unlock : Lock}
          label={folder.isLocked ? "Unlock" : "Lock"}
          onClick={handleLockToggle}
        />

        {/* Rename */}
        <MenuButton
          icon={Pencil}
          label="Rename"
          onClick={() => setView("rename")}
        />

        {/* Color */}
        <MenuButton
          icon={Palette}
          label="Color"
          onClick={() => setView("color")}
        />

        {/* Divider */}
        <div className="h-px bg-slate-200/80 dark:bg-slate-800/80 my-1 mx-2" />

        {/* Delete */}
        <MenuButton
          icon={Trash2}
          label="Delete"
          onClick={handleDelete}
          danger
        />
      </div>

      {/* Verify PIN Modal when trying to unlock a folder from menu */}
      <VerifyPinModal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        onSuccess={() => {
          setShowPinModal(false);
          performLockToggle();
        }}
        title="Unlock Folder"
        description="Enter your Master PIN to remove the lock from this folder."
      />
    </>
  );
}

// ── Reusable Menu Button ───
function MenuButton({
  icon: Icon,
  label,
  onClick,
  danger = false,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-all text-left group ${
        danger
          ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80"
      }`}
    >
      <Icon
        className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${danger ? "" : "text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 dark:group-hover:text-sky-400"}`}
      />
      {label}
    </button>
  );
}

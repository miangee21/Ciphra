// src/features/folder/components/FileContextMenu.tsx
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { ramStore } from "@/lib/storage/ram";
import { encryptData } from "@/lib/crypto/aes";
import type { DecryptedFile, DecryptedDocument } from "../FolderPage";
import type { Id } from "../../../../convex/_generated/dataModel";
import ConfirmModal from "@/components/common/ConfirmModal";
import VerifyPinModal from "@/components/common/VerifyPinModal";
import { toast } from "sonner";
import {
  Star,
  StarOff,
  Lock,
  Unlock,
  Pencil,
  Palette,
  Trash2,
  Check,
} from "lucide-react";

const DOC_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#ef4444",
  "#14b8a6",
];

interface FileContextMenuProps {
  item: DecryptedFile | DecryptedDocument;
  itemType: "file" | "document";
  folderId: Id<"folders">;
  onClose: () => void;
}

export default function FileContextMenu({
  item,
  itemType,
  onClose,
}: FileContextMenuProps) {
  const [view, setView] = useState<"menu" | "rename" | "color">("menu");
  const [newName, setNewName] = useState(item.name);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);

  const updateFile = useMutation(api.files.updateFile);
  const updateDoc = useMutation(api.documents.updateDocument);
  const softDeleteFile = useMutation(api.files.softDeleteFile);
  const softDeleteDoc = useMutation(api.documents.softDeleteDocument);

  // ── Handle Star ──
  const handleStar = async () => {
    try {
      if (itemType === "file") {
        await updateFile({
          id: item._id as Id<"files">,
          isStarred: !item.isStarred,
        });
      } else {
        await updateDoc({
          id: item._id as Id<"documents">,
          isStarred: !item.isStarred,
        });
      }
      toast.success(
        item.isStarred ? "Removed from Starred" : "Added to Starred",
      );
      onClose();
    } catch {
      toast.error("Failed to update star status");
    }
  };

  // ── Handle Lock ──
  const handleLockToggle = () => {
    if (item.isLocked) {
      setShowPinModal(true);
    } else {
      performLockToggle();
    }
  };

  const performLockToggle = async () => {
    try {
      if (itemType === "file") {
        await updateFile({
          id: item._id as Id<"files">,
          isLocked: !item.isLocked,
        });
      } else {
        await updateDoc({
          id: item._id as Id<"documents">,
          isLocked: !item.isLocked,
        });
      }
      toast.success(
        item.isLocked ? "Unlocked successfully" : "Locked securely",
      );
      onClose();
    } catch {
      toast.error("Failed to update lock status");
    }
  };

  // ── Handle Rename ──
  const handleRename = async () => {
    if (!newName.trim() || newName === item.name) {
      onClose();
      return;
    }
    const key = ramStore.getKey();
    if (!key) return;
    setLoading(true);
    try {
      const encrypted = await encryptData(newName.trim(), key);
      if (itemType === "file") {
        await updateFile({
          id: item._id as Id<"files">,
          nameEncrypted: encrypted,
        });
      } else {
        await updateDoc({
          id: item._id as Id<"documents">,
          titleEncrypted: encrypted,
        });
      }
      toast.success("Renamed successfully");
      onClose();
    } catch {
      toast.error("Failed to rename");
    } finally {
      setLoading(false);
    }
  };

  // ── Handle Color Change (Docs Only) ──
  const handleColorChange = async (color: string) => {
    if (itemType === "document") {
      await updateDoc({ id: item._id as Id<"documents">, color });
    }
    onClose();
  };

  // ── Handle Delete ──
  const handleDelete = async () => {
    setLoading(true);
    try {
      if (itemType === "file") {
        await softDeleteFile({ id: item._id as Id<"files"> });
      } else {
        await softDeleteDoc({ id: item._id as Id<"documents"> });
      }
      toast.success("Moved to Recycle Bin");
      onClose();
    } catch (error) {
      toast.error("Failed to delete item");
    } finally {
      setLoading(false);
    }
  };

  // ── Views ──
  if (view === "rename") {
    return (
      <div className="flex flex-col gap-3 p-3 animate-in fade-in slide-in-from-right-2 duration-200">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
            Rename
          </label>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
            autoFocus
            className="w-full px-3 py-2 rounded-xl bg-slate-100/50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800/80 text-[13px] font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder:text-slate-400"
            placeholder="Name..."
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

  if (view === "color" && itemType === "document") {
    const doc = item as DecryptedDocument;
    return (
      <div className="flex flex-col gap-3 p-3 animate-in fade-in slide-in-from-right-2 duration-200">
        <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
          Doc Color
        </label>
        <div className="grid grid-cols-4 gap-2.5 p-2 bg-slate-50/50 dark:bg-slate-950/50 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
          {DOC_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => handleColorChange(c)}
              className={`w-7 h-7 rounded-full transition-all duration-300 flex items-center justify-center hover:scale-110 mx-auto ${
                doc.color === c
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
              {doc.color === c && (
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

  return (
    <>
      <div className="flex flex-col p-1.5 animate-in fade-in zoom-in-95 duration-200">
        <MenuButton
          icon={item.isStarred ? StarOff : Star}
          label={item.isStarred ? "Unstar" : "Star"}
          onClick={handleStar}
        />

        <MenuButton
          icon={item.isLocked ? Unlock : Lock}
          label={item.isLocked ? "Unlock" : "Lock"}
          onClick={handleLockToggle}
        />

        <MenuButton
          icon={Pencil}
          label="Rename"
          onClick={() => setView("rename")}
        />

        {itemType === "document" && (
          <MenuButton
            icon={Palette}
            label="Color"
            onClick={() => setView("color")}
          />
        )}

        <div className="h-px bg-slate-200/80 dark:bg-slate-800/80 my-1 mx-2" />

        <MenuButton
          icon={Trash2}
          label="Delete"
          onClick={() => setShowDeleteConfirm(true)}
          danger
        />
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Move to Recycle Bin?"
        description={`Are you sure you want to move "${item.name}" to the recycle bin? You can restore it later.`}
        confirmText="Delete"
        loading={loading}
      />

      <VerifyPinModal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        onSuccess={() => {
          setShowPinModal(false);
          performLockToggle();
        }}
        title={`Unlock ${itemType === "file" ? "File" : "Document"}`}
        description={`Enter your Master PIN to remove the lock from this ${itemType}.`}
      />
    </>
  );
}

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

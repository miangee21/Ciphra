// src/features/home/components/CreateFolderModal.tsx
import { useState } from "react";
import { X, FolderOpen, Check, Sparkles } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useSessionStore } from "@/store/sessionStore";
import type { Id } from "../../../../convex/_generated/dataModel";
import { ramStore } from "@/lib/storage/ram";
import { encryptData } from "@/lib/crypto/aes";
import { toast } from "sonner";

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

interface CreateFolderModalProps {
  onClose: () => void;
}

export default function CreateFolderModal({ onClose }: CreateFolderModalProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(FOLDER_COLORS[0]);
  const [loading, setLoading] = useState(false);

  const createFolder = useMutation(api.folders.createFolder);
  const { userId } = useSessionStore();

  const handleCreate = async () => {
    if (!name.trim() || !userId) return;
    const key = ramStore.getKey();
    if (!key) return;

    setLoading(true);
    try {
      const nameEncrypted = await encryptData(name.trim(), key);
      await createFolder({
        userId: userId as Id<"users">,
        nameEncrypted,
        color,
      });
      toast.success("Vault Created", {
        description: `"${name}" is ready and secured.`,
      });
      onClose();
    } catch {
      toast.error("Failed to create folder");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
      {/* Main Modal Card */}
      <div className="relative w-full max-w-100 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-[2rem] border border-white/50 dark:border-slate-700/50 shadow-2xl p-6 sm:p-8 flex flex-col gap-6 animate-in zoom-in-95 slide-in-from-bottom-4 duration-500 overflow-hidden">
        {/* Dynamic Top Glow based on selected color */}
        <div
          className="absolute top-0 left-0 w-full h-32 opacity-10 dark:opacity-20 transition-colors duration-500 pointer-events-none"
          style={{
            background: `linear-gradient(to bottom, ${color}, transparent)`,
          }}
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100/80 dark:bg-slate-800/80 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:scale-105 transition-all z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Section */}
        <div className="flex flex-col items-center gap-3 text-center mt-2 relative z-10">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm transition-colors duration-500"
            style={{
              backgroundColor: color + "15",
              border: `1px solid ${color}30`,
            }}
          >
            <FolderOpen
              className="w-8 h-8 transition-colors duration-500"
              style={{ color }}
            />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Create Vault Folder
            </h2>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">
              Organize your encrypted files securely.
            </p>
          </div>
        </div>

        {/* Inputs Section */}
        <div className="flex flex-col gap-5 relative z-10 mt-2">
          {/* Name input */}
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 ml-1">
              Folder Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="e.g. Personal Documents"
              autoFocus
              className="w-full px-4 py-3 rounded-xl bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white text-sm outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-sky-500/10 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Color picker */}
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 ml-1">
              Folder Color
            </label>
            <div className="flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
              {FOLDER_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-full transition-all duration-300 flex items-center justify-center hover:scale-110 ${
                    color === c
                      ? "ring-2 ring-offset-2 dark:ring-offset-slate-900 shadow-md"
                      : "opacity-80 hover:opacity-100"
                  }`}
                  style={
                    {
                      backgroundColor: c,
                      "--tw-ring-color": c,
                    } as React.CSSProperties
                  }
                >
                  {color === c && (
                    <Check
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white animate-in zoom-in duration-200"
                      strokeWidth={3}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 relative z-10 pt-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
          >
            Cancel
          </button>

          {/* Dynamic Color Create Button */}
          <button
            onClick={handleCreate}
            disabled={!name.trim() || loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
            style={{
              backgroundColor: color,
              boxShadow: `0 4px 14px 0 ${color}40`,
            }}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Create
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

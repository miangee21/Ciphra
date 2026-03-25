// src/features/recycle/components/ConfirmDeleteModal.tsx
import { AlertTriangle, Trash2, RotateCcw, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfirmDeleteModalProps {
  itemName?: string;
  actionType: "delete" | "restore" | "empty";
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDeleteModal({
  itemName,
  actionType,
  onConfirm,
  onCancel,
}: ConfirmDeleteModalProps) {
  const isRestore = actionType === "restore";
  const isEmpty = actionType === "empty";

  const Icon: LucideIcon = isRestore
    ? RotateCcw
    : isEmpty
      ? Trash2
      : AlertTriangle;

  const title = isRestore
    ? "Restore Item"
    : isEmpty
      ? "Empty Recycle Bin"
      : "Permanent Delete";

  const desc = isRestore ? (
    <>
      Are you sure you want to restore{" "}
      <span className="font-semibold text-slate-900 dark:text-white">
        "{itemName}"
      </span>
      ? It will be moved back to your vault.
    </>
  ) : isEmpty ? (
    "Are you sure you want to permanently delete ALL items in the recycle bin? This action cannot be undone."
  ) : (
    <>
      Are you sure you want to permanently delete{" "}
      <span className="font-semibold text-slate-900 dark:text-white">
        "{itemName}"
      </span>
      ? This cannot be undone.
    </>
  );

  const iconBg = isRestore
    ? "bg-indigo-100 dark:bg-indigo-950/50"
    : "bg-red-100 dark:bg-red-950/50";
  const iconColor = isRestore
    ? "text-indigo-500 dark:text-indigo-400"
    : "text-red-500 dark:text-red-400";
  const btnClass = isRestore
    ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20"
    : "bg-red-500 hover:bg-red-600 text-white shadow-red-500/20";
  const btnText = isRestore
    ? "Restore"
    : isEmpty
      ? "Empty Bin"
      : "Delete Forever";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm mx-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 flex flex-col gap-5 animate-in zoom-in-95 duration-200">
        {/* Animated Premium Icon */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div
            className={`w-14 h-14 rounded-2xl ${iconBg} flex items-center justify-center shadow-sm`}
          >
            <Icon className={`w-7 h-7 ${iconColor}`} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              {title}
            </h2>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed px-2">
              {desc}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-1">
          <Button
            variant="outline"
            className="flex-1 rounded-xl font-semibold border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            className={`flex-1 rounded-xl font-bold shadow-sm transition-all hover:-translate-y-0.5 ${btnClass}`}
            onClick={onConfirm}
          >
            {btnText}
          </Button>
        </div>
      </div>
    </div>
  );
}

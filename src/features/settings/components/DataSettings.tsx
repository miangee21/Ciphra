//src/features/settings/components/DataSettings.tsx
import { useState } from "react";
import { Database, AlertTriangle, Trash2, Loader2 } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useSessionStore } from "@/store/sessionStore";
import ConfirmModal from "@/components/common/ConfirmModal";
import { ramStore } from "@/lib/storage/ram";
import { toast } from "sonner";

export default function DataSettings() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Zustand stores and Convex mutation
  const userId = useSessionStore((state) => state.userId);
  const clearSession = useSessionStore((state) => state.clearSession);
  const deleteAccountAPI = useMutation(api.auth.deleteAccount);

  const handleDeleteClick = () => {
    if (!userId) return;
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!userId) return;

    setIsDeleting(true);
    const toastId = toast.loading("Wiping your vault completely...", {
      id: "delete",
    });

    try {
      // 1. Call Convex to delete everything from DB and Storage
      await deleteAccountAPI({ userId: userId as any });

      // 2. Clear local RAM keys and Session
      ramStore.clearKey();
      clearSession();

      toast.success("Account deleted permanently.", { id: toastId });
    } catch (error) {
      console.error("Delete account error:", error);
      toast.error("Failed to delete account. Try again.", { id: toastId });
    } finally {
      setIsDeleting(false);
      setShowConfirmModal(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full">
      {/* --- Header Section --- */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Database className="text-indigo-500" size={22} strokeWidth={2.5} />
          Data & Privacy
        </h2>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
          Manage your vault's data. You have full control to permanently delete
          your account and all associated encrypted data from our servers.
        </p>
      </div>

      {/* --- Danger Zone Section --- */}
      <div className="pt-2">
        <h3 className="text-[11px] font-bold text-red-500 dark:text-red-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <AlertTriangle size={14} strokeWidth={3} />
          Danger Zone
        </h3>

        <div className="bg-red-50/50 dark:bg-red-500/5 border border-red-200 dark:border-red-900/50 rounded-3xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
          {/* Subtle red background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 dark:bg-red-500/10 blur-[80px] rounded-full pointer-events-none translate-x-1/2 -translate-y-1/2" />

          <div className="relative z-10 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/20 flex items-center justify-center shrink-0">
                <Trash2 size={22} strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-red-600 dark:text-red-400">
                  Delete Account
                </h3>
                <p className="text-xs sm:text-sm text-red-500/80 dark:text-red-400/80 mt-0.5 max-w-sm leading-relaxed">
                  Permanently delete your account and all encrypted data.{" "}
                  <strong>Cannot be undone.</strong>
                </p>
              </div>
            </div>

            <button
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white dark:bg-slate-950 hover:bg-red-50 dark:hover:bg-red-950 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/80 font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-70 shrink-0"
            >
              {isDeleting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                "Delete Account"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* --- Beautiful Confirmation Modal --- */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmDelete}
        title="Delete Account?"
        description="Are you absolutely sure? This will permanently delete your account, settings, folders, documents, and files. This action CANNOT be undone."
        confirmText="Yes, Delete My Account"
        cancelText="Cancel"
        loading={isDeleting}
      />
    </div>
  );
}

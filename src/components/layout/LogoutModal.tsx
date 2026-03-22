// src/components/layout/LogoutModal.tsx
import { LogOut, AlertTriangle, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function LogoutModal({
  isOpen,
  onClose,
  onConfirm,
}: LogoutModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* [&>button]:hidden hides the default Shadcn close button so we can use our premium one */}
      <DialogContent className="sm:max-w-106.25 p-0 overflow-hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-slate-200/80 dark:border-slate-800/80 rounded-[2rem] shadow-2xl [&>button]:hidden">
        {/* Subtle Inner Glow */}
        <div className="absolute top-0 left-0 w-full h-24 bg-linear-to-b from-red-500/5 dark:from-red-500/10 to-transparent pointer-events-none" />

        {/* Premium Custom Close Button (Wrapped in div to escape the hidden rule) */}
        <div className="absolute top-5 right-5 z-50">
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100/80 dark:bg-slate-800/80 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:scale-105 transition-all shadow-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 pt-8 flex flex-col gap-6 relative z-10">
          {/* Header */}
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center border border-red-100 dark:border-red-500/20 shadow-sm">
              <LogOut className="w-6 h-6 text-red-500 dark:text-red-400 ml-1" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white tracking-tight text-center">
                Logout
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-65 mx-auto text-center">
                Are you sure you want to logout?
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Warning Box */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200/50 dark:border-amber-500/20">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[13px] leading-relaxed text-amber-800 dark:text-amber-200/90 font-medium text-left">
              Logging out will remove your App Lock PIN. You will need to use
              your 12-word recovery phrase to log back in.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 sm:justify-between w-full pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-500/20 transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// src/components/common/VerifyPinModal.tsx
import { useState, useEffect } from "react";
import { ShieldCheck, X } from "lucide-react";
import PinInput from "@/features/lock/components/PinInput";
import { loadKeyWithPin } from "@/lib/storage/pinStorage";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface VerifyPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  description?: string;
}

export default function VerifyPinModal({
  isOpen,
  onClose,
  onSuccess,
  title = "Enter PIN",
  description = "Verify your identity to access this secure vault.",
}: VerifyPinModalProps) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Clear error whenever modal opens or closes
  useEffect(() => {
    if (!isOpen) setError("");
  }, [isOpen]);

  const handlePinSubmit = async (pin: string) => {
    setLoading(true);
    setError("");
    const key = await loadKeyWithPin(pin);
    setLoading(false);

    if (key) {
      onSuccess();
      onClose();
    } else {
      setError("Incorrect PIN. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-120 p-0 overflow-hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-slate-200/80 dark:border-slate-800/80 rounded-[2rem] shadow-2xl outline-none [&>button]:hidden">
        {/* Cinematic Top Glow */}
        <div className="absolute top-0 left-0 w-full h-32 bg-linear-to-b from-indigo-500/10 dark:from-sky-500/10 to-transparent pointer-events-none" />

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

        <div className="p-6 sm:p-8 flex flex-col gap-8 relative z-10">
          {/* Header Section */}
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-sky-500/10 flex items-center justify-center border border-indigo-100 dark:border-sky-500/20 shadow-sm relative">
              <ShieldCheck
                className="w-8 h-8 text-indigo-500 dark:text-sky-400"
                strokeWidth={1.5}
              />
            </div>

            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight text-center">
                {title}
              </DialogTitle>
              <DialogDescription className="text-[13.5px] text-slate-500 dark:text-slate-400 mt-1 max-w-75 mx-auto text-center leading-relaxed">
                {description}
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* PIN Input Area */}
          <div className="w-full flex justify-center py-2 relative z-10">
            <PinInput
              onSubmit={handlePinSubmit}
              error={error}
              disabled={loading}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

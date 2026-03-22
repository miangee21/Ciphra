// src/features/lock/LockScreen.tsx
import { useState } from "react";
import { loadKeyWithPin } from "@/lib/storage/pinStorage";
import { ramStore } from "@/lib/storage/ram";
import { useLockStore } from "@/store/lockStore";
import PinInput from "./components/PinInput";
import PinResetModal from "./components/PinResetModal";
import { toast } from "sonner";

export default function LockScreen() {
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [showReset, setShowReset] = useState(false);

  const { setLocked } = useLockStore();

  const handlePinSubmit = async (pin: string) => {
    try {
      const key = await loadKeyWithPin(pin);

      if (key) {
        ramStore.setKey(key);
        setLocked(false);
        setError("");
        setAttempts(0);
      } else {
        triggerWrongPinError();
      }
    } catch (err) {
      triggerWrongPinError();
    }
  };

  const triggerWrongPinError = () => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    const remaining = 5 - newAttempts;
    const errorMsg = `Incorrect PIN. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`;

    setError(errorMsg);

    toast.error("Authentication Failed", {
      description: errorMsg,
    });

    if (newAttempts >= 5) {
      setShowReset(true);
    }
  };

  const handleResetSuccess = () => {
    setShowReset(false);
    setAttempts(0);
    setError("");
    toast.success("PIN Reset Successfully", {
      description: "Your new PIN has been securely saved. App unlocked.",
    });
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col items-center justify-center overflow-hidden bg-slate-100/30 dark:bg-slate-950/30 backdrop-blur-3xl">
      {/* Heavy Ambient Glows behind the glass */}
      <div className="absolute top-[20%] left-[20%] w-125 h-125 bg-indigo-500/20 dark:bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none animate-pulse duration-1000" />
      <div className="absolute bottom-[20%] right-[20%] w-100 h-100 bg-purple-500/20 dark:bg-sky-500/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Main Content Area */}
      <div className="z-10 flex flex-col items-center gap-8 w-full animate-in fade-in zoom-in-95 duration-500">
        {/* Heading */}
        <div className="flex flex-col items-center gap-1.5 text-center">
          <h1 className="text-[22px] font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-2xl">🔐Welcome Back</span>
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400">
            Enter your PIN to access your vault
          </p>
        </div>

        {/* PIN Input & Forgot Link Wrapper (Restricts width to exactly the inputs) */}
        <div className="flex flex-col w-fit mx-auto gap-0">
          <PinInput
            onSubmit={handlePinSubmit}
            error={error}
            disabled={attempts >= 5}
          />

          {/* Forgot PIN - Pulled up closer to boxes, aligned right */}
          <div className="w-full flex justify-end -mt-8 relative z-20">
            <button
              onClick={() => setShowReset(true)}
              className="text-[12px] font-medium text-slate-400 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-indigo-400 transition-colors px-1"
            >
              Forgot PIN?
            </button>
          </div>
        </div>
      </div>

      {/* PIN Reset Modal */}
      {showReset && (
        <PinResetModal
          onSuccess={handleResetSuccess}
          onClose={() => setShowReset(false)}
        />
      )}
    </div>
  );
}

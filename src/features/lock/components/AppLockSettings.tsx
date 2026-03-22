// src/features/lock/components/AppLockSettings.tsx
import { useState } from "react";
import { Shield, ChevronLeft } from "lucide-react";
import { useLockStore } from "@/store/lockStore";
import PinInput from "@/features/lock/components/PinInput";
import { ramStore } from "@/lib/storage/ram";
import { toast } from "sonner";
import {
  saveKeyWithPin,
  clearPinStorage,
  changePinStorage,
  loadKeyWithPin,
} from "@/lib/storage/pinStorage";

type View =
  | "main"
  | "setPin"
  | "confirmPin"
  | "changePin"
  | "setNewPin"
  | "confirmNewPin";
type TimeoutOption = 1 | 5 | 30 | 60;

const TIMEOUT_OPTIONS: { label: string; value: TimeoutOption }[] = [
  { label: "1 min", value: 1 },
  { label: "5 min", value: 5 },
  { label: "30 min", value: 30 },
  { label: "1 hour", value: 60 },
];

export default function AppLockSettings() {
  const { isLockEnabled, timeoutMinutes, setLockEnabled, setTimeoutMinutes } =
    useLockStore();

  const [view, setView] = useState<View>("main");
  const [firstPin, setFirstPin] = useState("");
  const [error, setError] = useState("");
  const [oldPin, setOldPin] = useState("");

  // ── Enable Lock ──
  const handleEnableStart = () => {
    setError("");
    setView("setPin");
  };

  const handleFirstPin = (pin: string) => {
    setFirstPin(pin);
    setView("confirmPin");
  };

  const handleConfirmPin = async (pin: string) => {
    if (pin !== firstPin) {
      setError("PINs do not match. Try again.");
      setView("setPin");
      setFirstPin("");
      return;
    }

    const key = ramStore.getKey();
    if (!key) {
      setError("Session expired. Please login again.");
      return;
    }

    await saveKeyWithPin(key, pin);
    setLockEnabled(true);
    setView("main");
    setError("");
    toast.success("App Lock Enabled", {
      description: "Your app is now protected with a PIN.",
    });
  };

  // ── Disable Lock ──
  const handleDisable = () => {
    clearPinStorage();
    setLockEnabled(false);
    setView("main");
    setError("");
    toast.success("App Lock Disabled", {
      description: "PIN protection has been removed.",
    });
  };

  // ── Change PIN ──
  const handleOldPin = async (pin: string) => {
    const key = await loadKeyWithPin(pin);
    if (!key) {
      setError("Incorrect current PIN. Please try again.");
      return;
    }
    setOldPin(pin);
    setError("");
    setView("setNewPin");
  };

  const handleNewPinStart = (pin: string) => {
    setFirstPin(pin);
    setError("");
    setView("confirmNewPin");
  };

  const handleConfirmNewPin = async (pin: string) => {
    if (pin !== firstPin) {
      setError("PINs do not match. Try again.");
      setView("setNewPin");
      setFirstPin("");
      return;
    }

    const success = await changePinStorage(oldPin, pin);
    if (!success) {
      setError("Something went wrong. Please try again.");
      setView("changePin");
      return;
    }

    setView("main");
    setError("");
    setFirstPin("");
    toast.success("PIN Changed", {
      description: "Your PIN has been updated successfully.",
    });
  };

  // ── Render PIN setup views ───
  if (view === "setPin") {
    return (
      <PinSetView
        title="Set New PIN"
        description="Create a 6-digit PIN to secure your app"
        error={error}
        onSubmit={handleFirstPin}
        onBack={() => setView("main")}
      />
    );
  }

  if (view === "confirmPin") {
    return (
      <PinSetView
        title="Confirm PIN"
        description="Enter the same 6-digit PIN again to verify"
        error={error}
        onSubmit={handleConfirmPin}
        onBack={() => setView("setPin")}
      />
    );
  }

  if (view === "changePin") {
    return (
      <PinSetView
        title="Current PIN"
        description="Verify your identity by entering your current PIN"
        error={error}
        onSubmit={handleOldPin}
        onBack={() => setView("main")}
      />
    );
  }

  if (view === "setNewPin") {
    return (
      <PinSetView
        title="New PIN"
        description="Create a new 6-digit PIN"
        error={error}
        onSubmit={handleNewPinStart}
        onBack={() => setView("changePin")}
      />
    );
  }

  if (view === "confirmNewPin") {
    return (
      <PinSetView
        title="Confirm New PIN"
        description="Enter your new 6-digit PIN again to verify"
        error={error}
        onSubmit={handleConfirmNewPin}
        onBack={() => setView("setNewPin")}
      />
    );
  }

  // ── Main View ──
  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300 max-w-2xl">
      {/* App Lock Toggle Section */}
      <div className="flex items-center justify-between p-5 rounded-2xl bg-white/40 dark:bg-slate-800/20 border border-slate-200/60 dark:border-slate-700/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
            <Shield
              className="w-6 h-6 text-indigo-600 dark:text-indigo-400"
              strokeWidth={1.5}
            />
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white text-base">
              App Lock
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {isLockEnabled
                ? "PIN protection is currently active"
                : "Protect your workspace with a 6-digit PIN"}
            </p>
          </div>
        </div>

        {/* Smooth iOS-style Toggle */}
        <button
          onClick={isLockEnabled ? handleDisable : handleEnableStart}
          className={`relative w-14 h-8 rounded-full transition-colors duration-300 ease-in-out shrink-0 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
            isLockEnabled ? "bg-indigo-500" : "bg-slate-200 dark:bg-slate-700"
          }`}
        >
          <span
            className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out ${
              isLockEnabled ? "translate-x-6" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {isLockEnabled && (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-top-2 duration-500">
          {/* Segmented Control for Timeout */}
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 px-1">
              Require PIN after inactivity
            </p>
            <div className="flex items-center p-1.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
              {TIMEOUT_OPTIONS.map((opt) => {
                const isActive = timeoutMinutes === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setTimeoutMinutes(opt.value)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? "bg-indigo-50 dark:bg-indigo-500/20 shadow-sm text-indigo-600 dark:text-indigo-400"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Minimalist Change PIN Button */}
          <div>
            <button
              onClick={() => {
                setError("");
                setView("changePin");
              }}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 dark:text-indigo-400 border border-transparent dark:border-indigo-500/10"
            >
              Change Current PIN
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500 font-medium px-1 animate-in fade-in">
          {error}
        </p>
      )}
    </div>
  );
}

// ── Reusable Minimalist PIN entry view ───
function PinSetView({
  title,
  description,
  error,
  onSubmit,
  onBack,
}: {
  title: string;
  description: string;
  error: string;
  onSubmit: (pin: string) => void;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-8 animate-in fade-in zoom-in-95 duration-300 w-full max-w-sm mx-auto">
      <div className="flex flex-col items-center gap-2 text-center">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          {title}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>

      <div className="w-full flex justify-center">
        <PinInput
          key={title}
          onSubmit={onSubmit}
          error={error}
          disabled={false}
        />
      </div>

      <button
        onClick={onBack}
        className="flex items-center gap-1.5 px-4 py-2 mt-4 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
      >
        <ChevronLeft size={16} />
        Back to Settings
      </button>
    </div>
  );
}

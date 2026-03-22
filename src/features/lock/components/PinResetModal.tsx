// src/features/lock/components/PinResetModal.tsx
import { useState } from "react";
import { isValidMnemonic, wordsToMnemonic } from "@/lib/crypto/bip39";
import { deriveKeyPair } from "@/lib/crypto/keys";
import { clearPinStorage, saveKeyWithPin } from "@/lib/storage/pinStorage";
import { ramStore } from "@/lib/storage/ram";
import { useLockStore } from "@/store/lockStore";
import { useConvex } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import PinInput from "./PinInput";
import {
  X,
  ShieldAlert,
  KeyRound,
  Eye,
  EyeOff,
  ChevronLeft,
} from "lucide-react";

type ResetStep = "words" | "setPin" | "confirmPin";

interface PinResetModalProps {
  onSuccess: () => void;
  onClose: () => void;
}

export default function PinResetModal({
  onSuccess,
  onClose,
}: PinResetModalProps) {
  const [step, setStep] = useState<ResetStep>("words");
  const [words, setWords] = useState<string[]>(Array(12).fill(""));
  const [showWords, setShowWords] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // New PIN state
  const [recoveredKey, setRecoveredKey] = useState("");
  const [newPin, setNewPin] = useState("");

  const { setLockEnabled, setLocked } = useLockStore();
  const convex = useConvex();

  const updateWord = (index: number, value: string) => {
    const updated = [...words];
    updated[index] = value.trim().toLowerCase();
    setWords(updated);
    setError("");
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text");
    const pasted = text.trim().toLowerCase().split(/\s+/);

    if (pasted.length === 12) {
      e.preventDefault();
      setWords(pasted);
    }
  };

  // ── Step 1: Verify Words ──
  const handleVerifyWords = async () => {
    const mnemonic = wordsToMnemonic(words);

    if (!isValidMnemonic(mnemonic)) {
      setError("Invalid recovery words. Please check and try again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { privateKeyB64, publicKeyB64 } = await deriveKeyPair(mnemonic);

      // Direct Database Query (Instant & Reliable)
      const userResult = await convex.query(api.auth.getUserByPublicKey, {
        publicKey: publicKeyB64,
      });

      if (!userResult) {
        setError("Account not found. These words don't match your account.");
        setLoading(false);
        return;
      }

      // Match confirmed — Move to Set PIN screen
      setRecoveredKey(privateKeyB64);
      setStep("setPin");
      setLoading(false);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  // ── Step 2 & 3: Set and Confirm PIN ──
  const handleSetPin = (pin: string) => {
    setNewPin(pin);
    setError("");
    setStep("confirmPin");
  };

  const handleConfirmPin = async (pin: string) => {
    if (pin !== newPin) {
      setError("PINs do not match. Try again.");
      setStep("setPin");
      setNewPin("");
      return;
    }

    // Finalize: Save new PIN and unlock
    clearPinStorage();
    await saveKeyWithPin(recoveredKey, pin);
    ramStore.setKey(recoveredKey);

    setLockEnabled(true);
    setLocked(false);
    onSuccess();
  };

  const allFilled = words.every((w) => w.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 dark:bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
      {/* Main Modal Card */}
      <div className="relative w-full max-w-130 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[2rem] border border-white/50 dark:border-slate-700/50 shadow-2xl p-6 sm:p-8 flex flex-col gap-8 animate-in zoom-in-95 slide-in-from-bottom-4 duration-500 overflow-hidden min-h-100">
        {/* Subtle Top Inner Glow */}
        <div className="absolute top-0 left-0 w-full h-32 bg-linear-to-b from-amber-500/5 dark:from-sky-500/5 to-transparent pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:scale-105 transition-all z-20"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ── View: 12 Words Entry ── */}
        {step === "words" && (
          <div className="flex flex-col gap-8 relative z-10 animate-in fade-in slide-in-from-left-4">
            {/* Header Section */}
            <div className="flex flex-col items-center gap-4 text-center mt-2">
              <div className="relative flex items-center justify-center w-16 h-16">
                <div className="absolute inset-0 bg-amber-100 dark:bg-slate-800 rounded-2xl rotate-3 scale-105 transition-transform" />
                <div className="absolute inset-0 bg-amber-50 dark:bg-slate-800/80 rounded-2xl -rotate-3 transition-transform" />
                <div className="relative w-full h-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl flex items-center justify-center shadow-sm">
                  <ShieldAlert className="w-7 h-7 text-amber-500 dark:text-amber-400" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Account Recovery
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-75 mx-auto">
                  Enter your 12-word recovery phrase to securely reset your PIN.
                </p>
              </div>
            </div>

            {/* 12-Word Grid Area */}
            <div className="flex flex-col gap-4">
              <div
                className="grid grid-cols-2 sm:grid-cols-3 gap-2.5"
                onPaste={handlePaste}
              >
                {words.map((word, i) => (
                  <div key={i} className="relative flex items-center group">
                    <span className="absolute left-3 text-[11px] font-bold text-slate-400 group-focus-within:text-indigo-500 dark:group-focus-within:text-sky-400 select-none transition-colors z-10">
                      {i + 1}
                    </span>
                    <input
                      type={showWords ? "text" : "password"}
                      value={word}
                      onChange={(e) => updateWord(i, e.target.value)}
                      disabled={loading}
                      className="w-full pl-8 pr-8 py-2.5 text-sm font-medium rounded-xl bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-400/50 dark:focus:border-sky-500/50 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-sky-500/10 transition-all disabled:opacity-50"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck={false}
                    />
                    {/* Toggle Eye Icon in the first box */}
                    {i === 0 && (
                      <button
                        type="button"
                        onClick={() => setShowWords(!showWords)}
                        className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors z-10"
                      >
                        {showWords ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Error Message */}
              <div className="h-5 flex items-center justify-center">
                {error && (
                  <p className="text-sm text-red-500 font-medium animate-in fade-in slide-in-from-top-1">
                    {error}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyWords}
                disabled={!allFilled || loading}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 dark:border-slate-900/30 border-t-white dark:border-t-slate-900 rounded-full animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    Verify Words
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── View: Set & Confirm PIN ── */}
        {step !== "words" && (
          <div className="flex-1 flex flex-col items-center justify-center w-full relative z-10 animate-in fade-in slide-in-from-right-4">
            <div className="flex flex-col items-center gap-8 w-full my-auto">
              <div className="flex flex-col items-center gap-2 text-center">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {step === "setPin" ? "Set New PIN" : "Confirm New PIN"}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-70">
                  {step === "setPin"
                    ? "Create a new 6-digit PIN to secure your vault."
                    : "Enter the same 6-digit PIN again to verify."}
                </p>
              </div>

              <div className="w-full flex justify-center">
                <PinInput
                  key={step}
                  onSubmit={step === "setPin" ? handleSetPin : handleConfirmPin}
                  error={error}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Back to set pin button  */}
            {step === "confirmPin" && (
              <div className="absolute bottom-0 left-0 w-full flex justify-center pb-2">
                <button
                  onClick={() => {
                    setStep("setPin");
                    setError("");
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back to Set PIN
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

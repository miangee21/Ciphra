// src/features/auth/components/MnemonicRevealStep.tsx
import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { generateMnemonic12 } from "@/lib/crypto/bip39";
import { deriveKeyPair } from "@/lib/crypto/keys";
import { ramStore } from "@/lib/storage/ram";
import { useSessionStore } from "@/store/sessionStore";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  Copy,
  Download,
  Check,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";

interface MnemonicRevealStepProps {
  username: string;
  onBack: () => void;
}

export default function MnemonicRevealStep({
  username,
  onBack,
}: MnemonicRevealStepProps) {
  const [mnemonic, setMnemonic] = useState<string[]>([]);
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [warningChecked, setWarningChecked] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const createUser = useMutation(api.auth.createUser);
  const { setSession } = useSessionStore();
  const navigate = useNavigate();

  // Generate 12 words on mount
  useEffect(() => {
    const words = generateMnemonic12().split(" ");
    setMnemonic(words);
  }, []);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(mnemonic.join(" "));
    setHasCopied(true);
  };

  const handleDownload = () => {
    const content = `CIPHRA RECOVERY PHRASE\n\nKeep this file safe.\nNever share it.\nLosing these words means permanent loss of your account.\n\n${mnemonic.join("\n")}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ciphra-key.txt";
    a.click();
    URL.revokeObjectURL(url);
    setHasDownloaded(true);
  };

  const handleCompleteSignup = async () => {
    if (!warningChecked || !hasDownloaded || !hasCopied) return;
    setLoading(true);
    setError("");

    try {
      const mnemonicStr = mnemonic.join(" ");
      const { privateKeyB64, publicKeyB64 } = await deriveKeyPair(mnemonicStr);

      const userId = await createUser({
        username,
        publicKey: publicKeyB64,
      });

      ramStore.setKey(privateKeyB64);
      setSession(userId, username, publicKeyB64);

      toast.success("Account Created!", {
        description: `Welcome to Ciphra, @${username}. Your vault is ready.`,
      });

      navigate("/home");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Something went wrong";
      setError(errorMessage);

      toast.error("Signup Failed", {
        description: errorMessage,
      });

      setLoading(false);
    }
  };

  const canContinue = hasCopied && hasDownloaded && warningChecked;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-[#09090b]">
      {/* Premium Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-125 h-125 bg-indigo-500/10 dark:bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-100 h-100 bg-purple-500/10 dark:bg-purple-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="z-10 w-full max-w-2xl flex flex-col gap-5 px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-center px-1">
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            Save Your Recovery Phrase
          </span>
        </div>

        {/* 12 Words Glassmorphism Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {mnemonic.map((word, index) => (
            <div
              key={index}
              className="relative flex items-center justify-center py-3.5 bg-white/60 dark:bg-[#121215]/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl backdrop-blur-xl shadow-sm transition-all"
            >
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400/50 dark:text-slate-500/50 text-[11px] font-mono select-none">
                {(index + 1).toString().padStart(2, "0")}
              </span>

              <span
                className={`font-mono font-semibold text-sm transition-all duration-300 ${
                  !showMnemonic
                    ? "blur-xs select-none text-slate-400 opacity-50"
                    : "text-slate-900 dark:text-white"
                } ${index === 0 ? "pl-4 pr-8" : "px-2"}`}
              >
                {word}
              </span>

              {/* Eye toggle only on first block */}
              {index === 0 && (
                <button
                  onClick={() => setShowMnemonic(!showMnemonic)}
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  title={showMnemonic ? "Hide words" : "Show words"}
                >
                  {showMnemonic ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-200/50 hover:bg-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm transition-colors backdrop-blur-md"
          >
            {hasCopied ? (
              <Check size={18} className="text-emerald-500" />
            ) : (
              <Copy size={18} />
            )}
            {hasCopied ? "Copied!" : "Copy Words"}
          </button>
          <button
            onClick={handleDownload}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-colors backdrop-blur-md ${
              hasDownloaded
                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                : "bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400"
            }`}
          >
            {hasDownloaded ? <Check size={18} /> : <Download size={18} />}
            {hasDownloaded ? "Downloaded" : "Download .txt"}
          </button>
        </div>

        {/* Warning & Confirmation Section */}
        <div className="flex flex-col gap-4 mt-2">
          <div className="flex items-start gap-3 p-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 backdrop-blur-md">
            <AlertTriangle
              size={20}
              className="text-red-500 dark:text-red-400 shrink-0 mt-0.5"
            />
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              <strong className="text-red-600 dark:text-red-400 font-bold">
                Critical Warning:
              </strong>{" "}
              This is your ONLY way to access your account. If you lose these
              words, your account is gone forever.
            </p>
          </div>

          <label className="flex items-center gap-3 cursor-pointer group w-fit">
            <input
              type="checkbox"
              className="hidden"
              checked={warningChecked}
              onChange={() => setWarningChecked(!warningChecked)}
            />
            <div
              className={`w-6 h-6 rounded-lg border-2 shrink-0 flex items-center justify-center transition-all ${
                warningChecked
                  ? "bg-indigo-600 border-indigo-600"
                  : "border-slate-300 dark:border-slate-600 group-hover:border-indigo-400"
              }`}
            >
              {warningChecked && (
                <Check size={14} className="text-white" strokeWidth={3} />
              )}
            </div>
            <span className="text-slate-700 dark:text-slate-300 text-sm font-medium select-none">
              I have safely saved my recovery words and understand the risks.
            </span>
          </label>
        </div>

        {error && (
          <p className="text-sm text-red-500 text-center font-medium">
            {error}
          </p>
        )}

        {/* Footer Navigation */}
        <div className="flex gap-4 pt-4 border-t border-slate-200 dark:border-slate-800/80">
          <button
            onClick={onBack}
            disabled={loading}
            className="px-5 py-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors flex items-center justify-center disabled:opacity-50"
          >
            <ArrowLeft size={20} />
          </button>
          <button
            onClick={handleCompleteSignup}
            disabled={!canContinue || loading}
            className="flex-1 py-4 rounded-2xl bg-indigo-600 text-white font-bold text-base disabled:opacity-40 disabled:cursor-not-allowed hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all flex justify-center items-center"
          >
            {loading ? (
              <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              "Complete Signup"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

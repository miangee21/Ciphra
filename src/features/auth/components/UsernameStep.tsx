// src/features/auth/components/UsernameStep.tsx
import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";

interface UsernameStepProps {
  onNext: (username: string) => void;
  initialUsername?: string;
}

export default function UsernameStep({
  onNext,
  initialUsername = "",
}: UsernameStepProps) {
  const [input, setInput] = useState(initialUsername);
  const [debounced, setDebounced] = useState(initialUsername);
  const [formatError, setFormatError] = useState<string | null>(null);

  // Real-time Validation & Debounce
  useEffect(() => {
    const val = input.toLowerCase().trim();

    if (val === "") {
      setFormatError(null);
      setDebounced("");
      return;
    }

    // Validation Rules
    if (val.length < 3) {
      setFormatError("Username must be at least 3 characters");
    } else if (val.length > 15) {
      setFormatError("Username cannot exceed 15 characters");
    } else if (!/^[a-z0-9]+$/.test(val)) {
      setFormatError("Only lowercase letters and numbers allowed");
    } else if (!/\d/.test(val)) {
      setFormatError("Username must contain at least 1 number (e.g. yaram45)");
    } else {
      setFormatError(null);
    }

    // Fast Debounce for instant Convex query (150ms)
    const t = setTimeout(() => {
      if (
        val.length >= 3 &&
        val.length <= 15 &&
        /^[a-z0-9]+$/.test(val) &&
        /\d/.test(val)
      ) {
        setDebounced(val);
      } else {
        setDebounced("");
      }
    }, 150);

    return () => clearTimeout(t);
  }, [input]);

  const result = useQuery(
    api.auth.checkUsername,
    debounced.length >= 3 ? { username: debounced } : "skip",
  );

  const isChecking = debounced.length >= 3 && result === undefined;
  const isAvailable = result?.available === true;
  const isTaken = result?.available === false;

  const canContinue = isAvailable && !formatError && debounced.length >= 3;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-[#09090b]">
      {/* Premium Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-125 h-125 bg-indigo-500/10 dark:bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-100 h-100 bg-purple-500/10 dark:bg-purple-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="z-10 w-full max-w-md flex flex-col items-center px-6">
        <div className="w-full relative">
          <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-3 ml-2 tracking-wide uppercase">
            Enter Username
          </label>

          <div className="relative flex items-center p-2 bg-white/60 dark:bg-[#121215]/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl backdrop-blur-xl shadow-sm transition-all focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-500 dark:focus-within:border-indigo-500">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value.toLowerCase())}
              placeholder="e.g. yaram45"
              maxLength={15}
              autoFocus
              onKeyDown={(e) =>
                e.key === "Enter" && canContinue && onNext(debounced)
              }
              className="flex-1 w-full min-w-0 bg-transparent py-2 pl-4 pr-2 outline-none text-slate-900 dark:text-white text-xl placeholder:text-slate-400/60 font-medium"
            />

            <div className="shrink-0 flex items-center gap-3">
              <div className="shrink-0 flex items-center justify-center w-6">
                {isChecking && (
                  <div className="w-5 h-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                )}
                {!isChecking && formatError && input.length > 0 && (
                  <XCircle size={22} className="text-red-500" />
                )}
                {!isChecking && !formatError && isAvailable && (
                  <CheckCircle2 size={22} className="text-emerald-500" />
                )}
                {!isChecking && !formatError && isTaken && (
                  <XCircle size={22} className="text-red-500" />
                )}
              </div>

              <button
                onClick={() => onNext(debounced)}
                disabled={!canContinue}
                className="shrink-0 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white disabled:text-slate-400 dark:disabled:text-slate-500 rounded-xl px-6 py-3 font-semibold transition-all duration-300 disabled:cursor-not-allowed"
              >
                <span className="mr-2">Next</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          <div className="absolute -bottom-7 left-2 h-5">
            {formatError && (
              <p className="text-red-500 text-sm font-medium">{formatError}</p>
            )}
            {!formatError && isTaken && (
              <p className="text-red-500 text-sm font-medium">
                Username already taken
              </p>
            )}
            {!formatError && isAvailable && (
              <p className="text-emerald-500 text-sm font-medium">
                Username is available!
              </p>
            )}
          </div>
        </div>

        {/* Login Link */}
        <div className="mt-12">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            Already have an account?{" "}
            <button
              onClick={() => (window.location.href = "/login")}
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
            >
              Log in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

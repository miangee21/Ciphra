// src/features/auth/LoginPage.tsx
import { useNavigate } from "react-router-dom";
import { ArrowRight, ShieldAlert } from "lucide-react";
import { useLogin } from "./hooks/useLogin";
import MnemonicInputGrid from "./components/MnemonicInputGrid";

export default function LoginPage() {
  const navigate = useNavigate();
  const {
    words,
    error,
    loading,
    updateWord,
    handlePaste,
    handleLogin,
    getLockoutInfo,
  } = useLogin();

  const { isLockedOut, remainingMinutes } = getLockoutInfo();
  const allFilled = words.every((w) => w.length > 0);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-[#09090b]">
      {/* Premium Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-125 h-125 bg-indigo-500/10 dark:bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-100 h-100 bg-purple-500/10 dark:bg-purple-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="z-10 w-full max-w-2xl flex flex-col items-center gap-8 px-6 py-10">
        {/* Header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            🔐 Welcome Back
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Enter your 12 recovery words to access your vault
          </p>
        </div>

        {/* Lockout Warning (Shows only if too many failed attempts) */}
        {isLockedOut && (
          <div className="w-full max-w-md rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 px-4 py-3 flex items-center gap-3 backdrop-blur-md">
            <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-400">
              Account locked due to failed attempts. Try again in{" "}
              <strong>{remainingMinutes} mins</strong>.
            </p>
          </div>
        )}

        {/* Mnemonic Grid Component */}
        <MnemonicInputGrid
          words={words}
          updateWord={updateWord}
          handlePaste={handlePaste}
          onSubmit={() => handleLogin(navigate)}
          disabled={isLockedOut || loading}
        />

        {/* Error Message */}
        {error && !isLockedOut && (
          <p className="text-sm text-red-500 text-center font-medium h-4">
            {error}
          </p>
        )}

        {/* Login Button */}
        <button
          onClick={() => handleLogin(navigate)}
          disabled={!allFilled || loading || isLockedOut}
          className="w-full max-w-md flex items-center justify-center gap-2 py-4 rounded-2xl bg-indigo-600 text-white font-bold text-base disabled:opacity-40 disabled:cursor-not-allowed hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all group"
        >
          {loading ? (
            <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : (
            <>
              Sign In
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        {/* Signup Link */}
        <div className="mt-2 text-center">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            Don't have an account?{" "}
            <button
              onClick={() => (window.location.href = "/signup")}
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
            >
              Create one
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

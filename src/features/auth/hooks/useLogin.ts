//src/features/auth/hooks/useLogin.ts
import { useState } from "react";
import { useConvex } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { deriveKeyPair } from "@/lib/crypto/keys";
import { ramStore } from "@/lib/storage/ram";
import { useSessionStore } from "@/store/sessionStore";
import { isValidMnemonic, wordsToMnemonic } from "@/lib/crypto/bip39";
import { toast } from "sonner";

const LOCKOUT_KEY = "ciphra_login_lockout";
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes

export function useLogin() {
  const [words, setWords] = useState<string[]>(Array(12).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setSession } = useSessionStore();
  const convex = useConvex();

  // Check lockout
  const getLockoutInfo = () => {
    const stored = localStorage.getItem(LOCKOUT_KEY);
    if (!stored)
      return { isLockedOut: false, remainingMinutes: 0, attempts: 0 };
    const { attempts, lockedAt } = JSON.parse(stored);
    if (attempts >= MAX_ATTEMPTS) {
      const elapsed = Date.now() - lockedAt;
      if (elapsed < LOCKOUT_DURATION) {
        const remaining = Math.ceil((LOCKOUT_DURATION - elapsed) / 60000);
        return { isLockedOut: true, remainingMinutes: remaining, attempts };
      } else {
        localStorage.removeItem(LOCKOUT_KEY);
        return { isLockedOut: false, remainingMinutes: 0, attempts: 0 };
      }
    }
    return { isLockedOut: false, remainingMinutes: 0, attempts };
  };

  const recordFailedAttempt = () => {
    const stored = localStorage.getItem(LOCKOUT_KEY);
    const current = stored ? JSON.parse(stored) : { attempts: 0 };
    const attempts = current.attempts + 1;
    localStorage.setItem(
      LOCKOUT_KEY,
      JSON.stringify({ attempts, lockedAt: Date.now() }),
    );
    return attempts;
  };

  const clearLockout = () => localStorage.removeItem(LOCKOUT_KEY);

  const updateWord = (index: number, value: string) => {
    setWords((prev) => {
      const updated = [...prev];
      updated[index] = value.trim().toLowerCase();
      return updated;
    });
    setError("");
  };

  const handlePaste = (text: string) => {
    const pasted = text.trim().toLowerCase().split(/\s+/);
    if (pasted.length === 12) {
      setWords(pasted);
    }
  };

  const handleLogin = async (navigate: (path: string) => void) => {
    const { isLockedOut, remainingMinutes } = getLockoutInfo();
    if (isLockedOut) {
      setError(`Too many attempts. Try again in ${remainingMinutes} minutes.`);
      return;
    }

    const mnemonic = wordsToMnemonic(words);
    if (!isValidMnemonic(mnemonic)) {
      recordFailedAttempt();
      const { attempts } = getLockoutInfo();
      const remaining = MAX_ATTEMPTS - attempts;
      const msg =
        remaining > 0
          ? `Invalid recovery words. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`
          : `Too many attempts. Locked for 30 minutes.`;

      setError(msg);

      // Professional Error Toast for Invalid Words
      toast.error("Invalid Phrase", {
        description: msg,
      });

      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { privateKeyB64, publicKeyB64 } = await deriveKeyPair(mnemonic);

      const userResult = await convex.query(api.auth.getUserByPublicKey, {
        publicKey: publicKeyB64,
      });

      if (!userResult) {
        recordFailedAttempt();
        const { attempts } = getLockoutInfo();
        const remaining = MAX_ATTEMPTS - attempts;
        const msg =
          remaining > 0
            ? `Account not found. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`
            : `Too many attempts. Locked for 30 minutes.`;
        setError(msg);
        toast.error("Login Failed", { description: msg });
        setLoading(false);
        return;
      }

      // Success
      clearLockout();
      ramStore.setKey(privateKeyB64);
      setSession(userResult._id, userResult.username, userResult.publicKey);

      toast.success("Welcome Back!", {
        description: `Successfully signed in as @${userResult.username}`,
      });

      navigate("/home");
    } catch (err) {
      setError("Invalid recovery phrase. Please check your words.");
      toast.error("Authentication Failed", {
        description:
          "The 12 words you entered are incorrect. Please check spelling and order.",
      });
      setLoading(false);
    }
  };

  return {
    words,
    error,
    loading,
    updateWord,
    handlePaste,
    handleLogin,
    getLockoutInfo,
  };
}

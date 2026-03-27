//src/router/AppRouter.tsx
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { getVersion } from "@tauri-apps/api/app";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { AlertTriangle, DownloadCloud } from "lucide-react";
import UpdateProgressToast from "@/components/common/UpdateProgressToast";
import { useSessionStore } from "@/store/sessionStore";
import { useLockStore } from "@/store/lockStore";
import { ramStore } from "@/lib/storage/ram";
import { hasPinStorage } from "@/lib/storage/pinStorage";
import SplashScreen from "@/features/splash/SplashScreen";
import LoginPage from "@/features/auth/LoginPage";
import SignupPage from "@/features/auth/SignupPage";
import HomePage from "@/features/home/HomePage";
import FolderPage from "@/features/folder/FolderPage";
import EditorPage from "@/features/editor/EditorPage";
import RecycleBinPage from "@/features/recycle/RecycleBinPage";
import SettingsPage from "@/features/settings/SettingsPage";
import LockScreen from "@/features/lock/LockScreen";
import { toast } from "sonner";

// Protects all private routes
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useSessionStore();
  const { isLocked } = useLockStore();

  // 1. Not logged in at all (no active session)
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // 2. Session exists, but private key is missing from RAM (App refreshed or closed)
  if (!ramStore.hasKey()) {
    if (hasPinStorage()) {
      return <LockScreen />; // Force Lock Screen to decrypt key with PIN
    } else {
      return <Navigate to="/login" replace />; // No PIN setup, must login via 12-words
    }
  }

  // 3. Key is in RAM, but user locked the app manually or due to inactivity
  if (isLocked) {
    return <LockScreen />;
  }

  // 4. Fully unlocked and session active
  return <>{children}</>;
}

export default function AppRouter() {
  const minRequiredVersion = useQuery(api.auth.getMinRequiredVersion);
  const [isOutdated, setIsOutdated] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    async function checkVersion() {
      if (!minRequiredVersion) return;
      try {
        if (typeof window !== "undefined" && "__TAURI_INTERNALS__" in window) {
          const currentVersion = await getVersion();
          const cParts = currentVersion.split(".").map(Number);
          const rParts = minRequiredVersion.split(".").map(Number);
          let outdated = false;

          for (let i = 0; i < 3; i++) {
            if (cParts[i] < rParts[i]) {
              outdated = true;
              break;
            }
            if (cParts[i] > rParts[i]) {
              break;
            }
          }

          setIsOutdated(outdated);
        }
      } catch (err) {
        console.error("Failed to check local version:", err);
      }
    }
    checkVersion();
  }, [minRequiredVersion]);

  async function handleForceUpdate() {
    if (isUpdating) return;
    setIsUpdating(true);
    const toastId = toast.loading("Connecting to update server...");

    try {
      const update = await check();
      if (update) {
        let downloaded = 0;
        let contentLength = 0;

        await update.downloadAndInstall((event) => {
          if (event.event === "Started") {
            contentLength = event.data.contentLength || 0;
            toast(
              <UpdateProgressToast progress={0} version={update.version} />,
              { id: toastId, duration: Infinity },
            );
          } else if (event.event === "Progress") {
            downloaded += event.data.chunkLength;
            if (contentLength > 0) {
              const percent = Math.round((downloaded / contentLength) * 100);
              toast(
                <UpdateProgressToast
                  progress={percent}
                  version={update.version}
                />,
                { id: toastId, duration: Infinity },
              );
            }
          } else if (event.event === "Finished") {
            toast.loading("Extracting and installing...", { id: toastId });
          }
        });

        toast.success("Update installed! Restarting...", {
          id: toastId,
          duration: 4000,
        });
        setTimeout(relaunch, 1500);
      } else {
        toast.error("Update not found on server yet.", { id: toastId });
        setIsUpdating(false);
      }
    } catch (err) {
      console.error("Update pending on server:", err);
      toast.error(
        "Update is still rolling out to the server. Please try again in a few minutes.",
        { id: toastId, duration: 5000 },
      );
      setIsUpdating(false);
    }
  }

  if (isOutdated) {
    return (
      <div className="fixed inset-0 z-9999 flex items-center justify-center bg-slate-50/80 dark:bg-[#09090b]/80 overflow-hidden backdrop-blur-3xl">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-red-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center max-w-sm p-8 text-center bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-2xl mx-4 rounded-3xl animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-center justify-center mb-6 shadow-sm">
            <AlertTriangle
              className="text-red-500"
              size={32}
              strokeWidth={2.5}
            />
          </div>

          <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
            Update Required
          </h1>

          <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 mb-8 leading-relaxed px-2">
            You are currently using an older version of App.
            <br /> A critical security update is required to continue accessing
            your vault.
          </p>

          <button
            onClick={handleForceUpdate}
            disabled={isUpdating}
            className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[14px] flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
          >
            {isUpdating ? (
              <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <>
                <DownloadCloud size={18} strokeWidth={2.5} />
                Update Now
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route
          path="/home"
          element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/folder/:id"
          element={
            <PrivateRoute>
              <FolderPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/doc/:id"
          element={
            <PrivateRoute>
              <EditorPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/recycle"
          element={
            <PrivateRoute>
              <RecycleBinPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <SettingsPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

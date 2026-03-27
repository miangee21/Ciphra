// src/features/settings/components/AboutSettings.tsx
import { useState, useEffect } from "react";
import { RefreshCw, Github, Heart, MessageCircle } from "lucide-react";
import UpdateProgressToast from "@/components/common/UpdateProgressToast";
import { getVersion } from "@tauri-apps/api/app";
import { openUrl } from "@tauri-apps/plugin-opener";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { toast } from "sonner";

export default function AboutSettings() {
  const [checking, setChecking] = useState(false);
  const [appVersion, setAppVersion] = useState<string>("...");

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        if (typeof window !== "undefined" && "__TAURI_INTERNALS__" in window) {
          const version = await getVersion();
          setAppVersion(`v${version}`);
        } else {
          setAppVersion("Web View");
        }
      } catch (error) {
        console.error("Failed to fetch version:", error);
        setAppVersion("v0.1.0 (Dev)");
      }
    };
    fetchVersion();
  }, []);

  const handleOpenLink = async (url: string) => {
    try {
      if (typeof window !== "undefined" && "__TAURI_INTERNALS__" in window) {
        await openUrl(url);
      } else {
        window.open(url, "_blank");
      }
    } catch (error) {
      console.error("Failed to open link:", error);
    }
  };

  const handleCheckUpdate = async () => {
    if (checking) return;
    setChecking(true);
    const toastId = toast.loading("Checking for updates...");

    try {
      if (typeof window === "undefined" || !("__TAURI_INTERNALS__" in window)) {
        toast.error("Updates are only supported in the desktop app.", {
          id: toastId,
        });
        setChecking(false);
        return;
      }

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

        toast.success("Update installed! Restarting app...", {
          id: toastId,
          duration: 4000,
        });
        setTimeout(relaunch, 1500);
      } else {
        toast.success("You are up to date!", {
          id: toastId,
          description: `Ciphra ${appVersion} is the latest version available.`,
          duration: 4000,
        });
        setChecking(false);
      }
    } catch (error) {
      console.error("Update check failed (Likely no update available):", error);
      toast.success("You are up to date!", {
        id: toastId,
        description: `Ciphra ${appVersion} is the latest version available.`,
        duration: 4000,
      });
      setChecking(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 animate-in fade-in zoom-in-95 duration-500">
      {/* Premium Logo Wrapper */}
      <div className="relative group cursor-default">
        {/* Animated Glow */}
        <div className="absolute -inset-4 bg-linear-to-r from-indigo-500 to-purple-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-700 animate-pulse" />

        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-linear-to-br from-indigo-500 to-purple-600 p-0.5 shadow-2xl shadow-indigo-500/20 transform transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-3">
          <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[calc(1.5rem-2px)] overflow-hidden flex items-center justify-center backdrop-blur-xl">
            <img
              src="/icon.png"
              alt="Ciphra Logo"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* App Info */}
      <div className="mt-6 flex flex-col items-center gap-1.5">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white bg-clip-text">
          Ciphra
        </h1>
        <div className="flex items-center gap-2 mt-1">
          <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 tracking-widest uppercase shadow-sm">
            {appVersion}
          </span>
          <span className="text-[11px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg uppercase tracking-wider">
            Beta
          </span>
        </div>
      </div>

      <p className="mt-4 text-[13px] text-center text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
        Your ultimate secure vault for files and documents.
      </p>

      {/* Glowing Update Button */}
      <div className="mt-8 relative group">
        <div className="absolute -inset-1 bg-linear-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500" />
        <button
          onClick={handleCheckUpdate}
          disabled={checking}
          className="relative flex items-center justify-center gap-2 w-52 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm transition-all hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-80"
        >
          <RefreshCw
            className={`w-4 h-4 text-indigo-600 dark:text-indigo-400 ${checking ? "animate-spin" : ""}`}
          />
          <span className="text-[13px] font-bold text-slate-900 dark:text-white">
            {checking ? "Checking..." : "Check for Updates"}
          </span>
        </button>
      </div>

      <div className="w-12 h-px bg-slate-200 dark:bg-slate-800 my-3" />

      {/* Credits & Links */}
      <div className="flex flex-col items-center gap-4">
        <p className="flex items-center gap-1.5 text-[12px] font-medium text-slate-500 dark:text-slate-400">
          Made with{" "}
          <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse" />{" "}
          by
          <span className="font-bold text-slate-900 dark:text-white">
            Hassan
          </span>
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              handleOpenLink("https://github.com/miangee21/Ciphra")
            }
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 text-[12px] font-semibold text-slate-600 dark:text-slate-300 transition-colors border border-transparent dark:border-slate-700/50"
          >
            <Github className="w-4 h-4" />
            GitHub
          </button>
          <button
            onClick={() => handleOpenLink("https://discord.gg/fcqMjR7K4C")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5865F2]/10 hover:bg-[#5865F2]/20 text-[12px] font-semibold text-[#5865F2] transition-colors border border-transparent dark:border-[#5865F2]/20"
          >
            <MessageCircle className="w-4 h-4" />
            Discord
          </button>
        </div>
      </div>
    </div>
  );
}

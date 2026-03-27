//src/features/settings/components/StorageSettings.tsx
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useSessionStore } from "@/store/sessionStore";
import { HardDrive, Cloud, FileText, Database } from "lucide-react";

// Helper function to convert Bytes into KB, MB, GB
function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export default function StorageSettings() {
  const userId = useSessionStore((state) => state.userId);

  const usageData = useQuery(
    api.files.getStorageUsage,
    userId ? { userId: userId as any } : "skip",
  );

  const isLoading = usageData === undefined;

  // Default values
  const totalBytes = usageData?.totalBytes || 0;
  const fileCount = usageData?.fileCount || 0;

  // 100MB is the free tier limit for the progress bar calculation
  const MAX_BYTES = 100 * 1024 * 1024;
  const usagePercentage = Math.min((totalBytes / MAX_BYTES) * 100, 100);

  return (
    <div className="max-w-2xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full">
      {/* --- Header Section --- */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <HardDrive className="text-indigo-500" size={22} strokeWidth={2.5} />
          Storage Usage
        </h2>
        <p className="text-[14px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
          Monitor your encrypted cloud storage. All files are securely stored in
          your personal vault.
        </p>
      </div>

      {/* --- Progress Bar Section --- */}
      <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        {/* Decorative background icon */}
        <Cloud
          className="absolute -bottom-6 -right-6 text-slate-50 dark:text-slate-800/50 w-32 h-32 rotate-12"
          strokeWidth={1}
        />

        <div className="relative z-10">
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Used Space
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  {isLoading ? "..." : formatBytes(totalBytes)}
                </span>
                <span className="text-sm font-medium text-slate-500">
                  / 100 MB
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-indigo-600 dark:text-indigo-400 font-bold text-lg">
                {isLoading ? "0" : usagePercentage.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* The Bar */}
          <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-indigo-500 transition-all duration-1000 ease-out relative"
              style={{ width: `${usagePercentage}%` }}
            >
              {/* Shimmer effect inside the bar */}
              <div className="absolute top-0 left-0 w-full h-full bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            </div>
          </div>
        </div>
      </div>

      {/* --- Stats Cards --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* File Count Card */}
        <div className="flex items-center gap-4 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <FileText size={20} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Files
            </p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {isLoading ? "-" : fileCount}
            </p>
          </div>
        </div>

        {/* Database Status Card */}
        <div className="flex items-center gap-4 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Database size={20} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Server Status
            </p>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Connected
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

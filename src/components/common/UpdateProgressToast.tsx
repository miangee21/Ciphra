// src/components/common/UpdateProgressToast.tsx
import { DownloadCloud } from "lucide-react";

interface Props {
  progress: number;
  version?: string;
}

export default function UpdateProgressToast({
  progress,
  version = "...",
}: Props) {
  return (
    <div className="flex flex-col gap-2.5 w-full py-1">
      <div className="flex items-center gap-2">
        <DownloadCloud
          size={18}
          className="text-indigo-500 dark:text-indigo-400 animate-pulse"
        />
        <span className="font-semibold text-slate-900 dark:text-white text-[14px]">
          Downloading Update v{version}
        </span>
        <span className="ml-auto text-[13px] font-bold text-indigo-600 dark:text-indigo-400">
          {progress}%
        </span>
      </div>
      <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner border border-slate-300/50 dark:border-slate-700/50">
        <div
          className="h-full bg-indigo-500 transition-all duration-300 ease-out rounded-full relative overflow-hidden"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite] -skew-x-12 -translate-x-full" />
        </div>
      </div>
    </div>
  );
}

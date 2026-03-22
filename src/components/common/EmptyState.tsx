// src/components/common/EmptyState.tsx
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  action?: React.ReactNode;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 text-center w-full h-full translate-y-18 animate-in fade-in duration-700 group">
      {/* Premium Icon Container with 3D floating effect */}
      <div className="relative flex items-center justify-center w-20 h-20 mb-2">
        {/* Animated Glow Behind */}
        <div className="absolute inset-0 bg-indigo-500/20 dark:bg-sky-500/10 blur-2xl rounded-full group-hover:bg-indigo-500/30 dark:group-hover:bg-sky-500/20 transition-all duration-500" />

        {/* Rotated Back Layers (Added border and shadow for Light Mode contrast) */}
        <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/50 rotate-6 scale-105 rounded-[1.2rem] group-hover:rotate-12 group-hover:scale-110 shadow-sm transition-all duration-500 ease-out" />
        <div className="absolute inset-0 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/30 -rotate-6 rounded-[1.2rem] group-hover:-rotate-12 group-hover:scale-110 shadow-sm transition-all duration-500 ease-out" />

        {/* Main Front Layer */}
        <div className="relative w-full h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 rounded-[1.2rem] flex items-center justify-center shadow-md group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-500 ease-out">
          <Icon
            className="w-8 h-8 text-indigo-500 dark:text-sky-400 transition-transform duration-500 group-hover:scale-110"
            strokeWidth={1.5}
          />
        </div>
      </div>

      {/* Typography */}
      <div className="flex flex-col gap-2 relative z-10">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          {title}
        </h3>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 max-w-70 mx-auto leading-relaxed">
          {description}
        </p>
      </div>

      {/* Action Button Wrapper */}
      {(actionLabel || action) && (
        <div className="mt-0 animate-in slide-in-from-bottom-2 fade-in duration-500 delay-150 fill-mode-both relative z-10">
          {actionLabel ? (
            <button
              onClick={onAction}
              className="relative overflow-hidden group/btn px-7 py-2.5 rounded-xl font-semibold text-sm bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg shadow-slate-900/20 dark:shadow-white/20 hover:shadow-indigo-500/30 dark:hover:shadow-sky-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
            >
              {/* Shine Animation Effect on Hover */}
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 dark:via-slate-900/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
              <span className="relative z-10 tracking-wide">{actionLabel}</span>
            </button>
          ) : (
            action
          )}
        </div>
      )}
    </div>
  );
}

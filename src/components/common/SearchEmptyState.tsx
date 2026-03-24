// src/components/common/SearchEmptyState.tsx
import { SearchX } from "lucide-react";

interface SearchEmptyStateProps {
  searchQuery: string;
  onClear: () => void;
}

export default function SearchEmptyState({
  searchQuery,
  onClear,
}: SearchEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 text-center w-full h-full py-16 animate-in fade-in duration-700 group">
      {/* Premium Icon Container with 3D floating effect */}
      <div className="relative flex items-center justify-center w-20 h-20 mb-2">
        <div className="absolute inset-0 bg-indigo-500/20 dark:bg-sky-500/10 blur-2xl rounded-full group-hover:bg-indigo-500/30 dark:group-hover:bg-sky-500/20 transition-all duration-500" />

        <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/50 rotate-6 scale-105 rounded-[1.2rem] group-hover:rotate-12 group-hover:scale-110 shadow-sm transition-all duration-500 ease-out" />
        <div className="absolute inset-0 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/30 -rotate-6 rounded-[1.2rem] group-hover:-rotate-12 group-hover:scale-110 shadow-sm transition-all duration-500 ease-out" />

        <div className="relative w-full h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 rounded-[1.2rem] flex items-center justify-center shadow-md group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-500 ease-out">
          <SearchX
            className="w-8 h-8 text-indigo-500 dark:text-sky-400 transition-transform duration-500 group-hover:scale-110"
            strokeWidth={1.5}
          />
        </div>
      </div>

      {/* Typography */}
      <div className="flex flex-col gap-2 relative z-10">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          No results found
        </h3>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 max-w-70 mx-auto leading-relaxed">
          We couldn't find anything matching "
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {searchQuery}
          </span>
          ". Try adjusting your search.
        </p>
      </div>

      {/* Clear Button */}
      <div className="mt-2 animate-in slide-in-from-bottom-2 fade-in duration-500 delay-150 relative z-10">
        <button
          onClick={onClear}
          className="px-6 py-2.5 rounded-xl font-semibold text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors shadow-sm"
        >
          Clear Search
        </button>
      </div>
    </div>
  );
}

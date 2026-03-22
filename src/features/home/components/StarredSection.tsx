// src/features/home/components/StarredSection.tsx
import { useState } from "react";
import { ChevronDown, Star } from "lucide-react";
import FolderGrid from "./FolderGrid";
import type { DecryptedFolder, ViewMode } from "../HomePage";
import type { Id } from "../../../../convex/_generated/dataModel";

interface StarredSectionProps {
  folders: DecryptedFolder[];
  viewMode: ViewMode;
  onFolderClick: (id: Id<"folders">) => void;
}

export default function StarredSection({
  folders,
  viewMode,
  onFolderClick,
}: StarredSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (folders.length === 0) return null;

  return (
    <div className="flex flex-col mb-2 animate-in fade-in duration-500">
      {/* ── Minimalist Header ── */}
      <div
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center py-2 cursor-pointer group select-none w-fit"
      >
        {/* Title, Badge & Arrow Together */}
        <div className="flex items-center gap-2.5">
          <Star className="w-5 h-5 fill-amber-400 text-amber-400 drop-shadow-sm transition-transform duration-300 group-hover:scale-110" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Starred
          </h2>
          <div className="flex items-center gap-1.5 ml-1">
            <span className="flex items-center justify-center px-2 py-0.5 text-[11px] font-bold bg-slate-200/60 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 rounded-full transition-colors group-hover:bg-slate-300/60 dark:group-hover:bg-slate-700/60">
              {folders.length}
            </span>
            <button className="p-1 rounded-lg text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-300 ease-out ${
                  isCollapsed ? "-rotate-90" : "rotate-0"
                }`}
                strokeWidth={2.5}
              />
            </button>
          </div>
        </div>
      </div>

      {/* ── Content Area ── */}
      {!isCollapsed && (
        <div className="pt-2 pb-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <FolderGrid
            folders={folders}
            viewMode={viewMode}
            onFolderClick={onFolderClick}
            defaultLimit={5}
            storageKey="ciphra_starred_grid_limit"
          />
        </div>
      )}
    </div>
  );
}

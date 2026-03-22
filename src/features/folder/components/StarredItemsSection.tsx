// src/features/folder/components/StarredItemsSection.tsx
import { useState } from "react";
import { ChevronDown, Star } from "lucide-react";
import type { DecryptedFile, DecryptedDocument, ViewMode } from "../FolderPage";
import type { Id } from "../../../../convex/_generated/dataModel";
import FileGrid from "./FileGrid";

interface StarredItemsSectionProps {
  files: DecryptedFile[];
  documents: DecryptedDocument[];
  viewMode: ViewMode;
  folderId: Id<"folders">;
  onDocClick: (id: Id<"documents">) => void;
}

export default function StarredItemsSection({
  files,
  documents,
  viewMode,
  folderId,
  onDocClick,
}: StarredItemsSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const totalItems = files.length + documents.length;

  if (totalItems === 0) return null;

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
              {totalItems}
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
          <FileGrid
            files={files}
            documents={documents}
            viewMode={viewMode}
            folderId={folderId}
            onDocClick={onDocClick}
            isStarredSection={true}
          />
        </div>
      )}
    </div>
  );
}

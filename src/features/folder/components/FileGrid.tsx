// src/features/folder/components/FileGrid.tsx
import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import type { DecryptedFile, DecryptedDocument, ViewMode } from "../FolderPage";
import type { Id } from "../../../../convex/_generated/dataModel";
import FileCard from "./FileCard";
import FileListItem from "./FileListItem";

interface FileGridProps {
  files: DecryptedFile[];
  documents: DecryptedDocument[];
  viewMode: ViewMode;
  folderId: Id<"folders">;
  onDocClick: (id: Id<"documents">) => void;
  isStarredSection?: boolean;
}

export default function FileGrid({
  files,
  documents,
  viewMode,
  folderId,
  onDocClick,
  isStarredSection = false,
}: FileGridProps) {
  const defaultLimit = isStarredSection ? 5 : 10;
  const storageKey = isStarredSection
    ? "ciphra_starred_file_limit"
    : "ciphra_file_grid_limit";

  // Pagination & Dropdown State
  const [currentPage, setCurrentPage] = useState(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load from Memory or default
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? Number(saved) : defaultLimit;
  });

  // Save to Memory whenever user changes the limit
  useEffect(() => {
    localStorage.setItem(storageKey, itemsPerPage.toString());
    setCurrentPage(1);
  }, [itemsPerPage, storageKey]);

  // Close custom dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen)
      document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  // ── Combine Documents and Files for Unified Pagination ──
  const allItems = [
    ...documents.map((doc) => ({ data: doc, type: "document" as const })),
    ...files.map((file) => ({ data: file, type: "file" as const })),
  ];

  const totalPages = Math.ceil(allItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleItems = allItems.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (allItems.length === 0) return null;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* ── Main Grid / List Area ── */}
      {viewMode === "list" ? (
        <div className="flex flex-col gap-2.5">
          {visibleItems.map((item) => (
            <FileListItem
              key={`${item.type}-${item.data._id}`}
              item={item.data}
              itemType={item.type}
              folderId={folderId}
              onClick={
                item.type === "document"
                  ? () => onDocClick(item.data._id as Id<"documents">)
                  : () => {}
              }
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4 auto-rows-max">
          {visibleItems.map((item) => (
            <FileCard
              key={`${item.type}-${item.data._id}`}
              item={item.data}
              itemType={item.type}
              folderId={folderId}
              onClick={
                item.type === "document"
                  ? () => onDocClick(item.data._id as Id<"documents">)
                  : () => {}
              }
            />
          ))}
        </div>
      )}

      {/* ── Cinematic Pagination Controls ── */}
      {(totalPages > 1 || itemsPerPage > defaultLimit) && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 mt-2 border-t border-slate-200/60 dark:border-slate-800/60">
          {/* Info Text & Items Per Page Selector */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <p className="text-[12px] sm:text-[13px] font-medium text-slate-500 dark:text-slate-400">
              Showing{" "}
              <span className="text-slate-900 dark:text-white font-semibold">
                {Math.min(startIndex + 1, allItems.length)}
              </span>{" "}
              to{" "}
              <span className="text-slate-900 dark:text-white font-semibold">
                {Math.min(startIndex + itemsPerPage, allItems.length)}
              </span>{" "}
              of{" "}
              <span className="text-slate-900 dark:text-white font-semibold">
                {allItems.length}
              </span>
            </p>

            {/* Custom Premium Dropdown */}
            <div className="flex items-center gap-2 relative" ref={dropdownRef}>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Show:
              </span>

              {/* Trigger Button */}
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 text-[12px] font-semibold rounded-xl px-3 py-1.5 outline-none hover:bg-slate-200 dark:hover:bg-slate-700/80 transition-all shadow-sm group"
              >
                {itemsPerPage === 99999 ? "All" : itemsPerPage}
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Glassy Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-32 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-700/80 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)] animate-in fade-in slide-in-from-bottom-2 duration-200 z-50 overflow-hidden py-1.5">
                  {[5, 10, 20, 30, 50, 100, 99999].map((val) => (
                    <button
                      key={val}
                      onClick={() => {
                        setItemsPerPage(val);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-[13px] font-medium transition-colors ${
                        itemsPerPage === val
                          ? "bg-indigo-50/80 dark:bg-indigo-500/10 text-indigo-600 dark:text-sky-400"
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80"
                      }`}
                    >
                      {val === 99999 ? "All Items" : `${val} Items`}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Glassy Controls */}
          <div className="flex items-center gap-1 bg-slate-100/60 dark:bg-slate-800/60 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm backdrop-blur-md">
            {/* Prev Button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-[10px] text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1 px-1.5">
              {Array.from({ length: totalPages }).map((_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-[10px] text-[12px] sm:text-[13px] font-bold transition-all duration-300 ${
                      currentPage === page
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30 scale-105"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            {/* Next Button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-[10px] text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

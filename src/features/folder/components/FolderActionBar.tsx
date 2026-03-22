// src/features/folder/components/FolderActionBar.tsx
import { useState, useRef, useEffect } from "react";
import type { FileFilterType, SortOption, ViewMode } from "../FolderPage";
import FileFilter from "./FileFilter";
import {
  Plus,
  Upload,
  LayoutGrid,
  List,
  ArrowDownAZ,
  ArrowDownZA,
  ChevronDown,
  Clock,
} from "lucide-react";

interface FolderActionBarProps {
  filter: FileFilterType;
  setFilter: (f: FileFilterType) => void;
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  sortOption: SortOption;
  setSortOption: (s: SortOption) => void;
  onUploadClick: () => void;
  onCreateDocClick: () => void;
}

export default function FolderActionBar({
  filter,
  setFilter,
  viewMode,
  setViewMode,
  sortOption,
  setSortOption,
  onUploadClick,
  onCreateDocClick,
}: FolderActionBarProps) {
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Handle Sort Dropdown Click Outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(e.target as Node)
      ) {
        setIsSortDropdownOpen(false);
      }
    };
    if (isSortDropdownOpen)
      document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSortDropdownOpen]);

  return (
    <div className="flex flex-row items-center justify-between gap-3 bg-white/40 dark:bg-slate-900/40 p-2 sm:p-2.5 rounded-[26px] border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-md relative z-30 flex-wrap sm:flex-nowrap">
      <div className="flex items-center gap-2.5 flex-nowrap shrink-0">
        {/* 1. Filter Pills */}
        <FileFilter active={filter} onChange={setFilter} />
        <div className="h-6 w-px bg-slate-300/50 dark:bg-slate-700/50 hidden md:block mx-1" />

        {/* 2. Compact View Mode Toggle */}
        <div className="flex items-center p-1 bg-slate-200/50 dark:bg-slate-800/60 rounded-xl border border-slate-300/30 dark:border-slate-700/50 shrink-0">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-lg transition-all duration-300 ${viewMode === "grid" ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-sky-400 shadow-sm scale-105" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-lg transition-all duration-300 ${viewMode === "list" ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-sky-400 shadow-sm scale-105" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        {/* 3. Premium Sort Dropdown */}
        <div className="relative shrink-0" ref={sortDropdownRef}>
          <button
            onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
            className="flex items-center gap-2.5 px-3 sm:px-4 py-2 bg-white/80 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-xl text-[13px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all shadow-sm group"
          >
            {sortOption === "name-asc" && (
              <ArrowDownAZ className="w-4 h-4 text-indigo-500" />
            )}
            {sortOption === "name-desc" && (
              <ArrowDownZA className="w-4 h-4 text-indigo-500" />
            )}
            {sortOption === "created" && (
              <Clock className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
            )}
            {sortOption === "modified" && (
              <Clock className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
            )}
            <span className="hidden lg:block tracking-tight">
              {sortOption === "name-asc" && "A to Z"}
              {sortOption === "name-desc" && "Z to A"}
              {sortOption === "created" && "Newest"}
              {sortOption === "modified" && "Modified"}
            </span>
            <ChevronDown
              className={`w-3 h-3 text-slate-400 transition-transform duration-300 ${isSortDropdownOpen ? "rotate-180" : ""}`}
            />
          </button>
          {isSortDropdownOpen && (
            <div className="absolute top-full left-0 sm:left-auto sm:right-0 mt-2 w-48 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-700/80 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 z-100 overflow-hidden py-1.5">
              {[
                { id: "name-asc", label: "A to Z", icon: ArrowDownAZ },
                { id: "name-desc", label: "Z to A", icon: ArrowDownZA },
                { id: "created", label: "Newest First", icon: Clock },
                { id: "modified", label: "Recently Modified", icon: Clock },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setSortOption(opt.id as SortOption);
                    setIsSortDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium transition-colors ${sortOption === opt.id ? "bg-indigo-50/80 dark:bg-indigo-500/10 text-indigo-600 dark:text-sky-400" : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80"}`}
                >
                  <opt.icon className="w-4 h-4 opacity-70" />
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. Action Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onUploadClick}
          title="Upload File"
          className="flex items-center justify-center gap-2 px-3.5 lg:px-5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[13px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm active:scale-95"
        >
          <Upload className="w-4 h-4 text-indigo-500" />
          <span className="hidden lg:inline">Upload</span>
        </button>
        <button
          onClick={onCreateDocClick}
          title="New Document"
          className="flex items-center justify-center gap-2 px-3.5 lg:px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden lg:inline">New Doc</span>
        </button>
      </div>
    </div>
  );
}

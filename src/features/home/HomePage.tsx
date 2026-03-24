// src/features/home/HomePage.tsx
import { useState, useEffect, useMemo, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useSessionStore } from "@/store/sessionStore";
import CreateFolderModal from "./components/CreateFolderModal";
import StarredSection from "./components/StarredSection";
import FolderGrid from "./components/FolderGrid";
import EmptyState from "@/components/common/EmptyState";
import SearchEmptyState from "@/components/common/SearchEmptyState";
import TopNav from "@/components/layout/TopNav";
import type { Id } from "../../../convex/_generated/dataModel";
import { ramStore } from "@/lib/storage/ram";
import { decryptData } from "@/lib/crypto/aes";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  LayoutGrid,
  List as ListIcon,
  FolderPlus,
  ChevronDown,
  ArrowDownAZ,
  ArrowDownZA,
  Clock,
} from "lucide-react";

export type ViewMode = "grid" | "list";
export type SortOption = "name-asc" | "name-desc" | "date-desc" | "date-asc";

export interface DecryptedFolder {
  _id: Id<"folders">;
  name: string;
  color: string;
  isStarred: boolean;
  isLocked: boolean;
  updatedAt: number;
}

export default function HomePage() {
  const navigate = useNavigate();
  const { userId } = useSessionStore();

  // Fetch from Convex
  const rawFolders = useQuery(
    api.folders.getFolders,
    userId ? { userId: userId as Id<"users"> } : "skip",
  );

  // State
  const [decryptedFolders, setDecryptedFolders] = useState<DecryptedFolder[]>(
    [],
  );
  const [isDecrypting, setIsDecrypting] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Dropdown State
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // ── 1. INTELLIGENT MEMORY (Local Storage) ──
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return (localStorage.getItem("ciphra_view_mode") as ViewMode) || "grid";
  });

  const [sortOption, setSortOption] = useState<SortOption>(() => {
    return (
      (localStorage.getItem("ciphra_sort_option") as SortOption) || "date-desc"
    );
  });

  // Save changes to memory instantly
  useEffect(() => {
    localStorage.setItem("ciphra_view_mode", viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem("ciphra_sort_option", sortOption);
  }, [sortOption]);

  // Handle Dropdown Click Outside
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

  // ── 2. DECRYPTION LOGIC ──
  useEffect(() => {
    const decrypt = async () => {
      if (rawFolders === undefined) return;
      if (rawFolders.length === 0) {
        setDecryptedFolders([]);
        setIsDecrypting(false);
        return;
      }

      const key = ramStore.getKey();
      if (!key) {
        setIsDecrypting(false);
        return;
      }

      try {
        const decrypted = await Promise.all(
          rawFolders.map(async (f) => ({
            _id: f._id,
            name: await decryptData(f.nameEncrypted, key),
            color: f.color,
            isStarred: f.isStarred ?? false,
            isLocked: f.isLocked ?? false,
            updatedAt: f._creationTime,
          })),
        );
        setDecryptedFolders(decrypted);
      } catch (error) {
        console.error("Decryption failed", error);
      } finally {
        setIsDecrypting(false);
      }
    };
    decrypt();
  }, [rawFolders]);

  // ── 3. FILTER & SORT LOGIC ──
  const filteredAndSortedFolders = useMemo(() => {
    let result = [...decryptedFolders];
    // ── Search LOGIC ──
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter((f) => f.name.toLowerCase().includes(lowerQuery));
    }

    result.sort((a, b) => {
      if (sortOption === "name-asc") return a.name.localeCompare(b.name);
      if (sortOption === "name-desc") return b.name.localeCompare(a.name);
      if (sortOption === "date-asc") return a.updatedAt - b.updatedAt;
      if (sortOption === "date-desc") return b.updatedAt - a.updatedAt;
      return 0;
    });

    return result;
  }, [decryptedFolders, sortOption, searchQuery]);

  const starredFolders = filteredAndSortedFolders.filter((f) => f.isStarred);
  const allFolders = filteredAndSortedFolders;

  // ── LOADING STATE ──
  if (rawFolders === undefined || isDecrypting) {
    return (
      <div className="flex-1 flex items-center justify-center w-full min-h-[50vh] bg-slate-50 dark:bg-[#0B1120] transition-colors duration-500">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 w-full flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-[#0B1120] transition-colors duration-500 relative">
      {/* Top Navigation */}
      <TopNav
        showSearch={true}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      {/* ── THE BEAUTIFUL 4px SCROLLBAR (Restored & Applied Globally) ── */}
      <style>{`
        ::-webkit-scrollbar {
          width: 4px; /* Ultra sleek */
          height: 4px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background-color: #cbd5e1; /* slate-300 */
          border-radius: 10px;
        }
        .dark ::-webkit-scrollbar-thumb {
          background-color: #334155; /* slate-700 */
        }
        ::-webkit-scrollbar-thumb:hover {
          background-color: #818cf8; /* indigo-400 */
        }
      `}</style>

      {/* Cinematic Top Ambient Glow */}
      <div className="absolute top-0 left-0 w-full h-[30vh] bg-linear-to-b from-indigo-500/5 dark:from-sky-500/5 to-transparent pointer-events-none z-0" />

      {/* Main Container (Padding removed from bottom to keep it neat) */}
      <div className="flex-1 overflow-y-auto flex flex-col p-4 sm:p-8 max-w-400 mx-auto w-full relative z-10 pb-16">
        {/* ── HEADER & ACTION BAR ── */}
        <div className="flex flex-col gap-6 mb-6 shrink-0 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
            {/* Page Title */}
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                My Vaults
              </h1>
              <p className="text-[13px] sm:text-[14px] text-slate-500 dark:text-slate-400 font-medium mt-1.5">
                Securely manage and organize your encrypted files.
              </p>
            </div>

            {/* Controls Row */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Premium Sort Dropdown */}
              <div className="relative" ref={sortDropdownRef}>
                <button
                  onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                  className="flex items-center gap-2.5 px-4 py-2.5 bg-white/80 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-xl text-[13px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all shadow-sm"
                >
                  {sortOption.includes("name") ? (
                    <ArrowDownAZ className="w-4 h-4 text-slate-400" />
                  ) : (
                    <Clock className="w-4 h-4 text-slate-400" />
                  )}
                  <span className="hidden xs:block">
                    {sortOption === "name-asc" && "A to Z"}
                    {sortOption === "name-desc" && "Z to A"}
                    {sortOption === "date-desc" && "Newest"}
                    {sortOption === "date-asc" && "Oldest"}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${isSortDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isSortDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-44 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-700/80 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)] animate-in fade-in slide-in-from-top-2 duration-200 z-50 overflow-hidden py-1.5">
                    <SortItem
                      label="A to Z"
                      value="name-asc"
                      icon={ArrowDownAZ}
                      current={sortOption}
                      onSelect={(v) => {
                        setSortOption(v);
                        setIsSortDropdownOpen(false);
                      }}
                    />
                    <SortItem
                      label="Z to A"
                      value="name-desc"
                      icon={ArrowDownZA}
                      current={sortOption}
                      onSelect={(v) => {
                        setSortOption(v);
                        setIsSortDropdownOpen(false);
                      }}
                    />
                    <SortItem
                      label="Newest First"
                      value="date-desc"
                      icon={Clock}
                      current={sortOption}
                      onSelect={(v) => {
                        setSortOption(v);
                        setIsSortDropdownOpen(false);
                      }}
                    />
                    <SortItem
                      label="Oldest First"
                      value="date-asc"
                      icon={Clock}
                      current={sortOption}
                      onSelect={(v) => {
                        setSortOption(v);
                        setIsSortDropdownOpen(false);
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center p-1 bg-slate-200/50 dark:bg-slate-800/60 rounded-xl backdrop-blur-md border border-slate-300/30 dark:border-slate-700/50">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-lg transition-all duration-300 ${viewMode === "grid" ? "bg-white dark:bg-slate-700/80 text-indigo-600 dark:text-sky-400 shadow-sm scale-105" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-lg transition-all duration-300 ${viewMode === "list" ? "bg-white dark:bg-slate-700/80 text-indigo-600 dark:text-sky-400 shadow-sm scale-105" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}
                >
                  <ListIcon className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="group relative flex items-center gap-2 px-5 py-2.5 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-400 text-white rounded-xl text-[13px] font-bold shadow-[0_8px_20px_-6px_rgba(99,102,241,0.6)] hover:shadow-[0_8px_25px_-4px_rgba(99,102,241,0.8)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <Plus className="w-4 h-4 relative z-10" strokeWidth={2.5} />
                <span className="hidden xs:block relative z-10 tracking-wide">
                  New Vault
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* ── CONTENT AREA ── */}
        <div className="flex flex-col pt-2">
          {/* Empty State Handlers */}
          {decryptedFolders.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState
                icon={FolderPlus}
                title="No Vaults Yet"
                description="Create your first secure vault to start storing encrypted files."
                actionLabel="Create Vault"
                onAction={() => setIsCreateModalOpen(true)}
              />
            </div>
          ) : allFolders.length === 0 && searchQuery.trim() !== "" ? (
            <div className="flex-1 flex items-center justify-center mt-10">
              <SearchEmptyState
                searchQuery={searchQuery}
                onClear={() => setSearchQuery("")}
              />
            </div>
          ) : (
            /* Data Rendering Area */
            <div className="flex flex-col gap-6 animate-in fade-in duration-500">
              <StarredSection
                folders={starredFolders}
                viewMode={viewMode}
                onFolderClick={(id) => navigate(`/folder/${id}`)}
              />

              {allFolders.length > 0 && (
                <div className="flex flex-col gap-3">
                  <h2 className="text-[16px] sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mb-1">
                    All Folders
                    <span className="px-2 py-0.5 text-[11px] font-bold bg-slate-200/60 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 rounded-full">
                      {allFolders.length}
                    </span>
                  </h2>
                  <FolderGrid
                    folders={allFolders}
                    viewMode={viewMode}
                    onFolderClick={(id) => navigate(`/folder/${id}`)}
                    defaultLimit={10}
                    storageKey="ciphra_all_grid_limit"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {isCreateModalOpen && (
        <CreateFolderModal onClose={() => setIsCreateModalOpen(false)} />
      )}
    </div>
  );
}

// ── Dropdown Helper Component ──
interface SortItemProps {
  label: string;
  value: SortOption;
  icon: React.ElementType;
  current: SortOption;
  onSelect: (value: SortOption) => void;
}

function SortItem({
  label,
  value,
  icon: Icon,
  current,
  onSelect,
}: SortItemProps) {
  return (
    <button
      onClick={() => onSelect(value)}
      className={`w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium transition-colors ${
        current === value
          ? "bg-indigo-50/80 dark:bg-indigo-500/10 text-indigo-600 dark:text-sky-400"
          : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80"
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

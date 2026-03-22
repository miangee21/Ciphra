// src/features/folder/FolderPage.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useSessionStore } from "@/store/sessionStore";
import { ramStore } from "@/lib/storage/ram";
import { decryptData } from "@/lib/crypto/aes";
import TopNav from "@/components/layout/TopNav";
import Breadcrumb from "@/components/layout/Breadcrumb";
import FileGrid from "./components/FileGrid";
import FolderActionBar from "./components/FolderActionBar";
import CreateDocModal from "./components/CreateDocModal";
import StarredItemsSection from "./components/StarredItemsSection";
import UploadFileModal from "./components/UploadFileModal";
import EmptyState from "@/components/common/EmptyState";
import type { Id } from "../../../convex/_generated/dataModel";
import { FolderOpen, ArrowLeft } from "lucide-react";

export type FileFilterType = "all" | "image" | "pdf" | "document";
export type SortOption = "name-asc" | "name-desc" | "created" | "modified";
export type ViewMode = "grid" | "list";

export interface DecryptedFile {
  _id: Id<"files">;
  name: string;
  type: "image" | "pdf";
  mimeType: string;
  storageId: string;
  sizeBytes: number;
  isStarred: boolean;
  isLocked?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface DecryptedDocument {
  _id: Id<"documents">;
  name: string;
  color: string;
  isStarred: boolean;
  isLocked?: boolean;
  createdAt: number;
  updatedAt: number;
}

export default function FolderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userId } = useSessionStore();
  const folderId = id as Id<"folders">;

  // ── States ──
  const [folderName, setFolderName] = useState("");
  const [filter, setFilter] = useState<FileFilterType>("all");
  const [showCreateDoc, setShowCreateDoc] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [decryptedFiles, setDecryptedFiles] = useState<DecryptedFile[]>([]);
  const [decryptedDocs, setDecryptedDocs] = useState<DecryptedDocument[]>([]);

  // ── Intelligent Memory (Local Storage) ──
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return (
      (localStorage.getItem("ciphra_file_view_mode") as ViewMode) || "grid"
    );
  });

  const [sortOption, setSortOption] = useState<SortOption>(() => {
    return (
      (localStorage.getItem("ciphra_file_sort_option") as SortOption) ||
      "name-asc"
    );
  });

  useEffect(() => {
    localStorage.setItem("ciphra_file_view_mode", viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem("ciphra_file_sort_option", sortOption);
  }, [sortOption]);

  // ── Data Fetching ──
  const folderRaw = useQuery(
    api.folders.getFolders,
    userId ? { userId: userId as Id<"users"> } : "skip",
  );
  const rawFiles = useQuery(api.files.getFiles, { folderId });
  const rawDocs = useQuery(api.documents.getDocuments, { folderId });

  // Decrypt folder name
  useEffect(() => {
    if (!folderRaw) return;
    const key = ramStore.getKey();
    if (!key) return;
    const folder = folderRaw.find((f) => f._id === folderId);
    if (!folder) return;
    decryptData(folder.nameEncrypted, key).then(setFolderName);
  }, [folderRaw, folderId]);

  // Decrypt files
  useEffect(() => {
    if (!rawFiles) return;
    const key = ramStore.getKey();
    if (!key) return;
    const decrypt = async () => {
      const results = await Promise.all(
        rawFiles.map(async (f) => {
          try {
            const name = await decryptData(f.nameEncrypted, key);
            return {
              _id: f._id,
              name,
              type: f.type,
              mimeType: f.mimeType,
              storageId: f.storageId,
              sizeBytes: f.sizeBytes,
              isStarred: f.isStarred,
              isLocked: f.isLocked ?? false,
              createdAt: f.createdAt,
              updatedAt: f.updatedAt,
            } as DecryptedFile;
          } catch {
            return null;
          }
        }),
      );
      setDecryptedFiles(results.filter(Boolean) as DecryptedFile[]);
    };
    decrypt();
  }, [rawFiles]);

  // Decrypt documents
  useEffect(() => {
    if (!rawDocs) return;
    const key = ramStore.getKey();
    if (!key) return;
    const decrypt = async () => {
      const results = await Promise.all(
        rawDocs.map(async (d) => {
          try {
            const name = await decryptData(d.titleEncrypted, key);
            return {
              _id: d._id,
              name,
              color: d.color,
              isStarred: d.isStarred,
              isLocked: d.isLocked ?? false,
              createdAt: d.createdAt,
              updatedAt: d.updatedAt,
            } as DecryptedDocument;
          } catch {
            return null;
          }
        }),
      );
      setDecryptedDocs(results.filter(Boolean) as DecryptedDocument[]);
    };
    decrypt();
  }, [rawDocs]);

  // ── Filtering & Sorting Logic ──
  const filteredFiles = decryptedFiles.filter(
    (f) => filter === "all" || filter === "document" || f.type === filter,
  );
  const filteredDocs =
    filter === "all" || filter === "document" ? decryptedDocs : [];

  const sortItems = <
    T extends { name: string; createdAt: number; updatedAt: number },
  >(
    items: T[],
  ) =>
    [...items].sort((a, b) => {
      switch (sortOption) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "created":
          return b.createdAt - a.createdAt;
        case "modified":
          return b.updatedAt - a.updatedAt;
        default:
          return 0;
      }
    });

  const sortedFiles = filter === "document" ? [] : sortItems(filteredFiles);
  const sortedDocs =
    filter === "image" || filter === "pdf" ? [] : sortItems(filteredDocs);

  const starredFiles = sortedFiles.filter((f) => f.isStarred);
  const starredDocs = sortedDocs.filter((d) => d.isStarred);

  const isEmpty = sortedFiles.length === 0 && sortedDocs.length === 0;
  const isLoading = rawFiles === undefined || rawDocs === undefined;

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 dark:bg-[#0B1120] transition-colors duration-500 overflow-hidden">
      {/* ── THE BEAUTIFUL 4px SCROLLBAR ── */}
      <style>{`
        .custom-content-scroll::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-content-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-content-scroll::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
        .dark .custom-content-scroll::-webkit-scrollbar-thumb { background-color: #334155; }
        .custom-content-scroll::-webkit-scrollbar-thumb:hover { background-color: #818cf8; }
      `}</style>

      {/* 1. Navbar  */}
      <div className="shrink-0 z-100">
        <TopNav showSearch={true} searchQuery="" onSearchChange={() => {}} />
      </div>

      {/* 2. Scrollable Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden custom-content-scroll relative scroll-smooth">
        <div className="max-w-400 mx-auto px-4 sm:px-8 py-6 flex flex-col gap-8 w-full relative z-10 pb-24">
          {/* Breadcrumb & Back Button Only */}
          <div className="flex items-center gap-3 mb-2 animate-in fade-in slide-in-from-top-4 duration-500">
            <button
              onClick={() => navigate(-1)}
              title="Go Back"
              className="w-9 h-9 flex items-center justify-center rounded-2xl bg-white/40 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-800/50 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-sky-400 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-x-0.5 group backdrop-blur-md shrink-0"
            >
              <ArrowLeft
                className="w-4 h-4 group-hover:scale-110 transition-transform"
                strokeWidth={2.5}
              />
            </button>

            <Breadcrumb
              items={[
                { label: "Home", href: "/home" },
                { label: folderName || "Folder" },
              ]}
            />
          </div>

          {/* ── Action Bar (Clean Component Import) ── */}
          <FolderActionBar
            filter={filter}
            setFilter={setFilter}
            viewMode={viewMode}
            setViewMode={setViewMode}
            sortOption={sortOption}
            setSortOption={setSortOption}
            onUploadClick={() => setShowUpload(true)}
            onCreateDocClick={() => setShowCreateDoc(true)}
          />

          {/* ── Main Content Area ── */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <div className="w-10 h-10 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
              <p className="text-slate-400 font-medium animate-pulse">
                Unlocking your vault...
              </p>
            </div>
          ) : isEmpty ? (
            <div className="py-12">
              <EmptyState
                icon={FolderOpen}
                title="This folder is empty"
                description="Your encrypted files and documents will appear here once you add them."
                actionLabel="Create First Document"
                onAction={() => setShowCreateDoc(true)}
              />
            </div>
          ) : (
            <div className="flex flex-col gap-10">
              <StarredItemsSection
                files={starredFiles}
                documents={starredDocs}
                viewMode={viewMode}
                folderId={folderId}
                onDocClick={(docId) => navigate(`/doc/${docId}`)}
              />

              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                    All Items
                    <span className="flex items-center justify-center px-2.5 py-0.5 text-[11px] font-black bg-indigo-500/10 text-indigo-600 dark:text-sky-400 rounded-full border border-indigo-500/10">
                      {sortedFiles.length + sortedDocs.length}
                    </span>
                  </h2>
                </div>
                <FileGrid
                  files={sortedFiles}
                  documents={sortedDocs}
                  viewMode={viewMode}
                  folderId={folderId}
                  onDocClick={(docId) => navigate(`/doc/${docId}`)}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <CreateDocModal
        isOpen={showCreateDoc}
        onClose={() => setShowCreateDoc(false)}
        folderId={folderId}
        onCreated={(docId) => navigate(`/doc/${docId}`)}
      />
      <UploadFileModal
        isOpen={showUpload}
        folderId={folderId}
        onClose={() => setShowUpload(false)}
      />
    </div>
  );
}

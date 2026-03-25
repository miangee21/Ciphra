//src/features/recycle/RecycleBinPage.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useSessionStore } from "@/store/sessionStore";
import { ramStore } from "@/lib/storage/ram";
import { decryptData } from "@/lib/crypto/aes";
import TopNav from "@/components/layout/TopNav";
import EmptyState from "@/components/common/EmptyState";
import SearchEmptyState from "@/components/common/SearchEmptyState";
import RecycleItemCard from "./components/RecycleItemCard";
import RecycleItemList from "./components/RecycleItemList";
import ConfirmDeleteModal from "./components/ConfirmDeleteModal";
import { Trash2, ArrowLeft, LayoutGrid, List } from "lucide-react";
import type { Id } from "../../../convex/_generated/dataModel";
import { toast } from "sonner";

export type RecycleItemType = "folder" | "document" | "image" | "pdf";
export type ViewMode = "grid" | "list";

export interface RecycleItem {
  _id: string;
  name: string;
  itemType: RecycleItemType;
  color?: string;
  deletedAt?: number;
  originalType: "folder" | "document" | "file";
  isStarred?: boolean;
  isLocked?: boolean;
  mimeType?: string;
  storageId?: string;
}

export default function RecycleBinPage() {
  const navigate = useNavigate();
  const { userId } = useSessionStore();
  const [items, setItems] = useState<RecycleItem[]>([]);

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return (
      (localStorage.getItem("ciphra_recycle_view_mode") as ViewMode) || "grid"
    );
  });

  const [modalConfig, setModalConfig] = useState<{
    type: "delete" | "restore" | "empty";
    item?: RecycleItem;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    localStorage.setItem("ciphra_recycle_view_mode", viewMode);
  }, [viewMode]);

  // Convex queries
  const deletedFolders = useQuery(
    api.folders.getDeletedFolders,
    userId ? { userId: userId as Id<"users"> } : "skip",
  );
  const deletedDocs = useQuery(
    api.documents.getDeletedDocuments,
    userId ? { userId: userId as Id<"users"> } : "skip",
  );
  const deletedFiles = useQuery(
    api.files.getDeletedFiles,
    userId ? { userId: userId as Id<"users"> } : "skip",
  );

  // Mutations
  const restoreFolder = useMutation(api.folders.restoreFolder);
  const restoreDoc = useMutation(api.documents.restoreDocument);
  const restoreFile = useMutation(api.files.restoreFile);
  const permDeleteFolder = useMutation(api.folders.permanentDeleteFolder);
  const permDeleteDoc = useMutation(api.documents.permanentDeleteDocument);
  const permDeleteFile = useMutation(api.files.permanentDeleteFile);

  // Decrypt and combine all items
  useEffect(() => {
    const key = ramStore.getKey();
    if (!key) return;

    const decrypt = async () => {
      const result: RecycleItem[] = [];

      // Folders
      if (deletedFolders) {
        for (const f of deletedFolders) {
          try {
            const name = await decryptData(f.nameEncrypted, key);
            result.push({
              _id: f._id,
              name,
              itemType: "folder",
              color: f.color,
              deletedAt: f.deletedAt,
              originalType: "folder",
              isStarred: f.isStarred ?? false,
              isLocked: f.isLocked ?? false,
            });
          } catch {
            /* skip */
          }
        }
      }

      // Documents
      if (deletedDocs) {
        for (const d of deletedDocs) {
          try {
            const name = await decryptData(d.titleEncrypted, key);
            result.push({
              _id: d._id,
              name,
              itemType: "document",
              color: d.color,
              deletedAt: d.deletedAt,
              originalType: "document",
              isStarred: d.isStarred ?? false,
              isLocked: d.isLocked ?? false,
            });
          } catch {
            /* skip */
          }
        }
      }

      // Files
      if (deletedFiles) {
        for (const f of deletedFiles) {
          try {
            const name = await decryptData(f.nameEncrypted, key);
            result.push({
              _id: f._id,
              name,
              itemType: f.type === "pdf" ? "pdf" : "image",
              deletedAt: f.deletedAt,
              originalType: "file",
              isStarred: f.isStarred ?? false,
              isLocked: f.isLocked ?? false,
              mimeType: f.mimeType,
              storageId: f.storageId,
            });
          } catch {
            /* skip */
          }
        }
      }

      // Sort by most recently deleted
      result.sort((a, b) => (b.deletedAt ?? 0) - (a.deletedAt ?? 0));
      setItems(result);
    };

    decrypt();
  }, [deletedFolders, deletedDocs, deletedFiles]);

  const handleRestore = async (item: RecycleItem) => {
    setLoading(true);
    try {
      if (item.originalType === "folder") {
        await restoreFolder({ id: item._id as Id<"folders"> });
      } else if (item.originalType === "document") {
        await restoreDoc({ id: item._id as Id<"documents"> });
      } else {
        await restoreFile({ id: item._id as Id<"files"> });
      }
      toast.success(`"${item.name}" restored successfully!`);
      setModalConfig(null);
    } catch {
      toast.error("Failed to restore item");
    } finally {
      setLoading(false);
    }
  };

  const handlePermanentDelete = async (item: RecycleItem) => {
    setLoading(true);
    try {
      if (item.originalType === "folder") {
        await permDeleteFolder({ id: item._id as Id<"folders"> });
      } else if (item.originalType === "document") {
        await permDeleteDoc({ id: item._id as Id<"documents"> });
      } else {
        await permDeleteFile({ id: item._id as Id<"files"> });
      }
      toast.success(`"${item.name}" permanently deleted`);
      setModalConfig(null);
    } catch {
      toast.error("Failed to delete item");
    } finally {
      setLoading(false);
    }
  };

  const handleEmptyBin = async () => {
    setLoading(true);
    try {
      const promises = items.map(async (item) => {
        if (item.originalType === "folder")
          await permDeleteFolder({ id: item._id as Id<"folders"> });
        else if (item.originalType === "document")
          await permDeleteDoc({ id: item._id as Id<"documents"> });
        else await permDeleteFile({ id: item._id as Id<"files"> });
      });
      await Promise.all(promises);
      toast.success("Recycle bin emptied forever!");
      setModalConfig(null);
    } catch {
      toast.error("Failed to empty bin");
    } finally {
      setLoading(false);
    }
  };

  const isLoading =
    deletedFolders === undefined ||
    deletedDocs === undefined ||
    deletedFiles === undefined;

  // ── Inline Search Filter ──
  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-[#0B1120] overflow-hidden transition-colors duration-500 relative">
      <style>{`
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
        .dark ::-webkit-scrollbar-thumb { background-color: #334155; }
        ::-webkit-scrollbar-thumb:hover { background-color: #818cf8; }
      `}</style>

      <div className="absolute top-0 left-0 w-full h-[30vh] bg-linear-to-b from-red-500/5 dark:from-red-500/5 to-transparent pointer-events-none z-0" />

      <TopNav
        showSearch={true}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="flex-1 overflow-y-auto relative z-10">
        <div className="max-w-400 mx-auto px-4 sm:px-8 py-6 flex flex-col gap-6 pb-20 animate-in fade-in slide-in-from-top-4 duration-500">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="w-9 h-9 flex items-center justify-center rounded-2xl bg-white/40 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-800/50 text-slate-500 hover:text-indigo-600 dark:hover:text-sky-400 transition-all shadow-sm hover:-translate-x-0.5 backdrop-blur-md"
              >
                <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-slate-400" />
                  Recycle Bin
                  {items.length > 0 && (
                    <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full">
                      {items.length}
                    </span>
                  )}
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Items are permanently deleted after 30 days
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              {/* View toggle */}
              <div className="flex items-center p-1 bg-white/80 dark:bg-slate-900/50 backdrop-blur-md rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-lg transition-all duration-300 ${
                    viewMode === "grid"
                      ? "bg-white dark:bg-slate-700/80 text-indigo-600 dark:text-sky-400 shadow-sm scale-105"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-lg transition-all duration-300 ${
                    viewMode === "list"
                      ? "bg-white dark:bg-slate-700/80 text-indigo-600 dark:text-sky-400 shadow-sm scale-105"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Empty bin button */}
              {items.length > 0 && (
                <button
                  onClick={() => setModalConfig({ type: "empty" })}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/40 text-[13px] font-bold transition-all disabled:opacity-50 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                >
                  <Trash2 className="w-4 h-4" />
                  Empty Bin
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <div className="w-10 h-10 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
              <p className="text-slate-400 font-medium animate-pulse">
                Loading items...
              </p>
            </div>
          ) : items.length === 0 ? (
            <div className="py-12">
              <EmptyState
                icon={Trash2}
                title="Recycle bin is empty"
                description="Deleted folders, documents and files will appear here for 30 days before being permanently removed."
              />
            </div>
          ) : filteredItems.length === 0 && searchQuery.trim() !== "" ? (
            <div className="py-12">
              <SearchEmptyState
                searchQuery={searchQuery}
                onClear={() => setSearchQuery("")}
              />
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredItems.map((item) => (
                <RecycleItemCard
                  key={item._id}
                  item={item}
                  onRestore={() => setModalConfig({ type: "restore", item })}
                  onDelete={() => setModalConfig({ type: "delete", item })}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredItems.map((item) => (
                <RecycleItemList
                  key={item._id}
                  item={item}
                  onRestore={() => setModalConfig({ type: "restore", item })}
                  onDelete={() => setModalConfig({ type: "delete", item })}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Universal Action Modal */}
      {modalConfig && (
        <ConfirmDeleteModal
          itemName={modalConfig.item?.name}
          actionType={modalConfig.type}
          onConfirm={() => {
            if (modalConfig.type === "empty") handleEmptyBin();
            else if (modalConfig.type === "restore" && modalConfig.item)
              handleRestore(modalConfig.item);
            else if (modalConfig.type === "delete" && modalConfig.item)
              handlePermanentDelete(modalConfig.item);
          }}
          onCancel={() => setModalConfig(null)}
        />
      )}
    </div>
  );
}

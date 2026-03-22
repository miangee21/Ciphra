// src/features/folder/components/FileCard.tsx
import { useState, useRef, useEffect } from "react";
import { Star, MoreVertical, FileText, Lock } from "lucide-react";
import type { DecryptedFile, DecryptedDocument } from "../FolderPage";
import type { Id } from "../../../../convex/_generated/dataModel";
import FullScreenViewer from "@/components/common/FullScreenViewer";
import VerifyPinModal from "@/components/common/VerifyPinModal";
import ImageThumbnail from "./ImageThumbnail";
import FileContextMenu from "./FileContextMenu";

interface FileCardProps {
  item: DecryptedFile | DecryptedDocument;
  itemType: "file" | "document";
  onClick: () => void;
  folderId: Id<"folders">;
}

export default function FileCard({
  item,
  itemType,
  onClick,
  folderId,
}: FileCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState<"down" | "up">("down");
  const [showViewer, setShowViewer] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isFile = itemType === "file";
  const file = isFile ? (item as DecryptedFile) : null;
  const doc = !isFile ? (item as DecryptedDocument) : null;

  // ── Secure Open Logic ──
  const handleCardClick = () => {
    if (item.isLocked) {
      setShowPinModal(true);
    } else {
      proceedToOpen();
    }
  };

  const proceedToOpen = () => {
    if (isFile) {
      setShowViewer(true);
    } else {
      onClick();
    }
  };

  // Intelligent Menu Positioning Logic
  const calculateMenuPosition = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    if (spaceBelow < 260) {
      setMenuPosition("up");
    } else {
      setMenuPosition("down");
    }
  };

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!showMenu) calculateMenuPosition(e);
    setShowMenu(!showMenu);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    calculateMenuPosition(e);
    setShowMenu(true);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  return (
    <>
      <div
        onClick={handleCardClick}
        onContextMenu={handleContextMenu}
        className={`group relative flex flex-col rounded-[1.5rem] border border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:-translate-y-1 hover:border-indigo-500/30 dark:hover:border-sky-500/30 transition-all duration-300 cursor-pointer ${
          showMenu ? "z-50 ring-2 ring-indigo-500/20" : "z-10"
        }`}
      >
        {/* Card Background Effects Wrapper  */}
        <div className="absolute inset-0 overflow-hidden rounded-[1.5rem] pointer-events-none z-0">
          {/* Top Right Corner Ambient Glow */}
          <div
            className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none"
            style={{ backgroundColor: doc?.color ?? "#6366f1" }}
          />
        </div>

        {/* Top Glowing Accent Strip */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[40%] h-1 rounded-b-full opacity-60 group-hover:opacity-100 group-hover:w-[70%] transition-all duration-500 z-20"
          style={{
            backgroundColor: doc?.color ?? "#6366f1",
            boxShadow: `0 2px 8px ${doc?.color ?? "#6366f1"}80`,
          }}
        />

        {/* Top Right Badges (Lock & Star) */}
        <div className="absolute top-3 right-3 z-30 flex flex-col gap-2">
          {item.isLocked && (
            <div className="flex items-center justify-center w-7 h-7 bg-slate-900/40 dark:bg-black/40 backdrop-blur-md rounded-xl border border-white/10 shadow-sm">
              <Lock className="w-3.5 h-3.5 text-white drop-shadow-sm" />
            </div>
          )}
          {item.isStarred && (
            <div className="flex items-center justify-center w-7 h-7 bg-slate-900/40 dark:bg-black/40 backdrop-blur-md rounded-xl border border-white/10 shadow-sm">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 drop-shadow-sm" />
            </div>
          )}
        </div>

        {/* ── Top Area: Thumbnail / Preview ── */}
        <div className="h-32 sm:h-36 w-full bg-slate-100/50 dark:bg-slate-800/50 flex items-center justify-center overflow-hidden relative rounded-t-[1.5rem]">
          <div className="absolute inset-0 bg-linear-to-t from-black/5 to-transparent z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {file?.type === "image" ? (
            <div className="w-full h-full overflow-hidden transform transition-transform duration-700 group-hover:scale-110">
              <ImageThumbnail
                storageId={file.storageId}
                name={file.name}
                isLocked={item.isLocked}
              />
            </div>
          ) : file?.type === "pdf" ? (
            <div className="flex flex-col items-center gap-2 transform transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-3">
              <div className="w-14 h-16 bg-red-50 dark:bg-red-500/10 rounded-xl border border-red-100/50 dark:border-red-500/20 flex flex-col items-center justify-center shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-red-500/5" />
                <span className="text-[13px] font-black text-red-500 tracking-wider">
                  PDF
                </span>
              </div>
            </div>
          ) : (
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6 relative"
              style={{
                backgroundColor: (doc?.color ?? "#6366f1") + "15",
                border: `1px solid ${doc?.color ?? "#6366f1"}30`,
              }}
            >
              <div
                className="absolute inset-0 rounded-2xl blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-500"
                style={{ backgroundColor: doc?.color ?? "#6366f1" }}
              />
              <FileText
                className="w-7 h-7 relative z-10 transition-colors duration-500"
                style={{ color: doc?.color ?? "#6366f1" }}
                strokeWidth={1.5}
              />
            </div>
          )}
        </div>

        {/* ── Bottom Area: Info & Actions ── */}
        <div
          className={`flex items-center justify-between px-3.5 py-3 gap-2 bg-white/40 dark:bg-slate-900/40 rounded-b-[1.5rem] relative transition-all duration-300 ${showMenu ? "z-60" : "z-10"}`}
        >
          <div className="flex-1 min-w-0">
            <p className="text-[13px] sm:text-[14px] font-semibold text-slate-900 dark:text-white truncate tracking-tight">
              {item.name}
            </p>
            <p className="text-[11px] sm:text-[12px] font-medium text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1.5 truncate">
              <span>
                {file ? `${(file.sizeBytes / 1024).toFixed(1)} KB` : "Document"}
              </span>

              {/* Colored Dot for visual connection */}
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0 shadow-sm opacity-90"
                style={{
                  backgroundColor: doc?.color ?? "#6366f1",
                  boxShadow: `0 0 6px ${doc?.color ?? "#6366f1"}80`,
                }}
              />

              <span className="truncate">
                {new Date(item.updatedAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </p>
          </div>

          <div className="flex items-center justify-end gap-1.5 shrink-0">
            <div ref={menuRef} className="relative">
              <button
                onClick={toggleMenu}
                className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-xl border transition-all shadow-sm opacity-0 group-hover:opacity-100 ${
                  showMenu
                    ? "bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white opacity-100"
                    : "bg-slate-100/60 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-700/60 text-slate-500 dark:text-slate-400 hover:bg-slate-200/80 dark:hover:bg-slate-700/80"
                }`}
              >
                <MoreVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              {showMenu && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className={`absolute right-0 z-100 w-48 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-700/80 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)] animate-in fade-in zoom-in-95 duration-200 ${
                    menuPosition === "up"
                      ? "bottom-10 slide-in-from-bottom-2 origin-bottom-right"
                      : "top-10 slide-in-from-top-2 origin-top-right"
                  }`}
                >
                  <FileContextMenu
                    item={item}
                    itemType={itemType}
                    folderId={folderId}
                    onClose={() => setShowMenu(false)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Full screen viewer for images and PDFs */}
      {showViewer && file && (
        <FullScreenViewer
          storageId={file.storageId}
          name={file.name}
          type={file.type}
          onClose={() => setShowViewer(false)}
        />
      )}

      {/* Master PIN Verification Modal for Opening Locked Items */}
      <VerifyPinModal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        onSuccess={() => {
          setShowPinModal(false);
          proceedToOpen();
        }}
        title={`Unlock ${itemType === "file" ? "File" : "Document"}`}
        description={`Enter your Master PIN to safely open this locked ${itemType}.`}
      />
    </>
  );
}

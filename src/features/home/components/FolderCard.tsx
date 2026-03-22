// src/features/home/components/FolderCard.tsx
import { useState, useRef, useEffect } from "react";
import { Star, Lock, MoreVertical, FolderOpen } from "lucide-react";
import type { DecryptedFolder } from "../HomePage";
import FolderContextMenu from "./FolderContextMenu";
import VerifyPinModal from "@/components/common/VerifyPinModal";

interface FolderCardProps {
  folder: DecryptedFolder;
  onClick: () => void;
}

export default function FolderCard({ folder, onClick }: FolderCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState<"down" | "up">("down");
  const [showPinModal, setShowPinModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle Folder Opening
  const handleCardClick = () => {
    if (folder.isLocked) {
      setShowPinModal(true);
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

  // Handle Right Click (Custom Context Menu)
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    calculateMenuPosition(e);
    setShowMenu(true);
  };

  // Close menu on outside click
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
        className={`group relative flex flex-col rounded-[1.5rem] border border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-visible ${showMenu ? "z-50!" : "z-10"}`}
      >
        {/* Subtle Dynamic Background Glow (Aura) */}
        <div className="absolute inset-0 rounded-[1.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden z-0">
          <div
            className="absolute -top-10 -right-10 w-32 h-32 blur-2xl rounded-full transition-all duration-500"
            style={{ backgroundColor: folder.color, opacity: 0.15 }}
          />
        </div>

        {/* Premium Glowing Top Strip */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-0.75 rounded-b-full opacity-60 group-hover:opacity-100 group-hover:w-[85%] transition-all duration-500 z-10"
          style={{
            backgroundColor: folder.color,
            boxShadow: `0 2px 12px ${folder.color}90`,
          }}
        />

        <div className="flex flex-col gap-4 p-5 relative z-10">
          {/* Header: Icon & Actions */}
          <div className="flex items-start justify-between gap-2">
            {/* Animated Icon Box (Added shrink-0 so it NEVER squishes) */}
            <div
              className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6 shadow-sm relative"
              style={{
                backgroundColor: folder.color + "15",
                border: `1px solid ${folder.color}30`,
              }}
            >
              <FolderOpen
                className="w-5 h-5 sm:w-6 sm:h-6 transition-colors duration-500"
                style={{ color: folder.color }}
                strokeWidth={1.5}
              />
            </div>

            {/* Badges & Menu Container (Responsive sizing & gap) */}
            <div className="flex items-center justify-end gap-1 sm:gap-1.5 flex-wrap">
              {/* Status Badges */}
              {folder.isStarred && (
                <div
                  className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-slate-100/60 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm opacity-90 group-hover:opacity-100 transition-opacity"
                  title="Starred"
                >
                  <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400 text-amber-400 drop-shadow-sm" />
                </div>
              )}

              {folder.isLocked && (
                <div
                  className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-slate-100/60 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm opacity-90 group-hover:opacity-100 transition-opacity"
                  title="Locked"
                >
                  <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 dark:text-slate-400" />
                </div>
              )}

              {/* Context Menu 3-Dots Button */}
              <div ref={menuRef} className="relative">
                <button
                  onClick={toggleMenu}
                  className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-xl border transition-all shadow-sm opacity-90 group-hover:opacity-100 ${
                    showMenu
                      ? "bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                      : "bg-slate-100/60 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-700/60 text-slate-500 dark:text-slate-400 hover:bg-slate-200/80 dark:hover:bg-slate-700/80"
                  }`}
                >
                  <MoreVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>

                {/* Dropdown Menu Wrapper - Intelligent Positioning */}
                {showMenu && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className={`absolute right-0 z-50 w-44 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-700/80 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)] animate-in fade-in zoom-in-95 duration-200 ${
                      menuPosition === "up"
                        ? "bottom-10 slide-in-from-bottom-2 origin-bottom-right"
                        : "top-10 slide-in-from-top-2 origin-top-right"
                    }`}
                  >
                    <FolderContextMenu
                      folder={folder}
                      onClose={() => setShowMenu(false)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content: Name & Date */}
          <div className="mt-1 flex flex-col gap-1.5">
            <h3 className="font-semibold text-[15px] text-slate-900 dark:text-white truncate tracking-tight transition-colors">
              {folder.name}
            </h3>
            <p className="text-[12px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-2">
              <span
                className="w-1.5 h-1.5 rounded-full shadow-sm"
                style={{ backgroundColor: folder.color }}
              />
              {new Date(folder.updatedAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Verify PIN Modal when trying to open a locked folder */}
      <VerifyPinModal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        onSuccess={() => {
          setShowPinModal(false);
          onClick();
        }}
        title="Vault Locked"
        description="Enter your Master PIN to open this encrypted folder."
      />
    </>
  );
}

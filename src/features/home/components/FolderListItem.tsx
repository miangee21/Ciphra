// src/features/home/components/FolderListItem.tsx
import { useState, useRef, useEffect } from "react";
import type { DecryptedFolder } from "../HomePage";
import FolderContextMenu from "./FolderContextMenu";
import VerifyPinModal from "@/components/common/VerifyPinModal";
import {
  Star,
  Lock,
  MoreVertical,
  FolderOpen,
  ChevronRight,
} from "lucide-react";

interface FolderListItemProps {
  folder: DecryptedFolder;
  onClick: () => void;
}

export default function FolderListItem({
  folder,
  onClick,
}: FolderListItemProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState<"down" | "up">("down");
  const [showPinModal, setShowPinModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle Folder Opening
  const handleItemClick = () => {
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
        onClick={handleItemClick}
        onContextMenu={handleContextMenu}
        className={`group relative flex items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl hover:shadow-[0_4px_20px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_4px_20px_rgb(0,0,0,0.15)] hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 cursor-pointer ${
          showMenu ? "z-50!" : "z-10"
        }`}
      >
        {/* Left Glowing Accent Strip */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-[40%] rounded-r-full opacity-60 group-hover:opacity-100 group-hover:h-[70%] transition-all duration-500 z-10"
          style={{
            backgroundColor: folder.color,
            boxShadow: `2px 0 8px ${folder.color}80`,
          }}
        />

        {/* Left Side: Icon & Info */}
        <div className="flex items-center gap-3.5 pl-2 overflow-hidden">
          {/* Animated Icon Box */}
          <div
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-6"
            style={{
              backgroundColor: folder.color + "15",
              border: `1px solid ${folder.color}30`,
            }}
          >
            <FolderOpen
              className="w-5 h-5 sm:w-5 sm:h-5 transition-colors duration-500"
              style={{ color: folder.color }}
              strokeWidth={1.5}
            />
          </div>

          {/* Name & Date */}
          <div className="flex flex-col truncate pr-2">
            <h3 className="font-semibold text-[14px] sm:text-[15px] text-slate-900 dark:text-white truncate tracking-tight">
              {folder.name}
            </h3>
            <p className="text-[11px] sm:text-[12px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1.5 mt-0.5">
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

        {/* Right Side: Badges & Menu */}
        <div className="flex items-center gap-1.5 shrink-0 pl-2">
          {/* Status Badges */}
          {folder.isStarred && (
            <div
              className="flex items-center justify-center w-8 h-8 bg-slate-100/60 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm opacity-90 group-hover:opacity-100 transition-opacity"
              title="Starred"
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 drop-shadow-sm" />
            </div>
          )}

          {folder.isLocked && (
            <div
              className="flex items-center justify-center w-8 h-8 bg-slate-100/60 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm opacity-90 group-hover:opacity-100 transition-opacity"
              title="Locked"
            >
              <Lock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            </div>
          )}

          {/* Context Menu 3-Dots Button */}
          <div ref={menuRef} className="relative ml-0.5 sm:ml-1">
            <button
              onClick={toggleMenu}
              className={`w-8 h-8 flex items-center justify-center rounded-xl border transition-all shadow-sm opacity-90 group-hover:opacity-100 ${
                showMenu
                  ? "bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                  : "bg-slate-100/60 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-700/60 text-slate-500 dark:text-slate-400 hover:bg-slate-200/80 dark:hover:bg-slate-700/80"
              }`}
            >
              <MoreVertical className="w-4 h-4" />
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

          {/* Subtle Chevron indicator for entering folder */}
          <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 dark:group-hover:text-sky-400 transition-colors ml-1 hidden sm:block" />
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

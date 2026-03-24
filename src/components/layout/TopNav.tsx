//src/components/layout/TopNav.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSessionStore } from "@/store/sessionStore";
import { useThemeStore } from "@/store/themeStore";
import { useLockStore } from "@/store/lockStore";
import { ramStore } from "@/lib/storage/ram";
import { clearPinStorage } from "@/lib/storage/pinStorage";
import icon from "@/assets/icon.png";
import LogoutModal from "./LogoutModal";
import {
  Search,
  Trash2,
  Settings,
  Lock,
  Moon,
  Sun,
  LogOut,
} from "lucide-react";

interface TopNavProps {
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  showSearch?: boolean;
}

export default function TopNav({
  searchQuery = "",
  onSearchChange,
  showSearch = true,
}: TopNavProps) {
  const navigate = useNavigate();
  const { username, clearSession } = useSessionStore();
  const { mode, toggleMode } = useThemeStore();
  const { isLockEnabled, setLocked } = useLockStore();

  // New State for Modal
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLock = () => {
    if (isLockEnabled) setLocked(true);
  };

  // This will only be called when user confirms in the modal
  const handleLogoutConfirm = () => {
    ramStore.clearKey();
    clearPinStorage();
    clearSession();
    window.location.href = "/login";
  };

  const initial = username?.charAt(0).toUpperCase() ?? "?";

  // ── Keyboard Shortcuts ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Lock: Ctrl + L
      if (e.ctrlKey && e.key.toLowerCase() === "l") {
        e.preventDefault();
        if (isLockEnabled) setLocked(true);
      }
      // Theme: Ctrl + T
      if (e.ctrlKey && e.key.toLowerCase() === "t") {
        e.preventDefault();
        toggleMode();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLockEnabled, setLocked, toggleMode]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl transition-colors">
      <div className="max-w-350 mx-auto px-3 sm:px-6 h-14 flex items-center justify-between relative gap-2 sm:gap-4">
        {/* Left: Logo */}
        <button
          onClick={() => navigate("/home")}
          className="flex items-center gap-2.5 shrink-0 z-10 outline-none rounded-lg focus-visible:ring-2 focus-visible:ring-indigo-500/50"
        >
          <img
            src={icon}
            alt="Ciphra"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-[10px] shadow-sm"
          />
          <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base tracking-tight block">
            Ciphra
          </span>
        </button>

        {/* Center: Search bar (Absolute Centered for Desktop) */}
        {showSearch && (
          <div className="hidden md:block absolute left-1/2 -translate-x-1/2 w-full max-w-[320px] z-10">
            <div className="relative group/search">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/search:text-indigo-500 dark:group-focus-within/search:text-sky-400 transition-colors" />
              <input
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                placeholder="Search vault..."
                className="w-full pl-9 pr-4 py-1.5 text-sm rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-transparent focus:border-indigo-500/50 dark:focus:border-sky-500/50 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-sky-500/10 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all shadow-inner dark:shadow-none"
              />
            </div>
          </div>
        )}

        {/* Center: Search bar (Flex for Mobile < 768px to prevent overlap) */}
        {showSearch && (
          <div className="flex-1 w-full max-w-60 md:hidden mx-auto z-10">
            <div className="relative group/search">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within/search:text-indigo-500 dark:group-focus-within/search:text-sky-400 transition-colors" />
              <input
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                placeholder="Search..."
                className="w-full pl-8 pr-3 py-1.5 text-[13px] rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-transparent focus:border-indigo-500/50 dark:focus:border-sky-500/50 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500/10 dark:focus:ring-sky-500/10 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all"
              />
            </div>
          </div>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 z-10">
          {/* Theme toggle */}
          <button
            onClick={toggleMode}
            title="Toggle Theme (Ctrl+T)"
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl text-slate-500 hover:text-indigo-600 dark:hover:text-sky-400 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-all"
          >
            {mode === "light" ? (
              <Moon className="w-4.5 h-4.5" />
            ) : (
              <Sun className="w-4.5 h-4.5" />
            )}
          </button>

          {/* Lock button */}
          {isLockEnabled && (
            <button
              onClick={handleLock}
              title="Lock Vault (Ctrl+L)"
              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl text-slate-500 hover:text-indigo-600 dark:hover:text-sky-400 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-all"
            >
              <Lock className="w-4.5 h-4.5" />
            </button>
          )}

          {/* Recycle bin */}
          <button
            onClick={() => navigate("/recycle")}
            title="Recycle Bin"
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl text-slate-500 hover:text-indigo-600 dark:hover:text-sky-400 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-all sm:flex"
          >
            <Trash2 className="w-4.5 h-4.5" />
          </button>

          {/* Settings */}
          <button
            onClick={() => navigate("/settings")}
            title="Settings"
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl text-slate-500 hover:text-indigo-600 dark:hover:text-sky-400 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-all"
          >
            <Settings className="w-4.5 h-4.5]" />
          </button>

          {/* Avatar Dropdown */}
          <div className="relative group/avatar ml-1 sm:ml-2">
            <button className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-50 dark:bg-sky-500/10 flex items-center justify-center text-indigo-600 dark:text-sky-400 font-bold text-sm ring-2 ring-transparent group-hover/avatar:ring-indigo-500/20 dark:group-hover/avatar:ring-sky-500/20 transition-all">
              {initial}
            </button>

            <div className="absolute right-0 top-[calc(100%+8px)] w-48 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] opacity-0 invisible group-hover/avatar:opacity-100 group-hover/avatar:visible group-hover/avatar:translate-y-0 translate-y-2 transition-all duration-300 origin-top-right z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/50">
                <p className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                  Signed in as
                </p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate mt-0.5">
                  @{username}
                </p>
              </div>
              <div className="p-1.5">
                <button
                  onClick={() => setIsLogoutModalOpen(true)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Render the confirmation modal */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogoutConfirm}
      />
    </header>
  );
}

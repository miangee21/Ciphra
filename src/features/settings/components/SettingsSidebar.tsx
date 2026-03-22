// src/features/settings/components/SettingsSidebar.tsx
import { useState, useEffect } from "react";
import {
  Palette,
  Shield,
  HardDrive,
  Database,
  ArrowLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

export type Tab = "appearance" | "security" | "storage" | "data";

interface SettingsSidebarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  onBack: () => void;
}

const TABS = [
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "security", label: "Security", icon: Shield },
  { id: "storage", label: "Storage", icon: HardDrive },
  { id: "data", label: "Data", icon: Database },
] as const;

export default function SettingsSidebar({
  activeTab,
  onTabChange,
  onBack,
}: SettingsSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Auto-collapse sidebar on small screens
  useEffect(() => {
    const handleResize = () => {
      setIsCollapsed(window.innerWidth < 800);
    };

    // Set initial state
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className={`shrink-0 flex flex-col gap-6 md:gap-8 transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-16 md:w-20" : "w-56 md:w-64 lg:w-72"
      }`}
    >
      {/* Header (Back Button, Title & Toggle) */}
      <div
        className={`flex items-center transition-all duration-300 ${
          isCollapsed ? "flex-col justify-center gap-4" : "justify-between px-2"
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 shrink-0 flex items-center justify-center rounded-2xl bg-white/60 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800/80 shadow-sm transition-all text-slate-500 hover:text-slate-900 dark:hover:text-white"
            title="Back to Home"
          >
            <ArrowLeft size={18} />
          </button>
          {!isCollapsed && (
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight whitespace-nowrap overflow-hidden transition-all duration-300">
              Settings
            </h1>
          )}
        </div>

        {/* Collapse/Expand Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-8 h-8 shrink-0 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors"
          title={isCollapsed ? "Expand Menu" : "Collapse Menu"}
        >
          {isCollapsed ? (
            <PanelLeftOpen size={18} />
          ) : (
            <PanelLeftClose size={18} />
          )}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex flex-col gap-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              title={isCollapsed ? tab.label : undefined}
              className={`group relative flex items-center w-full rounded-2xl transition-all duration-300 ${
                isCollapsed
                  ? "justify-center px-0 py-3 md:py-3.5"
                  : "justify-between px-3 md:px-4 py-3 md:py-3.5"
              } ${
                isActive
                  ? "bg-white dark:bg-slate-800/80 shadow-sm border border-slate-200/80 dark:border-slate-700/50"
                  : "hover:bg-slate-200/50 dark:hover:bg-slate-800/40 border border-transparent"
              }`}
            >
              <div className="flex items-center gap-3.5">
                {/* Icon Container */}
                <div
                  className={`w-8 h-8 shrink-0 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                      : "bg-transparent text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                  }`}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                </div>

                {/* Label (Hides when collapsed) */}
                {!isCollapsed && (
                  <span
                    className={`text-sm whitespace-nowrap overflow-hidden transition-colors duration-300 ${
                      isActive
                        ? "font-semibold text-slate-900 dark:text-white"
                        : "font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200"
                    }`}
                  >
                    {tab.label}
                  </span>
                )}
              </div>

              {/* Active Indicator Arrow (Hides when collapsed) */}
              {!isCollapsed && isActive && (
                <ChevronRight
                  size={16}
                  className="text-slate-300 dark:text-slate-600 shrink-0"
                />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

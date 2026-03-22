// src/features/settings/SettingsPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TopNav from "@/components/layout/TopNav";
import AppLockSettings from "../lock/components/AppLockSettings";
import SettingsSidebar, { Tab } from "./components/SettingsSidebar";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("security");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col relative overflow-hidden">
      {/* Premium Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-125 h-125 bg-indigo-500/10 dark:bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-100 h-100 bg-purple-500/10 dark:bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />

      <TopNav showSearch={false} />

      {/* Always row layout to keep sidebar on the left even on mobile */}
      <main className="flex-1 w-full max-w-350 mx-auto px-2 md:px-8 py-4 md:py-6 flex flex-row gap-3 md:gap-10 z-10">
        {/* Sidebar (Left Column) */}
        <SettingsSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onBack={() => navigate("/home")}
        />

        {/* Main Content Area (Right Column) */}
        <div className="flex-1 min-w-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-2xl md:rounded-3xl p-5 md:p-10 shadow-sm min-h-125 relative overflow-hidden flex flex-col transition-all">
          {/* Subtle inner top glow for depth */}
          <div className="absolute top-0 left-0 w-full h-32 bg-linear-to-b from-indigo-500/5 to-transparent pointer-events-none" />

          <div className="relative z-10 flex flex-col h-full">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 capitalize tracking-tight">
              {activeTab} Settings
            </h2>

            <div className="flex-1">
              {activeTab === "appearance" && (
                <div className="flex items-center justify-center h-full min-h-100 text-slate-500 text-sm font-medium">
                  Appearance settings coming soon...
                </div>
              )}

              {activeTab === "security" && <AppLockSettings />}

              {activeTab === "storage" && (
                <div className="flex items-center justify-center h-full min-h-100 text-slate-500 text-sm font-medium">
                  Storage settings coming soon...
                </div>
              )}

              {activeTab === "data" && (
                <div className="flex items-center justify-center h-full min-h-100 text-slate-500 text-sm font-medium">
                  Data settings coming soon...
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

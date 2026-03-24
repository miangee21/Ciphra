// src/features/editor/components/ToolbarHelpers.tsx
import React from "react";

export function ToolbarGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-0.5 shrink-0">{children}</div>;
}

export function Divider() {
  return (
    <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-0.5 sm:mx-1 shrink-0" />
  );
}

export function ToolBtn({
  children,
  onClick,
  active = false,
  disabled = false,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      onClick={() => {
        console.log(`🔘 Action Triggered: ${title}`);
        onClick();
      }}
      onMouseDown={(e) => e.preventDefault()}
      disabled={disabled}
      title={title}
      className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${active ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-sky-400 shadow-sm" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"} disabled:opacity-30 disabled:cursor-not-allowed shrink-0`}
    >
      {children}
    </button>
  );
}

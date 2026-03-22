// src/features/folder/components/FileFilter.tsx
import type { FileFilterType } from "../FolderPage";
import {
  LayoutGrid,
  Image as ImageIcon,
  FileText,
  FileCode,
} from "lucide-react";

interface FileFilterProps {
  active: FileFilterType;
  onChange: (filter: FileFilterType) => void;
}

const FILTERS: {
  id: FileFilterType;
  label: string;
  icon: React.ElementType;
}[] = [
  { id: "all", label: "All", icon: LayoutGrid },
  { id: "image", label: "Images", icon: ImageIcon },
  { id: "pdf", label: "PDFs", icon: FileText },
  { id: "document", label: "Docs", icon: FileCode },
];

export default function FileFilter({ active, onChange }: FileFilterProps) {
  return (
    <div className="relative flex items-center p-1.5 rounded-[18px] bg-slate-100/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50 backdrop-blur-md shadow-inner w-fit overflow-hidden">
      {FILTERS.map((f) => {
        const Icon = f.icon;
        const isActive = active === f.id;

        return (
          <button
            key={f.id}
            onClick={() => onChange(f.id)}
            className={`
              relative flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-all duration-300 z-10
              ${
                isActive
                  ? "text-indigo-600 dark:text-sky-400"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }
            `}
          >
            {/* Background Pill for Active State (Animated) */}
            {isActive && (
              <div className="absolute inset-0 bg-white dark:bg-slate-900 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] border border-slate-200/50 dark:border-slate-700/50 animate-in fade-in zoom-in-95 duration-300 -z-10" />
            )}

            <Icon
              className={`w-3.5 h-3.5 transition-transform duration-300 ${isActive ? "scale-110" : "opacity-70"}`}
            />
            <span className="tracking-tight">{f.label}</span>
          </button>
        );
      })}
    </div>
  );
}

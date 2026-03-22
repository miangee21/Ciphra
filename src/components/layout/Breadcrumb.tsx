// src/components/layout/Breadcrumb.tsx
import { ChevronRight, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ElementType;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  const navigate = useNavigate();

  return (
    <nav className="flex items-center gap-1.5 p-1.5 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 rounded-2xl w-fit shadow-sm">
      {items.map((item, i) => {
        const isHome = item.label.toLowerCase() === "home";
        const Icon = item.icon || (isHome ? Home : null);

        return (
          <div key={i} className="flex items-center gap-1.5">
            {/* Divider */}
            {i > 0 && (
              <ChevronRight
                className="w-3.5 h-3.5 text-slate-400/70"
                strokeWidth={2.5}
              />
            )}

            {/* Clickable Link (Previous Paths) */}
            {item.href ? (
              <button
                onClick={() => navigate(item.href!)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[13px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all duration-200 active:scale-95"
              >
                {Icon && <Icon className="w-3.5 h-3.5" strokeWidth={2.5} />}
                {item.label}
              </button>
            ) : (
              /* Active Current Page (Highlight) */
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200/60 dark:border-slate-700/60 text-[13px] font-bold text-indigo-600 dark:text-sky-400">
                {Icon && <Icon className="w-3.5 h-3.5" strokeWidth={2.5} />}
                <span className="truncate max-w-37.5">{item.label}</span>
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

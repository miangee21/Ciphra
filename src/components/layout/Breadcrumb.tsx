//src/components/layout/Breadcrumb.tsx
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  const navigate = useNavigate();

  return (
    <nav className="flex items-center gap-1">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1">
          {i > 0 && (
            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
          )}
          {item.href ? (
            <button
              onClick={() => navigate(item.href!)}
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {item.label}
            </button>
          ) : (
            <span className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-32">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}

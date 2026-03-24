// src/features/editor/components/FontSizeDropdown.tsx
import { useState, useRef, useEffect } from "react";
import type { Editor } from "@tiptap/react";
import { ChevronDown } from "lucide-react";

interface FontSizeDropdownProps {
  editor: Editor | null;
}

export default function FontSizeDropdown({ editor }: FontSizeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative flex items-center shrink-0" ref={dropdownRef}>
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center gap-1 w-14 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
        title="Font Size"
      >
        <span className="w-[3ch] text-center">
          {editor?.getAttributes("textStyle")?.fontSize?.replace("px", "") ||
            "16"}
        </span>
        <ChevronDown
          className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden z-50 py-1.5 animate-in fade-in slide-in-from-top-1 duration-150 max-h-48 overflow-y-auto custom-content-scroll">
          {["12", "14", "16", "18", "20", "24", "28", "32", "36"].map(
            (size, idx) => {
              const isActive =
                editor?.getAttributes("textStyle")?.fontSize === `${size}px` ||
                (!editor?.getAttributes("textStyle")?.fontSize &&
                  size === "16");
              return (
                <button
                  key={idx}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    editor
                      ?.chain()
                      .focus()
                      .setMark("textStyle", { fontSize: `${size}px` })
                      .run();
                    setIsOpen(false);
                  }}
                  className={`w-full text-center px-2 py-1.5 text-[13px] transition-colors ${isActive ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-sky-400 font-bold" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                >
                  {size}
                </button>
              );
            },
          )}
        </div>
      )}
    </div>
  );
}

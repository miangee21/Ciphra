// src/features/editor/components/AlignDropdown.tsx
import { useState, useRef, useEffect } from "react";
import type { Editor } from "@tiptap/react";
import { AlignLeft, AlignCenter, AlignRight } from "lucide-react";

interface AlignDropdownProps {
  editor: Editor | null;
}

export default function AlignDropdown({ editor }: AlignDropdownProps) {
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
    <div className="relative flex items-center" ref={dropdownRef}>
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
        title="Text Alignment"
      >
        {editor?.isActive({ textAlign: "center" }) ? (
          <AlignCenter className="w-4 h-4" />
        ) : editor?.isActive({ textAlign: "right" }) ? (
          <AlignRight className="w-4 h-4" />
        ) : (
          <AlignLeft className="w-4 h-4" />
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden z-50 py-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
          {[
            {
              label: "Left",
              icon: <AlignLeft className="w-4 h-4" />,
              action: () => editor?.chain().focus().setTextAlign("left").run(),
              active: editor?.isActive({ textAlign: "left" }),
            },
            {
              label: "Center",
              icon: <AlignCenter className="w-4 h-4" />,
              action: () =>
                editor?.chain().focus().setTextAlign("center").run(),
              active: editor?.isActive({ textAlign: "center" }),
            },
            {
              label: "Right",
              icon: <AlignRight className="w-4 h-4" />,
              action: () => editor?.chain().focus().setTextAlign("right").run(),
              active: editor?.isActive({ textAlign: "right" }),
            },
          ].map((item, idx) => (
            <button
              key={idx}
              onMouseDown={(e) => {
                e.preventDefault();
                item.action();
                setIsOpen(false);
              }}
              className={`flex items-center gap-3 w-full text-left px-3 py-2 text-[13px] transition-colors ${item.active ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-sky-400 font-bold" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

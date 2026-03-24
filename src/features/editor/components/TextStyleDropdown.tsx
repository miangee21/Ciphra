// src/features/editor/components/TextStyleDropdown.tsx
import { useState, useRef, useEffect } from "react";
import type { Editor } from "@tiptap/react";
import { ChevronDown } from "lucide-react";

interface TextStyleDropdownProps {
  editor: Editor | null;
}

export default function TextStyleDropdown({ editor }: TextStyleDropdownProps) {
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

  const getCurrentTextStyle = () => {
    if (editor?.isActive("heading", { level: 1 })) return "Title (H1)";
    if (editor?.isActive("heading", { level: 2 })) return "Heading 2";
    if (editor?.isActive("heading", { level: 3 })) return "Heading 3";
    if (editor?.isActive("heading", { level: 4 })) return "Heading 4";
    if (editor?.isActive("heading", { level: 5 })) return "Heading 5";
    if (editor?.isActive("heading", { level: 6 })) return "Heading 6";
    return "Normal Text";
  };

  return (
    <div className="relative flex items-center" ref={dropdownRef}>
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
        title="Text Style"
      >
        <span className="w-21.25 text-left truncate">
          {getCurrentTextStyle()}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden z-50 py-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
          {[
            {
              label: "Normal Text",
              action: () => editor?.chain().focus().setParagraph().run(),
              active: editor?.isActive("paragraph"),
            },
            {
              label: "Title (H1)",
              action: () =>
                editor?.chain().focus().toggleHeading({ level: 1 }).run(),
              active: editor?.isActive("heading", { level: 1 }),
            },
            {
              label: "Heading 2",
              action: () =>
                editor?.chain().focus().toggleHeading({ level: 2 }).run(),
              active: editor?.isActive("heading", { level: 2 }),
            },
            {
              label: "Heading 3",
              action: () =>
                editor?.chain().focus().toggleHeading({ level: 3 }).run(),
              active: editor?.isActive("heading", { level: 3 }),
            },
            {
              label: "Heading 4",
              action: () =>
                editor?.chain().focus().toggleHeading({ level: 4 }).run(),
              active: editor?.isActive("heading", { level: 4 }),
            },
            {
              label: "Heading 5",
              action: () =>
                editor?.chain().focus().toggleHeading({ level: 5 }).run(),
              active: editor?.isActive("heading", { level: 5 }),
            },
            {
              label: "Heading 6",
              action: () =>
                editor?.chain().focus().toggleHeading({ level: 6 }).run(),
              active: editor?.isActive("heading", { level: 6 }),
            },
          ].map((item, idx) => (
            <button
              key={idx}
              onMouseDown={(e) => {
                e.preventDefault();
                item.action();
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-[13px] transition-colors ${item.active ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-sky-400 font-bold" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

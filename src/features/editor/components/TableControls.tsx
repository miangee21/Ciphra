// src/features/editor/components/TableControls.tsx
import { useState, useRef, useEffect } from "react";
import type { Editor } from "@tiptap/react";
import { 
  Table as TableIcon, Trash2, 
  ArrowUpToLine, ArrowDownToLine, 
  ArrowLeftToLine, ArrowRightToLine, 
  Trash, Columns, Rows
} from "lucide-react";

interface TableControlsProps {
  editor: Editor | null;
  disabled: boolean;
}

export default function TableControls({ editor, disabled }: TableControlsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const menuRef = useRef<HTMLDivElement>(null);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  if (!editor) return null;

  const isTableActive = editor.isActive('table');

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
    setIsOpen(false);
  };

  return (
    <div className="relative flex items-center shrink-0" ref={menuRef}>
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
          isTableActive 
            ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-sky-400 shadow-sm" 
            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
        } disabled:opacity-30 disabled:cursor-not-allowed shrink-0`}
        title="Table Controls"
      >
        <TableIcon className="w-4 h-4" />
      </button>

      {isOpen && !disabled && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden z-50 p-2 animate-in fade-in slide-in-from-top-1 duration-150">
          
          {/* ── SCENARIO A: CREATE NEW TABLE ── */}
          {!isTableActive ? (
            <div className="flex flex-col gap-2 p-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Insert Table
              </span>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><Rows className="w-3 h-3"/> Rows</label>
                  <input 
                    type="number" min="1" max="100" value={rows} onChange={(e) => setRows(Number(e.target.value))}
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 text-xs outline-none text-slate-700 dark:text-slate-300"
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><Columns className="w-3 h-3"/> Cols</label>
                  <input 
                    type="number" min="1" max="20" value={cols} onChange={(e) => setCols(Number(e.target.value))}
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 text-xs outline-none text-slate-700 dark:text-slate-300"
                  />
                </div>
              </div>
              <button 
                onClick={insertTable}
                className="mt-2 w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors"
              >
                Create {rows}x{cols} Table
              </button>
            </div>
          ) : (
            
          /* ── SCENARIO B: EDIT EXISTING TABLE ── */
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 px-1">
                Edit Table
              </span>
              
              <div className="grid grid-cols-2 gap-1 mb-1">
                <button onClick={() => { editor.chain().focus().addRowBefore().run(); setIsOpen(false); }} className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors">
                  <ArrowUpToLine className="w-3.5 h-3.5 text-indigo-500" /> Row Above
                </button>
                <button onClick={() => { editor.chain().focus().addRowAfter().run(); setIsOpen(false); }} className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors">
                  <ArrowDownToLine className="w-3.5 h-3.5 text-indigo-500" /> Row Below
                </button>
                <button onClick={() => { editor.chain().focus().addColumnBefore().run(); setIsOpen(false); }} className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors">
                  <ArrowLeftToLine className="w-3.5 h-3.5 text-indigo-500" /> Col Left
                </button>
                <button onClick={() => { editor.chain().focus().addColumnAfter().run(); setIsOpen(false); }} className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors">
                  <ArrowRightToLine className="w-3.5 h-3.5 text-indigo-500" /> Col Right
                </button>
              </div>

              <div className="h-px bg-slate-200 dark:bg-slate-700 my-1 mx-1" />

              <button onClick={() => { editor.chain().focus().deleteRow().run(); setIsOpen(false); }} className="flex items-center gap-2 px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-xs font-semibold text-red-600 dark:text-red-400 transition-colors">
                <Trash className="w-3.5 h-3.5" /> Delete Row
              </button>
              <button onClick={() => { editor.chain().focus().deleteColumn().run(); setIsOpen(false); }} className="flex items-center gap-2 px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-xs font-semibold text-red-600 dark:text-red-400 transition-colors">
                <Trash className="w-3.5 h-3.5" /> Delete Column
              </button>
              <button onClick={() => { editor.chain().focus().deleteTable().run(); setIsOpen(false); }} className="flex items-center gap-2 px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-xs font-bold text-red-600 dark:text-red-500 transition-colors mt-1 bg-red-50 dark:bg-red-500/5">
                <Trash2 className="w-3.5 h-3.5" /> Delete Entire Table
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
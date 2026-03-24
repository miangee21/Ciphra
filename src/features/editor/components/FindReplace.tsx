// src/features/editor/components/FindReplace.tsx
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  Replace as ReplaceIcon,
  X,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

interface FindReplaceProps {
  editor: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function FindReplace({
  editor,
  isOpen,
  onClose,
}: FindReplaceProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [replaceTerm, setReplaceTerm] = useState("");
  const [results, setResults] = useState<{ from: number; to: number }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // ── THE MAGIC "CLICK OUTSIDE TO CLOSE" ──
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  // ── SCROLL & HIGHLIGHT (STABLE FOCUS) ──
  const focusResult = useCallback(
    (result: { from: number; to: number }) => {
      if (!editor) return;
      editor
        .chain()
        .focus()
        .setTextSelection({ from: result.from, to: result.to })
        .scrollIntoView()
        .run();
    },
    [editor],
  );

  // ── CORE SEARCH LOGIC ──
  const performSearch = useCallback(
    (term: string) => {
      if (!editor || !term.trim()) {
        setResults([]);
        setCurrentIndex(-1);
        return;
      }

      const newResults: { from: number; to: number }[] = [];
      const lowerTerm = term.toLowerCase();

      editor.state.doc.descendants((node: any, pos: number) => {
        if (node.isText && node.text) {
          const text = node.text.toLowerCase();
          let startIndex = 0;
          while (startIndex < text.length) {
            const index = text.indexOf(lowerTerm, startIndex);
            if (index === -1) break;
            newResults.push({
              from: pos + index,
              to: pos + index + term.length,
            });
            startIndex = index + term.length;
          }
        }
      });

      setResults(newResults);
      setCurrentIndex(-1);
    },
    [editor],
  );

  useEffect(() => {
    performSearch(searchTerm);
  }, [searchTerm, performSearch]);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setReplaceTerm("");
    } else {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const nextResult = useCallback(() => {
    if (results.length === 0) return;
    const nextIdx =
      currentIndex === -1 ? 0 : (currentIndex + 1) % results.length;
    setCurrentIndex(nextIdx);
    focusResult(results[nextIdx]);
  }, [results, currentIndex, focusResult]);

  const prevResult = useCallback(() => {
    if (results.length === 0) return;
    const prevIdx =
      currentIndex === -1
        ? results.length - 1
        : (currentIndex - 1 + results.length) % results.length;
    setCurrentIndex(prevIdx);
    focusResult(results[prevIdx]);
  }, [results, currentIndex, focusResult]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "Enter" &&
        (e.target as HTMLElement)?.classList?.contains("ProseMirror")
      ) {
        e.preventDefault();
        e.stopPropagation();
        e.shiftKey ? prevResult() : nextResult();
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [isOpen, nextResult, prevResult]);

  // ── REPLACE LOGIC ──
  const handleReplace = () => {
    if (results.length === 0 || !editor) return;
    const activeIdx = currentIndex === -1 ? 0 : currentIndex;
    const result = results[activeIdx];

    editor
      .chain()
      .setTextSelection({ from: result.from, to: result.to })
      .insertContent(replaceTerm)
      .run();
    performSearch(searchTerm);
  };

  const handleReplaceAll = () => {
    if (results.length === 0 || !editor) return;

    const reversed = [...results].reverse();
    let chain = editor.chain();
    reversed.forEach((res) => {
      chain = chain
        .setTextSelection({ from: res.from, to: res.to })
        .insertContent(replaceTerm);
    });
    chain.run();

    performSearch(searchTerm);
  };

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className="absolute top-16 right-4 sm:right-8 w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-4 duration-200 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/50">
        <h3 className="text-[13px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Search className="w-3.5 h-3.5 text-indigo-500" /> Find & Replace
        </h3>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-3 flex flex-col gap-3">
        {/* ── FIND INPUT GROUP ── */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
            Find
          </label>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 focus-within:border-indigo-500 transition-colors">
            <input
              ref={searchInputRef}
              autoFocus
              type="text"
              placeholder="Search text..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.shiftKey ? prevResult() : nextResult();
                }
              }}
              className="flex-1 bg-transparent text-[13px] font-medium text-slate-900 dark:text-white outline-none placeholder:text-slate-400 min-w-0"
            />

            {searchTerm && (
              <div className="flex items-center gap-1 shrink-0 bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded-md shadow-sm border border-slate-200 dark:border-slate-600">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-300 min-w-[2ch] text-center">
                  {results.length > 0
                    ? currentIndex === -1
                      ? 0
                      : currentIndex + 1
                    : 0}
                  /{results.length}
                </span>
                <div className="w-px h-3 bg-slate-300 dark:bg-slate-500 mx-0.5" />
                <button
                  onClick={prevResult}
                  disabled={results.length === 0}
                  className="text-slate-400 hover:text-indigo-500 disabled:opacity-30 transition-colors p-0.5"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={nextResult}
                  disabled={results.length === 0}
                  className="text-slate-400 hover:text-indigo-500 disabled:opacity-30 transition-colors p-0.5"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── REPLACE INPUT GROUP ── */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
            Replace With
          </label>
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 focus-within:border-indigo-500 transition-colors">
            <ReplaceIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Replace text..."
              value={replaceTerm}
              onChange={(e) => setReplaceTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleReplace();
                }
              }}
              className="flex-1 bg-transparent text-[13px] font-medium text-slate-900 dark:text-white outline-none placeholder:text-slate-400 min-w-0"
            />
          </div>
        </div>

        {/* ── ACTION BUTTONS ── */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleReplace}
            disabled={results.length === 0 || !replaceTerm}
            className="flex-1 py-2 text-[12px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 shadow-sm"
          >
            Replace
          </button>
          <button
            onClick={handleReplaceAll}
            disabled={results.length === 0 || !replaceTerm}
            className="flex-1 py-2 text-[12px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors disabled:opacity-50 shadow-sm shadow-indigo-500/20"
          >
            Replace All
          </button>
        </div>
      </div>
    </div>
  );
}

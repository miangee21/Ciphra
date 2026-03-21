// src/features/auth/components/MnemonicInputGrid.tsx
import React, { useState, useRef } from "react";
import { Eye, EyeOff } from "lucide-react";

interface MnemonicInputGridProps {
  words: string[];
  updateWord: (index: number, value: string) => void;
  handlePaste: (text: string) => void;
  onSubmit: () => void;
  disabled: boolean;
}

export default function MnemonicInputGrid({
  words,
  updateWord,
  handlePaste,
  onSubmit,
  disabled,
}: MnemonicInputGridProps) {
  const [showWords, setShowWords] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Keyboard navigation (Tab, Enter, Backspace)
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      const next = inputRefs.current[index + 1];
      if (next) {
        next.focus();
      } else {
        onSubmit();
      }
    }

    if (e.key === "Backspace" && words[index] === "") {
      e.preventDefault();
      const prev = inputRefs.current[index - 1];
      if (prev) {
        prev.focus();
      }
    }
  };

  // Paste logic
  const onWordPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text");
    if (text.trim().split(/\s+/).length === 12) {
      e.preventDefault();
      handlePaste(text);
    }
  };

  return (
    <div className="w-full grid grid-cols-3 sm:grid-cols-4 gap-3">
      {words.map((word, index) => (
        <div key={index} className="relative">
          {/* Absolute Numbering */}
          <span className="absolute z-10 left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-[11px] font-mono select-none pointer-events-none">
            {(index + 1).toString().padStart(2, "0")}
          </span>

          {/* Glassmorphism Input */}
          <input
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type={showWords ? "text" : "password"}
            value={word}
            onChange={(e) => updateWord(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={index === 0 ? onWordPaste : undefined}
            disabled={disabled}
            className={`w-full bg-white/60 dark:bg-[#121215]/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl py-3.5 pl-9 ${
              index === 0 ? "pr-10" : "pr-3"
            } text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all font-mono backdrop-blur-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed`}
            placeholder="•••"
            autoComplete="off"
            spellCheck="false"
            autoFocus={index === 0}
          />

          {/* Show/Hide Eye Icon (Only on first input) */}
          {index === 0 && (
            <button
              onClick={() => setShowWords(!showWords)}
              type="button"
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              title={showWords ? "Hide words" : "Show words"}
            >
              {showWords ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

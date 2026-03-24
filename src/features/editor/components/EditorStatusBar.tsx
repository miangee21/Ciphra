import { CheckCircle2, Clock, AlertCircle, Loader2 } from "lucide-react";

type SaveStatus = "saving" | "saved" | "unsaved";

interface EditorStatusBarProps {
  wordCount: number;
  charCount: number;
  saveStatus: SaveStatus;
  isFocusMode: boolean;
}

export default function EditorStatusBar({
  wordCount,
  charCount,
  saveStatus,
  isFocusMode,
}: EditorStatusBarProps) {
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-30 h-8 flex items-center justify-between px-6 border-t transition-all duration-300 ${
        isFocusMode
          ? "bg-black/20 dark:bg-black/40 backdrop-blur-sm border-white/5"
          : "bg-white/90 dark:bg-[#0f1117]/90 backdrop-blur-xl border-slate-200 dark:border-slate-800"
      }`}
    >
      {/* Left — word + char count */}
      <div className="flex items-center gap-4">
        <StatusItem
          label="Words"
          value={wordCount.toLocaleString()}
          isFocusMode={isFocusMode}
        />
        <StatusItem
          label="Characters"
          value={charCount.toLocaleString()}
          isFocusMode={isFocusMode}
        />
        <StatusItem
          label="Read"
          value={`${readingTime} min`}
          isFocusMode={isFocusMode}
        />
      </div>

      {/* Right — save status */}
      <div className="flex items-center gap-1.5">
        {saveStatus === "saving" && (
          <>
            <Loader2
              className={`w-3 h-3 animate-spin ${
                isFocusMode
                  ? "text-white/40"
                  : "text-slate-400"
              }`}
            />
            <span
              className={`text-xs font-medium ${
                isFocusMode
                  ? "text-white/40"
                  : "text-slate-400"
              }`}
            >
              Saving...
            </span>
          </>
        )}

        {saveStatus === "saved" && (
          <>
            <CheckCircle2
              className={`w-3 h-3 ${
                isFocusMode
                  ? "text-white/50"
                  : "text-green-500"
              }`}
            />
            <span
              className={`text-xs font-medium ${
                isFocusMode
                  ? "text-white/50"
                  : "text-green-600 dark:text-green-400"
              }`}
            >
              Saved
            </span>
          </>
        )}

        {saveStatus === "unsaved" && (
          <>
            <AlertCircle
              className={`w-3 h-3 ${
                isFocusMode
                  ? "text-white/40"
                  : "text-amber-500"
              }`}
            />
            <span
              className={`text-xs font-medium ${
                isFocusMode
                  ? "text-white/40"
                  : "text-amber-600 dark:text-amber-400"
              }`}
            >
              Unsaved
            </span>
          </>
        )}
      </div>
    </div>
  );
}

// ── Reusable stat item ───────────────────────────────────
function StatusItem({
  label,
  value,
  isFocusMode,
}: {
  label: string;
  value: string;
  isFocusMode: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      <span
        className={`text-xs font-medium ${
          isFocusMode
            ? "text-white/30"
            : "text-slate-400 dark:text-slate-500"
        }`}
      >
        {label}:
      </span>
      <span
        className={`text-xs font-semibold ${
          isFocusMode
            ? "text-white/50"
            : "text-slate-600 dark:text-slate-300"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
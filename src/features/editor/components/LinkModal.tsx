// src/features/editor/components/LinkModal.tsx
import { createPortal } from "react-dom";

interface LinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  linkUrl: string;
  setLinkUrl: (val: string) => void;
  onApply: () => void;
}

export default function LinkModal({
  isOpen,
  onClose,
  linkUrl,
  setLinkUrl,
  onApply,
}: LinkModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-80 p-5 animate-in fade-in zoom-in-95 duration-200">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
          Insert Link
        </h3>
        <input
          autoFocus
          type="url"
          placeholder="https://example.com"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onApply();
            if (e.key === "Escape") onClose();
          }}
          className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 transition-colors mb-5 text-slate-900 dark:text-white"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onApply}
            className="px-4 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

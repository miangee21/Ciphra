// src/features/editor/EditorPage.tsx
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ramStore } from "@/lib/storage/ram";
import { decryptData, encryptData } from "@/lib/crypto/aes";
import TopNav from "@/components/layout/TopNav";
import TipTapEditor from "./components/TipTapEditor";
import EditorToolbar from "./components/EditorToolbar";
import EditorStatusBar from "./components/EditorStatusBar";
import FindReplace from "./components/FindReplace";
import ExportMenu from "./components/ExportMenu";
import { useFocusMode } from "./hooks/useFocusMode";
import type { Id } from "../../../convex/_generated/dataModel";

type SaveStatus = "saving" | "saved" | "unsaved";

export default function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const docId = id as Id<"documents">;

  const [docTitle, setDocTitle] = useState("");
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  
  // Modals States
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  // ── PREMIUM FEATURES STATES ──
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isReadOnly, setIsReadOnly] = useState(true); // Safe Mode Default!
  
  // Ye engine Toolbar ko TipTap se connect karega
  const [editorInstance, setEditorInstance] = useState<any>(null);

  const { isFocusMode, toggleFocusMode } = useFocusMode();
  const updateDocument = useMutation(api.documents.updateDocument);
  const rawDoc = useQuery(api.documents.getDocument, { id: docId });

  // ── Image Upload Logic Zinda Ho Gayi! ──
  const handleImageUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !editorInstance) return;
      
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        // MAGIC FIX: Canvas Compression to avoid Convex 1MB Limit!
        const img = new globalThis.Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          
          // MAGIC FIX: Extreme WebP Compression for E2E Encryption (Bypasses Convex 1MB limit)
          const MAX_WIDTH = 800; // Optimal width for documents
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Compress to WEBP (Super small size, keeps quality) with 0.6 quality
          const compressedBase64 = canvas.toDataURL("image/webp", 0.6);
          editorInstance.chain().focus().setImage({ src: compressedBase64 }).run();
        };
        img.src = readerEvent.target?.result as string;
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  useEffect(() => {
    if (!rawDoc) return;
    const key = ramStore.getKey();
    if (!key) return;
    const decrypt = async () => {
      try {
        const title = await decryptData(rawDoc.titleEncrypted, key);
        const content = await decryptData(rawDoc.contentEncrypted, key);
        setDocTitle(title);
        setDecryptedContent(content);
      } catch {
        navigate(-1);
      }
    };
    decrypt();
  }, [rawDoc, navigate]);

  const handleTitleSave = async () => {
    if (!docTitle.trim()) return;
    setIsEditingTitle(false);
    const key = ramStore.getKey();
    if (!key) return;
    try {
      const titleEncrypted = await encryptData(docTitle.trim(), key);
      await updateDocument({ id: docId, titleEncrypted });
    } catch {
      // ignore
    }
  };

  if (decryptedContent === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-[#0f1117]">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-white dark:bg-[#0B1120] overflow-hidden">
      
      {/* ── GLOBAL STYLES (SCROLLBAR & BULLETPROOF EDITOR UI) ── */}
      <style>{`
        .custom-content-scroll::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-content-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-content-scroll::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
        .dark .custom-content-scroll::-webkit-scrollbar-thumb { background-color: #334155; }
        .custom-content-scroll::-webkit-scrollbar-thumb:hover { background-color: #818cf8; }

        /* MAGIC FIX: Overriding Tailwind's Reset for Tiptap */
        .ProseMirror h1 { font-size: 2.5rem !important; font-weight: 800 !important; margin-top: 1.5em !important; margin-bottom: 0.5em !important; line-height: 1.2 !important; }
        .ProseMirror h2 { font-size: 2rem !important; font-weight: 700 !important; margin-top: 1.5em !important; margin-bottom: 0.5em !important; line-height: 1.25 !important; }
        .ProseMirror h3 { font-size: 1.5rem !important; font-weight: 700 !important; margin-top: 1.5em !important; margin-bottom: 0.5em !important; line-height: 1.3 !important; }
        .ProseMirror h4 { font-size: 1.25rem !important; font-weight: 600 !important; margin-top: 1.2em !important; margin-bottom: 0.5em !important; }
        .ProseMirror ul { list-style-type: disc !important; padding-left: 1.5rem !important; margin-top: 0.5em !important; margin-bottom: 0.5em !important; }
        .ProseMirror ol { list-style-type: decimal !important; padding-left: 1.5rem !important; margin-top: 0.5em !important; margin-bottom: 0.5em !important; }
        .ProseMirror li { margin-bottom: 0.25em !important; }
        .ProseMirror p { margin-bottom: 0.75em !important; }
        
        /* Premium Blockquote Design */
        .ProseMirror blockquote { 
          border-left: 4px solid #6366f1 !important; 
          padding-left: 1.2rem !important; 
          margin-top: 1.5em !important; 
          margin-bottom: 1.5em !important; 
          font-style: italic !important; 
          background: rgba(99, 102, 241, 0.05) !important; 
          padding: 0.8rem 1.2rem !important; 
          border-radius: 0 0.5rem 0.5rem 0 !important; 
          color: #475569 !important;
        }
        .dark .ProseMirror blockquote { color: #cbd5e1 !important; }

        /* MAGIC FIX: Premium Link Design */
        .ProseMirror a {
          color: #4f46e5 !important; /* Indigo for light mode */
          text-decoration: underline !important;
          text-decoration-color: rgba(79, 70, 229, 0.4) !important;
          text-underline-offset: 4px !important;
          font-weight: 600 !important;
          cursor: pointer !important;
          transition: text-decoration-color 0.2s ease-in-out !important;
        }
        .ProseMirror a:hover {
          text-decoration-color: #4f46e5 !important;
        }
        .dark .ProseMirror a {
          color: #38bdf8 !important; /* Sky blue for dark mode */
          text-decoration-color: rgba(56, 189, 248, 0.4) !important;
        }
        .dark .ProseMirror a:hover {
          text-decoration-color: #38bdf8 !important;
        }

        /* ── MAGIC FIX: Notion Style Table Resizing & Design ── */
        .ProseMirror table {
          border-collapse: collapse;
          table-layout: fixed;
          /* MAGIC FIX 1: Width 100% taake screen se bahar na bhagay aur inner columns distribute hon! */
          width: 100% !important; 
          margin: 1.5rem 0 !important;
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
        }
        .ProseMirror td, .ProseMirror th {
          min-width: 50px !important; 
          border: 1px solid #cbd5e1 !important; 
          /* Padding thori balanced ki taake box pyara lage */
          padding: 6px 10px !important;
          /* MAGIC FIX 1: Text ko upar latkane ke bajaye bilkul darmian (middle) mein kiya */
          vertical-align: middle;
          box-sizing: border-box;
          position: relative; 
        }

        /* MAGIC FIX 2: TipTap ke extra neechay walay margin ko table ke andar zero kar diya! */
        .ProseMirror td > p, .ProseMirror th > p {
          margin: 0 !important;
        }
        .dark .ProseMirror td, .dark .ProseMirror th {
          border-color: #334155 !important; 
        }
        .ProseMirror th {
          background-color: #f1f5f9 !important; 
          font-weight: bold !important;
          text-align: left;
        }
        .dark .ProseMirror th {
          background-color: #1e293b !important; 
        }
        
        /* ── The Drag Handle Line ── */
        .ProseMirror .column-resize-handle {
          position: absolute;
          right: -2px;
          top: 0;
          bottom: -2px;
          width: 4px;
          background-color: #6366f1; 
          pointer-events: none; 
          z-index: 20;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .ProseMirror td:hover .column-resize-handle, 
        .ProseMirror th:hover .column-resize-handle {
          opacity: 0.5; 
        }

        /* MAGIC FIX 2: Cursor zaroor change hoga (Globally apply kar diya hai) */
        .resize-cursor {
          cursor: col-resize !important; 
        }
        .ProseMirror.resize-cursor {
          cursor: col-resize !important; 
        }
      `}</style>

      {/* 1. Top Navbar */}
      <div className="shrink-0 z-50">
        <TopNav showSearch={false} />
      </div>

      {/* 2. Unified Premium Toolbar (Now holds Title & Back) */}
      {!isFocusMode && (
        <div className="shrink-0 w-full z-40">
           <EditorToolbar 
             editor={editorInstance} 
             isFocusMode={isFocusMode} 
             onToggleFocusMode={toggleFocusMode}
             onToggleFindReplace={() => setShowFindReplace((p) => !p)}
             onImageUpload={handleImageUpload}
             onExport={() => setShowExportMenu((p) => !p)}
             // New Title Props
             docTitle={docTitle}
             setDocTitle={setDocTitle}
             isEditingTitle={isEditingTitle}
             setIsEditingTitle={setIsEditingTitle}
             onTitleSave={handleTitleSave}
             titleInputRef={titleInputRef}
             onBack={() => navigate(-1)}
             // ── PREMIUM PROPS ──
             zoomLevel={zoomLevel}
             setZoomLevel={setZoomLevel}
             isReadOnly={isReadOnly}
           />
        </div>
      )}

      {/* ── SAFE MODE BANNER ── */}
      {isReadOnly && !isFocusMode && (
        <div className="shrink-0 w-full bg-amber-50 dark:bg-amber-500/10 border-b border-amber-200 dark:border-amber-500/20 px-4 py-2 flex items-center justify-center gap-3 z-30 animate-in slide-in-from-top-2">
          <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="text-[13px] font-bold text-amber-800 dark:text-amber-300">
            Safe Mode: Document is locked to prevent accidental changes.
          </span>
          <button
            onClick={() => setIsReadOnly(false)}
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white text-[11px] uppercase font-black rounded-lg shadow-sm transition-colors ml-2 tracking-wide"
          >
            Enable Editing
          </button>
        </div>
      )}

      {/* 3. Main Edge-to-Edge Canvas (No extra padding or titles above it!) */}
      <main className="flex-1 w-full overflow-y-auto custom-content-scroll bg-white dark:bg-[#0B1120] flex flex-col">
        {/* Sirf editor aur uski required padding */}
        <div className="w-full flex-1 flex flex-col pb-20">
          <TipTapEditor
            docId={docId}
            initialContent={decryptedContent}
            isFocusMode={isFocusMode}
            onWordCountChange={(w, c) => { setWordCount(w); setCharCount(c); }}
            onSaveStatusChange={setSaveStatus}
            onEditorReady={(editor) => setEditorInstance(editor)}
            // ── PREMIUM PROPS ──
            isReadOnly={isReadOnly}
            zoomLevel={zoomLevel}
          />
        </div>
      </main>

      {/* ── Floating Modals ── */}
      <FindReplace editor={editorInstance} isOpen={showFindReplace} onClose={() => setShowFindReplace(false)} />
      {showExportMenu && (
        <ExportMenu editor={editorInstance} docTitle={docTitle} onClose={() => setShowExportMenu(false)} />
      )}

      {/* Status Bar */}
      <EditorStatusBar wordCount={wordCount} charCount={charCount} saveStatus={saveStatus} isFocusMode={isFocusMode} />
    </div>
  );
}
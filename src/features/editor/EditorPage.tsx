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
import "./styles/EditorPage.css";

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
  const [isReadOnly, setIsReadOnly] = useState(true);

  const [editorInstance, setEditorInstance] = useState<any>(null);

  const { isFocusMode, toggleFocusMode } = useFocusMode();
  const updateDocument = useMutation(api.documents.updateDocument);
  const rawDoc = useQuery(api.documents.getDocument, { id: docId });

  // ── Image Upload Logic ──
  const handleImageUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !editorInstance) return;

      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const img = new globalThis.Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          const MAX_WIDTH = 800;
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          const compressedBase64 = canvas.toDataURL("image/webp", 0.6);
          editorInstance
            .chain()
            .focus()
            .setImage({ src: compressedBase64 })
            .run();
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
      {/* 1. Top Navbar */}
      <div className="shrink-0 z-50">
        <TopNav showSearch={false} />
      </div>

      {/* 2. Unified Premium Toolbar  */}
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
          <svg
            className="w-4 h-4 text-amber-600 dark:text-amber-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
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

      {/* 3. Main Edge-to-Edge Canvas */}
      <main className="flex-1 w-full overflow-y-auto custom-content-scroll bg-white dark:bg-[#0B1120] flex flex-col">
        {/* Only editor  */}
        <div className="w-full flex-1 flex flex-col pb-20">
          <TipTapEditor
            docId={docId}
            initialContent={decryptedContent}
            isFocusMode={isFocusMode}
            onWordCountChange={(w, c) => {
              setWordCount(w);
              setCharCount(c);
            }}
            onSaveStatusChange={setSaveStatus}
            onEditorReady={(editor) => setEditorInstance(editor)}
            // ── PREMIUM PROPS ──
            isReadOnly={isReadOnly}
            zoomLevel={zoomLevel}
          />
        </div>
      </main>

      {/* ── Floating Modals ── */}
      <FindReplace
        editor={editorInstance}
        isOpen={showFindReplace}
        onClose={() => setShowFindReplace(false)}
      />
      {showExportMenu && (
        <ExportMenu
          editor={editorInstance}
          docTitle={docTitle}
          onClose={() => setShowExportMenu(false)}
        />
      )}

      {/* Status Bar */}
      <EditorStatusBar
        wordCount={wordCount}
        charCount={charCount}
        saveStatus={saveStatus}
        isFocusMode={isFocusMode}
      />
    </div>
  );
}

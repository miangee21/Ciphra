// src/features/editor/components/EditorToolbar.tsx
import type { Editor } from "@tiptap/react";
import { useCallback, useEffect, useState } from "react";
import TableControls from "./TableControls";
import ExportMenu from "./ExportMenu";
import { ToolbarGroup, Divider, ToolBtn } from "./ToolbarHelpers";
import LinkModal from "./LinkModal";
import AlignDropdown from "./AlignDropdown";
import TextStyleDropdown from "./TextStyleDropdown";
import FontSizeDropdown from "./FontSizeDropdown";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image,
  Minus,
  Undo,
  Redo,
  Search,
  Maximize2,
  Minimize2,
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  Code2,
} from "lucide-react";

interface EditorToolbarProps {
  editor: Editor | null;
  isFocusMode: boolean;
  onToggleFocusMode: () => void;
  onToggleFindReplace: () => void;
  onImageUpload: () => void;
  onExport: () => void;
  docTitle: string;
  setDocTitle: (val: string) => void;
  isEditingTitle: boolean;
  setIsEditingTitle: (val: boolean) => void;
  onTitleSave: () => void;
  titleInputRef: React.RefObject<HTMLInputElement | null>;
  onBack: () => void;
  zoomLevel: number;
  setZoomLevel: (val: number) => void;
  isReadOnly: boolean;
}

export default function EditorToolbar({
  editor,
  isFocusMode,
  onToggleFocusMode,
  onToggleFindReplace,
  onImageUpload,
  docTitle,
  setDocTitle,
  isEditingTitle,
  setIsEditingTitle,
  onTitleSave,
  titleInputRef,
  onBack,
  zoomLevel,
  setZoomLevel,
  isReadOnly,
}: EditorToolbarProps) {
  const [, setRenderTick] = useState(0);

  // Link Modal States
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  useEffect(() => {
    if (!editor) return;
    const updateToolbar = () => {
      setRenderTick((t) => t + 1);
    };
    editor.on("transaction", updateToolbar);
    return () => {
      editor.off("transaction", updateToolbar);
    };
  }, [editor]);

  const openLinkModal = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    setLinkUrl(previousUrl || "");
    setShowLinkModal(true);
  }, [editor]);

  const applyLink = () => {
    if (!editor) return;
    if (linkUrl.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl })
        .run();
    }
    setShowLinkModal(false);
  };

  return (
    <div className="w-full bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-sm sticky top-0 z-40">
      <div className="w-full px-2 py-1.5 flex items-center gap-x-1 gap-y-2 flex-wrap relative">
        <div className="flex items-center gap-2 mr-2 shrink-0">
          <button
            onClick={onBack}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="min-w-30 max-w-50 flex items-center">
            {isEditingTitle ? (
              <input
                ref={titleInputRef}
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                onBlur={onTitleSave}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onTitleSave();
                  if (e.key === "Escape") setIsEditingTitle(false);
                }}
                className="w-full text-sm font-bold bg-transparent outline-none border-b border-indigo-500 text-slate-900 dark:text-white pb-0.5"
                autoFocus
              />
            ) : (
              <h1
                onClick={() => {
                  setIsEditingTitle(true);
                  setTimeout(() => titleInputRef.current?.focus(), 50);
                }}
                className="text-sm font-bold truncate cursor-text text-slate-900 dark:text-white hover:text-indigo-500 dark:hover:text-sky-400 transition-colors"
              >
                {docTitle || "Untitled"}
              </h1>
            )}
          </div>
        </div>

        <Divider />

        {/* ── FORMATTING TOOLS ── */}
        <ToolbarGroup>
          <ToolBtn
            onClick={() => editor?.chain().focus().undo().run()}
            disabled={!editor?.can().undo()}
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </ToolBtn>
          <ToolBtn
            onClick={() => editor?.chain().focus().redo().run()}
            disabled={!editor?.can().redo()}
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </ToolBtn>
        </ToolbarGroup>

        <Divider />

        {/* ── PREMIUM DROPDOWNS  ── */}
        <TextStyleDropdown editor={editor} />
        <FontSizeDropdown editor={editor} />

        <Divider />

        <ToolbarGroup>
          <ToolBtn
            onClick={() => editor?.chain().focus().toggleBold().run()}
            active={editor?.isActive("bold")}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </ToolBtn>
          <ToolBtn
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            active={editor?.isActive("italic")}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </ToolBtn>
          <ToolBtn
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            active={editor?.isActive("underline")}
            title="Underline"
          >
            <UnderlineIcon className="w-4 h-4" />
          </ToolBtn>
          <ToolBtn
            onClick={() => editor?.chain().focus().toggleStrike().run()}
            active={editor?.isActive("strike")}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </ToolBtn>
        </ToolbarGroup>

        <Divider />

        <AlignDropdown editor={editor} />

        <Divider />

        <ToolbarGroup>
          <div
            className="relative flex items-center gap-1 px-1 group cursor-pointer"
            title="Text Color"
          >
            <span className="text-xs font-black text-slate-500">A</span>
            <input
              type="color"
              className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent p-0"
              onChange={(e) =>
                editor?.chain().focus().setColor(e.target.value).run()
              }
            />
          </div>
          <div
            className="relative flex items-center gap-1 px-1 group cursor-pointer"
            title="Highlight Color"
          >
            <span className="text-xs font-black text-slate-500 bg-yellow-200 dark:bg-yellow-500/20 px-0.5 rounded">
              H
            </span>
            <input
              type="color"
              defaultValue="#fef08a"
              className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent p-0"
              onChange={(e) =>
                editor
                  ?.chain()
                  .focus()
                  .toggleHighlight({ color: e.target.value })
                  .run()
              }
            />
          </div>
          <ToolBtn
            onClick={openLinkModal}
            active={editor?.isActive("link")}
            title="Insert Link"
          >
            <LinkIcon className="w-4 h-4" />
          </ToolBtn>
        </ToolbarGroup>

        <Divider />

        {/* Lists & Blocks */}
        <ToolbarGroup>
          <ToolBtn
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            active={editor?.isActive("bulletList")}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </ToolBtn>
          <ToolBtn
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            active={editor?.isActive("orderedList")}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </ToolBtn>
          <ToolBtn
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            active={editor?.isActive("blockquote")}
            title="Blockquote"
          >
            <Quote className="w-4 h-4" />
          </ToolBtn>
        </ToolbarGroup>
        <ToolBtn
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
          active={editor?.isActive("codeBlock") || false}
          title="Code Block"
        >
          <Code2 className="w-4 h-4" />
        </ToolBtn>

        <Divider />

        {/* Table & Media */}
        <ToolbarGroup>
          <TableControls editor={editor} disabled={isReadOnly} />
          <ToolBtn
            onClick={onImageUpload}
            disabled={isReadOnly}
            title="Insert Image"
          >
            <Image className="w-4 h-4" />
          </ToolBtn>
          <ToolBtn
            onClick={() => editor?.chain().focus().setHorizontalRule().run()}
            disabled={isReadOnly}
            title="Divider Line"
          >
            <Minus className="w-4 h-4" />
          </ToolBtn>
        </ToolbarGroup>

        <Divider />

        {/* ── ZOOM CONTROLS ── */}
        <ToolbarGroup>
          <ToolBtn
            onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
            disabled={zoomLevel <= 50}
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </ToolBtn>
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 min-w-[3.5ch] text-center select-none flex items-center justify-center">
            {zoomLevel}%
          </span>
          <ToolBtn
            onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}
            disabled={zoomLevel >= 200}
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </ToolBtn>
        </ToolbarGroup>

        <Divider />

        <div className="flex-1" />

        <ToolbarGroup>
          <ToolBtn onClick={onToggleFindReplace} title="Find & Replace">
            <Search className="w-4 h-4 text-indigo-500" />
          </ToolBtn>

          <ExportMenu editor={editor} docTitle={docTitle} disabled={false} />

          <ToolBtn
            onClick={onToggleFocusMode}
            active={isFocusMode}
            title="Focus Mode"
          >
            {isFocusMode ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </ToolBtn>
        </ToolbarGroup>
      </div>

      {/* ── LINK MODAL COMPONENT ── */}
      <LinkModal
        isOpen={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        linkUrl={linkUrl}
        setLinkUrl={setLinkUrl}
        onApply={applyLink}
      />
    </div>
  );
}

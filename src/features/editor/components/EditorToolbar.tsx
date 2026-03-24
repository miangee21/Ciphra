// src/features/editor/components/EditorToolbar.tsx
import type { Editor } from "@tiptap/react";
import { useCallback, useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import TableControls from "./TableControls";
import ExportMenu from "./ExportMenu";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image,
  Minus,
  ChevronDown,
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

  // States for Dropdowns
  const [isTextDropdownOpen, setIsTextDropdownOpen] = useState(false);
  const textDropdownRef = useRef<HTMLDivElement>(null);

  // ── MAGIC: New Dropdowns States ──
  const [isFontSizeDropdownOpen, setIsFontSizeDropdownOpen] = useState(false);
  const fontSizeDropdownRef = useRef<HTMLDivElement>(null);

  const [isAlignDropdownOpen, setIsAlignDropdownOpen] = useState(false);
  const alignDropdownRef = useRef<HTMLDivElement>(null);

  // Handle Dropdowns Click Outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        textDropdownRef.current &&
        !textDropdownRef.current.contains(e.target as Node)
      ) {
        setIsTextDropdownOpen(false);
      }
      if (
        fontSizeDropdownRef.current &&
        !fontSizeDropdownRef.current.contains(e.target as Node)
      ) {
        setIsFontSizeDropdownOpen(false);
      }
      if (
        alignDropdownRef.current &&
        !alignDropdownRef.current.contains(e.target as Node)
      ) {
        setIsAlignDropdownOpen(false);
      }
    };
    if (isTextDropdownOpen || isFontSizeDropdownOpen || isAlignDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isTextDropdownOpen, isFontSizeDropdownOpen, isAlignDropdownOpen]);

  const getCurrentTextStyle = () => {
    if (editor?.isActive("heading", { level: 1 })) return "Title (H1)";
    if (editor?.isActive("heading", { level: 2 })) return "Heading 2";
    if (editor?.isActive("heading", { level: 3 })) return "Heading 3";
    if (editor?.isActive("heading", { level: 4 })) return "Heading 4";
    if (editor?.isActive("heading", { level: 5 })) return "Heading 5";
    if (editor?.isActive("heading", { level: 6 })) return "Heading 6";
    return "Normal Text";
  };

  useEffect(() => {
    if (!editor) {
      console.log(
        "🔴 Toolbar Debug: Editor is NULL. Engine not connected yet.",
      );
      return;
    }
    console.log("🟢 Toolbar Debug: Editor connected successfully!", editor);

    const updateToolbar = () => {
      setRenderTick((t) => t + 1);
    };

    editor.on("transaction", updateToolbar);
    return () => {
      editor.off("transaction", updateToolbar);
    };
  }, [editor]);

  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

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

        {/* ── Premium Text Style Dropdown ── */}
        <div className="relative flex items-center" ref={textDropdownRef}>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setIsTextDropdownOpen(!isTextDropdownOpen)}
            className="flex items-center gap-2 px-3 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
            title="Text Style"
          >
            <span className="w-21.25 text-left truncate">
              {getCurrentTextStyle()}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isTextDropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isTextDropdownOpen && (
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
                    setIsTextDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-[13px] transition-colors ${item.active ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-sky-400 font-bold" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── MAGIC: Font Size Dropdown ── */}
        <div
          className="relative flex items-center shrink-0"
          ref={fontSizeDropdownRef}
        >
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setIsFontSizeDropdownOpen(!isFontSizeDropdownOpen)}
            className="flex items-center justify-center gap-1 w-14 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
            title="Font Size"
          >
            <span className="w-[3ch] text-center">
              {editor
                ?.getAttributes("textStyle")
                ?.fontSize?.replace("px", "") || "16"}
            </span>
            <ChevronDown
              className={`w-3 h-3 text-slate-400 transition-transform ${isFontSizeDropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isFontSizeDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden z-50 py-1.5 animate-in fade-in slide-in-from-top-1 duration-150 max-h-48 overflow-y-auto custom-content-scroll">
              {["12", "14", "16", "18", "20", "24", "28", "32", "36"].map(
                (size, idx) => {
                  const isActive =
                    editor?.getAttributes("textStyle")?.fontSize ===
                      `${size}px` ||
                    (!editor?.getAttributes("textStyle")?.fontSize &&
                      size === "16");
                  return (
                    <button
                      key={idx}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        editor
                          ?.chain()
                          .focus()
                          .setMark("textStyle", { fontSize: `${size}px` })
                          .run();
                        setIsFontSizeDropdownOpen(false);
                      }}
                      className={`w-full text-center px-2 py-1.5 text-[13px] transition-colors ${isActive ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-sky-400 font-bold" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                    >
                      {size}
                    </button>
                  );
                },
              )}
            </div>
          )}
        </div>

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

        {/* ── MAGIC: Compact Alignment Dropdown ── */}
        <ToolbarGroup>
          <div className="relative flex items-center" ref={alignDropdownRef}>
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setIsAlignDropdownOpen(!isAlignDropdownOpen)}
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

            {isAlignDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden z-50 py-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                {[
                  {
                    label: "Left",
                    icon: <AlignLeft className="w-4 h-4" />,
                    action: () =>
                      editor?.chain().focus().setTextAlign("left").run(),
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
                    action: () =>
                      editor?.chain().focus().setTextAlign("right").run(),
                    active: editor?.isActive({ textAlign: "right" }),
                  },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      item.action();
                      setIsAlignDropdownOpen(false);
                    }}
                    className={`flex items-center gap-3 w-full text-left px-3 py-2 text-[13px] transition-colors ${item.active ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-sky-400 font-bold" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                  >
                    {item.icon} {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </ToolbarGroup>

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

        {/* ── ZOOM CONTROLS ── */}
        <Divider />
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

      {showLinkModal &&
        createPortal(
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
                  if (e.key === "Enter") applyLink();
                  if (e.key === "Escape") setShowLinkModal(false);
                }}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 transition-colors mb-5 text-slate-900 dark:text-white"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowLinkModal(false)}
                  className="px-4 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={applyLink}
                  className="px-4 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

function ToolbarGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-0.5 shrink-0">{children}</div>;
}
function Divider() {
  return (
    <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-0.5 sm:mx-1 shrink-0" />
  );
}
function ToolBtn({
  children,
  onClick,
  active = false,
  disabled = false,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      onClick={() => {
        console.log(`🔘 Action Triggered: ${title}`);
        onClick();
      }}
      onMouseDown={(e) => e.preventDefault()}
      disabled={disabled}
      title={title}
      className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${active ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-sky-400 shadow-sm" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"} disabled:opacity-30 disabled:cursor-not-allowed shrink-0`}
    >
      {children}
    </button>
  );
}

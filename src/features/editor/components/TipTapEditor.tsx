// src/features/editor/components/TipTapEditor.tsx
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import ResizableImage from "./ResizableImage";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import { SlashCommands } from "./SlashCommand";
import { useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { encryptData } from "@/lib/crypto/aes";
import { ramStore } from "@/lib/storage/ram";
import type { Id } from "../../../../convex/_generated/dataModel";
import { Extension } from "@tiptap/core";
import CodeBlock from "@tiptap/extension-code-block";
import { ReactNodeViewRenderer } from "@tiptap/react";
import CodeBlockComponent from "./CodeBlockComponent";

const FontSize = Extension.create({
  name: "fontSize",
  addOptions() {
    return { types: ["textStyle"] };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
        },
      },
    ];
  },
});

interface TipTapEditorProps {
  docId: Id<"documents">;
  initialContent: string | null;
  isFocusMode: boolean;
  onWordCountChange: (words: number, chars: number) => void;
  onSaveStatusChange: (status: "saving" | "saved" | "unsaved") => void;
  onEditorReady?: (editor: any) => void;
  isReadOnly: boolean;
  zoomLevel: number;
}

export default function TipTapEditor({
  docId,
  initialContent,
  isFocusMode,
  onWordCountChange,
  onSaveStatusChange,
  onEditorReady,
  isReadOnly,
  zoomLevel,
}: TipTapEditorProps) {
  const updateDocument = useMutation(api.documents.updateDocument);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      SlashCommands,
      TextStyle,
      FontSize,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class:
            "text-blue-600 dark:text-sky-400 underline decoration-blue-500/40 underline-offset-4 cursor-pointer font-semibold",
        },
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      ResizableImage,
      Color,
      TextStyle,
      Highlight.configure({ multicolor: true }),
      Typography,
      Placeholder.configure({
        placeholder: "Start writing... or type '/' for commands",
      }),

      CodeBlock.extend({
        addNodeView() {
          return ReactNodeViewRenderer(CodeBlockComponent);
        },
      }).configure({
        languageClassPrefix: "language-",
      }),
    ],

    content: initialContent ? JSON.parse(initialContent) : "",
    editorProps: {
      attributes: {
        class: [
          "prose prose-slate dark:prose-invert max-w-none w-full h-full focus:outline-none",
          "px-4 sm:px-6 py-6",
          "prose-headings:font-bold prose-headings:tracking-tight",
          "prose-p:leading-relaxed",
          "prose-ul:list-disc prose-ul:ml-5 prose-ul:my-2 prose-ul:marker:text-indigo-500",
          "prose-ol:list-decimal prose-ol:ml-5 prose-ol:my-2 prose-ol:marker:text-indigo-500",
          "prose-blockquote:border-l-4 prose-blockquote:border-slate-300 dark:prose-blockquote:border-slate-700 prose-blockquote:pl-5 prose-blockquote:my-4 prose-blockquote:italic",
          "prose-table:border-collapse prose-table:w-full prose-table:my-4",
          isFocusMode ? "pt-20" : "",
        ]
          .filter(Boolean)
          .join(" "),
      },
    },
    onUpdate: ({ editor }) => {
      onSaveStatusChange("unsaved");
      const text = editor.getText();
      const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
      onWordCountChange(words, text.length);

      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      onSaveStatusChange("saving");

      saveTimerRef.current = setTimeout(async () => {
        const key = ramStore.getKey();
        if (!key) return;
        try {
          const contentEncrypted = await encryptData(
            JSON.stringify(editor.getJSON()),
            key,
          );
          await updateDocument({ id: docId, contentEncrypted });
          onSaveStatusChange("saved");
        } catch {
          onSaveStatusChange("unsaved");
        }
      }, 500);
    },
  });

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  // ── SAFE MODE SYNC ──
  useEffect(() => {
    if (editor) {
      editor.setEditable(!isReadOnly);
    }
  }, [editor, isReadOnly]);

  return (
    <div
      className="w-full flex-1 flex flex-col bg-transparent"
      style={{ zoom: `${zoomLevel}%` }}
    >
      <EditorContent
        editor={editor}
        className="w-full flex-1 [&>.ProseMirror]:min-h-[70vh] [&>.ProseMirror]:outline-none"
      />
    </div>
  );
}

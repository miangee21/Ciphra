// src/features/editor/components/ExportMenu.tsx
import { useState, useRef, useEffect } from "react";
import type { Editor } from "@tiptap/react";
import { Download, FileText, FileDown, FileCode, Loader2 } from "lucide-react";
import TurndownService from "turndown";
import { saveAs } from "file-saver";
import { toast } from "sonner";

// @ts-ignore
import HTMLtoDOCX from "html-to-docx";

interface ExportMenuProps {
  editor: Editor | null;
  docTitle: string;
  disabled?: boolean;
  onClose?: () => void;
}

export default function ExportMenu({
  editor,
  docTitle,
  disabled = false,
}: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const getFileName = () => (docTitle.trim() ? docTitle : "Untitled_Document");

  // ── 1. EXPORT AS MARKDOWN (.md) ──
  const exportMarkdown = () => {
    if (!editor) return;
    setIsExporting("md");
    setTimeout(() => {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(editor.getHTML(), "text/html");

        doc.querySelectorAll(".tableWrapper").forEach((wrapper: any) => {
          const parent = wrapper.parentNode;
          while (wrapper.firstChild) {
            parent.insertBefore(wrapper.firstChild, wrapper);
          }
          parent.removeChild(wrapper);
        });

        doc.querySelectorAll("table").forEach((tbl: any) => {
          tbl.removeAttribute("style");
          tbl.setAttribute("width", "100%");
        });

        doc.querySelectorAll("th, td").forEach((cell: any) => {
          cell.removeAttribute("style");
        });

        const cleanHtml = doc.body.innerHTML;

        const turndownService = new TurndownService({
          headingStyle: "atx",
          codeBlockStyle: "fenced",
        });

        turndownService.keep(["table", "tr", "th", "td", "tbody", "thead"]);

        turndownService.addRule("centerAlignment", {
          filter: (node) => node.style.textAlign === "center",
          replacement: (content) =>
            `<div align="center">\n\n${content}\n\n</div>\n\n`,
        });

        turndownService.addRule("imageResize", {
          filter: "img",
          replacement: function (_content: any, node: any) {
            const src = node.getAttribute("src") || "";
            const alt = node.getAttribute("alt") || "";
            const width = node.style.width || node.getAttribute("width");

            if (width) {
              const w = parseInt(width);
              return `<img src="${src}" alt="${alt}" width="${w}" />`;
            }
            return `![${alt}](${src})`;
          },
        });

        const markdown = turndownService.turndown(cleanHtml);
        const blob = new Blob([markdown], {
          type: "text/markdown;charset=utf-8",
        });
        saveAs(blob, `${getFileName()}.md`);
        toast.success("Markdown file saved successfully!");
      } catch (error) {
        console.error("Markdown Export Error:", error);
      }
      setIsExporting(null);
      setIsOpen(false);
    }, 100);
  };

  // ── 2. EXPORT AS WORD (.docx) ──
  const exportWord = async () => {
    if (!editor) return;
    setIsExporting("word");
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(editor.getHTML(), "text/html");

      doc.querySelectorAll("img").forEach((img: any) => {
        let w = img.style.width || img.getAttribute("width");
        let h = img.style.height || img.getAttribute("height");
        if (w) {
          img.setAttribute("width", parseInt(w).toString());
          img.style.width = "";
        }
        if (h && h !== "auto") {
          img.setAttribute("height", parseInt(h).toString());
          img.style.height = "";
        }
      });

      doc.querySelectorAll("table").forEach((tbl: any) => {
        tbl.style.borderCollapse = "collapse";
        tbl.style.width = "100%";
        tbl.setAttribute("border", "1");
      });
      doc.querySelectorAll("th, td").forEach((cell: any) => {
        cell.style.border = "1px solid black";
        cell.style.padding = "8px";
      });

      const cleanHtml = doc.body.innerHTML;

      const fileBuffer = await HTMLtoDOCX(cleanHtml, null, {
        table: { row: { cantSplit: true } },
        footer: true,
        pageNumber: true,
        documentOptions: {
          margins: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      });

      const blob = new Blob([fileBuffer], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      saveAs(blob, `${getFileName()}.docx`);
      toast.success("Word document saved successfully!");
    } catch (error) {
      console.error("Word Export Error:", error);
    }
    setIsExporting(null);
    setIsOpen(false);
  };
  // ── 3. EXPORT AS PDF (THE NATIVE BROWSER METHOD) ──
  const exportPDF = () => {
    if (!editor) return;
    setIsExporting("pdf");

    setTimeout(() => {
      const originalTitle = document.title;
      const fileName = getFileName();
      document.title = fileName;

      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(editor.getHTML(), "text/html");

        doc.querySelectorAll(".tableWrapper").forEach((wrapper: any) => {
          const parent = wrapper.parentNode;
          while (wrapper.firstChild) {
            parent.insertBefore(wrapper.firstChild, wrapper);
          }
          parent.removeChild(wrapper);
        });

        doc.querySelectorAll("table, th, td").forEach((el: any) => {
          el.removeAttribute("style");
        });

        const cleanHtml = doc.body.innerHTML;

        const printIframe = document.createElement("iframe");
        printIframe.style.position = "fixed";
        printIframe.style.top = "0";
        printIframe.style.left = "0";
        printIframe.style.width = "100vw";
        printIframe.style.height = "100vh";
        printIframe.style.opacity = "0";
        printIframe.style.pointerEvents = "none";
        printIframe.style.zIndex = "-9999";
        document.body.appendChild(printIframe);

        const iframeDoc = printIframe.contentWindow?.document;
        if (!iframeDoc) throw new Error("Could not create print frame");

        iframeDoc.open();
        iframeDoc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${fileName}</title>
              <style>
                /* Date aur Localhost 100% Blocked */
                @page { margin: 0; size: auto; }
                
                /* Har cheez border ko andar ki taraf calculate karegi */
                *, *:before, *:after { box-sizing: border-box !important; }
                
                body { 
                  margin: 0; 
                  padding: 0;
                  background: white;
                }

                /* MAGIC FIX 2: Body ke bajaye ek khususi wrapper banaya padding k liye */
                .page-content {
                  padding: 15mm;
                  width: 100vw;
                  max-width: 100%;
                  box-sizing: border-box;
                  font-family: Arial, sans-serif; 
                  color: black; 
                  line-height: 1.4;
                }
                
                table { 
                  border-collapse: collapse; 
                  /* MAGIC FIX 3: 100% me se explicitly 2px minus kiye (left aur right border ke liye) taake kabhi page se bahar na nikle! */
                  width: calc(100% - 2px) !important; 
                  max-width: 100% !important; 
                  table-layout: fixed; 
                  margin: 10px 0; 
                  page-break-inside: auto;
                  border: 1px solid black; 
                }
                tr { page-break-inside: avoid; page-break-after: auto; }
                
                th, td { 
                  border: 1px solid black; 
                  padding: 6px 8px; 
                  text-align: left; 
                  vertical-align: middle; 
                  word-wrap: break-word; 
                  overflow-wrap: break-word;
                }
                th { background-color: #f1f5f9; font-weight: bold; }
                
                img { max-width: 100%; height: auto; page-break-inside: avoid; }
                [style*="text-align: center"] { text-align: center; }
                [style*="text-align: right"] { text-align: right; }
                
                p { margin: 0 0 4px 0; }
                p:last-child { margin: 0; }
                p:empty { display: none; }

                /* ── MAGIC FIX: Code Block PDF Styling ── */
                pre {
                  background-color: #1e293b; /* Dark slate background */
                  color: #f8fafc; /* White/Light text */
                  padding: 15px;
                  border-radius: 8px;
                  font-family: 'Courier New', Courier, monospace;
                  font-size: 13px;
                  line-height: 1.5;
                  white-space: pre-wrap; /* Lamba code paper se bahar na jaye */
                  word-wrap: break-word;
                  page-break-inside: avoid; /* Box ko half cut hone se rokay ga */
                  margin: 15px 0;
                  border: 1px solid #334155;
                }
                code { font-family: 'Courier New', Courier, monospace; }
                
                /* Inline code (jo paragraph ke andar chota sa code hota hai) */
                p > code, li > code {
                  background-color: #f1f5f9;
                  color: #ef4444; /* Red color for inline code */
                  padding: 2px 5px;
                  border-radius: 4px;
                }
              </style>
            </head>
            <body>
              <div class="page-content">
                ${cleanHtml}
              </div>
            </body>
          </html>
        `);
        iframeDoc.close();

        printIframe.onload = () => {
          setTimeout(() => {
            printIframe.contentWindow?.focus();
            printIframe.contentWindow?.print();

            setTimeout(() => {
              document.body.removeChild(printIframe);
              document.title = originalTitle;
              setIsExporting(null);
              setIsOpen(false);
            }, 1000);
          }, 300);
        };
      } catch (error) {
        console.error("PDF Native Export Error:", error);
        document.title = originalTitle;
        setIsExporting(null);
        setIsOpen(false);
      }
    }, 100);
  };
  return (
    <div className="relative flex items-center shrink-0" ref={menuRef}>
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || isExporting !== null}
        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
          isOpen
            ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-sky-400 shadow-sm"
            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
        } disabled:opacity-30 disabled:cursor-not-allowed`}
        title="Export Document"
      >
        {isExporting ? (
          <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
        ) : (
          <Download className="w-4 h-4 text-indigo-500" />
        )}
      </button>

      {isOpen && !disabled && (
        <div className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden z-50 p-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-2 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5">
            Export As
          </div>

          <button
            onClick={exportPDF}
            disabled={isExporting !== null}
            className="flex items-center gap-3 w-full text-left px-2.5 py-2 text-[13px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <FileText className="w-4 h-4 text-red-500" />
            PDF Document
          </button>

          <button
            onClick={exportWord}
            disabled={isExporting !== null}
            className="flex items-center gap-3 w-full text-left px-2.5 py-2 text-[13px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <FileDown className="w-4 h-4 text-blue-500" />
            Word (.docx)
          </button>

          <button
            onClick={exportMarkdown}
            disabled={isExporting !== null}
            className="flex items-center gap-3 w-full text-left px-2.5 py-2 text-[13px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <FileCode className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            Markdown (.md)
          </button>
        </div>
      )}
    </div>
  );
}

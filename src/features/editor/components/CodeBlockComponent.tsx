//src/features/editor/components/CodeBlockComponent.tsx
import { NodeViewWrapper, NodeViewContent } from "@tiptap/react";
import { useState } from "react";
import { Check, Copy } from "lucide-react";

export default function CodeBlockComponent({ node, updateAttributes }: any) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(node.textContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <NodeViewWrapper className="relative group rounded-xl overflow-hidden bg-slate-900 dark:bg-[#0d1117] text-slate-50 my-6 border border-slate-800 shadow-md">
      {/* ── TOP HEADER BAR ── */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 dark:bg-white/5 border-b border-slate-700/50">
        {/* Language Selector */}
        <select
          contentEditable={false}
          value={node.attrs.language || "javascript"}
          onChange={(e) => updateAttributes({ language: e.target.value })}
          className="bg-transparent text-xs font-semibold tracking-wider uppercase text-slate-400 focus:outline-none cursor-pointer hover:text-sky-400 transition-colors"
        >
          <option value="null" className="bg-slate-800 text-white">
            Plain Text
          </option>
          <option value="javascript" className="bg-slate-800 text-white">
            JavaScript
          </option>
          <option value="typescript" className="bg-slate-800 text-white">
            TypeScript
          </option>
          <option value="html" className="bg-slate-800 text-white">
            HTML
          </option>
          <option value="css" className="bg-slate-800 text-white">
            CSS
          </option>
          <option value="python" className="bg-slate-800 text-white">
            Python
          </option>
          <option value="rust" className="bg-slate-800 text-white">
            Rust
          </option>
          <option value="bash" className="bg-slate-800 text-white">
            Terminal
          </option>
        </select>

        {/* Copy Button */}
        <button
          contentEditable={false}
          onClick={copyToClipboard}
          className="p-1.5 rounded-md text-slate-400 hover:bg-slate-700 dark:hover:bg-white/10 hover:text-white transition-all flex items-center gap-1.5"
          title="Copy code"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-green-400" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
          <span className="text-[11px] font-medium">
            {copied ? "Copied!" : "Copy"}
          </span>
        </button>
      </div>

      {/* ── ACTUAL CODE AREA ── */}
      <pre className="p-4 m-0 overflow-x-auto text-[13px] leading-relaxed font-mono">
        {/* @ts-ignore: TypeScript yahan code tag allow nahi karta par TipTap karta hai */}
        <NodeViewContent as="code" className="bg-transparent p-0 border-none text-slate-100"/>
      </pre>
    </NodeViewWrapper>
  );
}

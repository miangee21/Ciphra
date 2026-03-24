// src/features/editor/components/ResizableImage.tsx
import { mergeAttributes, Node } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
import { useState, useRef, useEffect } from 'react'
import type { CommandProps } from '@tiptap/core'

// 1. TypeScript ko batana ke options mein kya kya aayega
export interface ResizableImageOptions {
  src: string;
  alt?: string;
  width?: string;
}

// 2. MAGIC FIX: TypeScript ko batana ke hamara custom command exist karta hai
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    resizableImage: {
      setImage: (options: ResizableImageOptions) => ReturnType;
    }
  }
}

const ResizableImageComponent = (props: any) => {
  const [isResizing, setIsResizing] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  // MAGIC FIX: Stale Closure ko rokne ke liye Width ko Ref mein store karna zaroori hai!
  const widthRef = useRef(props.node.attrs.width || '100%');
  const [width, setWidth] = useState(widthRef.current);

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (imgRef.current) {
        const rect = imgRef.current.getBoundingClientRect();
        let newWidth = e.clientX - rect.left;
        if (newWidth < 100) newWidth = 100; 
        
        const newWidthStr = `${newWidth}px`;
        setWidth(newWidthStr);
        widthRef.current = newWidthStr; // Ref update karo taake closure mein latest value jaye
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      props.updateAttributes({ width: widthRef.current }); // Puranay State ke bajaye strictly naya Ref Use kiya!
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, props]);

  return (
    <NodeViewWrapper style={{ width }} className="relative inline-block max-w-full my-4 group">
      <img
        ref={imgRef}
        src={props.node.attrs.src}
        alt={props.node.attrs.alt}
        style={{ width: '100%', height: 'auto' }}
        className={`rounded-xl shadow-md border-2 transition-colors ${props.selected ? 'border-indigo-500' : 'border-transparent'}`}
      />
      {/* ── DRAG HANDLE (Dot) ── */}
      {props.editor.isEditable && (
        <>
          <div
            onMouseDown={startResize}
            className="absolute -right-2 -bottom-2 w-6 h-6 bg-white dark:bg-slate-800 border-2 border-indigo-500 rounded-full cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10 flex items-center justify-center hover:scale-110"
          >
            <div className="w-2 h-2 bg-indigo-500 rounded-full" />
          </div>
          
          {/* ── DELETE BUTTON (Cross) ── */}
          <button
            onClick={() => props.deleteNode()}
            className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10 flex items-center justify-center hover:scale-110"
            title="Remove Image"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </>
      )}
    </NodeViewWrapper>
  );
};

export default Node.create({
  name: 'resizableImage',
  inline: false,
  group: 'block',
  draggable: true,
  
  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      width: { default: '50%' },
    }
  },
  
  parseHTML() {
    return [{ tag: 'img[src]' }]
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)]
  },
  
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageComponent)
  },
  
  // 3. Typescript Errors Fixed Here!
  addCommands() {
    return {
      setImage: (options: ResizableImageOptions) => ({ commands }: CommandProps) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        })
      },
    }
  },
})
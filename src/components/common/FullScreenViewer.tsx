// src/components/common/FullScreenViewer.tsx
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { decryptFileBlob } from "@/lib/crypto/fileCrypto";
import { ramStore } from "@/lib/storage/ram";
import { toast } from "sonner";
import {
  X,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize,
  Loader2,
  Image as ImageIcon,
  Check,
} from "lucide-react";

interface FullScreenViewerProps {
  storageId: string;
  name: string;
  type: "image" | "pdf";
  onClose: () => void;
}

export default function FullScreenViewer({
  storageId,
  name,
  type,
  onClose,
}: FullScreenViewerProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Interaction States for Images
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isDownloaded, setIsDownloaded] = useState(false);

  const fileUrl = useQuery(api.files.getFileUrl, { storageId });

  // 1. Mount Component & Lock Background Scroll 🔒
  useEffect(() => {
    setMounted(true);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // 2. Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // 3. Decrypt and create blob URL
  useEffect(() => {
    if (!fileUrl) return;
    const key = ramStore.getKey();
    if (!key) return;

    let objectUrl: string;

    const decrypt = async () => {
      try {
        const response = await fetch(fileUrl);
        if (!response.ok) throw new Error("Fetch failed");

        const encryptedBlob = await response.blob();
        const mimeType = type === "pdf" ? "application/pdf" : "image/jpeg";

        const decryptedBlob = await decryptFileBlob(
          encryptedBlob,
          key,
          mimeType,
        );

        objectUrl = URL.createObjectURL(decryptedBlob);
        setBlobUrl(objectUrl);
      } catch (err) {
        console.error("Viewer Decryption Error:", err);
        setError(true);
      }
    };

    decrypt();
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [fileUrl, type]);

  // 4. Download Logic with Visual Feedback
  const handleDownload = () => {
    if (!blobUrl) return;
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = name;
    a.click();

    toast.success("File downloaded successfully!");
    setIsDownloaded(true);

    setTimeout(() => {
      setIsDownloaded(false);
    }, 2000);
  };

  // Image Control Handlers
  const handleZoomIn = () => setScale((s) => Math.min(s + 0.25, 4));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.25, 0.25));
  const handleRotate = () => setRotation((r) => r + 90);
  const handleReset = () => {
    setScale(1);
    setRotation(0);
  };

  if (!mounted) return null;

  // ── Portal renders directly to document.body ──
  return createPortal(
    <div className="fixed inset-0 z-9999 flex flex-col bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
      {/* ── Top Navigation Bar ── */}
      <div className="absolute top-0 w-full flex items-center justify-between px-6 py-4 shrink-0 z-50 bg-linear-to-b from-black/60 to-transparent pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10 shadow-sm">
            {type === "image" ? (
              <ImageIcon className="w-5 h-5 text-white/80" />
            ) : (
              <span className="text-[10px] font-black tracking-wider text-red-400">
                PDF
              </span>
            )}
          </div>
          <p className="text-[15px] font-semibold text-white/90 truncate max-w-50 sm:max-w-md drop-shadow-md">
            {name}
          </p>
        </div>

        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            onClick={handleDownload}
            disabled={!blobUrl || isDownloaded}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all backdrop-blur-md border shadow-sm ${
              isDownloaded
                ? "bg-green-500/20 text-green-400 border-green-500/30 scale-100"
                : "bg-white/10 hover:bg-white/20 text-white disabled:opacity-40 border-white/10 hover:scale-105"
            }`}
          >
            {isDownloaded ? (
              <Check className="w-4 h-4" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">
              {isDownloaded ? "Downloaded" : "Download"}
            </span>
          </button>

          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/20 hover:bg-red-500/40 text-red-200 hover:text-white transition-all backdrop-blur-md border border-red-500/30 shadow-sm hover:scale-105 group"
          >
            <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>
      </div>

      {/* ── Main Content Area ── */}
      <div className="flex-1 w-full h-full flex items-center justify-center overflow-hidden relative pt-20 pb-20">
        {!blobUrl && !error && (
          <div className="flex flex-col items-center gap-4 animate-in zoom-in duration-300">
            <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
            <p className="text-white/60 text-sm font-medium tracking-wide">
              Decrypting securely...
            </p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center gap-3 bg-red-500/10 p-6 rounded-2xl border border-red-500/20 backdrop-blur-md">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
              <X className="w-6 h-6 text-red-400" />
            </div>
            <div className="text-center">
              <p className="text-red-200 font-semibold text-lg">
                Decryption Failed
              </p>
              <p className="text-red-300/60 text-sm mt-1 max-w-62.5">
                The file might be corrupted or the encryption key is invalid.
              </p>
            </div>
          </div>
        )}

        {/* Image Viewer */}
        {blobUrl && type === "image" && (
          <div className="w-full h-full flex items-center justify-center p-4 overflow-hidden">
            <img
              src={blobUrl}
              alt={name}
              className="max-w-full max-h-full object-contain rounded-lg transition-transform duration-300 ease-out shadow-2xl"
              style={{
                transform: `scale(${scale}) rotate(${rotation}deg)`,
              }}
            />
          </div>
        )}

        {/* PDF Viewer */}
        {blobUrl && type === "pdf" && (
          <div className="w-full h-full px-4 sm:px-12 max-w-6xl mx-auto">
            <iframe
              src={`${blobUrl}#toolbar=0`}
              title={name}
              className="w-full h-full rounded-2xl bg-white shadow-2xl border border-white/10 animate-in slide-in-from-bottom-4 duration-500"
            />
          </div>
        )}
      </div>

      {/* ── Cinematic Floating Toolbar (Images Only) ── */}
      {blobUrl && type === "image" && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-slate-900/80 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-8 duration-500 z-50">
          <ToolButton
            icon={ZoomOut}
            onClick={handleZoomOut}
            label="Zoom Out"
            disabled={scale <= 0.25}
          />
          <div className="w-14 text-center">
            <span className="text-[12px] font-bold text-white/70">
              {Math.round(scale * 100)}%
            </span>
          </div>
          <ToolButton
            icon={ZoomIn}
            onClick={handleZoomIn}
            label="Zoom In"
            disabled={scale >= 4}
          />
          <div className="w-px h-6 bg-white/10 mx-1" />
          <ToolButton icon={RotateCw} onClick={handleRotate} label="Rotate" />
          <ToolButton
            icon={Maximize}
            onClick={handleReset}
            label="Reset View"
          />
        </div>
      )}
    </div>,
    document.body,
  );
}

function ToolButton({
  icon: Icon,
  onClick,
  label,
  disabled = false,
}: {
  icon: React.ElementType;
  onClick: () => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className="w-10 h-10 flex items-center justify-center rounded-xl bg-transparent hover:bg-white/10 text-white/80 hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-transparent"
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}

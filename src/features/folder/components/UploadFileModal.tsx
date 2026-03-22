// src/features/folder/components/UploadFileModal.tsx
import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { ramStore } from "@/lib/storage/ram";
import { encryptData } from "@/lib/crypto/aes";
import type { Id } from "../../../../convex/_generated/dataModel";
import { useSessionStore } from "@/store/sessionStore";
import { encryptFileBlob } from "@/lib/crypto/fileCrypto";
import { UploadCloud, FileText, X, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";

interface UploadFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  folderId: Id<"folders">;
}

export default function UploadFileModal({
  isOpen,
  onClose,
  folderId,
}: UploadFileModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convex Hooks
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const saveFile = useMutation(api.files.saveFile);

  // User ID get karna
  const { userId } = useSessionStore();

  const resetModal = () => {
    setFile(null);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    if (uploading) return;
    resetModal();
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // Basic type validation
      if (
        !selectedFile.type.startsWith("image/") &&
        selectedFile.type !== "application/pdf"
      ) {
        toast.error("Invalid file type", {
          description: "Please upload an Image or PDF.",
        });
        resetModal();
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !folderId) return;

    const key = ramStore.getKey();
    if (!key) {
      toast.error("Encryption key not found", {
        description: "Please re-login.",
      });
      return;
    }

    setUploading(true);
    const toastId = toast.loading(`Uploading "${file.name}"...`);

    try {
      // 1. Generate secure upload URL
      const uploadUrl = await generateUploadUrl();
      const encryptedBlob = await encryptFileBlob(file, key);

      // 3. Upload Encrypted Blob to Convex Storage
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": "application/octet-stream" },
        body: encryptedBlob,
      });

      if (!result.ok) throw new Error("Convex upload failed");
      const { storageId } = await result.json();

      // 3. Encrypt file name for DB
      const encryptedName = await encryptData(file.name, key);

      // 4. Save file metadata
      if (!userId) {
        toast.error("User session missing!", {
          description: "Please log in again.",
        });
        return;
      }

      await saveFile({
        userId: userId as Id<"users">,
        folderId,
        nameEncrypted: encryptedName,
        storageId,
        type: file.type.startsWith("image/") ? "image" : "pdf",
        mimeType: file.type,
        sizeBytes: file.size,
      });

      toast.success("File uploaded securely!", { id: toastId });
      handleClose();
    } catch (error) {
      console.error("Upload Error:", error);
      toast.error("Upload failed", {
        id: toastId,
        description: "Check console for details or retry.",
      });
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onMouseDown={handleClose}
      className="fixed inset-0 z-150 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300"
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className="relative w-full max-w-110 bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-2xl p-7 flex flex-col gap-6 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 backdrop-blur-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center border border-indigo-100/50 dark:border-indigo-500/20 shadow-sm">
              <UploadCloud className="w-6 h-6 text-indigo-600 dark:text-sky-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Upload File
              </h2>
              <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Images or PDF up to 15MB
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={uploading}
            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── File Selector Area ── */}
        <div className="flex flex-col gap-3">
          <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
            Selected File
          </label>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,application/pdf"
            className="hidden"
          />

          {!file ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center gap-3 p-8 bg-slate-100/50 dark:bg-slate-950/50 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-sky-500/60 rounded-2xl cursor-pointer transition-all hover:bg-indigo-50/20 dark:hover:bg-indigo-500/5 shadow-inner group"
            >
              <div className="w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20 shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                <UploadCloud
                  className="w-7 h-7 text-indigo-400 dark:text-sky-600 transition-colors group-hover:text-indigo-600 dark:group-hover:text-sky-400"
                  strokeWidth={1.5}
                />
              </div>
              <p className="text-[14px] font-semibold text-slate-600 dark:text-slate-300 tracking-tight">
                Click to browse files
              </p>
            </div>
          ) : (
            // Sleek File Preview
            <div className="flex items-center gap-3.5 p-4 bg-slate-100/50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-inner animate-in fade-in slide-in-from-top-1">
              <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800/80 flex items-center justify-center shrink-0 border border-slate-300 dark:border-slate-700 shadow-sm relative overflow-hidden">
                <FileText
                  className="w-6 h-6 text-slate-500 dark:text-slate-400"
                  strokeWidth={1.5}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-slate-900 dark:text-white truncate tracking-tight">
                  {file.name}
                </p>
                <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                  {(file.size / 1024 / 1024).toFixed(2)} MB &middot;{" "}
                  {file.type.split("/")[1].toUpperCase()}
                </p>
              </div>
              <button
                onClick={resetModal}
                disabled={uploading}
                className="p-1.5 rounded-full text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-1.5">
          <button
            onClick={handleClose}
            disabled={uploading}
            className="flex-1 py-3 px-4 rounded-xl text-[13px] font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading || !file}
            className="flex-1 py-3 px-4 rounded-xl text-[13px] font-semibold bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-white/70 group-hover:scale-110" />
                Upload Securely
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

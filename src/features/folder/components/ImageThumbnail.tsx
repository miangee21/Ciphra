// src/features/folder/components/ImageThumbnail.tsx
import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { decryptFileBlob } from "@/lib/crypto/fileCrypto";
import { ramStore } from "@/lib/storage/ram";
import { ImageIcon } from "lucide-react";

interface ImageThumbnailProps {
  storageId: string;
  name: string;
  isLocked?: boolean;
}

export default function ImageThumbnail({
  storageId,
  name,
  isLocked = false,
}: ImageThumbnailProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  // Get the download URL from Convex
  const fileUrl = useQuery(api.files.getFileUrl, { storageId });

  useEffect(() => {
    if (!fileUrl) return;
    const key = ramStore.getKey();
    if (!key) return;

    let objectUrl: string;

    const decrypt = async () => {
      try {
        const response = await fetch(fileUrl);
        if (!response.ok) throw new Error("Failed to fetch file");

        const encryptedBlob = await response.blob();

        // 2. Decrypt it using Web Crypto function
        const decryptedBlob = await decryptFileBlob(
          encryptedBlob,
          key,
          "image/jpeg",
        );

        // 3. Create a local URL for the decrypted image
        objectUrl = URL.createObjectURL(decryptedBlob);
        setBlobUrl(objectUrl);
      } catch (err) {
        console.error("Thumbnail decryption failed:", err);
        setError(true);
      }
    };

    decrypt();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [fileUrl]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-slate-800/50">
        <ImageIcon className="w-8 h-8 text-slate-300 dark:text-slate-600" />
      </div>
    );
  }

  if (!blobUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-50/50 dark:bg-slate-800/30">
        <div className="w-5 h-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <img
      src={blobUrl}
      alt={name}
      // ── Smart Blur Logic ──
      className={`w-full h-full object-cover animate-in fade-in duration-500 transition-all ${
        isLocked ? "blur-lg scale-110 opacity-70" : ""
      }`}
    />
  );
}

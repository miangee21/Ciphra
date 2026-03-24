//src/features/editor/hooks/useAutoSave.ts
import { useRef, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { encryptData } from "@/lib/crypto/aes";
import { ramStore } from "@/lib/storage/ram";
import type { Editor } from "@tiptap/react";
import type { Id } from "../../../../convex/_generated/dataModel";

type SaveStatus = "saving" | "saved" | "unsaved";

export function useAutoSave(
  docId: Id<"documents">,
  onStatusChange: (status: SaveStatus) => void,
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const updateDocument = useMutation(api.documents.updateDocument);

  const save = useCallback(
    (editor: Editor) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      onStatusChange("saving");

      timerRef.current = setTimeout(async () => {
        const key = ramStore.getKey();
        if (!key) {
          onStatusChange("unsaved");
          return;
        }
        try {
          const contentEncrypted = await encryptData(
            JSON.stringify(editor.getJSON()),
            key,
          );
          await updateDocument({ id: docId, contentEncrypted });
          onStatusChange("saved");
        } catch {
          onStatusChange("unsaved");
        }
      }, 500);
    },
    [docId, onStatusChange, updateDocument],
  );

  const flush = useCallback(
    async (editor: Editor) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      const key = ramStore.getKey();
      if (!key) return;
      try {
        const contentEncrypted = await encryptData(
          JSON.stringify(editor.getJSON()),
          key,
        );
        await updateDocument({ id: docId, contentEncrypted });
        onStatusChange("saved");
      } catch {
        onStatusChange("unsaved");
      }
    },
    [docId, onStatusChange, updateDocument],
  );

  const cleanup = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  return { save, flush, cleanup };
}

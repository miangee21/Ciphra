//src/hooks/useInactivity.ts
import { useEffect, useState } from "react";
import { useLockStore } from "@/store/lockStore";
import { ramStore } from "@/lib/storage/ram";

export function useInactivity() {
  const { isLockEnabled, timeoutMinutes, isLocked, setLocked } = useLockStore();
  const [hasKey, setHasKey] = useState(ramStore.hasKey());

  // Listen for RAM key changes (login/unlock/logout)
  useEffect(() => {
    const handleKeyChange = () => setHasKey(ramStore.hasKey());
    window.addEventListener("ram_key_changed", handleKeyChange);
    return () => window.removeEventListener("ram_key_changed", handleKeyChange);
  }, []);

  useEffect(() => {
    // Only run if app lock is enabled, app is NOT currently locked, and key is in RAM
    if (!isLockEnabled || isLocked || !hasKey) return;

    const ms = timeoutMinutes * 60 * 1000;

    let timer = setTimeout(() => {
      setLocked(true);
    }, ms);

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        setLocked(true);
      }, ms);
    };

    const events = ["mousemove", "keydown", "touchstart", "click", "scroll"];
    events.forEach((e) => window.addEventListener(e, resetTimer));

    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [isLockEnabled, timeoutMinutes, isLocked, hasKey, setLocked]);
}

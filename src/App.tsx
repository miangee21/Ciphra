//src/App.tsx
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { useEffect } from "react";
import AppRouter from "@/router/AppRouter";
import { useThemeStore } from "@/store/themeStore";
import { useLockStore } from "@/store/lockStore";
import { useInactivity } from "@/hooks/useInactivity";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Toaster } from "sonner";
import "./App.css";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

export default function App() {
  const { mode, accent } = useThemeStore();
  const { isLockEnabled, setLocked } = useLockStore();

  // Start inactivity timer
  useInactivity();

  // Apply theme
  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(mode);
    document.documentElement.setAttribute("data-accent", accent);
  }, [mode, accent]);

  // Lock app when window is closed (Tauri)
  useEffect(() => {
    let unlisten: (() => void) | undefined;

    const setupListener = async () => {
      const appWindow = getCurrentWindow();
      unlisten = await appWindow.onCloseRequested(() => {
        if (isLockEnabled) {
          setLocked(true);
        }
      });
    };

    setupListener();

    return () => {
      if (unlisten) unlisten();
    };
  }, [isLockEnabled, setLocked]);

  return (
    <ConvexProvider client={convex}>
      <AppRouter />
      <Toaster richColors position="top-right" theme={mode} />
    </ConvexProvider>
  );
}

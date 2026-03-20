//src/App.tsx
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { useEffect } from "react";
import AppRouter from "@/router/AppRouter";
import { useThemeStore } from "@/store/themeStore";
import "./App.css";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

export default function App() {
  const { mode, accent } = useThemeStore();

  useEffect(() => {
    // Apply dark/light mode class to html element
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(mode);

    // Apply accent color as data attribute
    document.documentElement.setAttribute("data-accent", accent);
  }, [mode, accent]);

  return (
    <ConvexProvider client={convex}>
      <AppRouter />
    </ConvexProvider>
  );
}

//src/store/themeStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "light" | "dark";
export type AccentColor = "blue" | "purple" | "green" | "rose" | "orange";

interface ThemeState {
  mode: ThemeMode;
  accent: AccentColor;

  setMode: (mode: ThemeMode) => void;
  setAccent: (accent: AccentColor) => void;
  toggleMode: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: "light",
      accent: "blue",

      setMode: (mode) => set({ mode }),
      setAccent: (accent) => set({ accent }),
      toggleMode: () =>
        set({ mode: get().mode === "light" ? "dark" : "light" }),
    }),
    {
      name: "ciphra-theme",
    },
  ),
);

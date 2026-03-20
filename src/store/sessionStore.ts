//src/store/sessionStore.ts
import { create } from "zustand";

interface SessionState {
  userId: string | null;
  username: string | null;
  publicKey: string | null;
  isLoggedIn: boolean;

  setSession: (userId: string, username: string, publicKey: string) => void;

  clearSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  userId: null,
  username: null,
  publicKey: null,
  isLoggedIn: false,

  setSession: (userId, username, publicKey) =>
    set({
      userId,
      username,
      publicKey,
      isLoggedIn: true,
    }),

  clearSession: () =>
    set({
      userId: null,
      username: null,
      publicKey: null,
      isLoggedIn: false,
    }),
}));

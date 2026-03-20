//src/store/lockStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

type TimeoutOption = 1 | 5 | 30 | 60;

interface LockState {
  isLockEnabled: boolean;
  isLocked: boolean;
  timeoutMinutes: TimeoutOption;

  setLockEnabled: (value: boolean) => void;
  setLocked: (value: boolean) => void;
  setTimeoutMinutes: (value: TimeoutOption) => void;
}

export const useLockStore = create<LockState>()(
  persist(
    (set) => ({
      isLockEnabled: false,
      isLocked: false,
      timeoutMinutes: 5,

      setLockEnabled: (value) => set({ isLockEnabled: value }),
      setLocked: (value) => set({ isLocked: value }),
      setTimeoutMinutes: (value) => set({ timeoutMinutes: value }),
    }),
    {
      name: "ciphra-lock-settings",
      // Only persist settings, NOT the locked state
      // App always starts unlocked — user must enter PIN
      partialize: (state) => ({
        isLockEnabled: state.isLockEnabled,
        timeoutMinutes: state.timeoutMinutes,
      }),
    },
  ),
);

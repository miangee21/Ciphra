//src/lib/storage/ram.ts

// In-memory private key store
// This is NEVER persisted to disk — clears on every app reload/refresh
// This is intentional for maximum security

let _privateKey: string | null = null;

export const ramStore = {
  setKey: (key: string): void => {
    _privateKey = key;
    window.dispatchEvent(new Event("ram_key_changed"));
  },

  getKey: (): string | null => {
    return _privateKey;
  },

  clearKey: (): void => {
    _privateKey = null;
    window.dispatchEvent(new Event("ram_key_changed"));
  },

  hasKey: (): boolean => {
    return _privateKey !== null;
  },
};

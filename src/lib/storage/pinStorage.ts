//src/lib/storage/pinStorage.ts
const PIN_KEY = "ciphra_locked_key";

// Encrypt private key with 6-digit PIN and save to localStorage
export async function saveKeyWithPin(
  privateKeyB64: string,
  pin: string,
): Promise<void> {
  const pinBytes = new TextEncoder().encode(pin.padEnd(32, "0"));
  const pinKey = await crypto.subtle.importKey(
    "raw",
    pinBytes,
    { name: "AES-GCM" },
    false,
    ["encrypt"],
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    pinKey,
    new TextEncoder().encode(privateKeyB64),
  );

  const combined = new Uint8Array(iv.byteLength + cipher.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(cipher), iv.byteLength);

  localStorage.setItem(PIN_KEY, btoa(String.fromCharCode(...combined)));
}

// Decrypt private key from localStorage using PIN
// Returns null if PIN is wrong or no key stored
export async function loadKeyWithPin(pin: string): Promise<string | null> {
  const stored = localStorage.getItem(PIN_KEY);
  if (!stored) return null;

  try {
    const pinBytes = new TextEncoder().encode(pin.padEnd(32, "0"));
    const pinKey = await crypto.subtle.importKey(
      "raw",
      pinBytes,
      { name: "AES-GCM" },
      false,
      ["decrypt"],
    );

    const combined = Uint8Array.from(atob(stored), (c) => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const cipher = combined.slice(12);

    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      pinKey,
      cipher,
    );

    return new TextDecoder().decode(plain);
  } catch {
    // Wrong PIN — decryption fails
    return null;
  }
}

// Remove encrypted key from localStorage (on logout)
export const clearPinStorage = (): void => {
  localStorage.removeItem(PIN_KEY);
};

// Check if an encrypted key exists in localStorage
export const hasPinStorage = (): boolean => {
  return !!localStorage.getItem(PIN_KEY);
};

// Update PIN — decrypt with old PIN, re-encrypt with new PIN
export async function changePinStorage(
  oldPin: string,
  newPin: string,
): Promise<boolean> {
  const key = await loadKeyWithPin(oldPin);
  if (!key) return false;
  await saveKeyWithPin(key, newPin);
  return true;
}

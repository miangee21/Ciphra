//src/lib/crypto/aes.ts

// Encrypt plaintext string with AES-256-GCM
// Returns base64 string with IV prepended
export async function encryptData(
  plaintext: string,
  keyB64: string,
): Promise<string> {
  const keyBytes = Uint8Array.from(atob(keyB64), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-GCM" },
    false,
    ["encrypt"],
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const cipher = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded,
  );

  // Combine IV + ciphertext into single base64 string
  const combined = new Uint8Array(iv.byteLength + cipher.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(cipher), iv.byteLength);

  return btoa(String.fromCharCode(...combined));
}

// Decrypt base64 ciphertext (IV prepended) with AES-256-GCM
// Returns original plaintext string
export async function decryptData(
  cipherB64: string,
  keyB64: string,
): Promise<string> {
  const keyBytes = Uint8Array.from(atob(keyB64), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-GCM" },
    false,
    ["decrypt"],
  );

  const combined = Uint8Array.from(atob(cipherB64), (c) => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const cipher = combined.slice(12);

  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    cipher,
  );

  return new TextDecoder().decode(plain);
}

// Encrypt raw bytes (for media files) — returns base64 string
export async function encryptBytes(
  bytes: Uint8Array<ArrayBuffer>,
  keyB64: string,
): Promise<string> {
  const keyBytes = Uint8Array.from(atob(keyB64), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-GCM" },
    false,
    ["encrypt"],
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    bytes,
  );

  const combined = new Uint8Array(iv.byteLength + cipher.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(cipher), iv.byteLength);

  return btoa(String.fromCharCode(...combined));
}

// Decrypt base64 ciphertext back to raw bytes (for media files)
export async function decryptBytes(
  cipherB64: string,
  keyB64: string,
): Promise<Uint8Array> {
  const keyBytes = Uint8Array.from(atob(keyB64), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-GCM" },
    false,
    ["decrypt"],
  );

  const combined = Uint8Array.from(atob(cipherB64), (c) => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const cipher = combined.slice(12);

  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    cipher,
  );

  return new Uint8Array(plain);
}

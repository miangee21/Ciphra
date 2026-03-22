// src/lib/crypto/fileCrypto.ts

// ── File Encryption ──
export async function encryptFileBlob(
  file: Blob,
  secretKey: string,
): Promise<Blob> {
  const encoder = new TextEncoder();

  // 1. Convert the key into a 256-bit hash so that it becomes compatible with AES-GCM.
  const keyHash = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(secretKey),
  );
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyHash,
    { name: "AES-GCM" },
    false,
    ["encrypt"],
  );

  // 2. Generate a random IV (Initialization Vector) for security.
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const fileBuffer = await file.arrayBuffer();

  // 3. Encrypt the file!
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    cryptoKey,
    fileBuffer,
  );

  // 4. Combine the IV and the encrypted data to create a new "application/octet-stream" blob.
  return new Blob([iv, encryptedBuffer], { type: "application/octet-stream" });
}

// ── A function to decrypt the file (will be useful later for the viewer).
export async function decryptFileBlob(
  encryptedBlob: Blob,
  secretKey: string,
  originalMimeType: string,
): Promise<Blob> {
  const encoder = new TextEncoder();
  const keyHash = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(secretKey),
  );
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyHash,
    { name: "AES-GCM" },
    false,
    ["decrypt"],
  );

  const fullBuffer = await encryptedBlob.arrayBuffer();

  // Extract the first 12 bytes as the IV, and treat the remaining as data.
  const iv = fullBuffer.slice(0, 12);
  const data = fullBuffer.slice(12);

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(iv) },
    cryptoKey,
    data,
  );

  return new Blob([decryptedBuffer], { type: originalMimeType });
}

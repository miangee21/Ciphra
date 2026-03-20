//src/lib/crypto/keys.ts
import { mnemonicToSeed } from "./bip39";

export async function deriveKeyPair(mnemonic: string): Promise<{
  privateKeyB64: string;
  publicKeyB64: string;
}> {
  const seed = mnemonicToSeed(mnemonic);

  // Import first 32 bytes as PBKDF2 key material
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    seed.slice(0, 32),
    { name: "PBKDF2" },
    false,
    ["deriveKey"],
  );

  // Derive AES-256-GCM private key
  const privateKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: seed.slice(32, 64),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );

  // Export private key as base64
  const privateKeyRaw = await crypto.subtle.exportKey("raw", privateKey);
  const privateKeyB64 = btoa(
    String.fromCharCode(...new Uint8Array(privateKeyRaw)),
  );

  // Public key = SHA-256 hash of private key raw bytes (used as identifier)
  const pubHash = await crypto.subtle.digest("SHA-256", privateKeyRaw);
  const publicKeyB64 = btoa(String.fromCharCode(...new Uint8Array(pubHash)));

  return { privateKeyB64, publicKeyB64 };
}

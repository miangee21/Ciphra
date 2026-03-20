//src/lib/crypto/bip39.ts
import {
  generateMnemonic,
  validateMnemonic,
  mnemonicToSeedSync,
} from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english.js";

// Generate a fresh 12-word mnemonic (128 bits entropy)
export const generateMnemonic12 = (): string => generateMnemonic(wordlist, 128);

// Validate that a mnemonic is correct BIP39
export const isValidMnemonic = (mnemonic: string): boolean =>
  validateMnemonic(mnemonic.trim().toLowerCase(), wordlist);

// Convert mnemonic to seed bytes
export const mnemonicToSeed = (mnemonic: string): Uint8Array =>
  mnemonicToSeedSync(mnemonic.trim().toLowerCase());

// Split mnemonic string into array of 12 words
export const mnemonicToWords = (mnemonic: string): string[] =>
  mnemonic.trim().toLowerCase().split(" ");

// Join 12 words array back to mnemonic string
export const wordsToMnemonic = (words: string[]): string =>
  words.map((w) => w.trim().toLowerCase()).join(" ");

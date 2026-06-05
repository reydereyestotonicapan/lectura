import * as Crypto from 'expo-crypto';

export interface NoncePayload {
  rawNonce: string;    // Random 32-char hex string, sent to Firebase
  hashedNonce: string; // SHA-256 of rawNonce, sent to Apple
}

export async function generateNonce(): Promise<NoncePayload> {
  const rawNonce = Array.from(
    { length: 32 },
    () => Math.floor(Math.random() * 16).toString(16)
  ).join('');

  const hashedNonce = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    rawNonce
  );

  return { rawNonce, hashedNonce };
}

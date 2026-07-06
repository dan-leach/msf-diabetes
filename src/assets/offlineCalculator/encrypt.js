/**
 * Encryption module for securing sensitive data before storage.
 *
 * @module encrypt
 * @summary Provides AES encryption for data and RSA encryption for AES keys.
 *
 * @description This module encrypts sensitive data using AES-256-GCM and securely encrypts the AES key using an RSA public key.
 *
 * @requires config - Configuration object containing the RSA public key.
 *
 * @exports encrypt - Function that encrypts data using AES-256-GCM and secures the AES key with RSA encryption.
 */

import { config } from "../fetchConfig.js";

/**
 * Converts an ArrayBuffer (or TypedArray-compatible buffer) to a lowercase hex string.
 *
 * @param {ArrayBuffer} buffer - The binary data to encode.
 * @returns {string} Lowercase hex string (two characters per byte).
 */
function arrayBufferToHex(buffer) {
  return [...new Uint8Array(buffer)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Imports an RSA-OAEP public key from a base64-encoded SPKI PEM string.
 * Strips the PEM header/footer and whitespace before passing the DER bytes to
 * the Web Crypto API.
 *
 * @param {string} pem - PEM-encoded RSA public key (PKCS#8 SPKI format).
 * @returns {Promise<CryptoKey>} Imported CryptoKey usable for RSA-OAEP encryption.
 */
async function importRSAPublicKey(pem) {
  const pemHeader = "-----BEGIN PUBLIC KEY-----";
  const pemFooter = "-----END PUBLIC KEY-----";

  const pemContents = pem
    .replace(pemHeader, "")
    .replace(pemFooter, "")
    .replace(/\s+/g, "");

  const der = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

  return crypto.subtle.importKey(
    "spki",
    der,
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["encrypt"],
  );
}

// Load RSA Public Key asynchronously
const rsaPublicKeyPromise = importRSAPublicKey(config.value.api.rsaPublicKey);

/**
 * Encrypts data using AES-256-GCM.
 *
 * @param {object} data - The data to be encrypted.
 * @returns {object} - The encrypted data, AES key, IV, and authentication tag.
 */
async function encryptDataWithAES(data) {
  const key = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt"],
  );
  const iv = crypto.getRandomValues(new Uint8Array(16));
  const encoded = new TextEncoder().encode(JSON.stringify(data));
  const encryptedFull = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded,
  );
  const encrypted = encryptedFull.slice(0, -16);
  const authTag = encryptedFull.slice(-16);
  const exportedKey = await crypto.subtle.exportKey("raw", key);
  return {
    encrypted: arrayBufferToHex(encrypted),
    key: new Uint8Array(exportedKey),
    iv: arrayBufferToHex(iv),
    authTag: arrayBufferToHex(authTag),
  };
}

/**
 * Encrypts the AES key using RSA public encryption.
 *
 * @param {Uint8Array} aesKey - The AES key to be encrypted.
 * @param {CryptoKey} rsaKey - The RSA public key.
 * @returns {string} - The RSA-encrypted AES key in base64 format.
 */
async function encryptAESKeyWithRSA(aesKey, rsaKey) {
  const encrypted = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    rsaKey,
    aesKey,
  );
  return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
}

/**
 * Encrypts data and secures the AES key using RSA encryption.
 *
 * @param {object} data - The data to be encrypted.
 * @returns {object} - Object containing encrypted data, encrypted AES key, IV, and authentication tag.
 */
async function encrypt(data) {
  try {
    const rsaKey = await rsaPublicKeyPromise;
    const { encrypted, key, iv, authTag } = await encryptDataWithAES(data);
    const encryptedKey = await encryptAESKeyWithRSA(key, rsaKey);
    return { encryptedData: encrypted, encryptedKey, iv, authTag };
  } catch (error) {
    console.error("Encryption error: ", error);
    throw new Error("Encryption failed: " + (error?.message || error));
  }
}

export { encrypt };

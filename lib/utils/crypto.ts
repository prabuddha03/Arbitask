/**
 * @fileoverview Cryptography utilities (hashing, encryption)
 */

import { createHash, randomBytes, createCipheriv, createDecipheriv } from "crypto";

/**
 * Hash string using SHA-256
 */
export function hash(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

/**
 * Hash string using MD5 (less secure, use for non-sensitive data)
 */
export function md5(text: string): string {
  return createHash("md5").update(text).digest("hex");
}

/**
 * Generate random token
 */
export function generateToken(length: number = 32): string {
  return randomBytes(length).toString("hex");
}

/**
 * Generate OTP (numeric)
 */
export function generateOTP(digits: number = 6): string {
  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;
  return Math.floor(Math.random() * (max - min + 1) + min).toString();
}

/**
 * Encrypt text using AES-256-CBC
 */
export function encrypt(text: string, secretKey: string): string {
  const algorithm = "aes-256-cbc";
  const key = createHash("sha256").update(secretKey).digest();
  const iv = randomBytes(16);

  const cipher = createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return iv.toString("hex") + ":" + encrypted;
}

/**
 * Decrypt text using AES-256-CBC
 */
export function decrypt(encryptedText: string, secretKey: string): string {
  const algorithm = "aes-256-cbc";
  const key = createHash("sha256").update(secretKey).digest();

  const parts = encryptedText.split(":");
  const iv = Buffer.from(parts[0], "hex");
  const encrypted = parts[1];

  const decipher = createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * Compare hash with plain text
 */
export function compareHash(text: string, hashedText: string): boolean {
  return hash(text) === hashedText;
}

/**
 * Generate API key
 */
export function generateApiKey(): string {
  return `bl_${randomBytes(32).toString("hex")}`;
}

/**
 * Generate secure random string
 */
export function generateSecureRandom(length: number = 16): string {
  return randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length);
}

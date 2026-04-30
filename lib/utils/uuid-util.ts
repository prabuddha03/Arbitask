import { uuidv7 } from "uuidv7";

/* Generate a new UUIDv7 */
export function generateUUID(): string {
  return uuidv7();
}

/* Extract timestamp from UUIDv7 */
export function extractTimestampFromUUID(uuid: string): Date {
  const hex = uuid.replace(/-/g, "").substring(0, 12);
  const timestamp = parseInt(hex, 16);
  return new Date(timestamp);
}

/* Validate if a string is a valid UUID format */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

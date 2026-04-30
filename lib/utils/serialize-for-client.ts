/**
 * Deep-clone to JSON-serializable plain objects for passing Server Component data
 * into Client Components (avoids Date/BigInt / class instances breaking the RSC boundary).
 */
export function serializeForClient<T>(value: T): T {
  try {
    return JSON.parse(JSON.stringify(value)) as T;
  } catch {
    return value;
  }
}

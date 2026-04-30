/**
 * Smoke tests for Phase 0 infrastructure
 * More complete tests will be added in Phase 1.
 */
import { describe, it, expect } from "vitest";

describe("Phase 0 infrastructure smoke tests", () => {
  it("memoryCache stores and retrieves values", async () => {
    const { memoryCache } = await import("@/lib/cache/memory-cache");
    memoryCache.set("test-key", "test-value");
    expect(memoryCache.get("test-key")).toBe("test-value");
    memoryCache.del("test-key");
    expect(memoryCache.get("test-key")).toBeUndefined();
  });

  it("memoryCache respects TTL", async () => {
    const { memoryCache } = await import("@/lib/cache/memory-cache");
    // Set with 0.001 second TTL (effectively expired immediately)
    memoryCache.set("ttl-key", "value", 0.001);
    // Wait a bit then check
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(memoryCache.get("ttl-key")).toBeUndefined();
  });

  it("ApiErrors returns correct status codes", async () => {
    const { ApiErrors } = await import("@/lib/middlewares/error.middleware");
    const notFound = ApiErrors.NotFound();
    expect(notFound.statusCode).toBe(404);
    const unauthorized = ApiErrors.Unauthorized();
    expect(unauthorized.statusCode).toBe(401);
    const forbidden = ApiErrors.Forbidden();
    expect(forbidden.statusCode).toBe(403);
  });
});

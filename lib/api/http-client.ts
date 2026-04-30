/**
 * @fileoverview HTTP Client with Automatic Token Refresh
 *
 * This module provides a fetch wrapper that automatically handles token refresh
 * on 401 Unauthorized responses. It intercepts failed requests, refreshes the token,
 * and retries the original request.
 */

import { authApi } from "./auth";
import type { AuthResponse } from "@/types/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
const API_VERSION = "/api/v1";

// Track if we're currently refreshing to prevent multiple simultaneous refresh calls
let isRefreshing = false;
let refreshPromise: Promise<AuthResponse | null> | null = null;

// Access tokens are stored in HttpOnly cookies, so we rely on credentials: "include"
// for automatic cookie sending. Manual Authorization headers are not needed.

/**
 * Refresh the access token
 * Uses a singleton pattern to prevent multiple simultaneous refresh calls
 * @param expiredAccessToken - The expired access token (needed to extract sessionId)
 */
async function refreshAccessToken(expiredAccessToken?: string): Promise<AuthResponse | null> {
  // If already refreshing, return the existing promise
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const response = await authApi.refreshToken(expiredAccessToken);
      return response;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Check if a response indicates an authentication error
 */
function isAuthError(response: Response): boolean {
  return response.status === 401;
}

/**
 * Check if a request should skip token refresh (e.g., auth endpoints)
 * Only auth flow endpoints (login, signup, etc.) should skip refresh
 * Protected endpoints like /auth/me and /auth/logout should allow refresh
 */
function shouldSkipRefresh(url: string): boolean {
  const skipPaths = [
    "/auth/identify",
    "/auth/verify-otp",
    "/auth/step2",
    "/auth/create-user",
    "/auth/resolve-conflict",
    "/auth/token/refresh", // Can't refresh itself
    "/auth/oauth",
  ];

  return skipPaths.some((path) => url.includes(path));
}

/**
 * Enhanced fetch with automatic token refresh
 *
 * @param url - Request URL
 * @param options - Fetch options (same as native fetch)
 * @param retryCount - Internal counter to prevent infinite retry loops
 * @returns Promise<Response>
 */
export async function authenticatedFetch(
  url: string | URL,
  options: RequestInit = {},
  retryCount = 0
): Promise<Response> {
  const maxRetries = 1; // Only retry once after refresh

  // Build full URL if relative
  let fullUrl: string;
  if (typeof url === "string" && !url.startsWith("http")) {
    // If URL already starts with API_VERSION, don't add it again
    const normalizedUrl = url.startsWith("/") ? url : `/${url}`;
    if (normalizedUrl.startsWith(API_VERSION)) {
      fullUrl = `${API_BASE}${normalizedUrl}`;
    } else {
      fullUrl = `${API_BASE}${API_VERSION}${normalizedUrl}`;
    }
  } else {
    fullUrl = url.toString();
  }

  // Skip refresh for auth endpoints
  if (shouldSkipRefresh(fullUrl)) {
    return fetch(fullUrl, {
      ...options,
      credentials: "include",
    });
  }

  // Make the initial request
  const requestHeaders = new Headers(options.headers);
  // Only set Content-Type for non-FormData bodies
  // FormData automatically sets Content-Type with boundary - don't override it
  if (!requestHeaders.has("Content-Type") && options.body && !(options.body instanceof FormData)) {
    requestHeaders.set("Content-Type", "application/json");
  }

  let response = await fetch(fullUrl, {
    ...options,
    credentials: "include",
    headers: requestHeaders,
  });

  // If we get a 401 and haven't exceeded retry limit, try to refresh
  if (isAuthError(response) && retryCount < maxRetries) {
    // Clone the response before consuming it (for error handling)
    const clonedResponse = response.clone();

    try {
      // Extract expired access token from the original request (if any)
      // The server needs it to extract sessionId
      const expiredToken = requestHeaders.get("Authorization")?.replace("Bearer ", "");

      // Try to refresh the token
      const refreshResult = await refreshAccessToken(expiredToken || undefined);

      if (refreshResult?.tokens?.accessToken) {
        // Token refreshed successfully, retry the original request
        // Note: The new token is in HttpOnly cookie, so credentials: "include" will send it
        // If the original request had Authorization header, we need to update it
        const retryHeaders = new Headers(options.headers);
        if (retryHeaders.has("Authorization")) {
          retryHeaders.set("Authorization", `Bearer ${refreshResult.tokens.accessToken}`);
        }
        // Don't set Content-Type for FormData (browser sets it automatically with boundary)
        if (
          !retryHeaders.has("Content-Type") &&
          options.body &&
          !(options.body instanceof FormData)
        ) {
          retryHeaders.set("Content-Type", "application/json");
        }

        const retryOptions: RequestInit = {
          ...options,
          credentials: "include",
          headers: retryHeaders,
        };

        response = await fetch(fullUrl, retryOptions);

        // If still 401 after refresh, the refresh token might be invalid
        if (isAuthError(response)) {
          // Clear any stored tokens and redirect to login
          if (typeof window !== "undefined") {
            // Dispatch a custom event that AuthContext can listen to
            window.dispatchEvent(new CustomEvent("auth:token-expired"));
          }
        }
      } else {
        // Refresh failed, token is invalid
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("auth:token-expired"));
        }
      }
    } catch (error) {
      // Refresh failed
      console.error("Token refresh error:", error);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:token-expired"));
      }
      // Return the original 401 response
      return clonedResponse;
    }
  }

  return response;
}

/**
 * Wrapper for authenticated API calls that automatically handles JSON parsing
 */
export async function authenticatedApiCall<T>(
  url: string | URL,
  options: RequestInit = {}
): Promise<T> {
  const response = await authenticatedFetch(url, options);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `API call failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data as T;
}

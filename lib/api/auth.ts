import type {
  ApiResponse,
  AuthResponse,
  IdentifyRequest,
  VerifyOTPRequest,
  Step2Request,
  CreateUserRequest,
  ResolveConflictRequest,
  OAuthIdentifyRequest,
  RefreshTokenRequest,
  LogoutRequest,
  IdentityChannel,
  OAuthProvider,
  ConflictAction,
} from "@/types/auth";
import { authenticatedFetch } from "./http-client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
const API_VERSION = "/api/v1";

class AuthApiError extends Error {
  code: string;
  status: number;
  details?: Record<string, unknown>;

  constructor(code: string, message: string, status: number, details?: Record<string, unknown>) {
    super(message);
    this.name = "AuthApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data: ApiResponse<T> = await response.json();

  if (!data.success || data.error) {
    throw new AuthApiError(
      data.error?.code || "UNKNOWN_ERROR",
      data.error?.message || "An unknown error occurred",
      response.status,
      data.error?.details
    );
  }

  return data.data as T;
}

export const authApi = {
  /**
   * Start authentication with phone or email
   * Sends OTP to the provided identifier
   */
  identify: async (channel: IdentityChannel, identifier: string): Promise<AuthResponse> => {
    const body: IdentifyRequest = {
      channel,
      identifier,
      clientType: "web",
    };

    const res = await fetch(`${API_BASE}${API_VERSION}/auth/identify`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    return handleResponse<AuthResponse>(res);
  },

  /**
   * Start authentication with OAuth provider
   * For web, this initiates a redirect flow
   * For mobile token verification, use identifyWithOAuthToken
   */
  identifyWithOAuth: async (
    provider: OAuthProvider,
    data: Partial<Omit<OAuthIdentifyRequest, "provider" | "clientType">>
  ): Promise<AuthResponse> => {
    const body: OAuthIdentifyRequest = {
      provider,
      ...data,
      clientType: "web",
    };

    const res = await fetch(`${API_BASE}${API_VERSION}/auth/identify/oauth`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    return handleResponse<AuthResponse>(res);
  },

  /**
   * Get OAuth redirect URL for web flow
   */
  getOAuthRedirectUrl: (provider: OAuthProvider): string => {
    return `${API_BASE}${API_VERSION}/auth/oauth/web/${provider}`;
  },

  /**
   * Verify OTP for Step 1 or Step 2
   */
  verifyOTP: async (sessionId: string, otp: string): Promise<AuthResponse> => {
    const body: VerifyOTPRequest = {
      sessionId,
      otp,
      clientType: "web",
    };

    const res = await fetch(`${API_BASE}${API_VERSION}/auth/verify-otp`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    return handleResponse<AuthResponse>(res);
  },

  /**
   * Start Step 2 with second identifier
   * Used when first identifier doesn't find a user
   */
  step2: async (
    sessionId: string,
    channel: IdentityChannel,
    identifier: string
  ): Promise<AuthResponse> => {
    const body: Step2Request = {
      sessionId,
      channel,
      identifier,
      clientType: "web",
    };

    const res = await fetch(`${API_BASE}${API_VERSION}/auth/step2`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    return handleResponse<AuthResponse>(res);
  },

  /**
   * Create a new user after NEW_USER status
   */
  createUser: async (
    sessionId: string,
    profile: {
      fullName: string;
      fullNameBn?: string;
      nickname?: string;
      bio?: string;
      profileImage?: string;
    }
  ): Promise<AuthResponse> => {
    const body = {
      sessionId,
      ...profile,
      clientType: "web",
    };

    const res = await fetch(`${API_BASE}${API_VERSION}/auth/create-user`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    return handleResponse<AuthResponse>(res);
  },

  /**
   * Resolve conflict between session data and existing user
   */
  resolveConflict: async (sessionId: string, action: ConflictAction): Promise<AuthResponse> => {
    const body: ResolveConflictRequest = {
      sessionId,
      action,
      clientType: "web",
    };

    const res = await fetch(`${API_BASE}${API_VERSION}/auth/resolve-conflict`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    return handleResponse<AuthResponse>(res);
  },

  /**
   * Refresh access token
   * For web, refresh token is read from HttpOnly cookie
   * We need to send the (possibly expired) access token in Authorization header
   * so the server can extract the sessionId from it
   */
  refreshToken: async (expiredAccessToken?: string): Promise<AuthResponse> => {
    const body: RefreshTokenRequest = {
      clientType: "web",
    };

    const headers: HeadersInit = { "Content-Type": "application/json" };

    // Include the expired access token if available
    // The server needs it to extract the sessionId
    if (expiredAccessToken) {
      headers["Authorization"] = `Bearer ${expiredAccessToken}`;
    }

    const res = await fetch(`${API_BASE}${API_VERSION}/auth/token/refresh`, {
      method: "POST",
      credentials: "include",
      headers,
      body: JSON.stringify(body),
    });

    return handleResponse<AuthResponse>(res);
  },

  /**
   * Logout current session or all devices
   * Uses authenticatedFetch for automatic token refresh if needed
   */
  logout: async (allDevices = false, accessToken?: string): Promise<void> => {
    const body: LogoutRequest = {
      allDevices,
      clientType: "web",
    };

    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const res = await authenticatedFetch(`${API_BASE}${API_VERSION}/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers,
      body: JSON.stringify(body),
    });

    await handleResponse<{ loggedOut: boolean }>(res);
  },

  /**
   * Get current user profile and sessions
   * Uses authenticatedFetch for automatic token refresh on 401
   */
  me: async (accessToken: string): Promise<AuthResponse> => {
    const res = await authenticatedFetch(`${API_BASE}${API_VERSION}/auth/me`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return handleResponse<AuthResponse>(res);
  },

  /**
   * Resend OTP - re-triggers identify or step2 based on current step
   * @param sessionId - Current session ID (required for step 2, optional for step 1)
   * @param channel - Phone or email channel
   * @param identifier - Phone number or email address
   * @param isStep2 - Whether this is a step 2 resend (default: false)
   */
  resendOTP: async (
    sessionId: string | null,
    channel: IdentityChannel,
    identifier: string,
    isStep2: boolean = false
  ): Promise<AuthResponse> => {
    if (isStep2 && sessionId) {
      // Step 2: Resend OTP for the second identifier using existing session
      return authApi.step2(sessionId, channel, identifier);
    } else {
      // Step 1: Resend OTP by calling identify again (creates new session)
      // Note: This will create a new sessionId, caller should update URL
      return authApi.identify(channel, identifier);
    }
  },
};

export { AuthApiError };
export default authApi;

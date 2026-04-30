/**
 * @fileoverview Cloudflare Stream Utility with RS256 Signed URLs
 *
 * This implementation uses self-signed JWTs (RS256) for secure video playback.
 *
 * WHY THIS APPROACH (vs calling /token API per request):
 * ⚡ Performance: 0ms latency (no API call) vs 200-500ms per request
 * 💰 Cost: No API rate limits, no per-request charges
 * 🎯 Scale: Handle 1000s of token generations/sec
 * 🔒 Security: Private keys never leave your server
 * 🎮 Control: Custom expiry, access rules, IP/geo restrictions
 *
 * SETUP REQUIRED:
 * 1. Generate signing key once: POST /accounts/{account_id}/stream/keys
 * 2. Save base64-encoded JWK and key ID to environment variables
 * 3. This script handles all token generation locally
 */

import * as jose from "jose";

// ============================================
// Configuration
// ============================================

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_TOKEN =
  process.env.CLOUDFLARE_STREAM_API_TOKEN || process.env.CLOUDFLARE_API_TOKEN;
const CLOUDFLARE_CUSTOMER_CODE =
  process.env.CLOUDFLARE_CUSTOMER_CODE || process.env.CLOUDFLARE_STREAM_CUSTOMER_CODE;

// RS256 Signing Key (base64-encoded JWK from Cloudflare)
// Get this once from: POST /accounts/{account_id}/stream/keys
const CLOUDFLARE_STREAM_SIGNING_KEY_JWK = process.env.CLOUDFLARE_STREAM_SIGNING_KEY_JWK;
const CLOUDFLARE_STREAM_SIGNING_KEY_ID = process.env.CLOUDFLARE_STREAM_SIGNING_KEY_ID;

const CLOUDFLARE_STREAM_BASE_URL = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream`;

// ============================================
// Types
// ============================================

export interface CloudflareStreamUploadResponse {
  success: boolean;
  result: {
    uid: string;
    thumbnail: string;
    thumbnailTimestampPct: number;
    readyToStream: boolean;
    status: {
      state: string;
      pctComplete: string;
      errorReasonCode: string;
      errorReasonText: string;
    };
    meta: {
      name: string;
    };
    created: string;
    modified: string;
    size: number;
    playback: {
      hls: string;
      dash: string;
    };
    /** Duration in seconds (float). -1 if unknown. */
    duration?: number;
    preview: string;
    watermark: unknown;
    allowedOrigins: unknown[];
    requireSignedURLs: boolean;
  };
  errors: Array<{ code: number; message: string }>;
  messages: unknown[];
}

export interface SignedStreamUrlOptions {
  videoId: string;
  expiresIn?: number; // seconds, default 2 hours
}

// ============================================
// Direct Upload URL Generation (tus protocol)
// ============================================

export interface DirectUploadUrlOptions {
  filename: string;
  fileSize: number; // in bytes
  requireSignedURLs?: boolean;
  maxDurationSeconds?: number;
  allowedOrigins?: string[];
  watermark?: string;
  meta?: Record<string, string>;
}

export interface DirectUploadUrlResponse {
  uploadUrl: string; // tus upload URL for client to upload directly
  tusEndpoint: string; // tus endpoint URL
  uploadLength: number; // File size in bytes
  // Note: videoId is obtained after upload completes, not from this endpoint
}

/**
 * Generate a direct upload URL for client-side uploads to Cloudflare Stream
 * This bypasses the Next.js server, allowing uploads of any size
 *
 * For files > 200MB, uses tus protocol for resumable uploads
 * For files < 200MB, can use direct upload (non-tus)
 *
 * @param options - Upload options including filename, size, and metadata
 * @returns Direct upload URL and tus endpoint information
 */
export async function generateDirectUploadUrl(
  options: DirectUploadUrlOptions
): Promise<DirectUploadUrlResponse> {
  if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
    throw new Error("Cloudflare Stream configuration is missing");
  }

  try {
    const {
      filename,
      fileSize,
      requireSignedURLs = true,
      maxDurationSeconds,
      allowedOrigins,
      watermark,
      meta,
    } = options;

    // Build metadata object
    const metadata: Record<string, string> = {
      filename: Buffer.from(filename).toString("base64"),
      ...meta,
    };

    if (maxDurationSeconds) {
      metadata.maxDurationSeconds = maxDurationSeconds.toString();
    }

    // Cloudflare Stream uses tus protocol for all direct creator uploads
    // Create tus upload session
    const tusEndpoint = `${CLOUDFLARE_STREAM_BASE_URL}`;

    // Build Upload-Metadata header (tus protocol format: key base64value,key2 base64value2)
    const uploadMetadata = Object.entries(metadata)
      .map(([key, value]) => {
        // Values should be base64 encoded
        const encodedValue = Buffer.from(value).toString("base64");
        return `${key} ${encodedValue}`;
      })
      .join(",");

    // Create tus upload session
    const response = await fetch(tusEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
        "Tus-Resumable": "1.0.0",
        "Upload-Length": fileSize.toString(),
        "Upload-Metadata": uploadMetadata,
        ...(requireSignedURLs !== undefined && {
          "Require-Signed-Urls": requireSignedURLs.toString(),
        }),
        ...(allowedOrigins &&
          allowedOrigins.length > 0 && {
            "Allowed-Origins": allowedOrigins.join(","),
          }),
        ...(watermark && { Watermark: watermark }),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to create tus upload session (${response.status})`;
      try {
        const error = JSON.parse(errorText);
        errorMessage = `Failed to create tus upload session: ${JSON.stringify(error)}`;
      } catch {
        errorMessage = `Failed to create tus upload session: ${errorText}`;
      }
      throw new Error(errorMessage);
    }

    // Get upload URL from Location header (tus protocol standard)
    const uploadUrl = response.headers.get("Location");
    if (!uploadUrl) {
      throw new Error("No upload URL (Location header) returned from Cloudflare Stream");
    }

    // For absolute URLs, return as-is. For relative URLs, make absolute
    const absoluteUploadUrl = uploadUrl.startsWith("http")
      ? uploadUrl
      : `${tusEndpoint}${uploadUrl.startsWith("/") ? "" : "/"}${uploadUrl}`;

    return {
      uploadUrl: absoluteUploadUrl,
      tusEndpoint,
      uploadLength: fileSize,
    };
  } catch (error) {
    console.error("Error generating direct upload URL:", error);
    throw error;
  }
}

// ============================================
// Video Upload
// ============================================

/**
 * Upload video file directly to Cloudflare Stream
 * @param fileBuffer - Video file as Buffer
 * @param filename - Original filename
 * @param metadata - Optional metadata for the video
 * @returns Cloudflare Stream video ID and playback URLs
 */
export async function uploadVideoFileToCloudflareStream(
  fileBuffer: Buffer,
  filename: string,
  metadata?: { name?: string; requireSignedURLs?: boolean }
): Promise<{ videoId: string; playbackUrls: { hls: string; dash: string } }> {
  if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
    throw new Error("Cloudflare Stream configuration is missing");
  }

  try {
    // Use form-data package for Node.js multipart/form-data
    const FormData = (await import("form-data")).default;
    const formData = new FormData();

    // Append the video file
    formData.append("file", fileBuffer, {
      filename,
      contentType: "video/mp4", // Default to mp4, adjust if needed
    });

    // Add metadata if provided
    if (metadata?.name) {
      formData.append("meta", JSON.stringify({ name: metadata.name }));
    }

    // Add requireSignedURLs flag
    const requireSignedURLs = metadata?.requireSignedURLs ?? true;
    formData.append("requireSignedURLs", requireSignedURLs.toString());

    const response = await fetch(`${CLOUDFLARE_STREAM_BASE_URL}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
        ...formData.getHeaders(), // This sets Content-Type with boundary
      },
      body: formData as unknown as BodyInit,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Cloudflare Stream upload failed: ${JSON.stringify(error)}`);
    }

    const data = (await response.json()) as CloudflareStreamUploadResponse;

    if (!data.success || !data.result) {
      throw new Error(`Cloudflare Stream upload failed: ${JSON.stringify(data.errors)}`);
    }

    return {
      videoId: data.result.uid,
      playbackUrls: {
        hls: data.result.playback.hls,
        dash: data.result.playback.dash,
      },
    };
  } catch (error) {
    console.error("Error uploading video file to Cloudflare Stream:", error);
    throw error;
  }
}

/**
 * Upload video to Cloudflare Stream from URL
 * @param videoUrl - URL of the video to upload
 * @param metadata - Optional metadata for the video
 * @returns Cloudflare Stream video ID and playback URLs
 */
export async function uploadVideoToCloudflareStream(
  videoUrl: string,
  metadata?: { name?: string; requireSignedURLs?: boolean }
): Promise<{ videoId: string; playbackUrls: { hls: string; dash: string } }> {
  if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
    throw new Error("Cloudflare Stream configuration is missing");
  }

  try {
    const response = await fetch(`${CLOUDFLARE_STREAM_BASE_URL}/copy`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: videoUrl,
        meta: metadata?.name ? { name: metadata.name } : undefined,
        requireSignedURLs: metadata?.requireSignedURLs ?? true, // Default to true for security
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Cloudflare Stream upload failed: ${JSON.stringify(error)}`);
    }

    const data = (await response.json()) as CloudflareStreamUploadResponse;

    if (!data.success || !data.result) {
      throw new Error(`Cloudflare Stream upload failed: ${JSON.stringify(data.errors)}`);
    }

    return {
      videoId: data.result.uid,
      playbackUrls: {
        hls: data.result.playback.hls,
        dash: data.result.playback.dash,
      },
    };
  } catch (error) {
    console.error("Error uploading video to Cloudflare Stream:", error);
    throw error;
  }
}

/**
 * Update Cloudflare Stream video settings
 * @param videoId - Cloudflare Stream video ID
 * @param settings - Settings to update
 * @returns Updated video information
 */
export async function updateStreamVideoSettings(
  videoId: string,
  settings: { requireSignedURLs?: boolean; allowedOrigins?: string[] }
): Promise<{ success: boolean }> {
  if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
    throw new Error("Cloudflare Stream configuration is missing");
  }

  try {
    const response = await fetch(`${CLOUDFLARE_STREAM_BASE_URL}/${videoId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requireSignedURLs: settings.requireSignedURLs,
        allowedOrigins: settings.allowedOrigins,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to update video settings: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    return { success: data.success || false };
  } catch (error) {
    console.error("Error updating video settings:", error);
    throw error;
  }
}

/**
 * Get Cloudflare Stream video details
 * @param videoId - Cloudflare Stream video ID
 * @returns Video information including duration and requireSignedURLs status
 */
export async function getStreamVideoDetails(videoId: string): Promise<{
  uid: string;
  requireSignedURLs: boolean;
  allowedOrigins: string[];
  readyToStream: boolean;
  /** Duration in seconds. -1 or undefined if unknown. */
  durationSec: number;
}> {
  if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
    throw new Error("Cloudflare Stream configuration is missing");
  }

  try {
    const response = await fetch(`${CLOUDFLARE_STREAM_BASE_URL}/${videoId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to get video details: ${JSON.stringify(error)}`);
    }

    const data = (await response.json()) as CloudflareStreamUploadResponse;
    if (!data.success || !data.result) {
      throw new Error(`Failed to get video details: ${JSON.stringify(data.errors)}`);
    }

    const rawDuration = data.result.duration;
    const durationSec =
      typeof rawDuration === "number" && rawDuration >= 0 ? Math.round(rawDuration) : -1;

    return {
      uid: data.result.uid,
      requireSignedURLs: data.result.requireSignedURLs,
      allowedOrigins: (data.result.allowedOrigins || []) as string[],
      readyToStream: data.result.readyToStream,
      durationSec,
    };
  } catch (error) {
    console.error("Error getting video details:", error);
    throw error;
  }
}

// ============================================
// Signed URL Generation (RS256)
// ============================================

/**
 * Generate Stream JWT token for signed URLs using RS256
 *
 * This is the PREFERRED method for production:
 * - No API calls = instant token generation
 * - No rate limits
 * - Full control over expiry and access rules
 *
 * @param videoId - The video UID (not a token)
 * @param expiresInSec - Token lifetime in seconds
 * @returns JWT token string
 */
async function generateStreamToken(videoId: string, expiresInSec: number): Promise<string> {
  if (!CLOUDFLARE_STREAM_SIGNING_KEY_JWK || !CLOUDFLARE_STREAM_SIGNING_KEY_ID) {
    throw new Error(
      "Cloudflare Stream signing key configuration is missing.\n" +
        "Run: node scripts/setup-stream-keys.js to generate keys."
    );
  }

  try {
    // Decode the base64-encoded JWK
    // Cloudflare returns JWK as base64-encoded JSON string
    let jwk: jose.JWK;
    try {
      const jwkJson = Buffer.from(CLOUDFLARE_STREAM_SIGNING_KEY_JWK, "base64").toString("utf8");
      jwk = JSON.parse(jwkJson) as jose.JWK;
    } catch (decodeError) {
      // If base64 decode fails, try parsing as direct JSON (in case it's not base64-encoded)
      try {
        jwk = JSON.parse(CLOUDFLARE_STREAM_SIGNING_KEY_JWK) as jose.JWK;
      } catch {
        throw new Error(
          `Invalid JWK format. Expected base64-encoded JSON or JSON string. Error: ${decodeError instanceof Error ? decodeError.message : String(decodeError)}`
        );
      }
    }

    // Import the JWK private key using jose library (supports JWK natively)
    const privateKey = await jose.importJWK(jwk, "RS256");

    const expiresAt = Math.floor(Date.now() / 1000) + expiresInSec;

    // Create and sign the JWT using jose
    const token = await new jose.SignJWT({
      // Payload
      sub: videoId,
      kid: CLOUDFLARE_STREAM_SIGNING_KEY_ID,
      // Access rules: allow any authenticated request
      // Add IP/geo restrictions here if needed:
      // accessRules: [
      //   { type: "ip.geoip.country", action: "allow", country: ["US", "CA"] },
      //   { type: "any", action: "block" }
      // ]
      accessRules: [
        {
          type: "any",
          action: "allow",
        },
      ],
    })
      .setProtectedHeader({
        alg: "RS256",
        kid: CLOUDFLARE_STREAM_SIGNING_KEY_ID,
      })
      .setIssuedAt(Math.floor(Date.now() / 1000))
      .setExpirationTime(expiresAt)
      .setSubject(videoId)
      .sign(privateKey);

    return token;
  } catch (error) {
    console.error("Error generating Stream token:", error);
    throw new Error("Failed to generate signed Stream token");
  }
}

/**
 * Generate signed playback URL for Cloudflare Stream (HLS + iframe)
 *
 * ARCHITECTURE:
 * 1. Client requests podcast → Backend verifies auth + subscription
 * 2. Backend generates signed JWT locally (no API call)
 * 3. Client receives token + HLS URL
 * 4. Client plays video using token (valid for 15 min)
 * 5. On expiry, client calls /refresh-playback for new token
 *
 * SECURITY:
 * - Tokens are short-lived (15 min recommended)
 * - Tokens are tied to specific video UID
 * - Tokens cannot be reused across domains (if allowedOrigins set)
 * - Private key never reaches client
 *
 * @param videoId - The video UID (not the signed token)
 * @param expiresIn - Token lifetime in seconds (default: 2 hours)
 * @returns Signed HLS URL, iframe URL, and token
 */
export async function generateSignedStreamUrl({
  videoId,
  expiresIn = 2 * 60 * 60, // 2 hours
}: SignedStreamUrlOptions): Promise<{
  hls: string;
  iframe: string;
  token: string;
  expiresIn: number;
}> {
  if (!CLOUDFLARE_CUSTOMER_CODE) {
    throw new Error("CLOUDFLARE_CUSTOMER_CODE is not set");
  }

  const token = await generateStreamToken(videoId, expiresIn);

  // Use token instead of videoId in URL
  const baseUrl = `https://customer-${CLOUDFLARE_CUSTOMER_CODE}.cloudflarestream.com`;

  return {
    hls: `${baseUrl}/${token}/manifest/video.m3u8`,
    iframe: `${baseUrl}/${token}/iframe`,
    token, // Return token separately for custom players
    expiresIn,
  };
}

/**
 * Get public playback URLs (for non-premium content)
 *
 * IMPORTANT: Only use this for videos with requireSignedURLs = false
 * For premium content, always use generateSignedStreamUrl()
 *
 * @param videoId - Cloudflare Stream video ID (not a token)
 * @returns Public HLS and iframe URLs
 */
export function getPublicStreamUrls(videoId: string): { hls: string; iframe: string } {
  if (!CLOUDFLARE_CUSTOMER_CODE) {
    throw new Error("CLOUDFLARE_CUSTOMER_CODE is not set");
  }

  const baseUrl = `https://customer-${CLOUDFLARE_CUSTOMER_CODE}.cloudflarestream.com`;
  return {
    hls: `${baseUrl}/${videoId}/manifest/video.m3u8`,
    iframe: `${baseUrl}/${videoId}/iframe`,
  };
}

// ============================================
// Helper: Setup Instructions
// ============================================

/**
 * Print setup instructions for Cloudflare Stream signing keys
 * Run this if you haven't generated keys yet
 */
export function printSetupInstructions(): void {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║  Cloudflare Stream Signing Keys Setup                          ║
╚════════════════════════════════════════════════════════════════╝

Step 1: Generate signing key (run once)
----------------------------------------
curl --request POST \\
  "https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/stream/keys" \\
  --header "Authorization: Bearer {API_TOKEN}"

Step 2: Extract values from response
-------------------------------------
{
  "result": {
    "id": "abc123...",           ← CLOUDFLARE_STREAM_SIGNING_KEY_ID
    "jwk": "eyJ1c2UiOi...",      ← CLOUDFLARE_STREAM_SIGNING_KEY_JWK (base64)
    "pem": "LS0tLS1CRU..."       ← Not needed (we use JWK)
  }
}

Step 3: Add to .env
-------------------
CLOUDFLARE_STREAM_SIGNING_KEY_JWK=eyJ1c2UiOi...
CLOUDFLARE_STREAM_SIGNING_KEY_ID=abc123...
CLOUDFLARE_CUSTOMER_CODE=your_customer_code

Step 4: Enable signed URLs in Cloudflare Dashboard
---------------------------------------------------
1. Go to Stream → Settings
2. Enable "Require Signed URLs" for premium videos
3. Set "Allowed Origins" (optional, for domain restrictions)

Done! Your app can now generate signed URLs locally.
  `);
}

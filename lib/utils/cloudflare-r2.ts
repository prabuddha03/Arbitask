/**
 * @fileoverview Cloudflare R2 Storage Utility
 *
 * Provides functions to upload files to Cloudflare R2 bucket
 * R2 is S3-compatible, so we use AWS SDK v3
 */

import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// ============================================
// Configuration
// ============================================

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL; // Optional: custom domain for R2

// ============================================
// Types
// ============================================

export interface R2UploadOptions {
  key: string; // Path/key in R2 bucket (e.g., "podcasts/thumbnails/abc123.jpg")
  buffer: Buffer;
  contentType?: string;
  metadata?: Record<string, string>;
}

export interface R2UploadResult {
  key: string;
  url: string; // Public URL to access the file
  bucket: string;
}

// ============================================
// R2 Client
// ============================================

/**
 * Get configured R2 client
 */
function getR2Client(): S3Client {
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
    throw new Error(
      "R2 configuration is missing. Required: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME"
    );
  }

  return new S3Client({
    region: "auto", // R2 uses 'auto' for region
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
}

// ============================================
// Upload Functions
// ============================================

/**
 * Upload a file to R2
 * @param options - Upload options including key, buffer, and metadata
 * @returns Upload result with URL
 */
export async function uploadToR2(options: R2UploadOptions): Promise<R2UploadResult> {
  const { key, buffer, contentType = "application/octet-stream", metadata } = options;

  if (!R2_BUCKET_NAME) {
    throw new Error("R2_BUCKET_NAME is not configured");
  }

  try {
    const client = getR2Client();

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      Metadata: metadata,
    });

    await client.send(command);

    // Generate public URL
    // If custom domain is configured, use it; otherwise use R2 default URL
    const url = R2_PUBLIC_URL
      ? `${R2_PUBLIC_URL}/${key}`
      : `https://${R2_BUCKET_NAME}.${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`;

    return {
      key,
      url,
      bucket: R2_BUCKET_NAME,
    };
  } catch (error) {
    console.error("Error uploading to R2:", error);
    throw error;
  }
}

/**
 * Upload an image file to R2
 * @param buffer - Image file buffer
 * @param filename - Original filename
 * @param folder - Optional folder path (e.g., "podcasts/thumbnails")
 * @returns Upload result with URL
 */
export async function uploadImageToR2(
  buffer: Buffer,
  filename: string,
  folder: string = "images"
): Promise<R2UploadResult> {
  // Generate unique key with timestamp
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  const key = `${folder}/${timestamp}-${sanitizedFilename}`;

  // Detect content type from filename
  const ext = filename.toLowerCase().split(".").pop();
  const contentTypeMap: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    avif: "image/avif",
  };
  const contentType = contentTypeMap[ext || ""] || "image/jpeg";

  return uploadToR2({
    key,
    buffer,
    contentType,
    metadata: {
      originalFilename: filename,
      uploadedAt: new Date().toISOString(),
    },
  });
}

/**
 * Upload a video file to R2
 * @param buffer - Video file buffer
 * @param filename - Original filename
 * @param folder - Optional folder path (e.g., "podcasts/thumbnail-videos")
 * @returns Upload result with URL
 */
export async function uploadVideoToR2(
  buffer: Buffer,
  filename: string,
  folder: string = "videos"
): Promise<R2UploadResult> {
  // Generate unique key with timestamp
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  const key = `${folder}/${timestamp}-${sanitizedFilename}`;

  // Detect content type from filename
  const ext = filename.toLowerCase().split(".").pop();
  const contentTypeMap: Record<string, string> = {
    mp4: "video/mp4",
    webm: "video/webm",
    ogg: "video/ogg",
    mov: "video/quicktime",
    avi: "video/x-msvideo",
    mkv: "video/x-matroska",
    flv: "video/x-flv",
    wmv: "video/x-ms-wmv",
    m4v: "video/x-m4v",
    "3gp": "video/3gpp",
  };
  const contentType = contentTypeMap[ext || ""] || "video/mp4";

  return uploadToR2({
    key,
    buffer,
    contentType,
    metadata: {
      originalFilename: filename,
      uploadedAt: new Date().toISOString(),
      type: "thumbnail-video",
    },
  });
}

/**
 * Generate a presigned URL for direct upload to R2
 * This allows clients to upload files directly to R2, bypassing Next.js body size limits
 * @param key - The key/path where the file will be stored in R2
 * @param contentType - MIME type of the file (e.g., "video/mp4")
 * @param expiresIn - URL expiration time in seconds (default: 3600 = 1 hour)
 * @returns Presigned URL and the key where the file will be stored
 */
export async function generateR2PresignedUrl(
  key: string,
  contentType: string,
  expiresIn: number = 3600
): Promise<{ presignedUrl: string; key: string; url: string }> {
  if (!R2_BUCKET_NAME) {
    throw new Error("R2_BUCKET_NAME is not configured");
  }

  try {
    const client = getR2Client();

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    const presignedUrl = await getSignedUrl(client, command, { expiresIn });

    // Generate public URL (same as in uploadToR2)
    const url = R2_PUBLIC_URL
      ? `${R2_PUBLIC_URL}/${key}`
      : `https://${R2_BUCKET_NAME}.${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`;

    return {
      presignedUrl,
      key,
      url,
    };
  } catch (error) {
    console.error("Error generating R2 presigned URL:", error);
    throw error;
  }
}

/**
 * Generate a presigned URL for thumbnail video upload
 * @param filename - Original filename
 * @param contentType - MIME type (e.g., "video/mp4")
 * @param expiresIn - URL expiration time in seconds (default: 3600)
 * @returns Presigned URL and file information
 */
export async function generateThumbnailVideoPresignedUrl(
  filename: string,
  contentType: string,
  expiresIn: number = 3600
): Promise<{ presignedUrl: string; key: string; url: string }> {
  // Generate unique key with timestamp
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  const key = `podcasts/thumbnail-videos/${timestamp}-${sanitizedFilename}`;

  return generateR2PresignedUrl(key, contentType, expiresIn);
}

/**
 * Check if a file exists in R2
 * @param key - The key/path of the object in R2
 * @returns true if object exists, false otherwise
 */
export async function checkR2FileExists(key: string): Promise<boolean> {
  if (!R2_BUCKET_NAME) {
    throw new Error("R2_BUCKET_NAME is not configured");
  }

  try {
    const client = getR2Client();
    const command = new HeadObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });
    await client.send(command);
    return true;
  } catch (error: any) {
    if (error.name === "NotFound" || error.$metadata?.httpStatusCode === 404) {
      return false;
    }
    console.warn(`Warning: Error checking R2 object ${key}:`, error.message);
    return false;
  }
}

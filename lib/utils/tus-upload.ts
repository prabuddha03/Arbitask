/**
 * @fileoverview Client-side tus upload utility for Cloudflare Stream
 *
 * This utility helps clients upload videos to Cloudflare Stream
 * using the tus protocol through a server proxy (to avoid CORS issues).
 *
 * Usage:
 * 1. Get upload URL from /api/v1/podcasts/upload-url
 * 2. Use this utility to upload the file (chunks go through our proxy)
 * 3. Get videoId from Cloudflare response
 */

import { API_PREFIX } from "@/lib/api/client";

export interface TusUploadOptions {
  uploadUrl: string;
  file: File;
  onProgress?: (bytesUploaded: number, bytesTotal: number) => void;
  onSuccess?: (videoId: string) => void;
  onError?: (error: Error) => void;
}

export interface TusUploadResult {
  videoId: string;
  uploadUrl: string;
}

/**
 * Upload a file to Cloudflare Stream using tus protocol
 * This is a simple implementation. For production, consider using tus-js-client library
 *
 * @param options - Upload options
 * @returns Promise with video ID
 */
export async function uploadWithTus(options: TusUploadOptions): Promise<TusUploadResult> {
  const { uploadUrl, file, onProgress, onSuccess, onError } = options;

  try {
    // Upload the file in chunks through our proxy endpoint
    // This avoids CORS issues by routing through our server
    const chunkSize = 5 * 1024 * 1024; // 5MB chunks (Cloudflare minimum is ~5MB)
    let currentOffset = 0;
    let videoId: string | null = null;

    while (currentOffset < file.size) {
      const chunk = file.slice(currentOffset, currentOffset + chunkSize);
      const chunkArrayBuffer = await chunk.arrayBuffer();

      // Convert ArrayBuffer to base64 for JSON transmission
      // Use FileReader for efficient base64 encoding (handles large chunks better)
      const base64Chunk = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Remove data URL prefix (data:application/octet-stream;base64,)
          const base64 = result.split(",")[1] || result;
          resolve(base64);
        };
        reader.onerror = reject;
        // Convert ArrayBuffer to Blob for FileReader
        const blob = new Blob([chunkArrayBuffer]);
        reader.readAsDataURL(blob);
      });

      // Upload chunk through our proxy endpoint
      const proxyResponse = await fetch(`${API_PREFIX}/podcasts/upload-proxy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies for auth
        body: JSON.stringify({
          uploadUrl,
          chunk: base64Chunk,
          offset: currentOffset,
        }),
      });

      if (!proxyResponse.ok) {
        const errorData = await proxyResponse.json();
        throw new Error(errorData.message || `Upload failed: ${proxyResponse.status}`);
      }

      const proxyData = await proxyResponse.json();
      if (!proxyData.success) {
        throw new Error(proxyData.message || "Upload failed");
      }

      // Update offset from response
      currentOffset = proxyData.data.offset;

      // Check if videoId is available (upload might be complete)
      if (proxyData.data.videoId) {
        videoId = proxyData.data.videoId;
      }

      // Report progress
      if (onProgress) {
        onProgress(currentOffset, file.size);
      }

      // Check if upload is complete
      if (proxyData.data.complete || currentOffset >= file.size) {
        break;
      }
    }

    // If we don't have videoId yet, we need to query the upload status
    // The videoId should be in Stream-Media-Id header from the last chunk response
    if (!videoId) {
      // Try to extract from upload URL as fallback
      // Cloudflare tus upload URLs sometimes contain the video ID
      const urlMatch = uploadUrl.match(/[\/-]([a-f0-9]{32})/i);
      if (urlMatch && urlMatch[1]) {
        videoId = urlMatch[1];
      } else {
        // Last resort: query the upload status via HEAD request through our server
        // This would require another endpoint, but for now we'll throw an error
        throw new Error("Video ID not found. Upload may have failed or is still processing.");
      }
    }

    if (onSuccess) {
      onSuccess(videoId);
    }

    return { videoId, uploadUrl };
  } catch (error) {
    const uploadError = error instanceof Error ? error : new Error(String(error));
    if (onError) {
      onError(uploadError);
    }
    throw uploadError;
  }
}

/**
 * Simple tus upload using fetch (for smaller files or simple use cases)
 * For production with large files, use tus-js-client library instead
 */
export async function simpleTusUpload(
  uploadUrl: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  const result = await uploadWithTus({
    uploadUrl,
    file,
    onProgress: onProgress ? (uploaded, total) => onProgress((uploaded / total) * 100) : undefined,
  });

  return result.videoId;
}

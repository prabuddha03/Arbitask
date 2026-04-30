/**
 * @fileoverview Cloudflare Images Utility
 *
 * Modern implementation for Cloudflare Images with:
 * - URL uploads (from existing images)
 * - Direct file uploads (from FormData/Buffer)
 * - Automatic variant generation
 * - Metadata support
 * - Error handling
 *
 * IMPORTANT: Variants must be configured in Cloudflare Dashboard first:
 * - Go to Cloudflare Dashboard → Images → Variants
 * - Create variants: card (600x400), heroLg (1440x860), mini (240x160)
 */

// ============================================
// Configuration
// ============================================

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_IMAGES_API_TOKEN = process.env.CLOUDFLARE_IMAGES_API_TOKEN;
const CLOUDFLARE_IMAGES_ACCOUNT_HASH = process.env.CLOUDFLARE_IMAGES_ACCOUNT_HASH;

const CLOUDFLARE_IMAGES_BASE_URL = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v1`;

// Image variants configuration
// These must match the variants configured in Cloudflare Dashboard
export const IMAGE_VARIANTS = {
  card: { width: 600, height: 400 },
  heroLg: { width: 1440, height: 860 },
  mini: { width: 240, height: 160 },
} as const;

export type ImageVariant = keyof typeof IMAGE_VARIANTS;

// ============================================
// Types
// ============================================

export interface CloudflareImageUploadResponse {
  success: boolean;
  result: {
    id: string;
    filename: string;
    uploaded: string;
    requireSignedURLs: boolean;
    variants: string[];
  };
  errors: Array<{ code: number; message: string }>;
  messages: unknown[];
}

export interface ImageVariants {
  card: string;
  heroLg: string;
  mini: string;
}

export interface UploadImageOptions {
  /**
   * Optional metadata to attach to the image
   */
  metadata?: Record<string, string>;
  /**
   * Whether to require signed URLs for this image
   * @default false
   */
  requireSignedURLs?: boolean;
  /**
   * Filename for the image (used when uploading from file/buffer)
   */
  filename?: string;
}

// ============================================
// Functions
// ============================================

/**
 * Upload image to Cloudflare Images from URL
 *
 * This is the recommended method when you have an existing image URL.
 * Cloudflare will fetch the image from the URL and process it.
 *
 * @param imageUrl - URL of the image to upload (must be publicly accessible)
 * @param options - Upload options (metadata, requireSignedURLs)
 * @returns Cloudflare image ID and variant URLs
 *
 * @example
 * ```typescript
 * const result = await uploadImageToCloudflare(
 *   "https://example.com/image.jpg",
 *   {
 *     metadata: { title: "Article thumbnail" },
 *     requireSignedURLs: false
 *   }
 * );
 * // Returns: { imageId: "abc123", variants: { card: "...", heroLg: "...", mini: "..." } }
 * ```
 */
export async function uploadImageToCloudflare(
  imageUrl: string,
  options?: UploadImageOptions
): Promise<{ imageId: string; variants: ImageVariants }> {
  if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_IMAGES_API_TOKEN) {
    throw new Error(
      "Cloudflare Images configuration is missing. Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_IMAGES_API_TOKEN"
    );
  }

  // Validate URL
  try {
    new URL(imageUrl);
  } catch {
    throw new Error(`Invalid image URL: ${imageUrl}`);
  }

  try {
    const formData = new FormData();
    formData.append("url", imageUrl);

    // Add metadata if provided
    if (options?.metadata) {
      Object.entries(options.metadata).forEach(([key, value]) => {
        formData.append(`metadata[${key}]`, value);
      });
    }

    // Add requireSignedURLs if specified
    if (options?.requireSignedURLs !== undefined) {
      formData.append("requireSignedURLs", String(options.requireSignedURLs));
    }

    const response = await fetch(`${CLOUDFLARE_IMAGES_BASE_URL}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CLOUDFLARE_IMAGES_API_TOKEN}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Unknown error" }));
      throw new Error(`Cloudflare Images upload failed: ${JSON.stringify(error)}`);
    }

    const data = (await response.json()) as CloudflareImageUploadResponse;

    if (!data.success || !data.result) {
      throw new Error(`Cloudflare Images upload failed: ${JSON.stringify(data.errors)}`);
    }

    // Build variant URLs using account hash
    const accountHash = CLOUDFLARE_IMAGES_ACCOUNT_HASH || CLOUDFLARE_ACCOUNT_ID;
    const baseUrl = `https://imagedelivery.net/${accountHash}`;
    const variants: ImageVariants = {
      card: `${baseUrl}/${data.result.id}/card`,
      heroLg: `${baseUrl}/${data.result.id}/heroLg`,
      mini: `${baseUrl}/${data.result.id}/mini`,
    };

    return {
      imageId: data.result.id,
      variants,
    };
  } catch (error) {
    console.error("Error uploading image to Cloudflare Images:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to upload image to Cloudflare Images");
  }
}

/**
 * Upload image to Cloudflare Images from file buffer
 *
 * Use this when you have the image file directly (e.g., from a file upload).
 *
 * @param fileBuffer - Image file as Buffer or ArrayBuffer
 * @param filename - Original filename (e.g., "image.jpg")
 * @param options - Upload options (metadata, requireSignedURLs)
 * @returns Cloudflare image ID and variant URLs
 *
 * @example
 * ```typescript
 * const fileBuffer = await file.arrayBuffer();
 * const result = await uploadImageFileToCloudflare(
 *   Buffer.from(fileBuffer),
 *   "thumbnail.jpg",
 *   { metadata: { title: "Article thumbnail" } }
 * );
 * ```
 */
export async function uploadImageFileToCloudflare(
  fileBuffer: Buffer | ArrayBuffer,
  filename: string,
  options?: UploadImageOptions
): Promise<{ imageId: string; variants: ImageVariants }> {
  if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_IMAGES_API_TOKEN) {
    throw new Error(
      "Cloudflare Images configuration is missing. Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_IMAGES_API_TOKEN"
    );
  }

  if (!filename || !filename.trim()) {
    throw new Error("Filename is required for file uploads");
  }

  try {
    const formData = new FormData();

    // Convert to ArrayBuffer for Blob compatibility
    let arrayBuffer: ArrayBuffer;
    if (fileBuffer instanceof Buffer) {
      // Buffer is compatible with Blob in Node.js environments
      arrayBuffer = fileBuffer.buffer.slice(
        fileBuffer.byteOffset,
        fileBuffer.byteOffset + fileBuffer.byteLength
      ) as ArrayBuffer;
    } else {
      arrayBuffer = fileBuffer as ArrayBuffer;
    }

    // Create a Blob from the buffer
    const blob = new Blob([arrayBuffer], { type: getContentTypeFromFilename(filename) });
    formData.append("file", blob, filename);

    // Add metadata if provided
    if (options?.metadata) {
      Object.entries(options.metadata).forEach(([key, value]) => {
        formData.append(`metadata[${key}]`, value);
      });
    }

    // Add requireSignedURLs if specified
    if (options?.requireSignedURLs !== undefined) {
      formData.append("requireSignedURLs", String(options.requireSignedURLs));
    }

    const response = await fetch(`${CLOUDFLARE_IMAGES_BASE_URL}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CLOUDFLARE_IMAGES_API_TOKEN}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Unknown error" }));
      throw new Error(`Cloudflare Images upload failed: ${JSON.stringify(error)}`);
    }

    const data = (await response.json()) as CloudflareImageUploadResponse;

    if (!data.success || !data.result) {
      throw new Error(`Cloudflare Images upload failed: ${JSON.stringify(data.errors)}`);
    }

    // Build variant URLs
    const accountHash = CLOUDFLARE_IMAGES_ACCOUNT_HASH || CLOUDFLARE_ACCOUNT_ID;
    const baseUrl = `https://imagedelivery.net/${accountHash}`;
    const variants: ImageVariants = {
      card: `${baseUrl}/${data.result.id}/card`,
      heroLg: `${baseUrl}/${data.result.id}/heroLg`,
      mini: `${baseUrl}/${data.result.id}/mini`,
    };

    return {
      imageId: data.result.id,
      variants,
    };
  } catch (error) {
    console.error("Error uploading image file to Cloudflare Images:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to upload image file to Cloudflare Images");
  }
}

/**
 * Get content type from filename
 * @param filename - File name with extension
 * @returns MIME type
 */
export function getContentTypeFromFilename(filename: string): string {
  const ext = filename.toLowerCase().split(".").pop();
  const contentTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    avif: "image/avif",
  };
  return contentTypes[ext || ""] || "image/jpeg";
}

/**
 * Get image variant URL
 * @param imageId - Cloudflare image ID
 * @param variant - Variant name (card, heroLg, mini)
 * @returns Variant URL
 */
export function getImageVariantUrl(imageId: string, variant: ImageVariant): string {
  const accountHash = CLOUDFLARE_IMAGES_ACCOUNT_HASH || CLOUDFLARE_ACCOUNT_ID;
  if (!accountHash) {
    throw new Error("Cloudflare Images account hash is missing");
  }
  return `https://imagedelivery.net/${accountHash}/${imageId}/${variant}`;
}

/**
 * Get all image variants
 * @param imageId - Cloudflare image ID
 * @returns Object with all variant URLs
 */
export function getImageVariants(imageId: string): ImageVariants {
  return {
    card: getImageVariantUrl(imageId, "card"),
    heroLg: getImageVariantUrl(imageId, "heroLg"),
    mini: getImageVariantUrl(imageId, "mini"),
  };
}

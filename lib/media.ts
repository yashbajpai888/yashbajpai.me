/**
 * Helper utilities for media validation, video detection, and batch uploads.
 */

export interface MediaValidationResult {
  valid: boolean;
  error?: string;
}

export function validateImageFile(file: File, maxMb = 10): MediaValidationResult {
  if (!file) return { valid: false, error: "No file selected." };
  if (!file.type.startsWith("image/")) {
    return { valid: false, error: "Selected file is not an image (allowed: JPG, PNG, WebP, SVG, GIF)." };
  }
  const maxBytes = maxMb * 1024 * 1024;
  if (file.size > maxBytes) {
    return { valid: false, error: `Image size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds ${maxMb}MB limit.` };
  }
  return { valid: true };
}

export function validateVideoFile(file: File, maxMb = 250): MediaValidationResult {
  if (!file) return { valid: false, error: "No file selected." };
  const isVideo = file.type.startsWith("video/") || 
    /\.(mp4|webm|mov|m4v|avi|mkv)$/i.test(file.name);
  if (!isVideo) {
    return { valid: false, error: "Selected file is not a valid video (allowed: MP4, WebM, MOV)." };
  }
  const maxBytes = maxMb * 1024 * 1024;
  if (file.size > maxBytes) {
    return { valid: false, error: `Video size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds ${maxMb}MB limit.` };
  }
  return { valid: true };
}

export function extractGoogleDriveFileId(url?: string): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();

  // Pattern 1: /file/d/FILE_ID
  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) {
    return fileDMatch[1];
  }

  // Pattern 2: id=FILE_ID or &id=FILE_ID
  const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch && idMatch[1]) {
    return idMatch[1];
  }

  // Pattern 3: Bare file ID
  if (/^[a-zA-Z0-9_-]{20,60}$/.test(trimmed) && !trimmed.includes("http") && !trimmed.includes(".")) {
    return trimmed;
  }

  return null;
}

export function getGoogleDriveEmbedUrl(urlOrId?: string): string | null {
  const fileId = extractGoogleDriveFileId(urlOrId);
  if (!fileId) return null;
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

export function isValidGoogleDriveUrl(url?: string): boolean {
  if (!url || !url.trim()) return false;
  return extractGoogleDriveFileId(url) !== null;
}

export function isVideoUrl(url?: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return (
    lower.endsWith(".mp4") ||
    lower.endsWith(".webm") ||
    lower.endsWith(".mov") ||
    lower.includes("video/") ||
    lower.includes("youtube.com") ||
    lower.includes("youtu.be") ||
    lower.includes("vimeo.com") ||
    lower.includes("drive.google.com") ||
    extractGoogleDriveFileId(url) !== null
  );
}

export function getEmbedVideoUrl(url: string): string {
  if (!url) return "";
  if (url.includes("drive.google.com") || extractGoogleDriveFileId(url)) {
    const embedUrl = getGoogleDriveEmbedUrl(url);
    if (embedUrl) return embedUrl;
  }
  if (url.includes("youtube.com/watch?v=")) {
    const videoId = url.split("v=")[1]?.split("&")[0];
    return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  }
  if (url.includes("youtu.be/")) {
    const videoId = url.split("youtu.be/")[1]?.split("?")[0];
    return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  }
  if (url.includes("vimeo.com/")) {
    const videoId = url.split("vimeo.com/")[1]?.split("?")[0];
    return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
  }
  return url;
}

export function isVideoCategory(categoryStr?: string): boolean {
  if (!categoryStr) return false;
  const c = categoryStr.toUpperCase().trim();
  return (
    c.includes("AI VIDEO") ||
    c.includes("VIDEO AD") ||
    c.includes("COMMERCIAL") ||
    c.includes("REEL") ||
    c.includes("TIKTOK") ||
    c === "AI VIDEO AD" ||
    c === "PRODUCT DEMO"
  );
}

export function isWebsiteCategory(categoryStr?: string): boolean {
  if (!categoryStr) return false;
  const c = categoryStr.toUpperCase().trim();
  return (
    c.includes("WEB") ||
    c.includes("SITE") ||
    c.includes("APP") ||
    c.includes("DEV") ||
    c === "WEBSITE"
  );
}

export function isLogoCategory(categoryStr?: string): boolean {
  if (!categoryStr) return false;
  const c = categoryStr.toUpperCase().trim();
  return (
    c.includes("LOGO") ||
    c.includes("BRAND") ||
    c.includes("IDENTITY")
  );
}

export function isGraphicsCategory(categoryStr?: string): boolean {
  if (!categoryStr) return false;
  const c = categoryStr.toUpperCase().trim();
  return (
    c.includes("GRAPHIC") ||
    c.includes("CREATIVE") ||
    c.includes("POSTER") ||
    c.includes("BANNER") ||
    c.includes("DESIGN")
  );
}

/**
 * Validates and cleanses Firestore document payloads to guarantee:
 * 1. No base64 strings (data:...) or data URLs are stored.
 * 2. No File/Blob objects exist.
 * 3. Serialized payload size is safely under 50KB (well below Firestore's 1MB limit).
 */
export function validateAndSanitizeFirestorePayload<T extends Record<string, any>>(
  payload: T,
  maxSizeBytes = 50 * 1024
): { sanitized: T; sizeBytes: number; valid: boolean; error?: string } {
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(payload)) {
    // Check if value is a raw File or Blob
    if (typeof value === "object" && value !== null) {
      if (
        typeof (value as any).arrayBuffer === "function" ||
        (typeof File !== "undefined" && value instanceof File) ||
        (typeof Blob !== "undefined" && value instanceof Blob)
      ) {
        return {
          sanitized: payload,
          sizeBytes: 0,
          valid: false,
          error: `Field "${key}" contains raw File/Blob data. Upload file to Storage first and store only the URL in Firestore.`,
        };
      }
    }

    // Check if value is a string containing base64 data URL
    if (typeof value === "string") {
      if (value.startsWith("data:") && (value.includes(";base64,") || value.length > 500)) {
        return {
          sanitized: payload,
          sizeBytes: value.length,
          valid: false,
          error: `Field "${key}" contains base64/data-URL media (${(value.length / 1024).toFixed(1)} KB). Media files must be uploaded to Firebase Storage or Cloudinary instead of storing inline data in Firestore.`,
        };
      }
      sanitized[key] = value;
    } else if (Array.isArray(value)) {
      const cleanArray = [];
      for (let i = 0; i < value.length; i++) {
        const item = value[i];
        if (typeof item === "string" && item.startsWith("data:") && item.includes(";base64,")) {
          return {
            sanitized: payload,
            sizeBytes: item.length,
            valid: false,
            error: `Field "${key}[${i}]" contains base64/data-URL media.`,
          };
        }
        cleanArray.push(item);
      }
      sanitized[key] = cleanArray;
    } else {
      sanitized[key] = value;
    }
  }

  // Calculate serialized JSON payload size
  let sizeBytes = 0;
  try {
    const jsonStr = JSON.stringify(sanitized);
    sizeBytes = new TextEncoder().encode(jsonStr).length;
  } catch (e) {
    sizeBytes = 1000;
  }

  if (sizeBytes > maxSizeBytes) {
    return {
      sanitized: sanitized as T,
      sizeBytes,
      valid: false,
      error: `Document payload size (${(sizeBytes / 1024).toFixed(1)} KB) exceeds safe limit of ${(maxSizeBytes / 1024).toFixed(0)} KB.`,
    };
  }

  return {
    sanitized: sanitized as T,
    sizeBytes,
    valid: true,
  };
}



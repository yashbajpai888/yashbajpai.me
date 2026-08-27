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
    lower.includes("vimeo.com")
  );
}

export function getEmbedVideoUrl(url: string): string {
  if (!url) return "";
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

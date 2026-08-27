import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { storage, auth } from "@/lib/firebase";

export interface UploadOptions {
  onProgress?: (progress: number) => void;
  folder?: string;
  subfolder?: "images" | "videos" | "previews" | "documents";
  projectId?: string;
}

export interface UploadResult {
  url: string;
  storagePath: string;
}

/**
 * Client-side canvas image compression to resize oversized images (>800KB)
 * down to lightweight WebP/JPEG before Firebase Storage upload.
 */
export async function compressImageFile(
  file: File,
  maxDimension = 1920,
  quality = 0.82
): Promise<File> {
  if (file.size < 800 * 1024 || file.type === "image/svg+xml" || file.type === "image/gif") {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);

    img.onload = () => {
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      const mimeType = file.type === "image/png" ? "image/png" : "image/jpeg";
      canvas.toBlob(
        (blob) => {
          if (blob && blob.size < file.size) {
            const compressedFile = new File([blob], file.name, {
              type: mimeType,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        },
        mimeType,
        quality
      );
    };
    img.onerror = () => resolve(file);

    reader.readAsDataURL(file);
  });
}

/**
 * High-performance, resilient upload utility built on Firebase Storage uploadBytesResumable.
 * Features real 0-100% progress tracking, auth pre-checks, clean path structuring, and diagnostic logging.
 */
export async function uploadMediaFile(
  file: File,
  options?: UploadOptions
): Promise<string> {
  const result = await uploadMediaFileWithResult(file, options);
  return result.url;
}

export async function uploadMediaFileWithResult(
  file: File,
  options?: UploadOptions
): Promise<UploadResult> {
  const MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1 GB file size limit
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds maximum 1GB limit.`);
  }

  // Pre-upload auth verification
  const currentUser = auth.currentUser;
  if (!currentUser && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== "mock-api-key") {
    // If not signed in via auth, verify before upload
    console.warn("Storage Upload Notice: Admin auth session state not detected on auth.currentUser.");
  }

  // Pre-process image if applicable
  let fileToUpload = file;
  if (file.type.startsWith("image/")) {
    try {
      fileToUpload = await compressImageFile(file);
    } catch (compressErr) {
      console.warn("Image compression notice:", compressErr);
    }
  }

  // Generate structured storage path
  const folder = options?.folder || "uploads";
  const subfolder = options?.subfolder ? `/${options.subfolder}` : "";
  const projectId = options?.projectId ? `/${options.projectId}` : "";
  const sanitizeName = fileToUpload.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `${folder}${projectId}${subfolder}/${Date.now()}_${sanitizeName}`;

  const storageRef = ref(storage, storagePath);

  if (options?.onProgress) options.onProgress(0);

  try {
    const uploadTask = uploadBytesResumable(storageRef, fileToUpload, {
      contentType: fileToUpload.type || "application/octet-stream",
    });

    const downloadUrl = await new Promise<string>((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (options?.onProgress) {
            options.onProgress(Math.round(progress));
          }
        },
        (error) => {
          // Log safe diagnostic details
          console.error("Firebase Storage Upload Error:", {
            code: error.code,
            message: error.message,
            fileType: fileToUpload.type,
            fileSize: fileToUpload.size,
            storagePath,
          });

          if (error.code === "storage/retry-limit-exceeded") {
            reject(new Error("Upload timed out or network connection was interrupted. Please check your internet connection and try again."));
          } else if (error.code === "storage/unauthorized") {
            reject(new Error("Storage permission denied. Please verify you are logged in as Admin."));
          } else if (error.code === "storage/canceled") {
            reject(new Error("Upload was canceled."));
          } else {
            reject(new Error(error.message || "Storage upload failed. Please try again."));
          }
        },
        async () => {
          try {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            if (options?.onProgress) options.onProgress(100);
            resolve(url);
          } catch (urlErr: any) {
            reject(new Error(`Failed to retrieve download URL: ${urlErr.message}`));
          }
        }
      );
    });

    if (!downloadUrl) {
      throw new Error("Failed to retrieve secure download URL from Firebase Storage.");
    }

    return {
      url: downloadUrl,
      storagePath,
    };
  } catch (err: any) {
    console.error("uploadMediaFileWithResult caught exception:", err);
    throw err;
  }
}

/**
 * Safely removes a file from Firebase Storage.
 */
export async function deleteStorageFile(storagePathOrUrl?: string): Promise<void> {
  if (!storagePathOrUrl || storagePathOrUrl.startsWith("data:") || storagePathOrUrl.startsWith("http")) return;
  try {
    const storageRef = ref(storage, storagePathOrUrl);
    await deleteObject(storageRef);
  } catch (err) {
    console.warn("Notice during storage file removal:", err);
  }
}

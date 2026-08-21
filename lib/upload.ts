import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

export interface UploadOptions {
  onProgress?: (progress: number) => void;
  folder?: string;
}

/**
 * Compress image using HTML Canvas to ensure base64 string is < 500 KB,
 * preventing Firestore 1,048,487 byte property size limit errors.
 */
export async function compressImageToDataUrl(file: File, maxDimension = 1200, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = (err) => reject(err);

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
        reject(new Error("Failed to get canvas context"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      let dataUrl = canvas.toDataURL("image/jpeg", quality);

      if (dataUrl.length > 500000 && quality > 0.3) {
        dataUrl = canvas.toDataURL("image/jpeg", quality * 0.6);
      }

      resolve(dataUrl);
    };
    img.onerror = (err) => reject(err);

    reader.readAsDataURL(file);
  });
}

/**
 * Uploads a file (images, videos, media up to 1GB) using a multi-provider fallback strategy:
 * 1. Server API Route (/api/upload - handles Cloudinary image/video endpoints)
 * 2. Direct Cloudinary REST API (image/video endpoints)
 * 3. Firebase Storage (supports up to 5GB)
 * 4. Client-side Canvas Image Compression (Local fallback for images < 500KB)
 */
export async function uploadMediaFile(
  file: File,
  options?: UploadOptions
): Promise<string> {
  const MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1 GB file size limit
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the maximum 1GB limit.`);
  }

  // 1. Try Server API Route (/api/upload)
  try {
    const formData = new FormData();
    formData.append("file", file);

    const apiRes = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (apiRes.ok) {
      const apiData = await apiRes.json();
      if (apiData.url) {
        if (options?.onProgress) options.onProgress(100);
        return apiData.url;
      }
    }
  } catch (apiErr) {
    console.warn("API route upload skipped/failed, trying direct providers:", apiErr);
  }

  // 2. Direct Cloudinary REST API
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (
    cloudName &&
    uploadPreset &&
    cloudName !== "your_cloudinary_cloud_name" &&
    uploadPreset !== "your_cloudinary_upload_preset"
  ) {
    try {
      const isVideo = file.type.startsWith("video/");
      const isAudio = file.type.startsWith("audio/");
      const resourceType = isVideo || isAudio ? "video" : file.type.startsWith("image/") ? "image" : "raw";

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.secure_url) {
          if (options?.onProgress) options.onProgress(100);
          return data.secure_url;
        }
      }
    } catch (cloudinaryErr) {
      console.warn("Direct Cloudinary upload failed:", cloudinaryErr);
    }
  }

  // 3. Firebase Storage
  const folder = options?.folder || "uploads";
  const sanitizeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const fileName = `${folder}/${Date.now()}_${sanitizeName}`;

  try {
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    const downloadUrl = await new Promise<string>((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (options?.onProgress) {
            options.onProgress(progress);
          }
        },
        (error) => {
          reject(error);
        },
        async () => {
          try {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(url);
          } catch (err) {
            reject(err);
          }
        }
      );
    });

    if (downloadUrl) {
      return downloadUrl;
    }
  } catch (firebaseErr) {
    console.warn("Firebase Storage upload failed:", firebaseErr);
  }

  // 4. Local Image Fallback: Canvas compression
  if (file.type.startsWith("image/")) {
    try {
      const compressedDataUrl = await compressImageToDataUrl(file);
      if (compressedDataUrl.length < 900000) {
        if (options?.onProgress) options.onProgress(100);
        return compressedDataUrl;
      }
    } catch (compressErr) {
      console.warn("Canvas compression failed:", compressErr);
    }
  }

  throw new Error(
    "Could not upload file. Please verify Cloudinary credentials (NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME & NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET) or Firebase Storage connection."
  );
}

import { doc, getDoc, setDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { uploadMediaFileWithResult, deleteStorageFile } from "@/lib/upload";

export interface ResumeConfig {
  url: string;
  name: string;
  label: string;
  storagePath: string;
  updatedAt: Timestamp | string | Date;
}

export function validateResumeFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: "No file selected." };
  }
  const nameLower = file.name.toLowerCase();
  const isAllowedExt = 
    nameLower.endsWith(".pdf") || 
    nameLower.endsWith(".docx") || 
    nameLower.endsWith(".doc") || 
    nameLower.endsWith(".png") || 
    nameLower.endsWith(".jpg") || 
    nameLower.endsWith(".jpeg") || 
    nameLower.endsWith(".webp");

  const isAllowedMime = 
    file.type.startsWith("image/") || 
    file.type === "application/pdf" || 
    file.type.includes("wordprocessingml") || 
    file.type.includes("msword") ||
    file.type === "";

  if (!isAllowedExt && !isAllowedMime) {
    return { valid: false, error: "Invalid file format. Allowed formats: PDF, DOCX, DOC, PNG, JPG, WebP." };
  }

  const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
  if (file.size > MAX_SIZE) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    return { valid: false, error: `File size (${sizeMb} MB) exceeds the 10 MB maximum limit.` };
  }

  return { valid: true };
}

export async function getResumeConfig(): Promise<ResumeConfig> {
  const defaultConfig: ResumeConfig = {
    url: "/Yash_S_Bajpai_Resume.pdf",
    name: "Yash_S_Bajpai_Resume.pdf",
    label: "MY RESUME",
    storagePath: "public/Yash_S_Bajpai_Resume.pdf",
    updatedAt: new Date()
  };

  try {
    const docRef = doc(db, "settings", "resume");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data && data.url) {
        return data as ResumeConfig;
      }
    }
  } catch (error) {
    console.warn("Failed to fetch resume config from Firestore, using default resume:", error);
  }
  return defaultConfig;
}

export async function uploadResumeFile(
  file: File,
  options?: { label?: string; onProgress?: (progress: number) => void }
): Promise<ResumeConfig> {
  const validation = validateResumeFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || "File validation failed.");
  }

  // 1. Fetch current resume config
  const currentConfig = await getResumeConfig();
  const oldStoragePath = currentConfig?.storagePath;

  // 2. Upload file via uploadMediaFileWithResult (resumable upload with real progress)
  const result = await uploadMediaFileWithResult(file, {
    folder: "resumes",
    onProgress: options?.onProgress,
  });

  // 3. Update Firestore settings/resume document ONLY after upload succeeds
  const newConfig: ResumeConfig = {
    url: result.url,
    name: file.name,
    label: options?.label || currentConfig?.label || "My Resume",
    storagePath: result.storagePath,
    updatedAt: Timestamp.now(),
  };

  try {
    await setDoc(doc(db, "settings", "resume"), newConfig);
  } catch (dbErr: any) {
    console.error("Firestore write failed:", dbErr);
    throw new Error(`Failed to save resume document in Firestore: ${dbErr.message}`);
  }

  // 4. Clean up old storage file after Firestore write succeeds
  if (oldStoragePath && oldStoragePath !== result.storagePath) {
    deleteStorageFile(oldStoragePath);
  }

  return newConfig;
}

export async function deleteResumeConfig(): Promise<void> {
  const currentConfig = await getResumeConfig();

  if (currentConfig?.storagePath) {
    deleteStorageFile(currentConfig.storagePath);
  }

  await deleteDoc(doc(db, "settings", "resume"));
}

export async function updateResumeLabel(newLabel: string): Promise<void> {
  const docRef = doc(db, "settings", "resume");
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    throw new Error("No resume configuration exists to update label.");
  }
  await setDoc(docRef, {
    ...docSnap.data(),
    label: newLabel,
    updatedAt: Timestamp.now(),
  });
}

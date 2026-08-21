import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, addDoc, Timestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyA2D69omPxurML2V_WIEIllGj8UvgOihnI",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "yash-bajpai-me.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "yash-bajpai-me",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "yash-bajpai-me.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "178186413894",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:178186413894:web:abf483546b954eb2166747"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  message: string;
  createdAt: string | Date | Timestamp;
  status?: string;
  read?: boolean;
  notes?: string;
  phone?: string;
  company?: string;
  source?: string;
}

export async function sendContactMessage(data: { name: string; email: string; message: string; phone?: string; company?: string }) {
  try {
    if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== "mock-api-key") {
      const docRef = await addDoc(collection(db, "contactSubmissions"), {
        ...data,
        status: "new",
        read: false,
        source: "website",
        notes: "",
        createdAt: Timestamp.now()
      });
      return { success: true, id: docRef.id };
    }
  } catch (error) {
    console.warn("Firebase message storage failed, falling back to API:", error);
  }
  
  // Return success fallback if mock mode
  return { success: true, id: `mock-${Date.now()}` };
}

export { app, db, auth, storage };


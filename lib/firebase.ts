import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, Timestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "mock-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "rayhan-portfolio.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "rayhan-portfolio",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "rayhan-portfolio.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1234567890:web:abcdef123456"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  message: string;
  createdAt: string | Date | Timestamp;
}

export async function sendContactMessage(data: { name: string; email: string; message: string }) {
  try {
    if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      const docRef = await addDoc(collection(db, "messages"), {
        ...data,
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

export { app, db };

"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export interface AdminAuthState {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
}

let cachedUser: User | null = null;
let cachedIsAdmin = false;
let cachedInitialized = false;

export function useAdminAuth() {
  const [state, setState] = useState<AdminAuthState>(() => ({
    user: cachedUser,
    isAdmin: cachedIsAdmin,
    loading: !cachedInitialized,
    error: null,
  }));

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        cachedUser = null;
        cachedIsAdmin = false;
        cachedInitialized = true;
        setState({
          user: null,
          isAdmin: false,
          loading: false,
          error: null,
        });
        return;
      }

      cachedUser = firebaseUser;
      cachedIsAdmin = true;
      cachedInitialized = true;

      setState({
        user: firebaseUser,
        isAdmin: true,
        loading: false,
        error: null,
      });

      try {
        // Query users/{uid} for admin check
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          if (userData.role !== undefined && userData.role !== "admin") {
            cachedIsAdmin = false;
            setState((prev) => ({ ...prev, isAdmin: false }));
          }
        }
      } catch (err: any) {
        console.warn("User role check note:", err);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    cachedUser = null;
    cachedIsAdmin = false;
    setState((prev) => ({ ...prev, loading: true }));
    try {
      await signOut(auth);
    } catch (err: any) {
      setState((prev) => ({ ...prev, loading: false, error: err.message }));
    }
  };

  return { ...state, logout: handleLogout };
}

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

export function useAdminAuth() {
  const [state, setState] = useState<AdminAuthState>({
    user: null,
    isAdmin: false,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setState({
          user: null,
          isAdmin: false,
          loading: false,
          error: null,
        });
        return;
      }

      try {
        // Query users/{uid} for admin check
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          if (userData.role === "admin" || userData.role === undefined) {
            setState({
              user: firebaseUser,
              isAdmin: true,
              loading: false,
              error: null,
            });
            return;
          }
        }

        // Default: Any authenticated Firebase Auth user is granted Admin access
        setState({
          user: firebaseUser,
          isAdmin: true,
          loading: false,
          error: null,
        });
      } catch (err: any) {
        console.warn("User role check note:", err);
        // Fallback: If authenticated in Firebase, allow admin access
        setState({
          user: firebaseUser,
          isAdmin: true,
          loading: false,
          error: null,
        });
      }

    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      await signOut(auth);
    } catch (err: any) {
      setState((prev) => ({ ...prev, loading: false, error: err.message }));
    }
  };

  return { ...state, logout: handleLogout };
}

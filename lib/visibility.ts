import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface SectionVisibility {
  navbar?: boolean;
  hero?: boolean;
  heroStats?: boolean;
  heroResume?: boolean;
  heroBadge?: boolean;
  services?: boolean;
  projects?: boolean;
  educationSkills?: boolean;
  workProcess?: boolean;
  aboutQuote?: boolean;
  contactFooter?: boolean;
}

export const DEFAULT_VISIBILITY: Required<SectionVisibility> = {
  navbar: true,
  hero: true,
  heroStats: true,
  heroResume: true,
  heroBadge: true,
  services: true,
  projects: true,
  educationSkills: true,
  workProcess: true,
  aboutQuote: true,
  contactFooter: true,
};

export async function getSectionVisibility(): Promise<Required<SectionVisibility>> {
  try {
    const docRef = doc(db, "settings", "homepage");
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data.visibility) {
        return {
          ...DEFAULT_VISIBILITY,
          ...data.visibility,
        };
      }
    }
  } catch (err) {
    console.warn("Could not fetch visibility configuration from Firestore:", err);
  }
  return DEFAULT_VISIBILITY;
}

export function subscribeSectionVisibility(callback: (visibility: Required<SectionVisibility>) => void) {
  try {
    const docRef = doc(db, "settings", "homepage");
    return onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.visibility) {
          callback({
            ...DEFAULT_VISIBILITY,
            ...data.visibility,
          });
          return;
        }
      }
      callback(DEFAULT_VISIBILITY);
    }, (error) => {
      console.warn("Error subscribing to visibility settings:", error);
      callback(DEFAULT_VISIBILITY);
    });
  } catch (e) {
    callback(DEFAULT_VISIBILITY);
    return () => {};
  }
}

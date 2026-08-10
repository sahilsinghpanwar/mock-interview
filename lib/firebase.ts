import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
} from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

// ─── Config ───────────────────────────────────────────────────────────────────

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate config at startup so missing env vars are caught immediately
const missingKeys = Object.entries(firebaseConfig)
  .filter(([, v]) => !v)
  .map(([k]) => `NEXT_PUBLIC_${k.replace(/([A-Z])/g, "_$1").toUpperCase()}`);

if (missingKeys.length > 0) {
  console.error(
    `[Firebase] ❌ Missing environment variables: ${missingKeys.join(", ")}. ` +
      "Check your .env.local file."
  );
}

// ─── Initialization ───────────────────────────────────────────────────────────

// Use singleton pattern — prevent re-initialization on hot-reload
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

// Log initialization status in development
if (process.env.NODE_ENV === "development") {
  console.log(
    `[Firebase] ✅ Initialized — project: ${firebaseConfig.projectId ?? "UNKNOWN"}`
  );
}

export default app;
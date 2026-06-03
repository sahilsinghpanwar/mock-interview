import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

import { getEnv } from "./env";

const firebaseConfig = {
  apiKey: getEnv("NEXT_PUBLIC_FIREBASE_API_KEY", "dummy-api-key-for-build-purposes"),
  authDomain: getEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", "dummy-auth-domain.firebaseapp.com"),
  projectId: getEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID", "dummy-project-id"),
  storageBucket: getEnv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET", "dummy-storage-bucket.appspot.com"),
  messagingSenderId: getEnv("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID", "1234567890"),
  appId: getEnv("NEXT_PUBLIC_FIREBASE_APP_ID", "1:1234567890:web:1234567890abcdef"),
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

export default app;
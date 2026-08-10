import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  updateProfile,
  UserCredential,
} from "firebase/auth";

import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider, githubProvider } from "./firebase";

// Types

export interface AuthResult {
  success: boolean;
  message: string;
  userId?: string;
}

export interface UserProfile {
  uid: string;
  username: string;
  email: string;
  displayName?: string;
  createdAt: unknown;
  updatedAt: unknown;
  photoURL?: string;
  interviewsCompleted: number;
  role?: "user" | "admin";
}

// Helpers

async function saveUserToFirestore(
  credential: UserCredential,
  displayName?: string
): Promise<void> {
  try {
    const { user } = credential;
    const userRef = doc(db, "users", user.uid);
    const existing = await getDoc(userRef);

    if (!existing.exists()) {
      const profile: UserProfile = {
        uid: user.uid,
        username: user.email!.split("@")[0],
        email: user.email!,
        displayName: displayName ?? user.displayName ?? "Anonymous",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        photoURL: user.photoURL ?? "",
        interviewsCompleted: 0,
        role: "user",
      };
      await setDoc(userRef, profile);
      console.log(`[Firebase] New user profile created: ${user.uid}`);
    } else {
      await setDoc(userRef, { updatedAt: serverTimestamp() }, { merge: true });
      console.log(`[Firebase] User profile updated: ${user.uid}`);
    }
  } catch (error) {
    const code = (error as Record<string, unknown>)?.code;
    const msg = (error as Record<string, unknown>)?.message;
    console.error(
      `[Firebase] saveUserToFirestore failed — code: ${String(code ?? "unknown")}, message: ${String(msg ?? error)}`
    );
  }
}

// Sign Up

export async function signUp(
  name: string,
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    await updateProfile(credential.user, { displayName: name });
    await saveUserToFirestore(credential, name);

    return {
      success: true,
      message: "Account created successfully!",
      userId: credential.user.uid,
    };
  } catch (error: unknown) {
    console.error("[Firebase] Sign-up error:", error);
    return { success: false, message: getFirebaseErrorMessage(error) };
  }
}

// Sign In

export async function signIn(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    await saveUserToFirestore(credential);

    return {
      success: true,
      message: "Signed in successfully!",
      userId: credential.user.uid,
    };
  } catch (error: unknown) {
    console.error("[Firebase] Sign-in error:", error);
    return { success: false, message: getFirebaseErrorMessage(error) };
  }
}

// Sign Out

export async function signOut(): Promise<AuthResult> {
  try {
    await firebaseSignOut(auth);
    return { success: true, message: "Signed out." };
  } catch (error: unknown) {
    return { success: false, message: getFirebaseErrorMessage(error) };
  }
}

// Google OAuth

export async function signInWithGoogle(): Promise<AuthResult> {
  try {
    const credential = await signInWithPopup(auth, googleProvider);
    await saveUserToFirestore(credential);
    return {
      success: true,
      message: "Signed in with Google!",
      userId: credential.user.uid,
    };
  } catch (error: unknown) {
    console.error("[Firebase] Google sign-in error:", error);
    if (error !== null && typeof error === "object" && "code" in error) {
      const code = (error as { code: string }).code;
      if (code === "auth/popup-blocked" || code === "auth/popup-closed-by-user") {
        try {
          await signInWithRedirect(auth, googleProvider);
          return {
            success: true,
            message: "Redirecting to Google...",
          };
        } catch (err) {
          return { success: false, message: getFirebaseErrorMessage(err) };
        }
      }
    }
    return { success: false, message: getFirebaseErrorMessage(error) };
  }
}

// GitHub OAuth

export async function signInWithGithub(): Promise<AuthResult> {
  try {
    const credential = await signInWithPopup(auth, githubProvider);
    await saveUserToFirestore(credential);
    return {
      success: true,
      message: "Signed in with GitHub!",
      userId: credential.user.uid,
    };
  } catch (error: unknown) {
    console.error("[Firebase] GitHub sign-in error:", error);
    if (error !== null && typeof error === "object" && "code" in error) {
      const code = (error as { code: string }).code;
      if (code === "auth/popup-blocked" || code === "auth/popup-closed-by-user") {
        try {
          await signInWithRedirect(auth, githubProvider);
          return {
            success: true,
            message: "Redirecting to GitHub...",
          };
        } catch (err) {
          return { success: false, message: getFirebaseErrorMessage(err) };
        }
      }
    }
    return { success: false, message: getFirebaseErrorMessage(error) };
  }
}

// Handle Redirect Login
export async function handleRedirectResult(): Promise<void> {
  try {
    const credential = await getRedirectResult(auth);
    if (credential) {
      await saveUserToFirestore(credential);
    }
  } catch (error) {
    console.error("[Firebase] Error handling redirect result:", error);
  }
}

// Get User Profile

export async function getUserProfile(
  uid: string
): Promise<UserProfile | null> {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() ? (snap.data() as UserProfile) : null;
  } catch {
    return null;
  }
}

// Error Messages

function getFirebaseErrorMessage(error: unknown): string {
  if (error !== null && typeof error === "object" && "code" in error) {
    const code = (error as { code: string }).code;
    const messages: Record<string, string> = {
      "auth/email-already-in-use": "An account with this email already exists.",
      "auth/invalid-email": "Please enter a valid email address.",
      "auth/operation-not-allowed": "Email/password sign-in is not enabled.",
      "auth/weak-password": "Password must be at least 6 characters.",
      "auth/user-disabled": "This account has been disabled.",
      "auth/user-not-found": "No account found with this email.",
      "auth/wrong-password": "Incorrect password. Please try again.",
      "auth/too-many-requests": "Too many failed attempts. Please try again later.",
      "auth/network-request-failed": "Network error. Check your connection and try again.",
      "auth/invalid-credential": "Invalid email or password.",
      "auth/popup-closed-by-user": "Sign-in popup was closed. Please try again.",
      "auth/account-exists-with-different-credential":
        "An account already exists with this email using a different sign-in method.",
    };
    return messages[code] ?? "Something went wrong. Please try again.";
  }
  return "An unexpected error occurred.";
}
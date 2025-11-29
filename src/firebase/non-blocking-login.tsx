'use client';
import {
  Auth, // Import Auth type for type hinting
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  UserCredential,
  // Assume getAuth and app are initialized elsewhere
} from 'firebase/auth';
import { toast } from '@/hooks/use-toast';

/** Initiate anonymous sign-in (non-blocking). */
export async function initiateAnonymousSignIn(authInstance: Auth): Promise<UserCredential | void> {
  try {
    // CRITICAL: Call signInAnonymously directly. Do NOT use 'await signInAnonymously(...)'.
    return await signInAnonymously(authInstance)
  } catch(error) {
    toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: "Could not sign in anonymously. Please try again.",
    });
  }
}

/** Initiate email/password sign-up (non-blocking). */
export async function initiateEmailSignUp(authInstance: Auth, email: string, password: string): Promise<UserCredential | void> {
  try {
    return await createUserWithEmailAndPassword(authInstance, email, password)
  } catch (error: any) {
    let description = "An unknown error occurred during sign up.";
    if (error.code === 'auth/email-already-in-use') {
        description = "This email address is already in use by another account.";
    } else if (error.code === 'auth/weak-password') {
        description = "The password is too weak. Please use at least 6 characters.";
    }
    toast({
        variant: "destructive",
        title: "Sign Up Failed",
        description: description,
    });
  }
}

/** Initiate email/password sign-in (non-blocking). */
export async function initiateEmailSignIn(authInstance: Auth, email: string, password: string): Promise<UserCredential | void> {
  try {
    return await signInWithEmailAndPassword(authInstance, email, password)
  } catch(error) {
    toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid email or password. Please try again.",
    });
  }
}

/** Initiate Google sign-in (non-blocking). */
export async function initiateGoogleSignIn(authInstance: Auth): Promise<UserCredential | void> {
  const provider = new GoogleAuthProvider();
  try {
    return await signInWithPopup(authInstance, provider)
  } catch(error) {
    toast({
        variant: "destructive",
        title: "Google Sign-In Failed",
        description: "Could not sign in with Google. Please try again.",
    });
  }
}

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Environment variable bindings matching user requirements
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyFakeKey_FinoraAI_Placeholder",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "finora-ai-prod.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "finora-ai-prod",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "finora-ai-prod.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1234567890:web:abcdef123456"
};

let app;
let auth;
let db;

try {
  // Initialize Firebase app
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  console.log("Firebase has been initialized successfully.");
} catch (error) {
  console.error("Firebase initialization failed. Verify config parameters.", error);
}

// Global Firebase error parser for robust UI feedback
export const parseFirebaseError = (error) => {
  if (!error || !error.code) return "An unexpected financial connection error occurred.";
  
  switch (error.code) {
    case 'auth/invalid-email':
      return 'The email format entered is invalid.';
    case 'auth/user-disabled':
      return 'This institutional account has been suspended.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid client access credentials.';
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists.';
    case 'auth/weak-password':
      return 'The passcode strength is too weak. Minimum 6 characters required.';
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in is not enabled on this server.';
    case 'auth/network-request-failed':
      return 'Network connection failed. Verify internet routing.';
    default:
      return error.message;
  }
};

export { app, auth, db };
export default firebaseConfig;

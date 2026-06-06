// Firebase configuration
// Initialize Firebase App — called once at app startup
import { initializeApp, FirebaseApp, getApps } from 'firebase/app';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';
import {
  Firestore, connectFirestoreEmulator, initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
} from 'firebase/firestore';
import { getFunctions, Functions, connectFunctionsEmulator } from 'firebase/functions';
import Config from 'react-native-config';

// Replace with your Firebase config from Firebase Console → Project Settings → General → Your apps → Web
const firebaseConfig = {
  apiKey: Config.FIREBASE_API_KEY,
  authDomain: Config.FIREBASE_AUTH_DOMAIN,
  projectId: Config.FIREBASE_PROJECT_ID,
  storageBucket: Config.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: Config.FIREBASE_MESSAGING_SENDER_ID,
  appId: Config.FIREBASE_APP_ID,
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let functions: Functions;

export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    const existing = getApps();
    if (existing.length > 0) {
      app = existing[0];
    } else {
      app = initializeApp(firebaseConfig);
    }
  }
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }
  return auth;
}

export function getFirestoreDb(): Firestore {
  if (!db) {
    db = initializeFirestore(getFirebaseApp(), {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });
  }
  return db;
}

export function getFirebaseFunctions(): Functions {
  if (!functions) {
    functions = getFunctions(getFirebaseApp(), 'asia-south1'); // Mumbai region
  }
  return functions;
}

// Call once at app startup
export async function initializeFirebase(): Promise<void> {
  getFirebaseApp();
  getFirebaseAuth();
  getFirestoreDb();
  getFirebaseFunctions();
}

// For local development with Firebase Emulator Suite
export function connectEmulators(): void {
  if (__DEV__) {
    try {
      connectAuthEmulator(getFirebaseAuth(), 'http://localhost:9099');
      connectFirestoreEmulator(getFirestoreDb(), 'localhost', 8080);
      connectFunctionsEmulator(getFirebaseFunctions(), 'localhost', 5001);
      console.log('🔥 Connected to Firebase emulators');
    } catch (err) {
      console.warn('Firebase emulator connection failed:', err);
    }
  }
}

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, type Auth, type Persistence } from 'firebase/auth';
import * as firebaseAuth from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { Platform } from 'react-native';

// `getReactNativePersistence` exists at runtime (Metro resolves the "react-native"
// build of @firebase/auth), but that package's `exports` map lists a generic
// `types` condition before the `react-native` one, so TypeScript always picks
// the web typings and doesn't see this export. Read it off the namespace
// import instead of failing the build — known upstream firebase-js-sdk issue.
const getReactNativePersistence = (
  firebaseAuth as unknown as { getReactNativePersistence: (storage: typeof AsyncStorage) => Persistence }
).getReactNativePersistence;

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

/** False until real EXPO_PUBLIC_FIREBASE_* values are set — see README. */
export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

let authInstance: Auth | undefined;
let dbInstance: Firestore | undefined;

// Only touch the Firebase SDK when real config is present: `getAuth`/
// `getFirestore` throw synchronously on a missing/placeholder API key (even
// during `expo export`'s static web prerendering, which imports this module
// on the server), and every caller already gates reads/writes behind
// `isFirebaseConfigured` or an authenticated user, so a clean app that hasn't
// been configured yet never actually reaches these two exports.
if (isFirebaseConfigured) {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

  if (Platform.OS === 'web') {
    authInstance = getAuth(app);
  } else {
    // `initializeAuth` throws if called twice (e.g. Fast Refresh), so fall
    // back to the already-initialized instance instead of crashing on hot reload.
    try {
      authInstance = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
    } catch {
      authInstance = getAuth(app);
    }
  }

  dbInstance = getFirestore(app);
}

export const auth = authInstance as Auth;
export const db = dbInstance as Firestore;

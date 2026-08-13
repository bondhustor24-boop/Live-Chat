import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import firebaseAppletConfig from "../../firebase-applet-config.json";

const env = (import.meta as unknown as { env?: Record<string, string> }).env || {};

const config = {
  projectId: env.VITE_FIREBASE_PROJECT_ID || firebaseAppletConfig.projectId,
  appId: env.VITE_FIREBASE_APP_ID || firebaseAppletConfig.appId,
  apiKey: env.VITE_FIREBASE_API_KEY || firebaseAppletConfig.apiKey,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || firebaseAppletConfig.authDomain,
  firestoreDatabaseId: env.VITE_FIREBASE_DATABASE_ID || firebaseAppletConfig.firestoreDatabaseId,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || firebaseAppletConfig.storageBucket,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseAppletConfig.messagingSenderId,
};

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(config) : getApp();

// Get Firestore instance for specific database ID
const dbId = config.firestoreDatabaseId && config.firestoreDatabaseId.trim() !== ""
  ? config.firestoreDatabaseId
  : "(default)";

export const db = getFirestore(app, dbId);



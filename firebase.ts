// Fix: Switched to Firebase v8 compatibility syntax to resolve import errors.
// Fix: Use firebase/compat/* for v8 compatibility.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';

// Fix: Add type definitions for Vite environment variables to resolve TypeScript errors.
// This is necessary because TypeScript doesn't know about `import.meta.env` by default.
interface ImportMetaEnv {
  readonly VITE_API_KEY: string;
  readonly VITE_AUTH_DOMAIN: string;
  readonly VITE_DATABASE_URL: string;
  readonly VITE_PROJECT_ID: string;
  readonly VITE_STORAGE_BUCKET: string;
  readonly VITE_MESSAGING_SENDER_ID: string;
  readonly VITE_APP_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Your web app's Firebase configuration is now loaded from environment variables
// This makes your application more secure, especially for deployment.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_DATABASE_URL,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

// Export Firebase services
export const auth = firebase.auth();
export const db = firebase.database();

export default app;
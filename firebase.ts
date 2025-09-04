// Fix: Switched to Firebase v8 compatibility syntax to resolve import errors.
// Fix: Use firebase/compat/* for v8 compatibility.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';

// Your web app's Firebase configuration
// NOTE: For a real-world deployment, these keys should be stored securely in environment variables,
// not hardcoded in the source code. This has been reverted to a hardcoded config to fix a runtime
// error in the current development environment which does not support import.meta.env.
const firebaseConfig = {
  apiKey: "AIzaSyCAVj5eON7DAsYxYyMeVjd_S41-6YqGLW4",
  authDomain: "green-crm-12bf0.firebaseapp.com",
  databaseURL: "https://green-crm-12bf0-default-rtdb.firebaseio.com",
  projectId: "green-crm-12bf0",
  storageBucket: "green-crm-12bf0.appspot.com",
  messagingSenderId: "1072210444292",
  appId: "1:1072210444292:web:53b70ff83024eff018f551"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

// Export Firebase services
export const auth = firebase.auth();
export const db = firebase.database();

export default app;
// Fix: Switched to Firebase v8 compatibility syntax to resolve import errors.
// Fix: Use firebase/compat/* for v8 compatibility.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';

// IMPORTANT: Replace this with your app's Firebase project configuration
// You can get this from the Firebase Console:
// Project Settings > General > Your apps > Web app > Firebase SDK snippet > Config
const firebaseConfig = {
  apiKey: "AIzaSyCAVj5eON7DAsYxYyMeVjd_S41-6YqGLW4",
  authDomain: "green-crm-12bf0.firebaseapp.com",
  databaseURL: "https://green-crm-12bf0-default-rtdb.firebaseio.com",
  projectId: "green-crm-12bf0",
  storageBucket: "green-crm-12bf0.firebasestorage.app",
  messagingSenderId: "1072210444292",
  appId: "1:1072210444292:web:53b70ff83024eff018f551"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

// Export Firebase services
export const auth = firebase.auth();
export const db = firebase.database();

export default app;
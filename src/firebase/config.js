// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getFunctions } from 'firebase/functions';
// If you need analytics:
// import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID,
};

// 1) Initialize the Firebase app
const app = initializeApp(firebaseConfig);
// If you need analytics: const analytics = getAnalytics(app);

// 2) Export Firestore
export const db = getFirestore(app);

// 3) Export Auth
export const auth = getAuth(app);

// 4) Export Functions
//    This allows you to call httpsCallable(functions, 'createCheckoutSession')
export const functions = getFunctions(app);

// Additional options?
// If you need region-specific functions or emulator support, you can do:
// export const functions = getFunctions(app, 'us-central1');

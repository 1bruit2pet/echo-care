import { initializeApp } from "firebase/app";
import { getFirestore, enableMultiTabIndexedDbPersistence, initializeFirestore, CACHE_SIZE_UNLIMITED } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyADxXl7uUx9JRuFMtEezNuPD4U8rAxwONE",
  authDomain: "echo-care-legacy-v1.firebaseapp.com",
  projectId: "echo-care-legacy-v1",
  storageBucket: "echo-care-legacy-v1.firebasestorage.app",
  messagingSenderId: "300798243862",
  appId: "1:300798243862:web:b29923a828896925877137"
};

const app = initializeApp(firebaseConfig);
// Initialize Firestore with offline persistence enabled
export const db = initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED
});

enableMultiTabIndexedDbPersistence(db).catch((err) => {
  if (err.code == 'failed-precondition') {
    // Multiple tabs open, persistence can only be enabled in one tab at a a time.
    console.warn("Firestore persistence failed: Multiple tabs open");
  } else if (err.code == 'unimplemented') {
    // The current browser does not support all of the features required to enable persistence
    console.warn("Firestore persistence not supported by browser");
  }
});

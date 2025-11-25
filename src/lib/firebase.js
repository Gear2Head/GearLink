import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { firebaseConfig } from '../firebaseConfig';

let app;

// Initialize Firebase
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApp();
}

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Helper functions to maintain compatibility with existing components
export const getFirebaseDb = () => db;
export const getFirebaseAuth = () => auth;
export const getFirebaseStorage = () => storage;

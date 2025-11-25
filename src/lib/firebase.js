import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { firebaseConfig } from '../firebaseConfig';

let app;
let db;
let auth;
let storage;

try {
    // Initialize Firebase
    if (!getApps().length) {
        app = initializeApp(firebaseConfig);
        console.log('Firebase initialized successfully');
    } else {
        app = getApp();
        console.log('Firebase app already initialized, using existing instance');
    }

    // Initialize services with error handling
    try {
        db = getFirestore(app);
        auth = getAuth(app);
        storage = getStorage(app);
        console.log('Firebase services initialized');
    } catch (serviceError) {
        console.error('Error initializing Firebase services:', serviceError);
        // Create fallback instances even if initialization fails
        db = getFirestore(app);
        auth = getAuth(app);
        storage = getStorage(app);
    }
} catch (error) {
    console.error('Critical Firebase initialization error:', error);
    // Try to create minimal instances to prevent complete crash
    if (!app && getApps().length > 0) {
        app = getApp();
        db = getFirestore(app);
        auth = getAuth(app);
        storage = getStorage(app);
    }
}

// Helper functions with error handling
export const getFirebaseDb = () => {
    if (!db) {
        console.error('Firestore not initialized');
        throw new Error('Firestore not initialized');
    }
    return db;
};

export const getFirebaseAuth = () => {
    if (!auth) {
        console.error('Auth not initialized');
        throw new Error('Auth not initialized');
    }
    return auth;
};

export const getFirebaseStorage = () => {
    if (!storage) {
        console.error('Storage not initialized');
        throw new Error('Storage not initialized');
    }
    return storage;
};

// Export instances
export { db, auth, storage };

// src/lib/firestore.ts
import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as path from 'path';

// Ensure FIREBASE_SERVICE_ACCOUNT_PATH is set in your .env.local
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

if (!serviceAccountPath) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT_PATH environment variable is not defined.');
}

initializeApp({
  credential: cert(path.resolve(serviceAccountPath)),
});

const db = getFirestore();
export { db };

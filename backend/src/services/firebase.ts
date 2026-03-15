import admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      storageBucket: process.env.GOOGLE_CLOUD_STORAGE_BUCKET
    });
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

export const db = admin.firestore();
export const bucket = admin.storage().bucket();

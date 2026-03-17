/**
 * Firebase Storage Connection Verifier
 * Uses environment variables exclusively (no hardcoded credentials).
 * Required: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 */

const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getStorage } = require('firebase-admin/storage');

async function verifyStorage() {
  console.log('\n=== Firebase Storage Connection Verifier ===\n');

  try {
    const credentials = {
      projectId: process.env.FIREBASE_PROJECT_ID || '',
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    };

    if (!credentials.projectId || !credentials.clientEmail || !credentials.privateKey) {
      console.log('Missing Firebase credentials in environment variables. Skipping verification.');
      process.exit(0);
    }

    if (!credentials.privateKey.includes('BEGIN PRIVATE KEY')) {
      throw new Error('Invalid private key format');
    }

    let app;
    const existingApps = getApps();

    if (existingApps.length > 0) {
      app = existingApps[0];
    } else {
      const bucket = process.env.FIREBASE_STORAGE_BUCKET || `${credentials.projectId}.firebasestorage.app`;
      app = initializeApp({
        credential: cert({
          projectId: credentials.projectId,
          clientEmail: credentials.clientEmail,
          privateKey: credentials.privateKey,
        }),
        storageBucket: bucket
      });
    }

    const storage = getStorage(app);
    const bucket = storage.bucket();
    const [exists] = await bucket.exists();

    if (exists) {
      console.log(`Storage bucket verified: ${bucket.name}`);
    } else {
      console.error(`Storage bucket does not exist: ${bucket.name}`);
      process.exit(1);
    }

    console.log('Storage connection verified successfully.\n');
    process.exit(0);

  } catch (error) {
    console.error('Storage verification failed:', error.message);
    process.exit(1);
  }
}

verifyStorage();

/**
 * API Route: GET /api/admin/media/debug
 * Endpoint de diagnóstico para verificar conexión a Firebase Storage
 */

import { NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase-admin-safe';
import { getStorage } from 'firebase-admin/storage';

export async function GET() {
  console.log('[DEBUG] Starting Firebase Storage diagnostic...');

  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      K_SERVICE: process.env.K_SERVICE || 'not set',
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || 'using hardcoded',
    },
    steps: []
  };

  try {
    // Step 1: Get Firebase Admin
    results.steps.push({ step: 1, name: 'Get Firebase Admin', status: 'starting' });
    const { app, db } = await getFirebaseAdmin();

    if (!app) {
      results.steps[0].status = 'failed';
      results.steps[0].error = 'Firebase Admin app is null';
      return NextResponse.json({ success: false, results });
    }
    results.steps[0].status = 'success';
    results.steps[0].projectId = app.options.projectId;

    // Step 2: Get Storage
    results.steps.push({ step: 2, name: 'Get Storage', status: 'starting' });
    const storage = getStorage(app);
    results.steps[1].status = 'success';

    // Step 3: Get Bucket
    results.steps.push({ step: 3, name: 'Get Bucket', status: 'starting' });
    const bucketName = 'metrica-fm.firebasestorage.app';
    const bucket = storage.bucket(bucketName);
    results.steps[2].status = 'success';
    results.steps[2].bucketName = bucket.name;

    // Step 4: Check bucket exists
    results.steps.push({ step: 4, name: 'Check Bucket Metadata', status: 'starting' });
    try {
      const [metadata] = await bucket.getMetadata();
      results.steps[3].status = 'success';
      results.steps[3].metadata = {
        name: metadata.name,
        location: metadata.location,
        storageClass: metadata.storageClass,
        timeCreated: metadata.timeCreated
      };
    } catch (metaError: any) {
      results.steps[3].status = 'failed';
      results.steps[3].error = metaError.message;
    }

    // Step 5: List files
    results.steps.push({ step: 5, name: 'List Files', status: 'starting' });
    try {
      const [files] = await bucket.getFiles({ prefix: 'images/', maxResults: 10 });
      results.steps[4].status = 'success';
      results.steps[4].fileCount = files.length;
      results.steps[4].files = files.map(f => ({
        name: f.name,
        size: f.metadata.size
      }));
    } catch (listError: any) {
      results.steps[4].status = 'failed';
      results.steps[4].error = listError.message;
    }

    // Step 6: Test upload (small test file)
    results.steps.push({ step: 6, name: 'Test Upload', status: 'starting' });
    try {
      const testFileName = `test-${Date.now()}.txt`;
      const testFile = bucket.file(`debug/${testFileName}`);
      const testContent = `Test file created at ${new Date().toISOString()}`;

      await testFile.save(testContent, {
        metadata: { contentType: 'text/plain' }
      });

      // Verify it exists
      const [exists] = await testFile.exists();

      // Clean up - delete test file
      if (exists) {
        await testFile.delete();
      }

      results.steps[5].status = 'success';
      results.steps[5].message = 'Upload and delete test successful';
    } catch (uploadError: any) {
      results.steps[5].status = 'failed';
      results.steps[5].error = uploadError.message;
    }

    results.overallStatus = results.steps.every((s: any) => s.status === 'success') ? 'ALL_PASSED' : 'SOME_FAILED';

    return NextResponse.json({
      success: results.overallStatus === 'ALL_PASSED',
      results
    });

  } catch (error: any) {
    console.error('[DEBUG] Error:', error);
    results.error = error.message;
    results.stack = error.stack;

    return NextResponse.json({
      success: false,
      results
    }, { status: 500 });
  }
}

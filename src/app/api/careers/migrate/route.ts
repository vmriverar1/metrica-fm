/**
 * API Careers Migration - Endpoint para ejecutar migración
 * Migración desde JSON a Firestore usando arquitectura unificada
 */

import { NextRequest, NextResponse } from 'next/server';
import { careersMigrator, CareersJSONReader } from '@/lib/migration/careers-migration';
import type { APIResponse } from '@/lib/api/base-controller';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      jsonFilePath,
      dryRun = true,
      migrationMode = 'unified' // 'unified' or 'legacy'
    } = body;

    if (!jsonFilePath) {
      return NextResponse.json({
        success: false,
        error: 'JSON file path required',
        message: 'Please provide a jsonFilePath in the request body'
      } as APIResponse, { status: 400 });
    }

    console.log(`🚀 Starting Careers migration (${migrationMode}, dryRun: ${dryRun})`);

    let result;

    if (migrationMode === 'legacy') {
      // Migración desde formato JSON legacy
      result = await CareersJSONReader.migrateFromLegacyJSON(jsonFilePath, dryRun);
    } else {
      // Migración usando datos mock (para testing)
      result = await careersMigrator.migrateCareersSystem(undefined, undefined, undefined, dryRun);
    }

    return NextResponse.json({
      success: result.success,
      data: {
        systemName: result.systemName,
        collections: result.collections,
        totalItems: result.totalItems,
        migratedItems: result.migratedItems,
        duration: result.duration,
        timestamp: result.timestamp
      },
      errors: result.errors,
      meta: {
        migrationMode,
        dryRun,
        jsonFilePath
      }
    } as APIResponse);

  } catch (error) {
    console.error('Error in careers migration:', error);
    return NextResponse.json({
      success: false,
      error: 'Migration failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    } as APIResponse, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Endpoint para obtener información sobre migración
    return NextResponse.json({
      success: true,
      data: {
        supportedModes: ['unified', 'legacy'],
        defaultMode: 'unified',
        migrationStatus: 'ready',
        availableCollections: [
          'career_departments',
          'career_positions',
          'career_applications'
        ]
      },
      message: 'Careers migration service ready'
    } as APIResponse);

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to get migration info',
      message: error instanceof Error ? error.message : 'Unknown error'
    } as APIResponse, { status: 500 });
  }
}
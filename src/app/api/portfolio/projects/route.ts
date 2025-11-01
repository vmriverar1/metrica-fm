/**
 * API Route para obtener proyectos de portfolio desde Firestore
 * Simplificado para resolver problemas del sistema unificado
 */

import { NextRequest, NextResponse } from 'next/server';
import { FirestoreCore } from '@/lib/firestore/firestore-core';

export async function GET(request: NextRequest) {
  try {
    // Obtener proyectos de portfolio desde Firestore usando FirestoreCore
    const result = await FirestoreCore.getDocuments('portfolio_projects');

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch portfolio projects');
    }

    const projects = result.data || [];
    console.log(`✅ Found ${projects.length} portfolio projects in Firestore via FirestoreCore`);

    return NextResponse.json({
      success: true,
      data: projects,
      count: projects.length,
      source: 'firestore',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error fetching portfolio projects:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: [],
      count: 0,
      source: 'error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
/**
 * API Portfolio Project Views
 * Incrementar contador de vistas de un proyecto
 */

import { NextRequest, NextResponse } from 'next/server';
import { portfolioProjectService } from '@/lib/firestore/portfolio-service-unified';
import type { APIResponse } from '@/lib/api/base-controller';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await portfolioProjectService.incrementViews(params.id);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message
      } as APIResponse);
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        message: result.message
      } as APIResponse, { status: 400 });
    }

  } catch (error) {
    console.error('Error incrementing project views:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to increment views',
      message: error instanceof Error ? error.message : 'Unknown error'
    } as APIResponse, { status: 500 });
  }
}